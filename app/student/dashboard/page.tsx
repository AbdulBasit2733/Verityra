import { requireStudent } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import {
  StudentDashboardClient,
  StudentRegistrationRow,
  StudentSubmissionRow,
} from "@/components/student-dashboard-client"

export const dynamic = "force-dynamic"

export default async function StudentDashboardPage() {
  const user = await requireStudent("/student/dashboard")
  const dbConnected = await isDatabaseConnected()

  let registrations: any[] = []
  let submissions: any[] = []

  if (dbConnected) {
    registrations = await prisma.testRegistration.findMany({
      where: { userId: user.id },
      include: {
        testSeries: true,
        submissions: {
          include: {
            evaluation: true,
          },
          orderBy: { attemptNumber: "desc" },
        },
      },
      orderBy: { registeredAt: "desc" },
    })

    submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      include: {
        testSeries: true,
        evaluation: true,
      },
      orderBy: { submittedAt: "desc" },
    })
  }

  // Fallback demo records if DB is not yet running
  if (registrations.length === 0) {
    registrations = [
      {
        id: "demo-reg-1",
        testSeriesId: "demo-upsc-mains-1",
        attemptsUsed: 1,
        maxAttempts: 3,
        registeredAt: new Date(),
        testSeries: {
          id: "demo-upsc-mains-1",
          title: "UPSC Civil Services General Studies Paper I Mock",
          maxMarks: 250,
          durationMinutes: 180,
          resultsPublished: true,
        },
        submissions: [
          {
            id: "demo-sub-1",
            attemptNumber: 1,
            status: "COMPLETED",
            submittedAt: new Date(Date.now() - 86400000),
            evaluation: {
              totalMarksAwarded: 182.5,
              maxMarks: 250,
              percentage: 73.0,
              generalFeedback:
                "Solid structural articulation and relevant constitutional citations. Diagrammatic presentation can be refined.",
            },
          },
        ],
      },
    ]

    if (submissions.length === 0) {
      submissions = [
        {
          id: "demo-sub-1",
          attemptNumber: 1,
          status: "COMPLETED",
          submittedAt: new Date(Date.now() - 86400000),
          testSeriesId: "demo-upsc-mains-1",
          testSeries: {
            id: "demo-upsc-mains-1",
            title: "UPSC Civil Services General Studies Paper I Mock",
          },
          evaluation: {
            totalMarksAwarded: 182.5,
            maxMarks: 250,
            percentage: 73.0,
          },
        },
      ]
    }
  }

  const registrationRows: StudentRegistrationRow[] = registrations.map((reg) => {
    const latestSub = reg.submissions?.[0]
    const latestEval = latestSub?.evaluation
    return {
      id: reg.id,
      testSeriesId: reg.testSeriesId,
      testTitle: reg.testSeries?.title || "Mock Examination",
      maxMarks: reg.testSeries?.maxMarks || 250,
      durationMinutes: reg.testSeries?.durationMinutes || 180,
      attemptsUsed: reg.attemptsUsed,
      maxAttempts: reg.maxAttempts,
      registeredAt: new Date(reg.registeredAt).toISOString(),
      latestScore: latestEval ? latestEval.totalMarksAwarded : null,
      latestPercentage: latestEval ? latestEval.percentage : null,
      latestStatus: latestSub ? latestSub.status : null,
      latestFeedback: latestEval ? latestEval.generalFeedback : null,
    }
  })

  const submissionRows: StudentSubmissionRow[] = submissions.map((sub) => ({
    id: sub.id,
    testSeriesId: sub.testSeries?.id || sub.testSeriesId,
    testTitle: sub.testSeries?.title || "Mock Examination",
    attemptNumber: sub.attemptNumber,
    status: sub.status,
    submittedAt: new Date(sub.submittedAt).toISOString(),
    totalMarksAwarded: sub.evaluation ? sub.evaluation.totalMarksAwarded : null,
    maxMarks: sub.evaluation ? sub.evaluation.maxMarks : null,
    percentage: sub.evaluation ? sub.evaluation.percentage : null,
  }))

  return (
    <StudentDashboardClient
      userName={user.name || "Candidate"}
      registrations={registrationRows}
      submissions={submissionRows}
    />
  )
}
