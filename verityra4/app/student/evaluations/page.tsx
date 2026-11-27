import { requireStudent } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import {
  resolveSubjectAndSeriesDisplay,
  stripLeadingSeriesPrefix,
} from "@/lib/student-test-display"
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
        test: {
          select: { id: true, title: true, subject: true, maxMarks: true },
        },
        testSeries: {
          select: {
            id: true,
            title: true,
            maxMarks: true,
            tests: {
              select: { id: true, title: true, subject: true, maxMarks: true },
            },
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
      const display = resolveSubjectAndSeriesDisplay({
        test: submission.test,
        testSeries: submission.testSeries,
        fallbackWorkspaceId: submission.testSeriesId,
      })
      return {
        submissionId: submission.id,
        testSeriesId: display.targetWorkspaceId,
        testTitle: stripLeadingSeriesPrefix(
          display.subjectTestTitle,
          submission.testSeries.title
        ),
        seriesTitle: null,
        subject: display.subject,
        attemptNumber: submission.attemptNumber,
        status: submission.status,
        submittedAt: submission.submittedAt.toISOString(),
        evaluatedAt: submission.evaluation?.evaluatedAt?.toISOString() || null,
        score: submission.evaluation?.totalMarksAwarded ?? null,
        maxMarks:
          display.effectiveMaxMarks ??
          submission.evaluation?.maxMarks ??
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
