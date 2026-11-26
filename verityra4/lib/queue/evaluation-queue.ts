import { Queue, Worker, Job } from "bullmq"
import { getRedisConnection, getWorkerRedisConnection } from "./connection"
import { prisma } from "@/lib/prisma"
import {
  evaluateAnswerSheetWithGemini,
  getGeminiModelName,
} from "@/lib/ai/gemini-evaluator"
import { invalidateLeaderboardCache, invalidateAdminAnalyticsCache } from "@/lib/cache"
// import { sendEvaluationReadyEmail } from "@/lib/email"
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

const PROCESSING_ORPHAN_MS = 12 * 60 * 1000
const PROCESSING_HARD_TIMEOUT_MS = 25 * 60 * 1000
const QUEUED_WAKE_THRESHOLD_MS = 3 * 60 * 1000
const QUEUED_ORPHAN_MS = 20 * 60 * 1000
const QUEUED_HARD_TIMEOUT_MS = 45 * 60 * 1000

export function isFinalBullMqAttempt(
  attemptsMade: number,
  maxAttempts?: number | null
): boolean {
  return attemptsMade + 1 >= (maxAttempts ?? 3)
}

export interface SubjectTestCandidate {
  id?: string
  title: string
  subject?: string | null
  maxMarks: number
  privateEvaluationInstructions?: string | null
  questionPaperUrl?: string | null
  modelAnswerUrl?: string | null
}

export function inferDocumentMimeType(filePath: string): string {
  const lower = filePath.toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg"
  if (lower.endsWith(".webp")) return "image/webp"
  return "application/pdf"
}

export async function tryDownloadOptionalPrivateFile(
  fileUrl: string | null | undefined
): Promise<{ buffer: Buffer; mimeType: string } | null> {
  if (!fileUrl) return null
  try {
    const ref = parsePrivateFileReference(fileUrl)
    if (!ref || ref.bucket !== "verityra-private") return null
    const buffer = await downloadPrivateFile(ref.bucket, ref.filePath)
    if (!buffer || buffer.length === 0) return null
    return {
      buffer,
      mimeType: inferDocumentMimeType(ref.filePath),
    }
  } catch (err) {
    console.warn(
      `[Queue] Optional evaluation reference file unavailable (${fileUrl}):`,
      err instanceof Error ? err.message : err
    )
    return null
  }
}

export function resolveEvaluationTargetMeta(submission: {
  testSeries: {
    title: string
    standard?: string | null
    maxMarks: number
    privateEvaluationInstructions?: string | null
    tests?: SubjectTestCandidate[]
    papers?: Array<{
      fileUrl?: string | null
      modelAnswerUrl?: string | null
      rubricContent?: string | null
    }>
    questionPapers?: Array<{
      fileUrl?: string | null
    }>
  }
  test?: SubjectTestCandidate | null
  registration?: {
    test?: SubjectTestCandidate | null
  } | null
}) {
  const seriesTests = submission.testSeries.tests || []
  const effectiveTest =
    submission.test ||
    submission.registration?.test ||
    (seriesTests.length === 1 ? seriesTests[0] : null)

  const latestPaper = submission.testSeries.papers?.[0]
  const latestMasterPaper = submission.testSeries.questionPapers?.[0]

  return {
    inferredTestId:
      !submission.test && effectiveTest?.id ? effectiveTest.id : null,
    subjectTest: effectiveTest,
    title: effectiveTest?.title || submission.testSeries.title,
    subject: effectiveTest?.subject || null,
    standard: submission.testSeries.standard || null,
    maxMarks: effectiveTest?.maxMarks ?? submission.testSeries.maxMarks,
    privateEvaluationInstructions:
      effectiveTest?.privateEvaluationInstructions ||
      submission.testSeries.privateEvaluationInstructions ||
      "",
    rubricContent: latestPaper?.rubricContent || null,
    questionPaperUrl:
      effectiveTest?.questionPaperUrl ||
      latestPaper?.fileUrl ||
      latestMasterPaper?.fileUrl ||
      null,
    modelAnswerUrl:
      effectiveTest?.modelAnswerUrl || latestPaper?.modelAnswerUrl || null,
  }
}

