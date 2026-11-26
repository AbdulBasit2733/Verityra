import { Worker, Job, Queue } from "bullmq"
import { getRedisConnection, closeRedisConnection } from "./connection.js"
import { prisma } from "../db/prisma.js"
import {
  evaluateAnswerSheetWithGemini,
  getGeminiModelName,
} from "../ai/gemini-evaluator.js"
import {
  persistEvaluationRun,
  failEvaluationRun,
} from "../db/evaluation-run-service.js"
import {
  downloadPrivateFile,
  parsePrivateFileReference,
} from "../storage/supabase.js"
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

const EVALUATION_JOB_DEFAULT_OPTIONS = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 5000,
  },
  removeOnComplete: 200,
  removeOnFail: 500,
}

async function markEvaluationFailed(params: {
  submissionId: string
  runId?: string
  runNumber?: number
  errorMessage: string
  attempts?: number
}) {
  const { submissionId, runId, runNumber, errorMessage, attempts } = params

  await prisma.evaluationJob
    .update({
      where: { submissionId },
      data: {
        status: "FAILED",
        lastError: errorMessage,
        ...(typeof attempts === "number" ? { attempts } : {}),
      },
    })
    .catch(() => undefined)

  const existingSub = await prisma.submission
    .findUnique({
      where: { id: submissionId },
      select: { registrationId: true, status: true },
    })
    .catch(() => null)

  if (existingSub && existingSub.status !== SubmissionStatus.COMPLETED) {
    const failedSub = await prisma.submission
      .updateMany({
        where: {
          id: submissionId,
          status: {
            in: [SubmissionStatus.PENDING, SubmissionStatus.PROCESSING],
          },
        },
        data: { status: SubmissionStatus.FAILED },
      })
      .catch(() => ({ count: 0 }))

    if (
      failedSub.count > 0 &&
      existingSub.registrationId &&
      runNumber === 1
    ) {
      await prisma.testRegistration
        .update({
          where: { id: existingSub.registrationId },
          data: { maxAttempts: { increment: 1 } },
        })
        .catch(() => undefined)
    }
  }

  if (runId) {
    await failEvaluationRun(runId, errorMessage).catch(() => undefined)
  }
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
      const {
        submissionId,
        fileUrl,
        fileBuffer,
        mimeType,
        runId,
        runNumber,
      } = job.data
      const maxAttempts = job.opts.attempts ?? 3

      console.log(
        `[Worker] Starting job ${job.id} for submission ${submissionId} (Run #${runNumber}, attempt ${job.attemptsMade + 1}/${maxAttempts})`
      )

      try {
        await prisma.evaluationJob
          .update({
            where: { submissionId },
            data: {
              status: "PROCESSING",
              startedAt: new Date(),
              attempts: job.attemptsMade + 1,
            },
          })
          .catch(() => undefined)

        const submission = await prisma.submission.findUnique({
          where: { id: submissionId },
          include: {
            user: { select: { name: true, email: true } },
            test: {
              select: {
                id: true,
                title: true,
                maxMarks: true,
                privateEvaluationInstructions: true,
              },
            },
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

        const effectiveTitle = submission.test?.title || submission.testSeries.title
        const effectiveMaxMarks =
          submission.test?.maxMarks ?? submission.testSeries.maxMarks
        const effectiveInstructions =
          submission.test?.privateEvaluationInstructions ||
          submission.testSeries.privateEvaluationInstructions ||
          ""

        // Retrieve student booklet buffer
        let buffer: Buffer
        if (fileBuffer) {
          buffer = Buffer.from(fileBuffer, "base64")
        } else {
          const fileReference = parsePrivateFileReference(fileUrl)
          if (!fileReference || fileReference.bucket !== "verityra-private") {
            throw new Error(
              `Invalid answer sheet storage reference: ${fileUrl}`
            )
          }
          buffer = await downloadPrivateFile(
            fileReference.bucket,
            fileReference.filePath
          )
        }

        if (!buffer || buffer.length === 0) {
          throw new Error(
            "Student answer sheet file is empty or could not be downloaded."
          )
        }

        await job.updateProgress(25)

        console.log(
          `[Worker] Running multimodal Gemini evaluation on ${buffer.length} bytes for submission ${submissionId}`
        )
        const aiResult = await evaluateAnswerSheetWithGemini({
          testTitle: effectiveTitle,
          maxMarks: effectiveMaxMarks,
          rubricContent: submission.testSeries.papers[0]?.rubricContent || null,
          privateEvaluationInstructions: effectiveInstructions,
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
          maxMarks: effectiveMaxMarks,
          evaluatorModel: getGeminiModelName(),
        })

        await prisma.evaluationJob
          .update({
            where: { submissionId },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
              lastError: null,
            },
          })
          .catch(() => undefined)

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
            testTitle: effectiveTitle,
            attemptNumber: submission.attemptNumber,
            totalMarksAwarded: persisted.totalMarksAwarded,
            maxMarks: effectiveMaxMarks,
            percentage: persisted.percentage,
            requiresReview:
              persisted.status === EvaluationStatus.REVIEW_REQUIRED,
          }).catch((mailErr) => {
            console.error(
              `[Worker] Failed to dispatch scorecard notification:`,
              mailErr
            )
          })
        }

        console.log(
          `[Worker] Job ${job.id} completed successfully for submission ${submissionId}: ${persisted.totalMarksAwarded}/${effectiveMaxMarks} marks (${persisted.percentage}%)`
        )

        return {
          success: true,
          evaluationStatus: persisted.status,
          totalMarksAwarded: persisted.totalMarksAwarded,
          percentage: persisted.percentage,
        }
      } catch (error: any) {
        console.error(`[Worker] Job ${job.id} failed:`, error)

        const isFinalAttempt = job.attemptsMade + 1 >= maxAttempts
        const errorMessage = error?.message || "Unknown error"

        if (isFinalAttempt) {
          await markEvaluationFailed({
            submissionId,
            runId,
            runNumber,
            errorMessage,
            attempts: job.attemptsMade + 1,
          })
        } else {
          await prisma.evaluationJob
            .update({
              where: { submissionId },
              data: {
                status: "RETRYING",
                lastError: errorMessage,
                attempts: job.attemptsMade + 1,
              },
            })
            .catch(() => undefined)
        }

        throw error
      }
    },
    {
      connection,
      concurrency: config.workerConcurrency,
      lockDuration: 15 * 60 * 1000, // 15 minutes for multimodal PDF evaluations
      stalledInterval: 60 * 1000,
      maxStalledCount: 2,
    }
  )

  evaluationWorkerInstance.on("error", (err) => {
    console.error("[Worker] BullMQ Worker error:", err)
  })

  evaluationWorkerInstance.on("stalled", (jobId) => {
    console.warn(`[Worker] Job ${jobId} stalled; BullMQ will retry or fail it.`)
  })

  evaluationWorkerInstance.on("failed", async (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed event: ${err.message}`)
    if (!job?.data?.submissionId) return

    const maxAttempts = job.opts?.attempts ?? 1
    const isTerminal =
      job.attemptsMade >= maxAttempts ||
      err.message.toLowerCase().includes("stalled")

    if (isTerminal) {
      await markEvaluationFailed({
        submissionId: job.data.submissionId,
        runId: job.data.runId,
        runNumber: job.data.runNumber,
        errorMessage: err.message || "Evaluation job failed permanently.",
        attempts: job.attemptsMade,
      })
    }
  })

  return evaluationWorkerInstance
}

export async function recoverPendingEvaluationJobs(): Promise<number> {
  const now = Date.now()
  const processingStaleThreshold = new Date(now - 12 * 60 * 1000) // 12 minutes
  const queuedStaleThreshold = new Date(now - 3 * 60 * 1000) // 3 minutes
  const retryingStaleThreshold = new Date(now - 5 * 60 * 1000) // 5 minutes
  const hardTimeoutMs = 60 * 60 * 1000 // 60 minutes

  const stalledJobs = await prisma.evaluationJob
    .findMany({
      where: {
        OR: [
          {
            status: "PROCESSING",
            startedAt: { lt: processingStaleThreshold },
          },
          {
            status: "PROCESSING",
            startedAt: null,
            queuedAt: { lt: queuedStaleThreshold },
          },
          {
            status: "QUEUED",
            queuedAt: { lt: queuedStaleThreshold },
          },
          {
            status: "RETRYING",
            updatedAt: { lt: retryingStaleThreshold },
          },
        ],
      },
      orderBy: { queuedAt: "asc" },
      take: 15,
    })
    .catch(() => [])

  if (stalledJobs.length === 0) return 0

  console.log(
    `[Worker:Recovery] Found ${stalledJobs.length} stale evaluation jobs to inspect.`
  )

  const connection = getRedisConnection()
  const queue = new Queue<EvaluationJobData>("evaluation", {
    connection,
    defaultJobOptions: EVALUATION_JOB_DEFAULT_OPTIONS,
  })

  let recoveredCount = 0
  try {
    for (const job of stalledJobs) {
      try {
        const submission = await prisma.submission.findUnique({
          where: { id: job.submissionId },
          select: {
            id: true,
            status: true,
            testSeriesId: true,
            userId: true,
            fileUrl: true,
            fileType: true,
          },
        })

        if (!submission) {
          await prisma.evaluationJob
            .update({
              where: { submissionId: job.submissionId },
              data: {
                status: "FAILED",
                lastError: "Submission record not found during recovery.",
              },
            })
            .catch(() => undefined)
          continue
        }

        if (
          submission.status === SubmissionStatus.COMPLETED ||
          submission.status === SubmissionStatus.REVIEW_REQUIRED
        ) {
          await prisma.evaluationJob
            .update({
              where: { submissionId: job.submissionId },
              data: {
                status: "COMPLETED",
                completedAt: new Date(),
                lastError: null,
              },
            })
            .catch(() => undefined)
          continue
        }

        if (submission.status === SubmissionStatus.FAILED) {
          await prisma.evaluationJob
            .update({
              where: { submissionId: job.submissionId },
              data: {
                status: "FAILED",
                lastError: job.lastError || "Submission already marked failed.",
              },
            })
            .catch(() => undefined)
          continue
        }

        const activeRun = await prisma.evaluationRun.findFirst({
          where: { submissionId: job.submissionId, status: "PROCESSING" },
          orderBy: { runNumber: "desc" },
        })

        if (!activeRun) {
          await markEvaluationFailed({
            submissionId: job.submissionId,
            errorMessage:
              "No active processing evaluation run found during recovery.",
            attempts: job.attempts,
          })
          continue
        }

        const jobId = `eval-${submission.id}-run-${activeRun.runNumber}`
        const existingBullJob = await queue.getJob(jobId).catch(() => null)
        const existingState = existingBullJob
          ? await existingBullJob.getState().catch(() => null)
          : null

        const ageBase = job.startedAt ?? job.queuedAt
        const ageMs = now - ageBase.getTime()
        const isTimedOut = ageMs > hardTimeoutMs || job.attempts >= 3

        if (
          !isTimedOut &&
          ((existingState === "active" && ageMs < 20 * 60 * 1000) ||
            existingState === "waiting" ||
            existingState === "delayed" ||
            existingState === "prioritized")
        ) {
          continue
        }

        if (isTimedOut) {
          if (existingBullJob) {
            await existingBullJob.remove().catch(() => undefined)
          }
          await markEvaluationFailed({
            submissionId: submission.id,
            runId: activeRun.id,
            runNumber: activeRun.runNumber,
            errorMessage:
              job.lastError ||
              "Evaluation timed out or exceeded recovery retry limit.",
            attempts: job.attempts,
          })
          continue
        }

        if (existingBullJob) {
          await existingBullJob.remove().catch(() => undefined)
        }

        await queue.add(
          "evaluate",
          {
            submissionId: submission.id,
            testSeriesId: submission.testSeriesId,
            userId: submission.userId,
            fileUrl: submission.fileUrl || "",
            mimeType: submission.fileType || "application/pdf",
            runId: activeRun.id,
            runNumber: activeRun.runNumber,
          },
          {
            ...EVALUATION_JOB_DEFAULT_OPTIONS,
            jobId,
          }
        )

        await prisma.evaluationJob.update({
          where: { submissionId: job.submissionId },
          data: {
            status: "QUEUED",
            queuedAt: new Date(),
            startedAt: null,
            attempts: { increment: 1 },
          },
        })

        recoveredCount++
      } catch (err) {
        console.error(
          `[Worker:Recovery] Failed to recover job ${job.submissionId}:`,
          err
        )
      }
    }
  } finally {
    await queue.close()
  }

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
