"use server"

import { getCurrentUser } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { uploadPrivateFile } from "@/lib/supabase"
import { evaluateAnswerSheetWithGemini, getGeminiModelName } from "@/lib/ai/gemini-evaluator"
import { queueEvaluation } from "@/lib/queue/evaluation-queue"
import { claimEvaluationRun, failEvaluationRun, persistEvaluationRun } from "@/lib/evaluation/evaluation-run-service"
import { RegistrationStatus, SubmissionStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { ActionResult } from "./auth-actions"

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024 // Keep scanned answer sheets under 2 MB

/**
 * Server Action: Submit Handwritten Answer Sheet
 * Strict atomic three-attempt enforcement with database concurrency safety.
 */
export async function submitAnswerSheetAction(formData: FormData): Promise<ActionResult<{ submissionId: string; attemptNumber: number }>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Authentication required to submit answers." }
  }

  const testSeriesIdValue = formData.get("testSeriesId")
  const fileValue = formData.get("file")
  const testSeriesId = typeof testSeriesIdValue === "string" ? testSeriesIdValue : ""
  const file = fileValue instanceof File ? fileValue : null

  if (!testSeriesId || !file) {
    return { success: false, error: "Test series ID and answer sheet file are required." }
  }

  // 1. File Type and Size Validation (Does NOT consume attempt if invalid)
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      success: false,
      error: `Unsupported file format (${file.type}). Please upload a PDF or JPG/PNG image scan.`,
    }
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      success: false,
      error: `File size exceeds the 2MB limit (current: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
    }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: true,
      message: "Submission accepted (Dev Mode). Evaluation completed.",
      data: { submissionId: "dev-sub-" + Date.now(), attemptNumber: 1 },
    }
  }

  // 2. Fetch Registration and Test Series
  const registration = await prisma.testRegistration.findUnique({
    where: {
      userId_testSeriesId: {
        userId: user.id,
        testSeriesId,
      },
    },
    include: {
      testSeries: {
        include: {
          papers: true,
        },
      },
    },
  })

  if (!registration || registration.status !== RegistrationStatus.ACTIVE) {
    return {
      success: false,
      error: "You are not registered for this test series or your registration is inactive.",
    }
  }

  // 3. Strict Attempt Limit Check
  if (registration.attemptsUsed >= registration.maxAttempts) {
    return {
      success: false,
      error: `Attempt limit reached. You have utilized all ${registration.maxAttempts} allowed submissions for this test series.`,
    }
  }

  // 4. Verify test window
  const now = new Date()
  if (registration.testSeries.endDate && now > registration.testSeries.endDate) {
    return {
      success: false,
      error: "The submission deadline for this test series has passed.",
    }
  }

  // 5. Upload File Securely to Private Storage
  const fileBytes = Buffer.from(await file.arrayBuffer())
  const attemptToReserve = registration.attemptsUsed + 1
  const safeFileName = (file.name.split(/[\\/]/).pop() || "answer-sheet").replace(/[^\w.-]/g, "_")
  const storagePath = `submissions/${testSeriesId}/${user.id}/attempt_${attemptToReserve}_${Date.now()}_${safeFileName}`

  let uploadedFileUrl: string
  try {
    const uploadResult = await uploadPrivateFile("verityra-private", storagePath, fileBytes, file.type)
    uploadedFileUrl = uploadResult.url
  } catch (err: any) {
    console.error("[UPLOAD ERROR]", err)
    return { success: false, error: "Failed to store answer sheet securely. Please try again." }
  }

  // 6. Atomically Reserve Attempt & Create Submission in Database Transaction
  let submission: any
  try {
    submission = await prisma.$transaction(async (tx) => {
      // Re-check count inside transaction to prevent concurrent race condition bypass
      const currentReg = await tx.testRegistration.findUnique({
        where: { id: registration.id },
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
          testSeriesId,
          userId: user.id,
          attemptNumber: nextAttemptNumber,
          fileUrl: uploadedFileUrl,
          fileType: file.type,
          fileSizeBytes: file.size,
          status: SubmissionStatus.PENDING,
        },
      })

      return newSub
    })
  } catch (txError: any) {
    if (txError.message === "ATTEMPT_LIMIT_EXCEEDED" || txError.code === "P2002") {
      return {
        success: false,
        error: "Attempt limit exceeded or concurrent submission detected. Further submissions blocked.",
      }
    }
    console.error("[TRANSACTION SUBMISSION ERROR]", txError)
    return { success: false, error: "Database transaction failed. Please try again." }
  }

  let evaluationRun
  try {
    evaluationRun = await claimEvaluationRun(submission.id, "AUTOMATIC")
  } catch (runError: any) {
    console.error("[EVALUATION RUN CLAIM ERROR]", runError)
    await prisma.submission.update({ where: { id: submission.id }, data: { status: SubmissionStatus.FAILED } })
    return { success: false, error: "Submission saved, but evaluation could not be queued. Please contact an administrator." }
  }

  // 7. Trigger AI Evaluation Workflow (Async Queue)
  // Queue evaluation in the background; only local development may use the sync fallback.
  const jobId = await queueEvaluation({
    submissionId: submission.id,
    testSeriesId: registration.testSeriesId,
    userId: user.id,
    fileUrl: uploadedFileUrl,
    fileBuffer: fileBytes.toString('base64'), // Pass buffer to avoid re-downloading
    mimeType: file.type,
    runId: evaluationRun.id,
    runNumber: evaluationRun.runNumber,
  })

  let evaluationFailed = false
  if (!jobId && process.env.NODE_ENV === "development") {
    // Keep local development usable without Redis; production is always asynchronous.
    console.warn('[Submission] Redis unavailable in development, using synchronous evaluation')

    try {
      const testSeries = registration.testSeries
      const latestPaper = testSeries.papers[0]

      const aiResult = await evaluateAnswerSheetWithGemini({
        testTitle: testSeries.title,
        maxMarks: testSeries.maxMarks,
        rubricContent: latestPaper?.rubricContent || null,
        privateEvaluationInstructions: testSeries.privateEvaluationInstructions,
        studentAnswerSheetBuffer: fileBytes,
        studentAnswerSheetMimeType: file.type,
        studentAnswerSheetUrl: uploadedFileUrl,
      })

      await persistEvaluationRun({
        runId: evaluationRun.id,
        submissionId: submission.id,
        result: aiResult,
        maxMarks: testSeries.maxMarks,
        evaluatorModel: getGeminiModelName(),
      })
    } catch (evalErr) {
      console.error("[EVALUATION FAILED]", evalErr)
      evaluationFailed = true
      await failEvaluationRun(evaluationRun.id, evalErr instanceof Error ? evalErr.message : "Evaluation failed")
    }
  } else if (!jobId) {
    evaluationFailed = true
    await failEvaluationRun(evaluationRun.id, "Evaluation worker is unavailable. Configure REDIS_URL and start the worker.")
  } else {
    evaluationFailed = false
  }

  revalidatePath(`/student/tests/${testSeriesId}`)
  revalidatePath("/student/dashboard")
  revalidatePath("/admin/submissions")

  const evaluationMessage = jobId
    ? "Your submission is being evaluated. Results will be available shortly."
    : evaluationFailed
      ? "Your submission was saved, but evaluation failed. It remains retryable from the admin submissions page."
      : "Evaluation completed."

  return {
    success: true,
    message: `Attempt ${submission.attemptNumber} of ${registration.maxAttempts} submitted successfully. ${evaluationMessage}`,
    data: { submissionId: submission.id, attemptNumber: submission.attemptNumber },
  }
}
