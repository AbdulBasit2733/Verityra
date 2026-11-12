import { Queue, Worker, Job } from "bullmq"
import { getRedisConnection, getWorkerRedisConnection } from "./connection"
import { prisma } from "@/lib/prisma"
import {
  evaluateAnswerSheetWithGemini,
  getGeminiModelName,
} from "@/lib/ai/gemini-evaluator"
import { invalidateLeaderboardCache } from "@/lib/cache"
import { sendEvaluationReadyEmail } from "@/lib/email"
import { EvaluationStatus, SubmissionStatus } from "@prisma/client"
import {
  failEvaluationRun,
  persistEvaluationRun,
} from "@/lib/evaluation/evaluation-run-service"
import { downloadPrivateFile, parsePrivateFileReference } from "@/lib/supabase"

export interface EvaluationJobData {
  submissionId: string
  testSeriesId: string
  userId: string
  fileUrl: string
  fileBuffer?: string // Optional legacy base64 fallback
  mimeType: string
  runId: string
  runNumber: number
}

const globalForQueue = globalThis as unknown as {
  evaluationQueue: Queue<EvaluationJobData> | null | undefined
  evaluationWorker: Worker<EvaluationJobData> | null | undefined
}

/**
 * Get or create evaluation queue
 */
export function getEvaluationQueue(): Queue<EvaluationJobData> | null {
  const connection = getRedisConnection()
  if (!connection) return null

  if (!globalForQueue.evaluationQueue) {
    globalForQueue.evaluationQueue = new Queue<EvaluationJobData>(
      "evaluation",
      {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: "exponential",
            delay: 2000,
          },
          removeOnComplete: 200, // Keep last 200 completed jobs to bound Redis RAM
          removeOnFail: 500, // Keep last 500 failed jobs for debugging
        },
      }
    )
  }

  return globalForQueue.evaluationQueue
}

/**
 * Create and start evaluation worker
 * Call this once on server startup or in a dedicated worker process
 */
