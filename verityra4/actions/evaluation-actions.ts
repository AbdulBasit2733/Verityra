"use server"

import { getCurrentUser, resolvePersistedAdminActor } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected, DB_TX_OPTIONS } from "@/lib/prisma"
import {
  evaluateAnswerSheetWithGemini,
  getGeminiModelName,
} from "@/lib/ai/gemini-evaluator"
import { downloadPrivateFile, parsePrivateFileReference } from "@/lib/supabase"
import { invalidateLeaderboardCache } from "@/lib/cache"
import { EvaluationStatus, Role, SubmissionStatus } from "@prisma/client"
import {
  claimEvaluationRun,
  EvaluationRunError,
  failEvaluationRun,
} from "@/lib/evaluation/evaluation-run-service"
import { queueEvaluation } from "@/lib/queue/evaluation-queue"
import { revalidatePath } from "next/cache"
import { ActionResult } from "./auth-actions"

export async function adminReevaluateSubmissionAction(
  submissionId: string
): Promise<ActionResult<{ runNumber: number }>> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }
  if (!submissionId?.trim())
    return { success: false, error: "A submission ID is required." }
  if (!(await isDatabaseConnected()))
    return {
      success: false,
      error: "Connect the database before re-evaluating.",
    }
  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: {
      id: true,
      testSeriesId: true,
      userId: true,
      fileUrl: true,
      fileType: true,
    },
  })
  if (!submission) return { success: false, error: "Submission not found." }

  let run
  try {
    run = await claimEvaluationRun(submission.id, "ADMIN_REEVALUATION")
  } catch (error) {
    if (error instanceof EvaluationRunError)
      return { success: false, error: error.message }
    console.error("[ADMIN RE-EVALUATION CLAIM ERROR]", error)
    return { success: false, error: "Could not reserve a re-evaluation run." }
  }

  const jobId = await queueEvaluation({
    submissionId: submission.id,
    testSeriesId: submission.testSeriesId,
    userId: submission.userId,
    fileUrl: submission.fileUrl,
    mimeType: submission.fileType,
    runId: run.id,
    runNumber: run.runNumber,
  })
  if (!jobId) {
    await failEvaluationRun(
      run.id,
      "Evaluation worker is unavailable. Configure REDIS_URL and start the worker."
    )
    return {
      success: false,
      error:
        "Evaluation worker is unavailable. The run was marked failed and remains audited.",
    }
  }

  revalidatePath("/admin/submissions")
  revalidatePath(`/admin/submissions/${submission.id}`)
  revalidatePath(`/student/tests/${submission.testSeriesId}`)
  return {
    success: true,
    message: `Re-evaluation run ${run.runNumber} queued.`,
    data: { runNumber: run.runNumber },
  }
}

