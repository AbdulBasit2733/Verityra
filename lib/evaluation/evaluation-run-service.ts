import { prisma } from "@/lib/prisma"
import { EvaluationStatus, SubmissionStatus } from "@prisma/client"
import type { AiEvaluationResult } from "@/lib/ai/evaluation-schema"

type EvaluationTriggerValue = "AUTOMATIC" | "ADMIN_REEVALUATION"

export const MAX_AI_EVALUATION_RUNS = 3

export class EvaluationRunError extends Error {
  constructor(message: string, public readonly code: "NOT_FOUND" | "LIMIT_REACHED" | "ALREADY_PROCESSING") {
    super(message)
  }
}

export async function claimEvaluationRun(
  submissionId: string,
  trigger: EvaluationTriggerValue
) {
  return prisma.$transaction(async (tx) => {
    const current = await tx.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        aiEvaluationRuns: true,
        status: true,
        evaluation: { select: { id: true } },
      },
    })

    if (!current) throw new EvaluationRunError("Submission not found.", "NOT_FOUND")
    const recordedRuns = Math.max(current.aiEvaluationRuns, current.evaluation ? 1 : 0)
    if (recordedRuns >= MAX_AI_EVALUATION_RUNS) {
      throw new EvaluationRunError("This submission has used all 3 AI evaluation runs.", "LIMIT_REACHED")
    }

    const claimed = await tx.submission.updateMany({
      where: {
        id: submissionId,
        aiEvaluationRuns: current.aiEvaluationRuns,
        status: {
          in: [
            SubmissionStatus.PENDING,
            SubmissionStatus.FAILED,
            SubmissionStatus.COMPLETED,
            SubmissionStatus.REVIEW_REQUIRED,
          ],
        },
      },
      data: { aiEvaluationRuns: recordedRuns + 1, status: SubmissionStatus.PROCESSING },
    })

    if (claimed.count !== 1) {
      const submission = await tx.submission.findUnique({
        where: { id: submissionId },
        select: { id: true, aiEvaluationRuns: true, status: true },
      })
      if (!submission) throw new EvaluationRunError("Submission not found.", "NOT_FOUND")
      if (submission.aiEvaluationRuns >= MAX_AI_EVALUATION_RUNS) {
        throw new EvaluationRunError("This submission has used all 3 AI evaluation runs.", "LIMIT_REACHED")
      }
      throw new EvaluationRunError("This submission is already being evaluated.", "ALREADY_PROCESSING")
    }

    return tx.evaluationRun.create({
      data: {
        submissionId,
        runNumber: recordedRuns + 1,
        trigger,
        status: EvaluationStatus.PROCESSING,
        evaluatorModel: "pending",
        generalFeedback: "",
        startedAt: new Date(),
      },
    })
  }, { maxWait: 10_000, timeout: 30_000 })
}

export async function failEvaluationRun(runId: string, reason: string) {
  await prisma.$transaction(async (tx) => {
    const run = await tx.evaluationRun.update({
      where: { id: runId },
      data: { status: EvaluationStatus.FAILED, failureReason: reason, completedAt: new Date() },
      select: { submissionId: true },
    })
    await tx.submission.update({
      where: { id: run.submissionId },
      data: { status: SubmissionStatus.FAILED },
    })
  }, { maxWait: 10_000, timeout: 30_000 })
}

