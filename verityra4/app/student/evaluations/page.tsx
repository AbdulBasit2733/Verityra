import { requireStudent } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { StudentEvaluationsClient } from "@/components/student/evaluations/student-evaluations-client"
import type { StudentEvaluationRow } from "@/components/student/evaluations/types"

export const dynamic = "force-dynamic"

export default async function StudentEvaluationsPage() {
  const user = await requireStudent("/student/evaluations")
  let evaluations: StudentEvaluationRow[] = []

  try {
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        testSeriesId: true,
        testId: true,
        attemptNumber: true,
        status: true,
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
            evaluatedAt: true,
            legibilityWarning: true,
            uncertaintyFlag: true,
            _count: { select: { questions: true } },
          },
        },
      },
    })
    evaluations = submissions.map((submission) => {
      const effectiveTest =
        submission.test ||
        (submission.testSeries.tests.length === 1
          ? submission.testSeries.tests[0]
          : null)
      return {
        submissionId: submission.id,
        testSeriesId: effectiveTest?.id || submission.testSeriesId,
        testTitle: effectiveTest?.title || submission.testSeries.title,
        attemptNumber: submission.attemptNumber,
        status: submission.status,
        submittedAt: submission.submittedAt.toISOString(),
        evaluatedAt: submission.evaluation?.evaluatedAt?.toISOString() || null,
        score: submission.evaluation?.totalMarksAwarded ?? null,
        maxMarks:
          effectiveTest?.maxMarks ??
          submission.evaluation?.maxMarks ??
          submission.testSeries.maxMarks ??
          null,
        percentage: submission.evaluation?.percentage ?? null,
        questionCount: submission.evaluation?._count.questions || 0,
        legibilityWarning: Boolean(submission.evaluation?.legibilityWarning),
        uncertaintyFlag: Boolean(submission.evaluation?.uncertaintyFlag),
      }
    })
  } catch (error) {
    console.error("[StudentEvaluationsPage] Database query error:", error)
  }

  return <StudentEvaluationsClient evaluations={evaluations} />
}
