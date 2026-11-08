import { Worker, Job, Queue } from "bullmq"
import { getRedisConnection, closeRedisConnection } from "./connection.js"
import { prisma } from "../db/prisma.js"
import { evaluateAnswerSheetWithGemini, getGeminiModelName } from "../ai/gemini-evaluator.js"
import { persistEvaluationRun, failEvaluationRun } from "../db/evaluation-run-service.js"
import { downloadPrivateFile, parsePrivateFileReference } from "../storage/supabase.js"
import { sendEvaluationReadyEmail } from "../email/mailer.js"
import { EvaluationStatus, SubmissionStatus } from "@prisma/client"
import { config } from "../config.js"

export interface EvaluationJobData {
  submissionId: string
  testSeriesId: string
  userId: string
  fileUrl: string
  fileBuffer?: string
  mimeType: string
  runId: string
  runNumber: number
}

let evaluationWorkerInstance: Worker<EvaluationJobData> | null = null

export function createEvaluationWorker(): Worker<EvaluationJobData> {
  if (evaluationWorkerInstance) {
    return evaluationWorkerInstance
  }

  const connection = getRedisConnection()

  evaluationWorkerInstance = new Worker<EvaluationJobData>(
    "evaluation",
    async (job: Job<EvaluationJobData>) => {
      const { submissionId, testSeriesId, fileUrl, fileBuffer, mimeType, runId, runNumber } = job.data

      console.log(`[Worker] Starting job ${job.id} for submission ${submissionId} (Attempt run #${runNumber})`)

      try {
        await prisma.evaluationJob.update({
          where: { submissionId },
          data: {
            status: "PROCESSING",
            startedAt: new Date(),
            attempts: job.attemptsMade,
          },
        }).catch(() => undefined)

        const submission = await prisma.submission.findUnique({
          where: { id: submissionId },
          include: {
            user: { select: { name: true, email: true } },
            testSeries: {
              include: {
                papers: { orderBy: { createdAt: "desc" }, take: 1 },
              },
            },
          },
        })

        if (!submission) {
          throw new Error(`Submission ${submissionId} not found in database.`)
        }

        // Retrieve student booklet buffer
        let buffer: Buffer
        if (fileBuffer) {
          buffer = Buffer.from(fileBuffer, "base64")
        } else {
          const fileReference = parsePrivateFileReference(fileUrl)
          if (!fileReference || fileReference.bucket !== "verityra-private") {
            throw new Error(`Invalid answer sheet storage reference: ${fileUrl}`)
          }
          buffer = await downloadPrivateFile(fileReference.bucket, fileReference.filePath)
        }

        await job.updateProgress(25)

        console.log(`[Worker] Running multimodal Gemini evaluation on ${buffer.length} bytes for submission ${submissionId}`)
        const aiResult = await evaluateAnswerSheetWithGemini({
          testTitle: submission.testSeries.title,
          maxMarks: submission.testSeries.maxMarks,
          rubricContent: submission.testSeries.papers[0]?.rubricContent || null,
          privateEvaluationInstructions: submission.testSeries.privateEvaluationInstructions || "",
          studentAnswerSheetBuffer: buffer,
          studentAnswerSheetMimeType: mimeType,
          studentAnswerSheetUrl: fileUrl,
        })

        await job.updateProgress(80)

        // Atomic DB persistence
        const persisted = await persistEvaluationRun({
          runId,
          submissionId,
          result: aiResult,
          maxMarks: submission.testSeries.maxMarks,
          evaluatorModel: getGeminiModelName(),
        })

        await prisma.evaluationJob.update({
          where: { submissionId },
          data: { status: "COMPLETED", completedAt: new Date(), lastError: null },
        }).catch(() => undefined)

        await job.updateProgress(100)

        // Invalidate leaderboard cache in Redis
        try {
          const redis = getRedisConnection()
          const keys = await redis.keys("cache:leaderboard:*")
          if (keys.length > 0) {
            await redis.del(...keys)
          }
        } catch {
          // Non-critical cache purge failure
        }

        // Email scorecard notification
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
            requiresReview: persisted.status === EvaluationStatus.REVIEW_REQUIRED,
          }).catch((mailErr) => {
            console.error(`[Worker] Failed to dispatch scorecard notification:`, mailErr)
          })
        }

        console.log(`[Worker] Job ${job.id} completed successfully for submission ${submissionId}: ${persisted.totalMarksAwarded}/${submission.testSeries.maxMarks} marks (${persisted.percentage}%)`)

        return {
          success: true,
          evaluationStatus: persisted.status,
          totalMarksAwarded: persisted.totalMarksAwarded,
          percentage: persisted.percentage,
        }
      } catch (error: any) {
        console.error(`[Worker] Job ${job.id} failed:`, error)

        await prisma.evaluationJob.update({
          where: { submissionId },
          data: {
            status: job.attemptsMade >= 2 ? "FAILED" : "RETRYING",
            lastError: error.message || "Unknown error",
            attempts: job.attemptsMade,
          },
        }).catch(() => undefined)

        // On terminal attempt failure (attempt 3, i.e. attemptsMade >= 2)
        if (job.attemptsMade >= 2) {
          const failedSub = await prisma.submission.update({
            where: { id: submissionId },
            data: { status: SubmissionStatus.FAILED },
            select: { registrationId: true },
          }).catch(() => null)

          if (failedSub?.registrationId && job.data.runNumber === 1) {
            await prisma.testRegistration.update({
              where: { id: failedSub.registrationId },
              data: { maxAttempts: { increment: 1 } },
            }).catch(() => undefined)
          }

          await failEvaluationRun(runId, error.message || "Evaluation failed after retries").catch(() => undefined)
        }

        throw error
      }
    },
    {
      connection,
      concurrency: config.workerConcurrency,
    }
  )

  evaluationWorkerInstance.on("error", (err) => {
    console.error("[Worker] BullMQ Worker error:", err)
  })

  evaluationWorkerInstance.on("failed", (job, err) => {
    console.error(`[Worker] Job ${job?.id} permanently failed: ${err.message}`)
  })

  return evaluationWorkerInstance
}

