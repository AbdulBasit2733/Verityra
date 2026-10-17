"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CreditCard,
  FileCheck2,
  History,
  LayoutDashboard,
  Plus,
  Users,
} from "lucide-react"

export interface AdminOverviewSubmissionRow {
  id: string
  candidateName: string
  candidateEmail: string
  testTitle: string
  attemptNumber: number
  status: string
  totalMarksAwarded: number | null
  maxMarks: number | null
  uncertaintyFlag: boolean
  submittedAt: string
}

export interface AdminAuditLogRow {
  id: string
  action: string
  details: string
  adminName: string
  createdAt: string
}

export function AdminOverviewClient({
  totalStudents,
  publishedTests,
  draftTests,
  totalRegistrations,
  pendingReviews,
  totalRevenueInRupees,
  submissions,
  auditLogs,
}: {
  totalStudents: number
  publishedTests: number
  draftTests: number
  totalRegistrations: number
  pendingReviews: number
  totalRevenueInRupees: number
  submissions: AdminOverviewSubmissionRow[]
  auditLogs: AdminAuditLogRow[]
}) {
  const submissionColumns: DataTableColumn<AdminOverviewSubmissionRow>[] = [
    {
      id: "candidate",
      header: "Candidate",
      sortable: true,
      sortAccessor: (s) => s.candidateName,
      searchAccessor: (s) =>
        `${s.candidateName} ${s.candidateEmail} ${s.testTitle} ${s.status}`,
      cell: (s) => (
        <div>
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            {s.candidateName}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {s.candidateEmail}
          </span>
        </div>
      ),
    },
    {
      id: "testTitle",
      header: "Test Series",
      sortable: true,
      sortAccessor: (s) => s.testTitle,
      cell: (s) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate block">
          {s.testTitle}
        </span>
      ),
    },
    {
      id: "attemptNumber",
      header: "Attempt",
      sortable: true,
      sortAccessor: (s) => s.attemptNumber,
      cell: (s) => (
        <Badge
          variant="outline"
          className="text-[11px] font-semibold border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-full"
        >
          Attempt #{s.attemptNumber} of 3
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (s) => s.status,
      cell: (s) => (
        <Badge
          variant="outline"
          className={
            s.status === "COMPLETED"
              ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[11px] font-semibold rounded-full"
              : s.status === "REVIEW_REQUIRED"
                ? "border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 text-[11px] font-semibold rounded-full"
                : "border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[11px] font-semibold rounded-full"
          }
        >
          {s.status === "COMPLETED"
            ? "Completed"
            : s.status === "REVIEW_REQUIRED"
              ? "Review Required"
              : s.status}
        </Badge>
      ),
    },
    {
      id: "score",
      header: "Score",
      sortable: true,
      sortAccessor: (s) => s.totalMarksAwarded ?? -1,
      cell: (s) =>
        s.totalMarksAwarded !== null ? (
          <span className="font-extrabold text-[#2A6AED] dark:text-blue-400">
            {s.totalMarksAwarded} / {s.maxMarks}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Processing</span>
        ),
    },
    {
      id: "submittedAt",
      header: "Date",
      sortable: true,
      sortAccessor: (s) => new Date(s.submittedAt),
      cell: (s) => <FormattedDate date={s.submittedAt} includeTime />,
    },
    {
      id: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      cell: (s) => (
        <Link href={`/admin/submissions/${s.id}`}>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-[#2A6AED] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold text-xs"
          >
            Inspect & Review
          </Button>
        </Link>
      ),
    },
  ]

  const distinctTestTitles = React.useMemo(() => {
    const set = new Set<string>()
    for (const s of submissions) {
      if (s.testTitle) set.add(s.testTitle)
    }
    return Array.from(set).sort()
  }, [submissions])

  const submissionFilters: DataTableFilter<AdminOverviewSubmissionRow>[] = [
    {
      id: "status",
      label: "Status",
      accessor: (s) => s.status,
      options: [
        { label: "Review Required", value: "REVIEW_REQUIRED" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Evaluating", value: "EVALUATING" },
      ],
    },
    {
      id: "flags",
      label: "Confidence Flags",
      accessor: (s) => (s.uncertaintyFlag ? "FLAGGED" : "CLEAR"),
      options: [
        { label: "Flagged for Review", value: "FLAGGED" },
        { label: "Clear Confidence", value: "CLEAR" },
      ],
    },
    ...(distinctTestTitles.length > 1
      ? [
          {
            id: "testSeries",
            label: "Test Series Paper",
            accessor: (s: AdminOverviewSubmissionRow) => s.testTitle,
            options: distinctTestTitles.map((title) => ({
              label: title,
              value: title,
            })),
          },
        ]
      : []),
    {
      id: "attempt",
      label: "Attempt #",
      accessor: (s) => String(s.attemptNumber),
      options: [
        { label: "Attempt #1", value: "1" },
        { label: "Attempt #2", value: "2" },
        { label: "Attempt #3", value: "3" },
      ],
    },
    {
      id: "scoreBand",
      label: "Score Tier",
      accessor: (s) => {
        if (s.totalMarksAwarded === null || !s.maxMarks) return "PENDING"
        const pct = (s.totalMarksAwarded / s.maxMarks) * 100
        if (pct >= 70) return "HIGH"
        if (pct >= 50) return "AVERAGE"
        return "LOW"
      },
      options: [
        { label: "High Marks (≥ 70%)", value: "HIGH" },
        { label: "Average Marks (50–69%)", value: "AVERAGE" },
        { label: "Low Marks (< 50%)", value: "LOW" },
        { label: "Evaluating / Pending", value: "PENDING" },
      ],
    },
  ]

  const distinctAuditActions = React.useMemo(() => {
    const set = new Set<string>()
    for (const a of auditLogs) {
      if (a.action) set.add(a.action)
    }
    return Array.from(set).sort()
  }, [auditLogs])

  const auditColumns: DataTableColumn<AdminAuditLogRow>[] = [
    {
      id: "action",
      header: "Action Event",
      sortable: true,
      sortAccessor: (a) => a.action,
      searchAccessor: (a) => `${a.action} ${a.details} ${a.adminName}`,
      cell: (a) => (
        <Badge
          variant="outline"
          className="text-[11px] font-mono border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-full"
        >
          {a.action}
        </Badge>
      ),
    },
    {
      id: "admin",
      header: "Administrator",
      sortable: true,
      sortAccessor: (a) => a.adminName,
      cell: (a) => (
        <span className="font-bold text-slate-900 dark:text-slate-100">
          {a.adminName}
        </span>
      ),
    },
    {
      id: "details",
      header: "Audit Description",
      sortable: false,
      className: "whitespace-normal min-w-[280px]",
      cell: (a) => (
        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          {a.details}
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Timestamp",
      sortable: true,
      sortAccessor: (a) => new Date(a.createdAt),
      cell: (a) => <FormattedDate date={a.createdAt} includeTime />,
    },
  ]

  const auditFilters: DataTableFilter<AdminAuditLogRow>[] = [
    {
      id: "actionType",
      label: "Action Type",
      accessor: (a) => a.action,
      options:
        distinctAuditActions.length > 0
          ? distinctAuditActions.map((action) => ({
              label: action.replace(/_/g, " "),
              value: action,
            }))
          : [
              { label: "Test Published", value: "TEST_PUBLISHED" },
              { label: "Score Adjusted", value: "SCORE_ADJUSTED" },
              { label: "Extra Attempt Granted", value: "EXTRA_ATTEMPT_GRANTED" },
              { label: "Results Published", value: "RESULTS_PUBLISHED" },
            ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header matching Reference Screenshot 1 */}
      <PageHeader
        icon={LayoutDashboard}
        title="Administrator Overview"
        subtitle="Viewing: All Candidates & Governance Metrics"
      >
        <Link href="/admin/test-series/new">
          <Button className="h-10 px-4 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs sm:text-sm font-semibold shadow-xs">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Test Series
          </Button>
        </Link>
      </PageHeader>

      {/* Horizontal Compact KPI Stat Cards matching Screenshot 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          label="Total Candidates"
          value={totalStudents}
          subtext="Registered aspirant accounts"
          icon={Users}
          variant="blue"
        />
        <KpiStatCard
          label="Active Enrollments"
          value={totalRegistrations}
          subtext={`${publishedTests} published · ${draftTests} draft`}
          icon={BookOpen}
          variant="indigo"
        />
        <KpiStatCard
          label="Pending Reviews"
          value={pendingReviews}
          subtext="Flagged for educator review"
          icon={AlertTriangle}
          variant="amber"
        />
        <KpiStatCard
          label="Verified Revenue"
          value={`₹${totalRevenueInRupees.toLocaleString()}`}
          subtext="Captured Razorpay orders"
          icon={CreditCard}
          variant="emerald"
        />
      </div>

      {/* Table Section with Tabs */}
      <Tabs defaultValue="submissions" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList variant="line" className="border-b border-slate-200 dark:border-slate-800 w-full sm:w-auto justify-start">
            <TabsTrigger value="submissions" className="text-xs sm:text-sm font-semibold px-4 py-2">
              <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
              Recent Candidate Submissions ({submissions.length})
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs sm:text-sm font-semibold px-4 py-2">
              <History className="h-3.5 w-3.5 mr-1.5" />
              Administrative Audit Logs ({auditLogs.length})
            </TabsTrigger>
          </TabsList>

          <Link
            href="/admin/submissions"
            className="text-xs font-semibold text-[#2A6AED] dark:text-blue-400 hover:underline inline-flex items-center shrink-0"
          >
            Open Full Submissions Queue
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </div>

        <TabsContent value="submissions" className="pt-1">
          <DataTable
            data={submissions}
            columns={submissionColumns}
            keyExtractor={(s) => s.id}
            searchPlaceholder="Search candidate name, email, or test series..."
            filters={submissionFilters}
            dateAccessor={(s) => s.submittedAt}
            dateFilterLabel="Submission Date"
            defaultSortColumn="submittedAt"
            defaultSortDirection="desc"
            defaultPageSize={10}
            showSerialNumber={true}
            emptyTitle="No candidate submissions found"
            emptyDescription="Adjust your search query or filters to view matching submissions."
          />
        </TabsContent>

        <TabsContent value="audit" className="pt-1">
          <DataTable
            data={auditLogs}
            columns={auditColumns}
            keyExtractor={(a) => a.id}
            searchPlaceholder="Search audit logs by action, admin, or details..."
            filters={auditFilters}
            dateAccessor={(a) => a.createdAt}
            dateFilterLabel="Audit Date"
            defaultSortColumn="createdAt"
            defaultSortDirection="desc"
            defaultPageSize={10}
            showSerialNumber={true}
            emptyTitle="No administrative audit events recorded"
            emptyDescription="Score adjustments, test publications, and extra attempt overrides appear here."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