async function legacyAdminEvaluateSubmissionAction(
  submissionId: string
): Promise<ActionResult<{ totalMarksAwarded: number; maxMarks: number }>> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  if (!submissionId?.trim()) {
    return { success: false, error: "A submission ID is required." }
  }

  if (!(await isDatabaseConnected())) {
    return {
      success: false,
      error: "Connect the database before evaluating a submission.",
    }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }
  const user = actor.user

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: {
      evaluation: { include: { questions: true } },
      testSeries: {
        include: {
          papers: { orderBy: { createdAt: "desc" } },
        },
      },
    },
  })

  if (!submission) {
    return { success: false, error: "Submission not found." }
  }
  const isReviewRequiredRetry =
    submission.status === SubmissionStatus.REVIEW_REQUIRED &&
    submission.evaluation?.status === EvaluationStatus.REVIEW_REQUIRED
  if (submission.evaluation && !isReviewRequiredRetry) {
    return {
      success: false,
      error: "This submission already has a score to review.",
    }
  }
  if (
    submission.status !== SubmissionStatus.PENDING &&
    submission.status !== SubmissionStatus.FAILED &&
    submission.status !== SubmissionStatus.REVIEW_REQUIRED
  ) {
    return {
      success: false,
      error:
        "This submission is already being evaluated or has been finalized.",
    }
  }

  const claimed = await prisma.submission.updateMany({
    where: { id: submission.id, status: submission.status },
    data: { status: SubmissionStatus.PROCESSING },
  })
  if (claimed.count !== 1) {
    return {
      success: false,
      error:
        "This submission was already claimed for evaluation. Refresh and check its status.",
    }
  }

  try {
    const fileReference = parsePrivateFileReference(submission.fileUrl)
    if (!fileReference || fileReference.bucket !== "verityra-private") {
      throw new Error("The answer-sheet file reference is invalid.")
    }

    const answerSheet = await downloadPrivateFile(
      fileReference.bucket,
      fileReference.filePath
    )
    const paper = submission.testSeries.papers[0]
    const result = await evaluateAnswerSheetWithGemini({
      testTitle: submission.testSeries.title,
      maxMarks: submission.testSeries.maxMarks,
      rubricContent: paper?.rubricContent || null,
      privateEvaluationInstructions:
        submission.testSeries.privateEvaluationInstructions || "",
      studentAnswerSheetBuffer: answerSheet,
      studentAnswerSheetMimeType: submission.fileType,
    })

    const totalMarksAwarded = result.questions.reduce(
      (total, question) => total + question.marksAwarded,
      0
    )
    const maxMarks = submission.testSeries.maxMarks
    const percentage =
      maxMarks > 0
        ? Number(((totalMarksAwarded / maxMarks) * 100).toFixed(2))
        : 0
    const requiresReview = result.uncertaintyFlag || result.legibilityWarning
    const evaluationStatus = requiresReview
      ? EvaluationStatus.REVIEW_REQUIRED
      : EvaluationStatus.COMPLETED

    await prisma.$transaction(
      async (tx) => {
        if (submission.evaluation && isReviewRequiredRetry) {
          await tx.auditLog.create({
            data: {
              adminId: user.id,
              action: "SUBMISSION_EVALUATION_RETRIGGERED",
              targetType: "Submission",
              targetId: submission.id,
              details: JSON.stringify({
                reason:
                  "Admin retriggered AI evaluation for a review-required submission.",
                previousEvaluation: {
                  totalMarksAwarded: submission.evaluation.totalMarksAwarded,
                  maxMarks: submission.evaluation.maxMarks,
                  percentage: submission.evaluation.percentage,
                  status: submission.evaluation.status,
                  uncertaintyFlag: submission.evaluation.uncertaintyFlag,
                  legibilityWarning: submission.evaluation.legibilityWarning,
                  questions: submission.evaluation.questions.map(
                    (question) => ({
                      questionNumber: question.questionNumber,
                      maxMarks: question.maxMarks,
                      marksAwarded: question.marksAwarded,
                      isUncertain: question.isUncertain,
                      isLegible: question.isLegible,
                    })
                  ),
                },
              }),
            },
          })
          await tx.evaluation.delete({
            where: { id: submission.evaluation.id },
          })
        }

        await tx.evaluation.create({
          data: {
            submissionId: submission.id,
            totalMarksAwarded,
            maxMarks,
            percentage,
            generalFeedback: result.generalFeedback,
            legibilityWarning: result.legibilityWarning,
            uncertaintyFlag: result.uncertaintyFlag,
            status: evaluationStatus,
            evaluatorModel: getGeminiModelName(),
            evaluatedAt: new Date(),
            questions: {
              create: result.questions.map((question) => ({
                questionNumber: question.questionNumber,
                maxMarks: question.maxMarks,
                marksAwarded: question.marksAwarded,
                feedback: question.feedback,
                missingConcepts: question.missingConcepts || "",
                isLegible: question.isLegible,
                isUncertain: question.isUncertain,
              })),
            },
          },
        })

        await tx.submission.update({
          where: { id: submission.id },
          data: {
            status: requiresReview
              ? SubmissionStatus.REVIEW_REQUIRED
              : SubmissionStatus.COMPLETED,
          },
        })

        await tx.evaluationJob.updateMany({
          where: { submissionId: submission.id },
          data: {
            status: "COMPLETED",
            completedAt: new Date(),
            lastError: null,
          },
        })

        await tx.auditLog.create({
          data: {
            adminId: user.id,
            action: isReviewRequiredRetry
              ? "SUBMISSION_EVALUATION_RETRIGGERED"
              : "SUBMISSION_EVALUATION_TRIGGERED",
            targetType: "Submission",
            targetId: submission.id,
            details: `Admin ${isReviewRequiredRetry ? "retriggered" : "triggered"} score calculation for attempt ${submission.attemptNumber}.`,
          },
        })
      },
      {
        // Supabase can take a few seconds for the delete/create cascade on a retry.
        // Keep this scoped to evaluation persistence instead of slowing all transactions.
        maxWait: 10_000,
        timeout: 30_000,
      }
    )

    revalidatePath("/admin/submissions")
    revalidatePath(`/admin/submissions/${submission.id}`)
    revalidatePath(`/student/tests/${submission.testSeriesId}`)
    revalidatePath("/leaderboard")
    invalidateLeaderboardCache()

    return {
      success: true,
      message: `Score calculated: ${totalMarksAwarded} / ${maxMarks}.`,
      data: { totalMarksAwarded, maxMarks },
    }
  } catch (error) {
    console.error("[ADMIN SUBMISSION EVALUATION ERROR]", error)
    await prisma.submission.update({
      where: { id: submission.id },
      data: {
        status: isReviewRequiredRetry
          ? SubmissionStatus.REVIEW_REQUIRED
          : SubmissionStatus.FAILED,
      },
    })
    return {
      success: false,
      error:
        "Could not calculate a score. Check the answer-sheet file and evaluation service, then retry.",
    }
  }
}

