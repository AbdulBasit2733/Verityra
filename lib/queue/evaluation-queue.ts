import { Queue, Worker, Job } from 'bullmq'
import { getRedisConnection } from './connection'
import { prisma } from '@/lib/prisma'
import { evaluateAnswerSheetWithGemini } from '@/lib/ai/gemini-evaluator'
import { invalidateLeaderboardCache } from '@/lib/cache'
import { EvaluationStatus, SubmissionStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export interface EvaluationJobData {
  submissionId: string
  testSeriesId: string
  userId: string
  fileUrl: string
  fileBuffer?: string // Base64 encoded buffer
  mimeType: string
}

let evaluationQueue: Queue<EvaluationJobData> | null = null
let evaluationWorker: Worker<EvaluationJobData> | null = null

/**
 * Get or create evaluation queue
 */
export function getEvaluationQueue(): Queue<EvaluationJobData> | null {
  const connection = getRedisConnection()
  if (!connection) return null

  if (!evaluationQueue) {
    evaluationQueue = new Queue<EvaluationJobData>('evaluation', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 1000, // Keep last 1000 completed jobs
        removeOnFail: 5000, // Keep last 5000 failed jobs for debugging
      },
    })
  }

  return evaluationQueue
}

/**
 * Create and start evaluation worker
 * Call this once on server startup or in a dedicated worker process
 */
