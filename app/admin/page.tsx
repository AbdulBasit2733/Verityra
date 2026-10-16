import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { EvaluationStatus, PaymentStatus, Role, TestSeriesStatus } from "@prisma/client"
import {
  AdminAuditLogRow,
  AdminOverviewClient,
  AdminOverviewSubmissionRow,
} from "@/components/admin-overview-client"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  const dbConnected = await isDatabaseConnected()

  let totalStudents = 0
  let publishedTests = 0
  let draftTests = 0
  let totalRegistrations = 0
  let pendingReviews = 0
  let totalRevenueInRupees = 0
  let recentSubmissions: any[] = []
  let recentAuditLogs: any[] = []

  if (dbConnected) {
    const [
      studentsCount,
      pubTestsCount,
      drfTestsCount,
      regsCount,
      reviewsCount,
      paymentsAggregate,
      subs,
      audits,
    ] = await Promise.all([
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.testSeries.count({ where: { status: TestSeriesStatus.PUBLISHED } }),
      prisma.testSeries.count({ where: { status: TestSeriesStatus.DRAFT } }),
      prisma.testRegistration.count(),
      prisma.evaluation.count({ where: { status: EvaluationStatus.REVIEW_REQUIRED } }),
      prisma.payment.aggregate({
        where: { status: PaymentStatus.COMPLETED },
        _sum: { amount: true },
      }),
      prisma.submission.findMany({
        take: 25,
        orderBy: { submittedAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          testSeries: { select: { title: true } },
          evaluation: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 25,
        orderBy: { createdAt: "desc" },
        include: {
          admin: { select: { name: true, email: true } },
        },
      }),
    ])

    totalStudents = studentsCount
    publishedTests = pubTestsCount
    draftTests = drfTestsCount
    totalRegistrations = regsCount
    pendingReviews = reviewsCount
    totalRevenueInRupees = (paymentsAggregate._sum.amount || 0) / 100
    recentSubmissions = subs
    recentAuditLogs = audits
  } else {
    totalStudents = 14
    publishedTests = 3
    draftTests = 1
    totalRegistrations = 28
    pendingReviews = 2
    totalRevenueInRupees = 12470
    recentSubmissions = [
      {
        id: "sub-1",
        attemptNumber: 1,
        status: "REVIEW_REQUIRED",
        submittedAt: new Date(),
        user: { name: "Aarav Sharma", email: "aarav@example.com" },
        testSeries: { title: "UPSC Civil Services GS I Mock" },
        evaluation: { totalMarksAwarded: 184.5, maxMarks: 250, uncertaintyFlag: true },
      },
    ]
    recentAuditLogs = [
      {
        id: "audit-1",
        action: "TEST_PUBLISHED",
        details: "Published UPSC GS Paper I Mock Test",
        createdAt: new Date(),
        admin: { name: "System Admin" },
      },
    ]
  }

  const submissionRows: AdminOverviewSubmissionRow[] = recentSubmissions.map((sub) => ({
    id: sub.id,
    candidateName: sub.user?.name || "Student",
    candidateEmail: sub.user?.email || "",
    testTitle: sub.testSeries?.title || "Mock Test",
    attemptNumber: sub.attemptNumber,
    status: sub.status,
    totalMarksAwarded: sub.evaluation ? sub.evaluation.totalMarksAwarded : null,
    maxMarks: sub.evaluation ? sub.evaluation.maxMarks : null,
    uncertaintyFlag: Boolean(sub.evaluation?.uncertaintyFlag),
    submittedAt: new Date(sub.submittedAt).toISOString(),
  }))

  const auditRows: AdminAuditLogRow[] = recentAuditLogs.map((log) => ({
    id: log.id,
    action: log.action,
    details: log.details || "",
    adminName: log.admin?.name || "Administrator",
    createdAt: new Date(log.createdAt).toISOString(),
  }))

  return (
    <AdminOverviewClient
      totalStudents={totalStudents}
      publishedTests={publishedTests}
      draftTests={draftTests}
      totalRegistrations={totalRegistrations}
      pendingReviews={pendingReviews}
      totalRevenueInRupees={totalRevenueInRupees}
      submissions={submissionRows}
      auditLogs={auditRows}
    />
  )
}
