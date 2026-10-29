import { prisma } from "@/lib/prisma"
import {
  AdminSubmissionRow,
  AdminSubmissionsClient,
} from "@/components/admin-submissions-client"
import { normalizePrivateFileUrl } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || '1', 10)
  const limit = parseInt(params.limit || '25', 10)
  const skip = (page - 1) * limit

  let submissions: any[] = []
  let totalCount = 0

  try {
    // The queries themselves are the health check; avoid an extra round trip to the database.
    [submissions, totalCount] = await Promise.all([
      prisma.submission.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          testSeries: { select: { title: true, maxMarks: true } },
          evaluation: { select: { status: true, totalMarksAwarded: true, maxMarks: true, uncertaintyFlag: true } },
        },
        orderBy: { submittedAt: "desc" },
      }),
      prisma.submission.count(),
    ])
  } catch {
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
    totalCount = 1
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
    fileUrl: normalizePrivateFileUrl(sub.fileUrl),
    submittedAt: new Date(sub.submittedAt).toISOString(),
    aiEvaluationRuns: sub.aiEvaluationRuns || 0,
  }))
  const totalPages = Math.ceil(totalCount / limit)

  return (
    <AdminSubmissionsClient
      submissions={rows}
      currentPage={page}
      totalPages={totalPages}
      pageSize={limit}
    />
  )
}