export function evaluateStaleJobDecision(params: {
  status: string
  ageMs: number
  queueJobState: string | null
}): { shouldFail: boolean; shouldWake: boolean } {
  const { status, ageMs, queueJobState } = params
  const hasRedisJob = queueJobState !== null
  const isWaitingInRedis =
    queueJobState === "waiting" ||
    queueJobState === "delayed" ||
    queueJobState === "prioritized"

  if (status === "PROCESSING") {
    if (ageMs >= PROCESSING_HARD_TIMEOUT_MS) {
      return { shouldFail: true, shouldWake: false }
    }
    if (ageMs >= PROCESSING_ORPHAN_MS && queueJobState !== "active") {
      return { shouldFail: true, shouldWake: false }
    }
    return { shouldFail: false, shouldWake: false }
  }

  if (status === "QUEUED" || status === "RETRYING") {
    if (ageMs >= QUEUED_HARD_TIMEOUT_MS) {
      return { shouldFail: true, shouldWake: false }
    }
    if (ageMs >= QUEUED_ORPHAN_MS && !hasRedisJob) {
      return { shouldFail: true, shouldWake: false }
    }
    if (
      ageMs >= QUEUED_WAKE_THRESHOLD_MS &&
      (isWaitingInRedis || !hasRedisJob)
    ) {
      return { shouldFail: false, shouldWake: true }
    }
  }

  return { shouldFail: false, shouldWake: false }
}

export async function wakeEvaluationWorker(): Promise<void> {
  const workerBaseUrl = process.env.EVALUATION_WORKER_URL?.trim()
  if (!workerBaseUrl) return

  const healthUrl = `${workerBaseUrl.replace(/\/+$/, "")}/health`
  try {
    await fetch(healthUrl, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(2500),
    })
  } catch {
    // Best-effort wake-up for sleeping Render free-tier worker
  }
}

