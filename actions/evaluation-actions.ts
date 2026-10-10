"use server"

import { getCurrentUser } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { evaluateAnswerSheetWithGemini } from "@/lib/ai/gemini-evaluator"
import { EvaluationStatus, Role, SubmissionStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { ActionResult } from "./auth-actions"

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
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return { success: true, message: "Review saved (Dev Mode)." }
  }

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
    return { success: false, error: "Evaluation not found for this submission." }
  }

  // Update questions and recalculate total
  await prisma.$transaction(async (tx) => {
    let newTotal = 0

    for (const q of evaluation.questions) {
      const adjustment = adjustments.find((a) => a.questionEvaluationId === q.id)
      const finalMarks = adjustment ? adjustment.newMarksAwarded : q.marksAwarded

      // Cap at max marks for the question
      const clampedMarks = Math.min(Math.max(0, finalMarks), q.maxMarks)
      newTotal += clampedMarks

      if (adjustment) {
        await tx.questionEvaluation.update({
          where: { id: q.id },
          data: {
            adminOverrideMarks: clampedMarks,
            marksAwarded: clampedMarks,
            adminNotes: adjustment.adminNotes,
          },
        })
      }
    }

    const percentage = Number(((newTotal / evaluation.maxMarks) * 100).toFixed(2))

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
  })

  revalidatePath(`/admin/submissions/${submissionId}`)
  revalidatePath("/admin/submissions")
  revalidatePath(`/student/tests/${evaluation.submission.testSeriesId}`)

  return { success: true, message: "Scores and evaluation review saved successfully." }
}

/**
 * Server Action: Admin Grant Exceptional Extra Attempt
 * Strictly audited manual override.
 */
export async function adminGrantExtraAttemptAction(
  registrationId: string,
  reason: string
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  if (!reason || reason.trim().length < 5) {
    return { success: false, error: "An audit reason must be provided (minimum 5 characters)." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return { success: true, message: "Extra attempt granted (Dev Mode)." }
  }

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
