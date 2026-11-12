import { requireStudent } from "@/lib/auth-guard"
import { isDatabaseConnected, prisma } from "@/lib/prisma"
import { StudentEvaluationsClient } from "@/components/student/evaluations/student-evaluations-client"
import type { StudentEvaluationRow } from "@/components/student/evaluations/types"

export const dynamic = "force-dynamic"

export default async function StudentEvaluationsPage() {
  const user = await requireStudent("/student/evaluations")
  const dbConnected = await isDatabaseConnected()
  let evaluations: StudentEvaluationRow[] = []

  if (dbConnected) {
    const submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      orderBy: { submittedAt: "desc" },
      select: {
        id: true,
        testSeriesId: true,
        attemptNumber: true,
        status: true,
        submittedAt: true,
        testSeries: { select: { title: true } },
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
    evaluations = submissions.map((submission) => ({
      submissionId: submission.id,
      testSeriesId: submission.testSeriesId,
      testTitle: submission.testSeries.title,
      attemptNumber: submission.attemptNumber,
      status: submission.status,
      submittedAt: submission.submittedAt.toISOString(),
      evaluatedAt: submission.evaluation?.evaluatedAt?.toISOString() || null,
      score: submission.evaluation?.totalMarksAwarded ?? null,
      maxMarks: submission.evaluation?.maxMarks ?? null,
      percentage: submission.evaluation?.percentage ?? null,
      questionCount: submission.evaluation?._count.questions || 0,
      legibilityWarning: Boolean(submission.evaluation?.legibilityWarning),
      uncertaintyFlag: Boolean(submission.evaluation?.uncertaintyFlag),
    }))
  }

  return <StudentEvaluationsClient evaluations={evaluations} />
}
