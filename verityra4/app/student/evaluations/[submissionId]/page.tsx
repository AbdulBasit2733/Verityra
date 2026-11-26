import { notFound } from "next/navigation"
import { requireStudent } from "@/lib/auth-guard"
import { isDatabaseConnected, prisma } from "@/lib/prisma"
import { normalizePrivateFileUrl } from "@/lib/supabase"
import { StudentEvaluationDetailClient } from "@/components/student/evaluations/student-evaluation-detail-client"
import type { StudentEvaluationDetail } from "@/components/student/evaluations/types"
import { compareQuestionNumbers } from "@/lib/ai/gemini-evaluator"

export const dynamic = "force-dynamic"

export default async function StudentEvaluationDetailPage({
  params,
}: {
  params: Promise<{ submissionId: string }>
}) {
  const { submissionId } = await params
  const user = await requireStudent(`/student/evaluations/${submissionId}`)
  if (!(await isDatabaseConnected())) notFound()

  const submission = await prisma.submission.findFirst({
    where: { id: submissionId, userId: user.id },
    select: {
      id: true,
      testSeriesId: true,
      testId: true,
      attemptNumber: true,
      status: true,
      fileUrl: true,
      submittedAt: true,
      test: { select: { id: true, title: true, maxMarks: true } },
      testSeries: {
        select: {
          title: true,
          maxMarks: true,
          tests: { select: { id: true, title: true, maxMarks: true } },
        },
      },
      evaluation: {
        select: {
          totalMarksAwarded: true,
          maxMarks: true,
          percentage: true,
          generalFeedback: true,
          evaluatedAt: true,
          legibilityWarning: true,
          uncertaintyFlag: true,
          questions: {
            orderBy: { questionNumber: "asc" },
            select: {
              id: true,
              questionNumber: true,
              maxMarks: true,
              marksAwarded: true,
              scoreBand: true,
              feedback: true,
              strengths: true,
              missingConcepts: true,
              improvementAdvice: true,
              examinerExpectation: true,
              isLegible: true,
              isUncertain: true,
            },
          },
        },
      },
    },
  })
  if (!submission) notFound()

  const effectiveTest =
    submission.test ||
    (submission.testSeries.tests.length === 1
      ? submission.testSeries.tests[0]
      : null)

  const detail: StudentEvaluationDetail = {
    submissionId: submission.id,
    testSeriesId: effectiveTest?.id || submission.testSeriesId,
    testTitle: effectiveTest?.title || submission.testSeries.title,
    attemptNumber: submission.attemptNumber,
    submittedAt: submission.submittedAt.toISOString(),
    status: submission.status,
    evaluation: submission.evaluation
      ? {
          totalMarksAwarded: submission.evaluation.totalMarksAwarded,
          maxMarks: submission.evaluation.maxMarks,
          percentage: submission.evaluation.percentage,
          generalFeedback: submission.evaluation.generalFeedback,
          evaluatedAt: submission.evaluation.evaluatedAt?.toISOString() || null,
          legibilityWarning: submission.evaluation.legibilityWarning,
          uncertaintyFlag: submission.evaluation.uncertaintyFlag,
          questions: [...submission.evaluation.questions].sort((a, b) =>
            compareQuestionNumbers(a.questionNumber, b.questionNumber)
          ),
        }
      : null,
  }

  return (
    <StudentEvaluationDetailClient
      detail={detail}
      submissionFileUrl={normalizePrivateFileUrl(submission.fileUrl)}
    />
  )
}
