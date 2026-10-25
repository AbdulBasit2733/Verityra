"use server"

import { getCurrentUser } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { uploadPrivateFile } from "@/lib/supabase"
import { evaluateAnswerSheetWithGemini } from "@/lib/ai/gemini-evaluator"
import { queueEvaluation } from "@/lib/queue/evaluation-queue"
import { EvaluationStatus, RegistrationStatus, SubmissionStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { ActionResult } from "./auth-actions"

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB

/**
 * Server Action: Submit Handwritten Answer Sheet
 * Strict atomic three-attempt enforcement with database concurrency safety.
 */
export async function submitAnswerSheetAction(formData: FormData): Promise<ActionResult<{ submissionId: string; attemptNumber: number }>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Authentication required to submit answers." }
  }

  const testSeriesId = formData.get("testSeriesId") as string
  const file = formData.get("file") as File | null

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
      error: `File size exceeds the 25MB limit (current: ${(file.size / (1024 * 1024)).toFixed(2)} MB).`,
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
  const storagePath = `submissions/${testSeriesId}/${user.id}/attempt_${attemptToReserve}_${Date.now()}_${file.name}`

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
          status: SubmissionStatus.PROCESSING,
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

  // 7. Trigger AI Evaluation Workflow (Async Queue)
  // Attempt to queue evaluation in background; fall back to synchronous if Redis unavailable
  const jobId = await queueEvaluation({
    submissionId: submission.id,
    testSeriesId: registration.testSeriesId,
    userId: user.id,
    fileUrl: uploadedFileUrl,
    fileBuffer: fileBytes.toString('base64'), // Pass buffer to avoid re-downloading
    mimeType: file.type,
  })

  if (!jobId) {
    // Redis not available - fall back to synchronous evaluation (legacy path)
    console.warn('[Submission] Redis unavailable, falling back to synchronous evaluation')

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

      // Compute application-level totals
      let totalScore = 0
      aiResult.questions.forEach((q) => {
        totalScore += q.marksAwarded
      })

      const percentage = Number(((totalScore / testSeries.maxMarks) * 100).toFixed(2))

      // Determine status: if uncertainty or legibility warnings triggered, flag for REVIEW_REQUIRED
      const evalStatus =
        aiResult.uncertaintyFlag || aiResult.legibilityWarning
          ? EvaluationStatus.REVIEW_REQUIRED
          : EvaluationStatus.COMPLETED

      await prisma.$transaction(async (tx) => {
        const evaluation = await tx.evaluation.create({
          data: {
            submissionId: submission.id,
            totalMarksAwarded: totalScore,
            maxMarks: testSeries.maxMarks,
            percentage,
            generalFeedback: aiResult.generalFeedback,
            legibilityWarning: aiResult.legibilityWarning,
            uncertaintyFlag: aiResult.uncertaintyFlag,
            status: evalStatus,
            evaluatedAt: new Date(),
            questions: {
              create: aiResult.questions.map((q) => ({
                questionNumber: q.questionNumber,
                maxMarks: q.maxMarks,
                marksAwarded: q.marksAwarded,
                feedback: q.feedback,
                missingConcepts: q.missingConcepts,
                isLegible: q.isLegible,
                isUncertain: q.isUncertain,
              })),
            },
          },
        })

        await tx.submission.update({
          where: { id: submission.id },
          data: {
            status:
              evalStatus === EvaluationStatus.REVIEW_REQUIRED
                ? SubmissionStatus.REVIEW_REQUIRED
                : SubmissionStatus.COMPLETED,
          },
        })
      })
    } catch (evalErr) {
      console.error("[EVALUATION FAILED]", evalErr)
      await prisma.submission.update({
        where: { id: submission.id },
        data: { status: SubmissionStatus.FAILED },
      })
    }
  }

  revalidatePath(`/student/tests/${testSeriesId}`)
  revalidatePath("/student/dashboard")
  revalidatePath("/admin/submissions")

  const evaluationMessage = jobId
    ? "Your submission is being evaluated. Results will be available shortly."
    : "Evaluation completed."

  return {
    success: true,
    message: `Attempt ${submission.attemptNumber} of ${registration.maxAttempts} submitted successfully. ${evaluationMessage}`,
    data: { submissionId: submission.id, attemptNumber: submission.attemptNumber },
  }
}
