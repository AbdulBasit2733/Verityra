import { prisma, isDatabaseConnected } from "@/lib/prisma"
import {
  AdminSubmissionRow,
  AdminSubmissionsClient,
} from "@/components/admin-submissions-client"

export const dynamic = "force-dynamic"

export default async function AdminSubmissionsPage() {
  const dbConnected = await isDatabaseConnected()

  let submissions: any[] = []

  if (dbConnected) {
    submissions = await prisma.submission.findMany({
      include: {
        user: { select: { name: true, email: true } },
        testSeries: { select: { title: true, maxMarks: true } },
        evaluation: true,
      },
      orderBy: { submittedAt: "desc" },
    })
  } else {
    submissions = [
      {
        id: "sub-1",
        attemptNumber: 1,
        status: "REVIEW_REQUIRED",
        submittedAt: new Date(),
        user: { name: "Aarav Sharma", email: "aarav@example.com" },
        testSeries: { title: "UPSC Civil Services GS I Mock", maxMarks: 250 },
        evaluation: {
          totalMarksAwarded: 184.5,
          maxMarks: 250,
          uncertaintyFlag: true,
        },
      },
    ]
  }

  const rows: AdminSubmissionRow[] = submissions.map((sub) => ({
    id: sub.id,
    candidateName: sub.user?.name || "Student",
    candidateEmail: sub.user?.email || "",
    testTitle: sub.testSeries?.title || "Mock Examination",
    attemptNumber: sub.attemptNumber,
    status: sub.status,
    totalMarksAwarded: sub.evaluation ? sub.evaluation.totalMarksAwarded : null,
    maxMarks: sub.evaluation ? sub.evaluation.maxMarks : sub.testSeries?.maxMarks || 250,
    uncertaintyFlag: Boolean(sub.evaluation?.uncertaintyFlag),
    fileUrl: sub.fileUrl || null,
    submittedAt: new Date(sub.submittedAt).toISOString(),
  }))

  return <AdminSubmissionsClient submissions={rows} />
}