export function createEvaluationWorker(): Worker<EvaluationJobData> | null {
  const connection = getRedisConnection()
  if (!connection) return null

  if (evaluationWorker) {
    return evaluationWorker
  }

  evaluationWorker = new Worker<EvaluationJobData>(
    'evaluation',
    async (job: Job<EvaluationJobData>) => {
      const { submissionId, testSeriesId, fileUrl, fileBuffer, mimeType } = job.data

      console.log(`[Worker] Processing evaluation job ${job.id} for submission ${submissionId}`)

      try {
        // Update job status in database
        await prisma.evaluationJob.update({
          where: { submissionId },
          data: {
            status: 'PROCESSING',
            startedAt: new Date(),
            attempts: job.attemptsMade,
          },
        })

        // Fetch submission with test series data
        const submission = await prisma.submission.findUnique({
          where: { id: submissionId },
          include: {
            testSeries: true,
          },
        })

        if (!submission) {
          throw new Error(`Submission ${submissionId} not found`)
        }

        // Get file buffer (either from job data or download from URL)
        let buffer: Buffer
        if (fileBuffer) {
          // Decode base64 buffer from job data
          buffer = Buffer.from(fileBuffer, 'base64')
        } else {
          // Download file from storage
          const response = await fetch(fileUrl)
          if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`)
          }
          buffer = Buffer.from(await response.arrayBuffer())
        }

        // Update job progress
        await job.updateProgress(20)

        // Run AI evaluation
        console.log(`[Worker] Running AI evaluation for submission ${submissionId}`)
        const aiResult = await evaluateAnswerSheetWithGemini({
          testTitle: submission.testSeries.title,
          maxMarks: submission.testSeries.maxMarks,
          rubricContent: submission.testSeries.privateEvaluationInstructions || '',
          privateEvaluationInstructions: submission.testSeries.privateEvaluationInstructions || '',
          studentAnswerSheetBuffer: buffer,
          studentAnswerSheetMimeType: mimeType,
          studentAnswerSheetUrl: fileUrl,
        })

        await job.updateProgress(80)

        // Calculate totals
        const totalMarksAwarded = aiResult.questions.reduce((sum, q) => sum + q.marksAwarded, 0)
        const percentage = (totalMarksAwarded / submission.testSeries.maxMarks) * 100

        // Determine if review required
        const needsReview = aiResult.uncertaintyFlag || aiResult.legibilityWarning
        const evaluationStatus = needsReview
          ? EvaluationStatus.REVIEW_REQUIRED
          : EvaluationStatus.COMPLETED

        console.log(
          `[Worker] Evaluation complete for submission ${submissionId}: ${totalMarksAwarded}/${submission.testSeries.maxMarks} (${percentage.toFixed(1)}%) - Status: ${evaluationStatus}`
        )

        // Save evaluation in transaction
        await prisma.$transaction(async (tx) => {
          const evaluation = await tx.evaluation.create({
            data: {
              submissionId,
              totalMarksAwarded,
              maxMarks: submission.testSeries.maxMarks,
              percentage,
              generalFeedback: aiResult.generalFeedback,
              legibilityWarning: aiResult.legibilityWarning,
              uncertaintyFlag: aiResult.uncertaintyFlag,
              status: evaluationStatus,
              evaluatorModel: 'gemini-2.5-flash',
              evaluatorVersion: '1.0',
              evaluatedAt: new Date(),
            },
          })

          await tx.questionEvaluation.createMany({
            data: aiResult.questions.map((q) => ({
              evaluationId: evaluation.id,
              questionNumber: q.questionNumber,
              maxMarks: q.maxMarks,
              marksAwarded: q.marksAwarded,
              feedback: q.feedback,
              missingConcepts: q.missingConcepts || '',
              isLegible: q.isLegible,
              isUncertain: q.isUncertain,
            })),
          })

          await tx.submission.update({
            where: { id: submissionId },
            data: {
              status: needsReview ? SubmissionStatus.REVIEW_REQUIRED : SubmissionStatus.COMPLETED,
            },
          })

          await tx.evaluationJob.update({
            where: { submissionId },
            data: {
              status: 'COMPLETED',
              completedAt: new Date(),
            },
          })
        })

        await job.updateProgress(100)

        // Invalidate caches
        revalidatePath('/admin/submissions')
        revalidatePath('/admin')
        revalidatePath('/student/dashboard')
        revalidatePath(`/student/tests/${testSeriesId}`)
        if (!needsReview) {
          revalidatePath('/leaderboard')
          invalidateLeaderboardCache() // Invalidate cached leaderboard
        }

        console.log(`[Worker] Job ${job.id} completed successfully`)

        return {
          success: true,
          evaluationStatus,
          totalMarksAwarded,
          percentage,
        }
      } catch (error: any) {
        console.error(`[Worker] Job ${job.id} failed:`, error)

        // Update job status in database
        await prisma.evaluationJob
          .update({
            where: { submissionId },
            data: {
              status: job.attemptsMade >= 3 ? 'FAILED' : 'RETRYING',
              lastError: error.message || 'Unknown error',
              attempts: job.attemptsMade,
            },
          })
          .catch((dbError) => {
            console.error(`[Worker] Failed to update job status in database:`, dbError)
          })

        // If max attempts reached, mark submission as failed
        if (job.attemptsMade >= 3) {
          await prisma.submission
            .update({
              where: { id: submissionId },
              data: { status: SubmissionStatus.FAILED },
            })
            .catch((dbError) => {
              console.error(`[Worker] Failed to mark submission as failed:`, dbError)
            })
        }

        throw error
      }
    },
    {
      connection: getRedisConnection()!,
      concurrency: 5, // Process 5 evaluations concurrently
      limiter: {
        max: 10,
        duration: 1000, // Max 10 jobs per second (respect Gemini rate limits)
      },
    }
  )

  // Worker event listeners
  evaluationWorker.on('completed', (job) => {
    console.log(`[Worker] Job ${job.id} completed`)
  })

  evaluationWorker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message)
  })

  evaluationWorker.on('error', (err) => {
    console.error('[Worker] Worker error:', err)
  })

  return evaluationWorker
}

/**
 * Queue an evaluation job
 * Returns job ID if queued successfully, null if Redis not available
 */
export async function queueEvaluation(data: EvaluationJobData): Promise<string | null> {
  const queue = getEvaluationQueue()
  if (!queue) {
    console.warn('[Queue] Redis not available, cannot queue evaluation')
    return null
  }

  try {
    // Create job in queue
    const job = await queue.add('evaluate', data, {
      jobId: `eval-${data.submissionId}`, // Prevent duplicates
    })

    // Create job record in database
    await prisma.evaluationJob.upsert({
      where: { submissionId: data.submissionId },
      create: {
        id: job.id || `eval-${data.submissionId}`,
        submissionId: data.submissionId,
        status: 'QUEUED',
        queuedAt: new Date(),
      },
      update: {
        status: 'QUEUED',
        queuedAt: new Date(),
        attempts: 0,
        lastError: null,
      },
    })

    console.log(`[Queue] Queued evaluation job ${job.id} for submission ${data.submissionId}`)

    return job.id || null
  } catch (error: any) {
    console.error('[Queue] Failed to queue evaluation:', error)
    return null
  }
}

/**
 * Get evaluation job status
 */
export async function getEvaluationStatus(submissionId: string) {
  try {
    const jobRecord = await prisma.evaluationJob.findUnique({
      where: { submissionId },
    })

    if (!jobRecord) return null

    const queue = getEvaluationQueue()
    let jobProgressValue: number = 0

    if (queue) {
      try {
        const job = await queue.getJob(jobRecord.id)
        // In BullMQ, progress can be number, string, object, or false
        const jobProgress = job?.progress
        if (typeof jobProgress === 'number') {
          jobProgressValue = jobProgress
        } else if (typeof jobProgress === 'string') {
          const parsed = parseFloat(jobProgress)
          jobProgressValue = isNaN(parsed) ? 0 : parsed
        }
      } catch (err) {
        // Job might not exist in queue anymore
        jobProgressValue = 0
      }
    }

    return {
      status: jobRecord.status,
      progress: jobProgressValue,
      attempts: jobRecord.attempts,
      error: jobRecord.lastError,
      queuedAt: jobRecord.queuedAt,
      startedAt: jobRecord.startedAt,
      completedAt: jobRecord.completedAt,
    }
  } catch (error) {
    console.error('[Queue] Failed to get evaluation status:', error)
    return null
  }
}

/**
 * Clean up queue connections on shutdown
 */
export async function shutdownQueue() {
  if (evaluationWorker) {
    await evaluationWorker.close()
    evaluationWorker = null
  }
  if (evaluationQueue) {
    await evaluationQueue.close()
    evaluationQueue = null
  }
}
