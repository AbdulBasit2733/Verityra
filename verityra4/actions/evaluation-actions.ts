"use server"

import { getCurrentUser, resolvePersistedAdminActor } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected, DB_TX_OPTIONS } from "@/lib/prisma"
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
  submissionId: string,
  options?: { force?: boolean }
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
      status: true,
      testSeriesId: true,
      testId: true,
      userId: true,
      fileUrl: true,
      fileType: true,
      registration: { select: { testId: true } },
      testSeries: { select: { tests: { select: { id: true } } } },
    },
  })
  if (!submission) return { success: false, error: "Submission not found." }

  const inferredTestId =
    submission.testId ||
    submission.registration?.testId ||
    (submission.testSeries.tests.length === 1
      ? submission.testSeries.tests[0].id
      : null)

  if (!submission.testId && inferredTestId) {
    await prisma.submission
      .update({
        where: { id: submission.id },
        data: { testId: inferredTestId },
      })
      .catch(() => undefined)
  }

  let run
  try {
    run = await claimEvaluationRun(submission.id, "ADMIN_REEVALUATION", {
      force:
        options?.force ?? submission.status === SubmissionStatus.PROCESSING,
    })
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

  await prisma.auditLog
    .create({
      data: {
        adminId: actor.user.id,
        action: "SUBMISSION_EVALUATION_RETRIGGERED",
        targetType: "Submission",
        targetId: submission.id,
        details: `Admin queued AI re-evaluation run #${run.runNumber}${options?.force ? " (force override)" : ""}.`,
      },
    })
    .catch(() => undefined)

  revalidatePath("/admin/submissions")
  revalidatePath(`/admin/submissions/${submission.id}`)
  revalidatePath(`/student/tests/${submission.testSeriesId}`)
  if (inferredTestId) {
    revalidatePath(`/student/tests/${inferredTestId}`)
  }
  revalidatePath("/student/evaluations")
  revalidatePath(`/student/evaluations/${submission.id}`)
  return {
    success: true,
    message: `Re-evaluation run ${run.runNumber} queued.`,
    data: { runNumber: run.runNumber },
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
          test: true,
          registration: { include: { test: true } },
          testSeries: { include: { tests: true } },
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

  const seriesTests = evaluation.submission.testSeries.tests || []
  const effectiveTest =
    evaluation.submission.test ||
    evaluation.submission.registration?.test ||
    (seriesTests.length === 1 ? seriesTests[0] : null)
  const authoritativeMaxMarks =
    effectiveTest?.maxMarks ??
    evaluation.submission.testSeries.maxMarks ??
    evaluation.maxMarks

  // Update questions and recalculate total
  await prisma.$transaction(async (tx) => {
    let newTotal = 0
    const updatePromises: Promise<unknown>[] = []

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

    const cappedTotal =
      authoritativeMaxMarks > 0
        ? Math.min(Number(newTotal.toFixed(2)), authoritativeMaxMarks)
        : Number(newTotal.toFixed(2))
    const percentage =
      authoritativeMaxMarks > 0
        ? Number(((cappedTotal / authoritativeMaxMarks) * 100).toFixed(2))
        : 0

    await tx.evaluation.update({
      where: { id: evaluation.id },
      data: {
        totalMarksAwarded: cappedTotal,
        maxMarks: authoritativeMaxMarks,
        percentage,
        status: EvaluationStatus.ADJUSTED,
        adminNotes: adminOverallNotes || evaluation.adminNotes,
        reviewedAt: new Date(),
        reviewedBy: user.email || user.id,
      },
    })

    await tx.submission.update({
      where: { id: submissionId },
      data: {
        status: SubmissionStatus.COMPLETED,
        ...(effectiveTest && !evaluation.submission.testId
          ? { testId: effectiveTest.id }
          : {}),
      },
    })

    // Create Audit Log
    await tx.auditLog.create({
      data: {
        adminId: user.id,
        action: "SCORE_REVIEW_ADJUSTED",
        targetType: "Evaluation",
        targetId: evaluation.id,
        details: `Adjusted total score from ${evaluation.totalMarksAwarded} to ${cappedTotal} / ${authoritativeMaxMarks}. Notes: ${adminOverallNotes || "None"}`,
      },
    })
  }, DB_TX_OPTIONS)

  revalidatePath(`/admin/submissions/${submissionId}`)
  revalidatePath("/admin/submissions")
  revalidatePath(`/student/tests/${evaluation.submission.testSeriesId}`)
  if (effectiveTest?.id) {
    revalidatePath(`/student/tests/${effectiveTest.id}`)
  }
  revalidatePath("/student/evaluations")
  revalidatePath(`/student/evaluations/${submissionId}`)
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