export function createEvaluationWorker(): Worker<EvaluationJobData> | null {
  const workerConnection = getWorkerRedisConnection()
  if (!workerConnection) return null

  if (globalForQueue.evaluationWorker) {
    return globalForQueue.evaluationWorker
  }

  globalForQueue.evaluationWorker = new Worker<EvaluationJobData>(
    "evaluation",
    async (job: Job<EvaluationJobData>) => {
      const {
        submissionId,
        testSeriesId,
        fileUrl,
        fileBuffer,
        mimeType,
        runId,
      } = job.data

      console.log(
        `[Worker] Processing evaluation job ${job.id} for submission ${submissionId}`
      )

      try {
        // Update job status in database
        await prisma.evaluationJob.update({
          where: { submissionId },
          data: {
            status: "PROCESSING",
            startedAt: new Date(),
            attempts: job.attemptsMade,
          },
        })

        // Fetch submission with test series data
        const submission = await prisma.submission.findUnique({
          where: { id: submissionId },
          include: {
            user: {
              select: { name: true, email: true },
            },
            testSeries: {
              include: {
                papers: { orderBy: { createdAt: "desc" }, take: 1 },
              },
            },
          },
        })

        if (!submission) {
          throw new Error(`Submission ${submissionId} not found`)
        }

        // Get file buffer (either from job data or download from URL)
        let buffer: Buffer
        if (fileBuffer) {
          // Decode base64 buffer from job data
          buffer = Buffer.from(fileBuffer, "base64")
        } else {
          const fileReference = parsePrivateFileReference(fileUrl)
          if (!fileReference || fileReference.bucket !== "verityra-private") {
            throw new Error("The answer-sheet file reference is invalid.")
          }
          buffer = await downloadPrivateFile(
            fileReference.bucket,
            fileReference.filePath
          )
        }

        // Update job progress
        await job.updateProgress(20)

        // Run AI evaluation
        console.log(
          `[Worker] Running AI evaluation for submission ${submissionId}`
        )
        const aiResult = await evaluateAnswerSheetWithGemini({
          testTitle: submission.testSeries.title,
          maxMarks: submission.testSeries.maxMarks,
          rubricContent: submission.testSeries.papers[0]?.rubricContent || null,
          privateEvaluationInstructions:
            submission.testSeries.privateEvaluationInstructions || "",
          studentAnswerSheetBuffer: buffer,
          studentAnswerSheetMimeType: mimeType,
          studentAnswerSheetUrl: fileUrl,
        })

        await job.updateProgress(80)

        const persisted = await persistEvaluationRun({
          runId,
          submissionId,
          result: aiResult,
          maxMarks: submission.testSeries.maxMarks,
          evaluatorModel: getGeminiModelName(),
        })

        await prisma.evaluationJob.update({
          where: { submissionId },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            lastError: null,
          },
        })

        await job.updateProgress(100)

        // The worker runs outside a Next.js request context, so revalidatePath
        // is not safe here. The affected pages are dynamic and will read the
        // persisted result on the next request.
        if (persisted.status === EvaluationStatus.COMPLETED) {
          invalidateLeaderboardCache() // Invalidate cached leaderboard
        }

        if (submission.user?.email) {
          await sendEvaluationReadyEmail({
            to: submission.user.email,
            name: submission.user.name,
            testSeriesId: submission.testSeriesId,
            testTitle: submission.testSeries.title,
            attemptNumber: submission.attemptNumber,
            totalMarksAwarded: persisted.totalMarksAwarded,
            maxMarks: submission.testSeries.maxMarks,
            percentage: persisted.percentage,
            requiresReview:
              persisted.status === EvaluationStatus.REVIEW_REQUIRED,
          }).catch((emailErr) => {
            console.error(
              `[Worker] Failed to send evaluation ready email:`,
              emailErr
            )
          })
        }

        console.log(`[Worker] Job ${job.id} completed successfully`)

        return {
          success: true,
          evaluationStatus: persisted.status,
          totalMarksAwarded: persisted.totalMarksAwarded,
          percentage: persisted.percentage,
        }
      } catch (error: any) {
        console.error(`[Worker] Job ${job.id} failed:`, error)

        // Update job status in database
        await prisma.evaluationJob
          .update({
            where: { submissionId },
            data: {
              status: job.attemptsMade >= 2 ? "FAILED" : "RETRYING",
              lastError: error.message || "Unknown error",
              attempts: job.attemptsMade,
            },
          })
          .catch((dbError) => {
            console.error(
              `[Worker] Failed to update job status in database:`,
              dbError
            )
          })

        // BullMQ attemptsMade starts at 0, so the third delivery is attempt 2.
        if (job.attemptsMade >= 2) {
          const failedSub = await prisma.submission
            .update({
              where: { id: submissionId },
              data: { status: SubmissionStatus.FAILED },
              select: { registrationId: true },
            })
            .catch((dbError) => {
              console.error(
                `[Worker] Failed to mark submission as failed:`,
                dbError
              )
              return null
            })

          // Compensate candidate quota on terminal system failure of initial run
          if (failedSub?.registrationId && job.data.runNumber === 1) {
            await prisma.testRegistration
              .update({
                where: { id: failedSub.registrationId },
                data: { maxAttempts: { increment: 1 } },
              })
              .catch((regError) => {
                console.error(
                  `[Worker] Failed to compensate candidate attempt quota:`,
                  regError
                )
              })
          }

          await failEvaluationRun(
            runId,
            error.message || "Evaluation failed after retries"
          ).catch((runError) => {
            console.error(
              `[Worker] Failed to mark evaluation run ${runId} failed:`,
              runError
            )
          })
        }

        throw error
      }
    },
    {
      connection: workerConnection,
      // Gemini multimodal evaluation can take several minutes for a scanned
      // booklet. The default 30s lock causes BullMQ to mark valid jobs stalled.
      concurrency: Math.max(
        1,
        Number(process.env.EVALUATION_WORKER_CONCURRENCY || 2)
      ),
      lockDuration: 15 * 60 * 1000,
      stalledInterval: 60 * 1000,
      maxStalledCount: 2,
      limiter: {
        max: 10,
        duration: 1000, // Max 10 jobs per second (respect Gemini rate limits)
      },
    }
  )

  // Worker event listeners
  globalForQueue.evaluationWorker.on("completed", (job) => {
    console.log(`[Worker] Job ${job.id} completed`)
  })

  globalForQueue.evaluationWorker.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message)
  })

  globalForQueue.evaluationWorker.on("error", (err) => {
    console.error("[Worker] Worker error:", err)
  })

  return globalForQueue.evaluationWorker
}

/**
 * Queue an evaluation job
 * Returns job ID if queued successfully, null if Redis not available
 */
export async function queueEvaluation(
  data: EvaluationJobData
): Promise<string | null> {
  const queue = getEvaluationQueue()
  if (!queue) {
    console.warn("[Queue] Redis not available, cannot queue evaluation")
    return null
  }

  try {
    // A re-evaluation is a new logical run. Reusing a completed BullMQ job ID
    // causes BullMQ to return the old job without executing the new run.
    const jobId = `eval-${data.submissionId}-run-${data.runNumber}`
    await prisma.evaluationJob.upsert({
      where: { submissionId: data.submissionId },
      create: {
        id: `eval-${data.submissionId}`,
        submissionId: data.submissionId,
        status: "QUEUED",
        queuedAt: new Date(),
      },
      update: {
        status: "QUEUED",
        queuedAt: new Date(),
        attempts: 0,
        lastError: null,
      },
    })

    const job = await queue.add("evaluate", data, { jobId })

    console.log(
      `[Queue] Queued evaluation job ${job.id} for submission ${data.submissionId}`
    )

    return job.id || jobId
  } catch (error: any) {
    console.error("[Queue] Failed to queue evaluation:", error)
    await prisma.evaluationJob
      .updateMany({
        where: { submissionId: data.submissionId },
        data: {
          status: "FAILED",
          lastError: error.message || "Queue submission failed",
        },
      })
      .catch(() => undefined)
    return null
  }
}

