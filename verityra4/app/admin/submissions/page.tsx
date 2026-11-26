import { prisma } from "@/lib/prisma"
import {
  AdminSubmissionRow,
  AdminSubmissionsClient,
} from "@/components/admin/submissions/admin-submissions-client"
import { normalizePrivateFileUrl } from "@/lib/supabase"
import { reconcileStaleEvaluationJobs } from "@/lib/queue/evaluation-queue"

export const dynamic = "force-dynamic"

export default async function AdminSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.page || "1", 10)
  const limit = parseInt(params.limit || "25", 10)
  const skip = (page - 1) * limit

  let submissions: any[] = []
  let totalCount = 0

  try {
    await reconcileStaleEvaluationJobs(25)

    // The queries themselves are the health check; avoid an extra round trip to the database.
    ;[submissions, totalCount] = await Promise.all([
      prisma.submission.findMany({
        skip,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          testSeries: {
            select: {
              title: true,
              maxMarks: true,
              tests: {
                select: { id: true, title: true, subject: true, maxMarks: true },
              },
            },
          },
          test: {
            select: { id: true, title: true, subject: true, maxMarks: true },
          },
          registration: {
            select: {
              test: {
                select: { id: true, title: true, subject: true, maxMarks: true },
              },
            },
          },
          evaluation: {
            select: {
              status: true,
              totalMarksAwarded: true,
              maxMarks: true,
              uncertaintyFlag: true,
            },
          },
          evaluationJob: {
            select: {
              status: true,
              attempts: true,
              lastError: true,
            },
          },
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

  const rows: AdminSubmissionRow[] = submissions.map((sub) => {
    const seriesTests = sub.testSeries?.tests || []
    const effectiveTest =
      sub.test ||
      sub.registration?.test ||
      (seriesTests.length === 1 ? seriesTests[0] : null)
    const configuredMaxMarks =
      effectiveTest?.maxMarks ?? sub.testSeries?.maxMarks ?? 100
    const subjectTestTitle = effectiveTest
      ? effectiveTest.subject &&
        !effectiveTest.title
          .toLowerCase()
          .startsWith(effectiveTest.subject.toLowerCase())
        ? `${effectiveTest.subject}: ${effectiveTest.title}`
        : effectiveTest.title
      : null
    const testSeriesTitle = sub.testSeries?.title || "Mock Examination"

    return {
      id: sub.id,
      candidateName: sub.user?.name || "Student",
      candidateEmail: sub.user?.email || "",
      testTitle: subjectTestTitle || testSeriesTitle,
      subjectTestTitle,
      testSeriesTitle,
      attemptNumber: sub.attemptNumber,
      status: sub.status,
      totalMarksAwarded: sub.evaluation
        ? sub.evaluation.totalMarksAwarded
        : null,
      maxMarks: configuredMaxMarks,
      evaluatedMaxMarks: sub.evaluation ? sub.evaluation.maxMarks : null,
      uncertaintyFlag: Boolean(sub.evaluation?.uncertaintyFlag),
      fileUrl: normalizePrivateFileUrl(sub.fileUrl),
      submittedAt: new Date(sub.submittedAt).toISOString(),
      aiEvaluationRuns: sub.aiEvaluationRuns || 0,
      jobStatus: sub.evaluationJob?.status || null,
      jobAttempts: sub.evaluationJob?.attempts ?? null,
      jobError: sub.evaluationJob?.lastError || null,
    }
  })
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
