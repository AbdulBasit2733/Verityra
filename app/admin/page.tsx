import Link from "next/link"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  BookOpen,
  FileCheck,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  Clock,
} from "lucide-react"
import { EvaluationStatus, PaymentStatus, Role, TestSeriesStatus } from "@prisma/client"

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
        take: 5,
        orderBy: { submittedAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          testSeries: { select: { title: true } },
          evaluation: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 5,
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
    // Development mode fallback metrics
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

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C]">
            Administrator Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#4B6375] mt-1">
            Real-time platform metrics, evaluation audit trails, and revenue reconciliation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/test-series/new">
            <Button className="bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold text-xs">
              <BookOpen className="mr-1.5 h-4 w-4" />
              Create Test Series
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="border-[#D5E5F2] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs text-[#4B6375]">Total Candidates</CardDescription>
              <Users className="h-4 w-4 text-[#0784B5]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0B192C]">{totalStudents}</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-[#4B6375]">
            Registered student accounts
          </CardContent>
        </Card>

        <Card className="border-[#D5E5F2] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs text-[#4B6375]">Active Registrations</CardDescription>
              <BookOpen className="h-4 w-4 text-[#0784B5]" />
            </div>
            <CardTitle className="text-2xl font-bold text-[#0784B5]">{totalRegistrations}</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-[#4B6375]">
            {publishedTests} published · {draftTests} draft tests
          </CardContent>
        </Card>

        <Card className="border-[#D5E5F2] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs text-[#4B6375]">Pending Reviews</CardDescription>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-amber-600">{pendingReviews}</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-[#4B6375]">
            Uncertainty flags awaiting score check
          </CardContent>
        </Card>

        <Card className="border-[#D5E5F2] bg-white shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs text-[#4B6375]">Verified Revenue</CardDescription>
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-700">₹{totalRevenueInRupees.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-[#4B6375]">
            Razorpay captured payments
          </CardContent>
        </Card>
      </div>

      {/* Pending Evaluations & Reviews Queue */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0B192C]">Recent Candidate Submissions</h2>
          <Link href="/admin/submissions" className="text-xs font-semibold text-[#0784B5] hover:underline flex items-center">
            View All Submissions <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>

        <Card className="border-[#D5E5F2] bg-white shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-[#CADEEF]/20 text-xs font-semibold text-[#0B192C]">
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Test Series</TableHead>
                <TableHead>Attempt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {recentSubmissions.map((sub) => (
                <TableRow key={sub.id} className="hover:bg-[#F2F7FA]/50">
                  <TableCell className="font-semibold text-[#0B192C]">
                    {sub.user?.name || "Student"}
                    <span className="block text-[11px] text-[#4B6375] font-normal">{sub.user?.email}</span>
                  </TableCell>
                  <TableCell className="text-[#4B6375]">{sub.testSeries?.title}</TableCell>
                  <TableCell className="font-semibold">Attempt #{sub.attemptNumber}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${
                        sub.status === "COMPLETED"
                          ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                          : sub.status === "REVIEW_REQUIRED"
                          ? "border-amber-300 text-amber-700 bg-amber-50"
                          : "border-blue-300 text-blue-700 bg-blue-50"
                      }`}
                    >
                      {sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-bold text-[#0784B5]">
                    {sub.evaluation ? `${sub.evaluation.totalMarksAwarded} / ${sub.evaluation.maxMarks}` : "Processing"}
                  </TableCell>
                  <TableCell className="text-[#4B6375]">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/submissions/${sub.id}`}>
                      <Button size="xs" variant="outline" className="border-[#0784B5] text-[#0784B5] hover:bg-[#CADEEF]/30 text-xs">
                        Inspect & Review
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Administrative Audit Trail */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-[#0B192C]">Recent Administrative Audit Logs</h2>
        <Card className="border-[#D5E5F2] bg-white shadow-sm overflow-hidden">
          <div className="divide-y divide-[#D5E5F2]">
            {recentAuditLogs.map((log) => (
              <div key={log.id} className="p-4 flex items-start justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-[#9BD4E4] text-[#0784B5] bg-[#CADEEF]/20 font-mono">
                      {log.action}
                    </Badge>
                    <span className="font-semibold text-[#0B192C]">{log.admin?.name || "Administrator"}</span>
                  </div>
                  <p className="mt-1 text-[#4B6375]">{log.details}</p>
                </div>
                <span className="text-[11px] text-[#4B6375] shrink-0 ml-4">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
