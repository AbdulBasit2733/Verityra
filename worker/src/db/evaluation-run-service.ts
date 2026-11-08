import { prisma } from "./prisma.js"
import { EvaluationStatus, SubmissionStatus } from "@prisma/client"
import type { AiEvaluationResult } from "../ai/evaluation-schema.js"

export async function failEvaluationRun(runId: string, reason: string): Promise<void> {
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
}): Promise<{ totalMarksAwarded: number; percentage: number; status: EvaluationStatus }> {
  const totalMarksAwarded = input.result.questions.reduce((sum, question) => sum + question.marksAwarded, 0)
  const percentage = input.maxMarks > 0 ? Number(((totalMarksAwarded / input.maxMarks) * 100).toFixed(2)) : 0
  const requiresReview = input.result.uncertaintyFlag || input.result.legibilityWarning
  const status = requiresReview ? EvaluationStatus.REVIEW_REQUIRED : EvaluationStatus.COMPLETED

  await prisma.$transaction(async (tx) => {
    // Clear existing question records for this run to remain idempotent on retries
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
            strengths: question.strengths || "Concept reasoning presented.",
            missingConcepts: question.missingConcepts || "",
            examinerExpectation: question.examinerExpectation || "Standard answer structure.",
            improvementAdvice: question.improvementAdvice || "Review question scope.",
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
              strengths: question.strengths || "Concept reasoning presented.",
              examinerExpectation: question.examinerExpectation || "Standard answer structure.",
              improvementAdvice: question.improvementAdvice || "Review question scope.",
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
              strengths: question.strengths || "Concept reasoning presented.",
              examinerExpectation: question.examinerExpectation || "Standard answer structure.",
              improvementAdvice: question.improvementAdvice || "Review question scope.",
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