export async function recoverPendingEvaluationJobs(): Promise<number> {
  const staleThreshold = new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago

  const stalledJobs = await prisma.evaluationJob.findMany({
    where: {
      status: "PROCESSING",
      startedAt: { lt: staleThreshold },
      attempts: { lt: 3 },
    },
    take: 10,
  }).catch(() => [])

  if (stalledJobs.length === 0) return 0

  console.log(`[Worker:Recovery] Found ${stalledJobs.length} stalled evaluation jobs to re-enqueue.`)

  const connection = getRedisConnection()
  const queue = new Queue<EvaluationJobData>("evaluation", { connection })

  let recoveredCount = 0
  for (const job of stalledJobs) {
    try {
      const submission = await prisma.submission.findUnique({
        where: { id: job.submissionId },
        select: { id: true, testSeriesId: true, userId: true, fileUrl: true, fileType: true },
      })
      if (!submission) continue

      const activeRun = await prisma.evaluationRun.findFirst({
        where: { submissionId: job.submissionId, status: "PROCESSING" },
        orderBy: { runNumber: "desc" },
      })
      if (!activeRun) continue

      await queue.add(`eval-${submission.id}-recovered-${Date.now()}`, {
        submissionId: submission.id,
        testSeriesId: submission.testSeriesId,
        userId: submission.userId,
        fileUrl: submission.fileUrl || "",
        mimeType: submission.fileType || "application/pdf",
        runId: activeRun.id,
        runNumber: activeRun.runNumber,
      })

      await prisma.evaluationJob.update({
        where: { submissionId: job.submissionId },
        data: { status: "QUEUED", startedAt: null },
      })

      recoveredCount++
    } catch (err) {
      console.error(`[Worker:Recovery] Failed to recover job ${job.submissionId}:`, err)
    }
  }

  await queue.close()
  return recoveredCount
}

export async function shutdownWorker(): Promise<void> {
  if (evaluationWorkerInstance) {
    await evaluationWorkerInstance.close()
    evaluationWorkerInstance = null
  }
  await closeRedisConnection()
  await prisma.$disconnect()
}