export async function persistEvaluationRun(input: {
  runId: string
  submissionId: string
  result: AiEvaluationResult
  maxMarks: number
  evaluatorModel: string
}) {
  const totalMarksAwarded = input.result.questions.reduce((sum, question) => sum + question.marksAwarded, 0)
  const percentage = input.maxMarks > 0 ? Number(((totalMarksAwarded / input.maxMarks) * 100).toFixed(2)) : 0
  const requiresReview = input.result.uncertaintyFlag || input.result.legibilityWarning
  const status = requiresReview ? EvaluationStatus.REVIEW_REQUIRED : EvaluationStatus.COMPLETED

  await prisma.$transaction(async (tx) => {
    // A BullMQ retry can re-enter persistence after a partial worker failure.
    // Replace the run's question rows so retries remain idempotent.
    await tx.evaluationRunQuestion.deleteMany({ where: { evaluationRunId: input.runId } })
    await tx.evaluationRun.update({
      where: { id: input.runId },
      data: {
        status,
        totalMarksAwarded,
        maxMarks: input.maxMarks,
        percentage,
        generalFeedback: input.result.generalFeedback,
        legibilityWarning: input.result.legibilityWarning,
        uncertaintyFlag: input.result.uncertaintyFlag,
        evaluatorModel: input.evaluatorModel,
        completedAt: new Date(),
        questions: {
          create: input.result.questions.map((question) => ({
            questionNumber: question.questionNumber,
            maxMarks: question.maxMarks,
            marksAwarded: question.marksAwarded,
            scoreBand: question.scoreBand,
            scoreExplanation: question.scoreExplanation,
            strengths: question.strengths,
            missingConcepts: question.missingConcepts || "",
            examinerExpectation: question.examinerExpectation,
            improvementAdvice: question.improvementAdvice,
            isLegible: question.isLegible,
            isUncertain: question.isUncertain,
          })),
        },
      },
    })

    const currentEvaluation = await tx.evaluation.findUnique({
      where: { submissionId: input.submissionId },
      select: { id: true },
    })

    if (currentEvaluation) {
      await tx.questionEvaluation.deleteMany({ where: { evaluationId: currentEvaluation.id } })
      await tx.evaluation.update({
        where: { id: currentEvaluation.id },
        data: {
          totalMarksAwarded,
          maxMarks: input.maxMarks,
          percentage,
          generalFeedback: input.result.generalFeedback,
          legibilityWarning: input.result.legibilityWarning,
          uncertaintyFlag: input.result.uncertaintyFlag,
          status,
          evaluatorModel: input.evaluatorModel,
          evaluatedAt: new Date(),
          adminNotes: null,
          reviewedAt: null,
          reviewedBy: null,
          questions: {
            create: input.result.questions.map((question) => ({
              questionNumber: question.questionNumber,
              maxMarks: question.maxMarks,
              marksAwarded: question.marksAwarded,
              feedback: question.feedback,
              missingConcepts: question.missingConcepts || "",
              scoreBand: question.scoreBand,
              scoreExplanation: question.scoreExplanation,
              strengths: question.strengths,
              examinerExpectation: question.examinerExpectation,
              improvementAdvice: question.improvementAdvice,
              isLegible: question.isLegible,
              isUncertain: question.isUncertain,
            })),
          },
        },
      })
    } else {
      await tx.evaluation.create({
        data: {
          submissionId: input.submissionId,
          totalMarksAwarded,
          maxMarks: input.maxMarks,
          percentage,
          generalFeedback: input.result.generalFeedback,
          legibilityWarning: input.result.legibilityWarning,
          uncertaintyFlag: input.result.uncertaintyFlag,
          status,
          evaluatorModel: input.evaluatorModel,
          evaluatedAt: new Date(),
          questions: {
            create: input.result.questions.map((question) => ({
              questionNumber: question.questionNumber,
              maxMarks: question.maxMarks,
              marksAwarded: question.marksAwarded,
              feedback: question.feedback,
              missingConcepts: question.missingConcepts || "",
              scoreBand: question.scoreBand,
              scoreExplanation: question.scoreExplanation,
              strengths: question.strengths,
              examinerExpectation: question.examinerExpectation,
              improvementAdvice: question.improvementAdvice,
              isLegible: question.isLegible,
              isUncertain: question.isUncertain,
            })),
          },
        },
      })
    }

    await tx.submission.update({
      where: { id: input.submissionId },
      data: { status: requiresReview ? SubmissionStatus.REVIEW_REQUIRED : SubmissionStatus.COMPLETED },
    })
  }, { maxWait: 10_000, timeout: 30_000 })

  return { totalMarksAwarded, percentage, status }
}