/**
 * Requeue database jobs that lost their BullMQ record during a restart or
 * transient Redis outage. This is a recovery sweep, not the worker loop.
 */
export async function recoverPendingEvaluationJobs(): Promise<number> {
  const queue = getEvaluationQueue()
  if (!queue) return 0

  const pendingJobs = await prisma.evaluationJob.findMany({
    where: { status: { in: ["QUEUED", "RETRYING"] } },
    include: {
      submission: {
        select: {
          id: true,
          testSeriesId: true,
          userId: true,
          fileUrl: true,
          fileType: true,
          evaluationRuns: {
            where: { status: EvaluationStatus.PROCESSING },
            orderBy: { runNumber: "desc" },
            take: 1,
            select: { id: true, runNumber: true },
          },
        },
      },
    },
    take: 100,
  })

  let recovered = 0
  for (const record of pendingJobs) {
    const run = record.submission.evaluationRuns[0]
    if (!run) continue

    const jobId = `eval-${record.submission.id}-run-${run.runNumber}`
    const existing = await queue.getJob(jobId)
    const state = existing ? await existing.getState() : null
    if (
      state &&
      [
        "waiting",
        "active",
        "delayed",
        "prioritized",
        "waiting-children",
      ].includes(state)
    )
      continue
    if (existing) await existing.remove()

    await queue.add(
      "evaluate",
      {
        submissionId: record.submission.id,
        testSeriesId: record.submission.testSeriesId,
        userId: record.submission.userId,
        fileUrl: record.submission.fileUrl,
        mimeType: record.submission.fileType,
        runId: run.id,
        runNumber: run.runNumber,
      },
      { jobId }
    )

    recovered += 1
  }

  if (recovered > 0) {
    console.log(
      `[Queue] Recovery sweep requeued ${recovered} evaluation job(s)`
    )
  }
  return recovered
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

    const latestRun = await prisma.evaluationRun.findFirst({
      where: { submissionId },
      orderBy: { runNumber: "desc" },
      select: { runNumber: true },
    })

    const queue = getEvaluationQueue()
    let jobProgressValue: number = 0
    let queueJobState: string | null = null

    if (queue) {
      try {
        const queueJobId = latestRun
          ? `eval-${submissionId}-run-${latestRun.runNumber}`
          : jobRecord.id
        const job = await queue.getJob(queueJobId)
        queueJobState = job ? await job.getState() : null
        // In BullMQ, progress can be number, string, object, or false
        const jobProgress = job?.progress
        if (typeof jobProgress === "number") {
          jobProgressValue = jobProgress
        } else if (typeof jobProgress === "string") {
          const parsed = parseFloat(jobProgress)
          jobProgressValue = isNaN(parsed) ? 0 : parsed
        }
      } catch (err) {
        // Job might not exist in queue anymore
        jobProgressValue = 0
      }
    }

    const ageBase = jobRecord.startedAt ?? jobRecord.queuedAt
    const staleAfterMs =
      jobRecord.status === "PROCESSING" ? 10 * 60 * 1000 : 15 * 60 * 1000
    const stale = Date.now() - ageBase.getTime() > staleAfterMs
    const activeQueueStates = new Set([
      "active",
      "waiting",
      "delayed",
      "prioritized",
      "waiting-children",
    ])

    if (stale && !activeQueueStates.has(queueJobState || "")) {
      const staleRun = await prisma.evaluationRun.findFirst({
        where: { submissionId, status: EvaluationStatus.PROCESSING },
        orderBy: { runNumber: "desc" },
        select: { id: true },
      })
      if (staleRun) {
        await failEvaluationRun(
          staleRun.id,
          "Evaluation worker timed out. The submission can be retried by an administrator."
        )
      }
      await prisma.evaluationJob.updateMany({
        where: { submissionId },
        data: {
          status: "FAILED",
          lastError:
            "Evaluation worker timed out. Retry from the admin submissions page.",
        },
      })
      return {
        status: "FAILED",
        progress: jobProgressValue,
        attempts: jobRecord.attempts,
        error:
          "Evaluation worker timed out. Retry from the admin submissions page.",
        queuedAt: jobRecord.queuedAt,
        startedAt: jobRecord.startedAt,
        completedAt: jobRecord.completedAt,
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
    console.error("[Queue] Failed to get evaluation status:", error)
    return null
  }
}

/**
 * Clean up queue connections on shutdown
 */
export async function shutdownQueue() {
  if (globalForQueue.evaluationWorker) {
    await globalForQueue.evaluationWorker.close().catch(() => undefined)
    globalForQueue.evaluationWorker = null
  }
  if (globalForQueue.evaluationQueue) {
    await globalForQueue.evaluationQueue.close().catch(() => undefined)
    globalForQueue.evaluationQueue = null
  }
}
