"use server"

import {
  getCurrentUser,
  getPersistedCurrentUser,
  PersistedUserLookupError,
} from "@/lib/auth-guard"
import { prisma, isDatabaseConnected, DB_TX_OPTIONS } from "@/lib/prisma"
import { uploadPrivateFile } from "@/lib/supabase"
import {
  evaluateAnswerSheetWithGemini,
  getGeminiModelName,
} from "@/lib/ai/gemini-evaluator"
import {
  getOrCreateQuestionBlueprint,
  queueEvaluation,
  tryDownloadOptionalPrivateFile,
} from "@/lib/queue/evaluation-queue"
import {
  claimEvaluationRun,
  failEvaluationRun,
  persistEvaluationRun,
} from "@/lib/evaluation/evaluation-run-service"
import { RegistrationStatus, SubmissionStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { ActionResult } from "./auth-actions"

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // Allow multi-page scanned answer booklets up to 10 MB

/**
 * Server Action: Submit Handwritten Answer Sheet
 * Strict atomic three-attempt enforcement with database concurrency safety.
 */
export async function submitAnswerSheetAction(
  formData: FormData
): Promise<ActionResult<{ submissionId: string; attemptNumber: number }>> {
  let user
  try {
    user = await getPersistedCurrentUser()
  } catch (err) {
    if (err instanceof PersistedUserLookupError) {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    throw err
  }

  if (!user) {
    return {
      success: false,
      error: "Authentication required to submit answers. Please sign in again.",
    }
  }

  const testSeriesIdValue = formData.get("testSeriesId")
  const fileValue = formData.get("file")
  const testSeriesId =
    typeof testSeriesIdValue === "string" ? testSeriesIdValue : ""
  const file = fileValue instanceof File ? fileValue : null

  if (!testSeriesId || !file) {
    return {
      success: false,
      error: "Test series ID and answer sheet file are required.",
    }
  }

  // 1. File Type and Size Validation (Does NOT consume attempt if invalid)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Unsupported file format (${file.type}). Please upload a PDF or JPG/PNG image scan.`,
    }
  }

  if (file.size <= 0) {
    return {
      success: false,
      error: "The selected answer sheet file is empty. Please upload a valid scan.",
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 10 MB maximum limit.`,
    }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    return {
      success: true,
      message: "Submission accepted (Dev Mode). Evaluation completed.",
      data: { submissionId: "dev-sub-" + Date.now(), attemptNumber: 1 },
    }
  }

  // 2. Resolve optional Subject Test (Test.id) vs parent TestSeries and fetch registration
  const childTest = await prisma.test.findUnique({
    where: { id: testSeriesId },
    select: {
      id: true,
      title: true,
      subject: true,
      maxMarks: true,
      maxAttempts: true,
      privateEvaluationInstructions: true,
      questionPaperUrl: true,
      modelAnswerUrl: true,
      testSeriesId: true,
    },
  })

  if (childTest && !childTest.testSeriesId) {
    return {
      success: false,
      error: "This subject test is not linked to an active test series yet.",
    }
  }

  const resolvedTestSeriesId = childTest?.testSeriesId || testSeriesId

  const [directTestRegistration, bundleRegistration] = await Promise.all([
    childTest
      ? prisma.testRegistration.findUnique({
          where: {
            userId_testId: {
              userId: user.id,
              testId: childTest.id,
            },
          },
          include: {
            testSeries: { include: { papers: true, _count: { select: { tests: true } } } },
          },
        })
      : Promise.resolve(null),
    prisma.testRegistration.findUnique({
      where: {
        userId_testSeriesId: {
          userId: user.id,
          testSeriesId: resolvedTestSeriesId,
        },
      },
      include: {
        testSeries: { include: { papers: true, _count: { select: { tests: true } } } },
      },
    }),
  ])

  const hasDirectAccess =
    directTestRegistration?.status === RegistrationStatus.ACTIVE
  const hasBundleAccess =
    bundleRegistration?.status === RegistrationStatus.ACTIVE

  if (!hasDirectAccess && !hasBundleAccess) {
    return {
      success: false,
      error:
        "You are not registered for this test or your registration is inactive.",
    }
  }

  const parentSeries =
    bundleRegistration?.testSeries ||
    directTestRegistration?.testSeries ||
    (await prisma.testSeries.findUnique({
      where: { id: resolvedTestSeriesId },
      include: { papers: true, _count: { select: { tests: true } } },
    }))

  // Isolate per-Subject-Test 3-attempt quota so bundle students get independent attempts per subject
  let activeRegistration: {
    id: string
    attemptsUsed: number
    maxAttempts: number
    testSeriesId: string | null
  }

  if (childTest) {
    if (directTestRegistration && hasDirectAccess) {
      activeRegistration = directTestRegistration
    } else {
      const isSingleTestSeries = (parentSeries?._count?.tests || 0) <= 1
      const legacySubjectAttempts = bundleRegistration
        ? await prisma.submission.count({
            where: {
              registrationId: bundleRegistration.id,
              OR: [
                { testId: childTest.id },
                ...(isSingleTestSeries ? [{ testId: null }] : []),
              ],
            },
          })
        : 0
      const resolvedMaxAttempts =
        childTest.maxAttempts || bundleRegistration?.maxAttempts || 3

      activeRegistration = await prisma.testRegistration.upsert({
        where: {
          userId_testId: {
            userId: user.id,
            testId: childTest.id,
          },
        },
        create: {
          userId: user.id,
          testId: childTest.id,
          testSeriesId: null,
          status: RegistrationStatus.ACTIVE,
          attemptsUsed: legacySubjectAttempts,
          maxAttempts: resolvedMaxAttempts,
        },
        update: {
          status: RegistrationStatus.ACTIVE,
        },
      })
    }
  } else {
    activeRegistration = bundleRegistration!
  }

  // 3. Strict Attempt Limit Check
  if (activeRegistration.attemptsUsed >= activeRegistration.maxAttempts) {
    return {
      success: false,
      error: `Attempt limit reached. You have utilized all ${activeRegistration.maxAttempts} allowed submissions for this test.`,
    }
  }

  // 4. Verify test window
  const now = new Date()
  if (parentSeries?.endDate && now > parentSeries.endDate) {
    return {
      success: false,
      error: "The submission deadline for this test series has passed.",
    }
  }

  // 5. Upload File Securely to Private Storage
  const fileBytes = Buffer.from(await file.arrayBuffer())
  const attemptToReserve = activeRegistration.attemptsUsed + 1
  const safeFileName = (
    file.name.split(/[\\/]/).pop() || "answer-sheet"
  ).replace(/[^\w.-]/g, "_")
  const storagePath = `submissions/${resolvedTestSeriesId}/${user.id}/attempt_${attemptToReserve}_${Date.now()}_${safeFileName}`

  let uploadedFileUrl: string
  try {
    const uploadResult = await uploadPrivateFile(
      "verityra-private",
      storagePath,
      fileBytes,
      file.type
    )
    uploadedFileUrl = uploadResult.url
  } catch (err: any) {
    console.error("[UPLOAD ERROR]", err)
    return {
      success: false,
      error: "Failed to store answer sheet securely. Please try again.",
    }
  }

  // 6. Atomically Reserve Attempt & Create Submission in Database Transaction
  let submission: any
  try {
    submission = await prisma.$transaction(async (tx) => {
      // Re-check count inside transaction to prevent concurrent race condition bypass
      const currentReg = await tx.testRegistration.findUnique({
        where: { id: activeRegistration.id },
      })

      if (!currentReg || currentReg.attemptsUsed >= currentReg.maxAttempts) {
        throw new Error("ATTEMPT_LIMIT_EXCEEDED")
      }

      const nextAttemptNumber = currentReg.attemptsUsed + 1

      // Increment attempts used
      await tx.testRegistration.update({
        where: { id: currentReg.id },
        data: { attemptsUsed: nextAttemptNumber },
      })

      // Create Submission record with unique (registrationId, attemptNumber) constraint
      const newSub = await tx.submission.create({
        data: {
          registrationId: currentReg.id,
          testSeriesId: resolvedTestSeriesId,
          testId: childTest?.id ?? null,
          userId: user.id,
          attemptNumber: nextAttemptNumber,
          fileUrl: uploadedFileUrl,
          fileType: file.type,
          fileSizeBytes: file.size,
          status: SubmissionStatus.PENDING,
        },
      })

      return newSub
    }, DB_TX_OPTIONS)
  } catch (txError: any) {
    if (
      txError.message === "ATTEMPT_LIMIT_EXCEEDED" ||
      txError.code === "P2002"
    ) {
      return {
        success: false,
        error:
          "Attempt limit exceeded or concurrent submission detected. Further submissions blocked.",
      }
    }
    console.error("[TRANSACTION SUBMISSION ERROR]", txError)
    return {
      success: false,
      error: "Database transaction failed. Please try again.",
    }
  }

  let evaluationRun
  try {
    evaluationRun = await claimEvaluationRun(submission.id, "AUTOMATIC")
  } catch (runError: any) {
    console.error("[EVALUATION RUN CLAIM ERROR]", runError)
    // Terminal setup failure: compensate attempt and delete un-claimable submission to restore attempt slot
    try {
      await prisma.$transaction([
        prisma.submission.delete({ where: { id: submission.id } }),
        prisma.testRegistration.update({
          where: { id: activeRegistration.id },
          data: { attemptsUsed: { decrement: 1 } },
        }),
      ])
    } catch (compensationError: any) {
      console.error("[COMPENSATION ERROR]", compensationError)
    }
    return {
      success: false,
      error:
        "Evaluation setup encountered a system error. Your attempt has been restored. Please try submitting again.",
    }
  }

  // 7. Trigger AI Evaluation Workflow (Async Queue)
  // Queue evaluation in the background; only local development may use the sync fallback.
  const targetSeriesId =
    activeRegistration.testSeriesId || resolvedTestSeriesId
  const jobId = await queueEvaluation({
    submissionId: submission.id,
    testSeriesId: targetSeriesId,
    userId: user.id,
    fileUrl: uploadedFileUrl,
    mimeType: file.type,
    runId: evaluationRun.id,
    runNumber: evaluationRun.runNumber,
  })

  let evaluationFailed = false
  if (!jobId && process.env.NODE_ENV === "development") {
    // Keep local development usable without Redis; production is always asynchronous.
    console.warn(
      "[Submission] Redis unavailable in development, using synchronous evaluation"
    )

    try {
      const latestPaper = parentSeries?.papers?.[0]
      const effectiveTitle =
        childTest?.title || parentSeries?.title || "Test Series"
      const effectiveMaxMarks =
        childTest?.maxMarks ?? parentSeries?.maxMarks ?? 100
      const effectiveInstructions =
        childTest?.privateEvaluationInstructions ||
        parentSeries?.privateEvaluationInstructions ||
        ""
      const questionPaperUrl =
        childTest?.questionPaperUrl || latestPaper?.fileUrl || null
      const [questionPaperDoc, modelAnswerDoc] = await Promise.all([
        tryDownloadOptionalPrivateFile(questionPaperUrl),
        tryDownloadOptionalPrivateFile(
          childTest?.modelAnswerUrl || latestPaper?.modelAnswerUrl
        ),
      ])
      const questionBlueprint = await getOrCreateQuestionBlueprint({
        questionPaperUrl,
        questionPaperDoc,
        testTitle: effectiveTitle,
        subject: childTest?.subject || null,
        maxMarks: effectiveMaxMarks,
      })

      const aiResult = await evaluateAnswerSheetWithGemini({
        testTitle: effectiveTitle,
        subject: childTest?.subject || null,
        standard: parentSeries?.standard || null,
        maxMarks: effectiveMaxMarks,
        rubricContent: latestPaper?.rubricContent || null,
        privateEvaluationInstructions: effectiveInstructions,
        questionBlueprint,
        questionPaperBuffer: questionPaperDoc?.buffer || null,
        questionPaperMimeType: questionPaperDoc?.mimeType || null,
        modelAnswerBuffer: modelAnswerDoc?.buffer || null,
        modelAnswerMimeType: modelAnswerDoc?.mimeType || null,
        studentAnswerSheetBuffer: fileBytes,
        studentAnswerSheetMimeType: file.type,
        studentAnswerSheetUrl: uploadedFileUrl,
      })

      await persistEvaluationRun({
        runId: evaluationRun.id,
        submissionId: submission.id,
        result: aiResult,
        maxMarks: effectiveMaxMarks,
        evaluatorModel: getGeminiModelName(),
      })
    } catch (evalErr) {
      console.error("[EVALUATION FAILED]", evalErr)
      evaluationFailed = true
      await failEvaluationRun(
        evaluationRun.id,
        evalErr instanceof Error ? evalErr.message : "Evaluation failed"
      )
    }
  } else if (!jobId) {
    evaluationFailed = true
    await failEvaluationRun(
      evaluationRun.id,
      "Evaluation worker is unavailable. Configure REDIS_URL and start the worker."
    )
  } else {
    evaluationFailed = false
  }

  revalidatePath(`/student/tests/${testSeriesId}`)
  if (resolvedTestSeriesId !== testSeriesId) {
    revalidatePath(`/student/tests/${resolvedTestSeriesId}`)
  }
  revalidatePath("/student/dashboard")
  revalidatePath("/student/evaluations")
  revalidatePath("/admin/submissions")

  const evaluationMessage = jobId
    ? "Your submission is being evaluated. Results will be available shortly."
    : evaluationFailed
      ? "Your submission was saved, but evaluation failed. It remains retryable from the admin submissions page."
      : "Evaluation completed."

  return {
    success: true,
    message: `Attempt ${submission.attemptNumber} of ${activeRegistration.maxAttempts} submitted successfully. ${evaluationMessage}`,
    data: {
      submissionId: submission.id,
      attemptNumber: submission.attemptNumber,
    },
  }
}