async function markEvaluationJobAndSubmissionFailed(params: {
  submissionId: string
  runId?: string
  runNumber?: number
  errorMessage: string
  attempts?: number
}) {
  const { submissionId, runId, runNumber, errorMessage, attempts } = params

  if (runId) {
    await failEvaluationRun(runId, errorMessage).catch((runError) => {
      console.error(
        `[Worker] Failed to mark evaluation run ${runId} failed:`,
        runError
      )
    })
  } else {
    const existingSub = await prisma.submission
      .findUnique({
        where: { id: submissionId },
        select: { status: true },
      })
      .catch(() => null)
    if (
      existingSub &&
      existingSub.status !== SubmissionStatus.COMPLETED &&
      existingSub.status !== SubmissionStatus.REVIEW_REQUIRED
    ) {
      await prisma.submission
        .updateMany({
          where: {
            id: submissionId,
            status: {
              in: [SubmissionStatus.PENDING, SubmissionStatus.PROCESSING],
            },
          },
          data: { status: SubmissionStatus.FAILED },
        })
        .catch(() => undefined)
    }
  }

  await prisma.evaluationJob
    .updateMany({
      where: { submissionId },
      data: {
        status: "FAILED",
        lastError: errorMessage,
        ...(typeof attempts === "number" ? { attempts } : {}),
      },
    })
    .catch(() => undefined)

  if (runNumber === 1) {
    const sub = await prisma.submission
      .findUnique({
        where: { id: submissionId },
        select: { registrationId: true },
      })
      .catch(() => null)

    if (sub?.registrationId) {
      await prisma.testRegistration
        .update({
          where: { id: sub.registrationId },
          data: { maxAttempts: { increment: 1 } },
        })
        .catch(() => undefined)
    }
  }
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

        const testSelect = {
          id: true,
          title: true,
          subject: true,
          maxMarks: true,
          privateEvaluationInstructions: true,
          questionPaperUrl: true,
          modelAnswerUrl: true,
        }

        // Fetch submission with test series & optional child subject test data
        const submission = await prisma.submission.findUnique({
          where: { id: submissionId },
          include: {
            user: {
              select: { name: true, email: true },
            },
            test: { select: testSelect },
            registration: {
              select: {
                test: { select: testSelect },
              },
            },
            testSeries: {
              include: {
                tests: { select: testSelect, orderBy: { order: "asc" } },
                papers: { orderBy: { createdAt: "desc" }, take: 1 },
                questionPapers: { orderBy: { createdAt: "desc" }, take: 1 },
              },
            },
          },
        })

        if (!submission) {
          throw new Error(`Submission ${submissionId} not found`)
        }

        const targetMeta = resolveEvaluationTargetMeta(submission)

        if (targetMeta.inferredTestId) {
          await prisma.submission
            .update({
              where: { id: submissionId },
              data: { testId: targetMeta.inferredTestId },
            })
            .catch(() => undefined)
        }

        // Get file buffer + optional ground-truth Question Paper & Model Answer PDFs
        const [buffer, questionPaperDoc, modelAnswerDoc] = await Promise.all([
          (async () => {
            if (fileBuffer) {
              return Buffer.from(fileBuffer, "base64")
            }
            const fileReference = parsePrivateFileReference(fileUrl)
            if (!fileReference || fileReference.bucket !== "verityra-private") {
              throw new Error("The answer-sheet file reference is invalid.")
            }
            return downloadPrivateFile(
              fileReference.bucket,
              fileReference.filePath
            )
          })(),
          tryDownloadOptionalPrivateFile(targetMeta.questionPaperUrl),
          tryDownloadOptionalPrivateFile(targetMeta.modelAnswerUrl),
        ])

        if (!buffer || buffer.length === 0) {
          throw new Error(
            "Student answer sheet file is empty or could not be downloaded."
          )
        }

        // Update job progress
        await job.updateProgress(20)

        // Run AI evaluation
        console.log(
          `[Worker] Running AI evaluation for submission ${submissionId} (maxMarks=${targetMeta.maxMarks})`
        )
        const aiResult = await evaluateAnswerSheetWithGemini({
          testTitle: targetMeta.title,
          subject: targetMeta.subject,
          standard: targetMeta.standard,
          maxMarks: targetMeta.maxMarks,
          rubricContent: targetMeta.rubricContent,
          privateEvaluationInstructions:
            targetMeta.privateEvaluationInstructions,
          questionPaperBuffer: questionPaperDoc?.buffer || null,
          questionPaperMimeType: questionPaperDoc?.mimeType || null,
          modelAnswerBuffer: modelAnswerDoc?.buffer || null,
          modelAnswerMimeType: modelAnswerDoc?.mimeType || null,
          studentAnswerSheetBuffer: buffer,
          studentAnswerSheetMimeType: mimeType,
          studentAnswerSheetUrl: fileUrl,
        })

        await job.updateProgress(80)

        const persisted = await persistEvaluationRun({
          runId,
          submissionId,
          result: aiResult,
          maxMarks: targetMeta.maxMarks,
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
          invalidateAdminAnalyticsCache() // Invalidate admin dashboard analytics
        }

        // Email notification bypassed until custom Resend domain is verified
        /*
        if (submission.user?.email) {
          await sendEvaluationReadyEmail({
            to: submission.user.email,
            name: submission.user.name,
            testSeriesId: submission.testSeriesId,
            testTitle: targetMeta.title,
            attemptNumber: submission.attemptNumber,
            totalMarksAwarded: persisted.totalMarksAwarded,
            maxMarks: targetMeta.maxMarks,
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
        */

        console.log(`[Worker] Job ${job.id} completed successfully`)

        return {
          success: true,
          evaluationStatus: persisted.status,
          totalMarksAwarded: persisted.totalMarksAwarded,
          percentage: persisted.percentage,
        }
      } catch (error: unknown) {
        console.error(`[Worker] Job ${job.id} failed:`, error)

        const isFinal = isFinalBullMqAttempt(
          job.attemptsMade,
          job.opts.attempts
        )
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error"

        if (isFinal) {
          const currentSub = await prisma.submission
            .findUnique({
              where: { id: submissionId },
              select: { status: true },
            })
            .catch(() => null)
          const wasNotFailed =
            currentSub &&
            (currentSub.status === SubmissionStatus.PENDING ||
              currentSub.status === SubmissionStatus.PROCESSING)

          await markEvaluationJobAndSubmissionFailed({
            submissionId,
            runId,
            runNumber: wasNotFailed ? job.data.runNumber : undefined,
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
            .catch((dbError) => {
              console.error(
                `[Worker] Failed to update job status in database:`,
                dbError
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

  globalForQueue.evaluationWorker.on("failed", async (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed:`, err.message)
    if (!job?.data?.submissionId) return
    const maxAttempts = job.opts?.attempts ?? 1
    if (
      job.attemptsMade >= maxAttempts ||
      err.message.toLowerCase().includes("stalled")
    ) {
      const currentSub = await prisma.submission
        .findUnique({
          where: { id: job.data.submissionId },
          select: { status: true },
        })
        .catch(() => null)
      const wasNotFailed =
        currentSub &&
        (currentSub.status === SubmissionStatus.PENDING ||
          currentSub.status === SubmissionStatus.PROCESSING)

      if (wasNotFailed) {
        await markEvaluationJobAndSubmissionFailed({
          submissionId: job.data.submissionId,
          runId: job.data.runId,
          runNumber: job.data.runNumber,
          errorMessage: err.message || "Evaluation job failed permanently.",
          attempts: job.attemptsMade,
        })
      }
    }
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
    // A re-evaluation is a new logical run. Remove any leftover completed/failed
    // BullMQ job for the same jobId so re-queueing never silently no-ops.
    const jobId = `eval-${data.submissionId}-run-${data.runNumber}`
    const existing = await queue.getJob(jobId).catch(() => null)
    if (existing) {
      const existingState = await existing.getState().catch(() => null)
      if (existingState === "completed" || existingState === "failed") {
        await existing.remove().catch(() => undefined)
      }
    }

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
        startedAt: null,
        attempts: 0,
        lastError: null,
      },
    })

    const job = await queue.add("evaluate", data, { jobId })

    // Best-effort wake-up ping for Render free-tier worker
    await wakeEvaluationWorker()

    console.log(
      `[Queue] Queued evaluation job ${job.id} for submission ${data.submissionId}`
    )

    return job.id || jobId
  } catch (error: unknown) {
    console.error("[Queue] Failed to queue evaluation:", error)
    await prisma.evaluationJob
      .updateMany({
        where: { submissionId: data.submissionId },
        data: {
          status: "FAILED",
          lastError:
            error instanceof Error ? error.message : "Queue submission failed",
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
 * Reconcile stale PROCESSING / QUEUED / RETRYING evaluation jobs so submissions
 * never stay stuck indefinitely if the worker crashed, stalled, or slept.
 */
export async function reconcileStaleEvaluationJobs(
  limit = 25
): Promise<number> {
  try {
    const staleThreshold = new Date(Date.now() - QUEUED_WAKE_THRESHOLD_MS)
    const candidateJobs = await prisma.evaluationJob.findMany({
      where: {
        status: { in: ["PROCESSING", "QUEUED", "RETRYING"] },
        queuedAt: { lt: staleThreshold },
      },
      orderBy: { queuedAt: "asc" },
      take: limit,
      select: {
        id: true,
        submissionId: true,
        status: true,
        queuedAt: true,
        startedAt: true,
        updatedAt: true,
        attempts: true,
      },
    })

    if (candidateJobs.length === 0) return 0

    const queue = getEvaluationQueue()
    let reconciled = 0
    let wokeWorker = false

    for (const jobRecord of candidateJobs) {
      const latestRun = await prisma.evaluationRun.findFirst({
        where: { submissionId: jobRecord.submissionId },
        orderBy: { runNumber: "desc" },
        select: { id: true, runNumber: true, status: true },
      })

      let queueJobState: string | null = null
      if (queue) {
        const queueJobId = latestRun
          ? `eval-${jobRecord.submissionId}-run-${latestRun.runNumber}`
          : jobRecord.id
        const bullJob = await queue.getJob(queueJobId).catch(() => null)
        queueJobState = bullJob ? await bullJob.getState().catch(() => null) : null
      }

      const ageBase =
        jobRecord.status === "PROCESSING"
          ? jobRecord.startedAt ?? jobRecord.queuedAt
          : jobRecord.updatedAt ?? jobRecord.queuedAt
      const decision = evaluateStaleJobDecision({
        status: jobRecord.status,
        ageMs: Date.now() - ageBase.getTime(),
        queueJobState,
      })

      if (decision.shouldFail) {
        const currentSub = await prisma.submission
          .findUnique({
            where: { id: jobRecord.submissionId },
            select: { status: true },
          })
          .catch(() => null)
        const wasActive =
          currentSub &&
          (currentSub.status === SubmissionStatus.PENDING ||
            currentSub.status === SubmissionStatus.PROCESSING)

        await markEvaluationJobAndSubmissionFailed({
          submissionId: jobRecord.submissionId,
          runId:
            latestRun?.status === EvaluationStatus.PROCESSING
              ? latestRun.id
              : undefined,
          runNumber: wasActive ? latestRun?.runNumber : undefined,
          errorMessage:
            "Evaluation worker timed out before finishing. Use Retry / Re-evaluate from the admin panel.",
          attempts: jobRecord.attempts,
        })
        reconciled += 1
      } else if (decision.shouldWake && !wokeWorker) {
        await wakeEvaluationWorker()
        wokeWorker = true
      }
    }

    return reconciled
  } catch (error) {
    console.error("[Queue] Failed to reconcile stale evaluation jobs:", error)
    return 0
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

    const latestRun = await prisma.evaluationRun.findFirst({
      where: { submissionId },
      orderBy: { runNumber: "desc" },
      select: { id: true, runNumber: true, status: true },
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
      } catch {
        // Job might not exist in queue anymore
        jobProgressValue = 0
      }
    }

    const ageBase =
      jobRecord.status === "PROCESSING"
        ? jobRecord.startedAt ?? jobRecord.queuedAt
        : jobRecord.updatedAt ?? jobRecord.queuedAt
    const decision = evaluateStaleJobDecision({
      status: jobRecord.status,
      ageMs: Date.now() - ageBase.getTime(),
      queueJobState,
    })

    if (decision.shouldFail) {
      const errorMsg =
        "Evaluation worker timed out. Retry from the admin submissions page."
      const currentSub = await prisma.submission
        .findUnique({
          where: { id: submissionId },
          select: { status: true },
        })
        .catch(() => null)
      const wasActive =
        currentSub &&
        (currentSub.status === SubmissionStatus.PENDING ||
          currentSub.status === SubmissionStatus.PROCESSING)

      await markEvaluationJobAndSubmissionFailed({
        submissionId,
        runId:
          latestRun?.status === EvaluationStatus.PROCESSING
            ? latestRun.id
            : undefined,
        runNumber: wasActive ? latestRun?.runNumber : undefined,
        errorMessage: errorMsg,
        attempts: jobRecord.attempts,
      })

      return {
        status: "FAILED",
        progress: jobProgressValue,
        attempts: jobRecord.attempts,
        error: errorMsg,
        queuedAt: jobRecord.queuedAt,
        startedAt: jobRecord.startedAt,
        completedAt: jobRecord.completedAt,
      }
    }

    if (decision.shouldWake) {
      await wakeEvaluationWorker()
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