export type QuestionAdjustment = {
  questionEvaluationId: string
  newMarksAwarded: number
  adminNotes?: string
}

/**
 * Server Action: Admin Review & Correction of Scores
 * Allows an admin to adjust question marks, record audit log, and approve the result.
 */
export async function adminReviewScoreAction(
  submissionId: string,
  adjustments: QuestionAdjustment[],
  adminOverallNotes?: string
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    return { success: true, message: "Review saved (Dev Mode)." }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }
  const user = actor.user

  const evaluation = await prisma.evaluation.findUnique({
    where: { submissionId },
    include: {
      questions: true,
      submission: {
        include: {
          testSeries: true,
        },
      },
    },
  })

  if (!evaluation) {
    return {
      success: false,
      error: "Evaluation not found for this submission.",
    }
  }

  // Update questions and recalculate total
  await prisma.$transaction(async (tx) => {
    let newTotal = 0
    const updatePromises: Promise<any>[] = []

    for (const q of evaluation.questions) {
      const adjustment = adjustments.find(
        (a) => a.questionEvaluationId === q.id
      )
      const finalMarks = adjustment
        ? adjustment.newMarksAwarded
        : q.marksAwarded

      // Cap at max marks for the question
      const clampedMarks = Math.min(Math.max(0, finalMarks), q.maxMarks)
      newTotal += clampedMarks

      if (adjustment) {
        updatePromises.push(
          tx.questionEvaluation.update({
            where: { id: q.id },
            data: {
              adminOverrideMarks: clampedMarks,
              marksAwarded: clampedMarks,
              adminNotes: adjustment.adminNotes,
            },
          })
        )
      }
    }

    if (updatePromises.length > 0) {
      await Promise.all(updatePromises)
    }

    const percentage = Number(
      ((newTotal / evaluation.maxMarks) * 100).toFixed(2)
    )

    await tx.evaluation.update({
      where: { id: evaluation.id },
      data: {
        totalMarksAwarded: newTotal,
        percentage,
        status: EvaluationStatus.ADJUSTED,
        adminNotes: adminOverallNotes || evaluation.adminNotes,
        reviewedAt: new Date(),
        reviewedBy: user.email || user.id,
      },
    })

    await tx.submission.update({
      where: { id: submissionId },
      data: { status: SubmissionStatus.COMPLETED },
    })

    // Create Audit Log
    await tx.auditLog.create({
      data: {
        adminId: user.id,
        action: "SCORE_REVIEW_ADJUSTED",
        targetType: "Evaluation",
        targetId: evaluation.id,
        details: `Adjusted total score from ${evaluation.totalMarksAwarded} to ${newTotal}. Notes: ${adminOverallNotes || "None"}`,
      },
    })
  }, DB_TX_OPTIONS)

  revalidatePath(`/admin/submissions/${submissionId}`)
  revalidatePath("/admin/submissions")
  revalidatePath(`/student/tests/${evaluation.submission.testSeriesId}`)
  // Revalidate leaderboard to update rankings immediately after score adjustments
  revalidatePath("/leaderboard")
  invalidateLeaderboardCache() // Invalidate cached leaderboard data

  return {
    success: true,
    message: "Scores and evaluation review saved successfully.",
  }
}

/**
 * Server Action: Admin Grant Exceptional Extra Attempt
 * Strictly audited manual override.
 */
export async function adminGrantExtraAttemptAction(
  registrationId: string,
  reason: string
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      error: "An audit reason must be provided (minimum 5 characters).",
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
    return { success: true, message: "Extra attempt granted (Dev Mode)." }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }
  const user = actor.user

  const registration = await prisma.testRegistration.findUnique({
    where: { id: registrationId },
  })

  if (!registration) {
    return { success: false, error: "Registration not found." }
  }

  const newMax = registration.maxAttempts + 1

  await prisma.$transaction([
    prisma.testRegistration.update({
      where: { id: registrationId },
      data: { maxAttempts: newMax },
    }),
    prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: "EXTRA_ATTEMPT_GRANTED",
        targetType: "TestRegistration",
        targetId: registrationId,
        details: `Granted additional attempt (increased limit to ${newMax}). Justification: ${reason}`,
      },
    }),
  ])

  revalidatePath("/admin/students")
  revalidatePath(`/admin/registrations/${registrationId}`)

  return {
    success: true,
    message: `Extra attempt granted. New maximum attempts for this student is ${newMax}.`,
  }
}
