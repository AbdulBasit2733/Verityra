"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiMetricStrip, KpiMetric } from "@/components/shared/kpi-metric-strip"
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

      {/* KPI Metric Strip - Flat Divided Design */}
      <KpiMetricStrip columns={4}>
        <KpiMetric
          label="Total Candidates"
          value={totalStudents}
          subtext="Registered aspirant accounts"
          icon={Users}
          variant="blue"
        />
        <KpiMetric
          label="Active Enrollments"
          value={totalRegistrations}
          subtext={`${publishedTests} published · ${draftTests} draft`}
          icon={BookOpen}
          variant="indigo"
        />
        <KpiMetric
          label="Pending Reviews"
          value={pendingReviews}
          subtext="Flagged for educator review"
          icon={AlertTriangle}
          variant="amber"
        />
        <KpiMetric
          label="Verified Revenue"
          value={`₹${totalRevenueInRupees.toLocaleString()}`}
          subtext="Captured Razorpay orders"
          icon={CreditCard}
          variant="emerald"
        />
      </KpiMetricStrip>

      {/* Table Section with Tabs */}
      <Tabs defaultValue="submissions" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList variant="line" className="border-b border-slate-200 dark:border-slate-800 w-full sm:w-auto justify-start">
            <TabsTrigger value="submissions" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2">
              <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
              <span className="sm:hidden">Submissions ({submissions.length})</span>
              <span className="hidden sm:inline">Recent Candidate Submissions ({submissions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="audit" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2">
              <History className="h-3.5 w-3.5 mr-1.5" />
              <span className="sm:hidden">Audit Logs ({auditLogs.length})</span>
              <span className="hidden sm:inline">Administrative Audit Logs ({auditLogs.length})</span>
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
            renderCard={(s, idx, serialNumber) => (
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 shrink-0">
                        #{serialNumber}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">
                          {s.candidateName}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">
                          {s.candidateEmail}
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        s.status === "COMPLETED"
                          ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-semibold shrink-0"
                          : s.status === "REVIEW_REQUIRED"
                            ? "border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 text-[10px] font-semibold shrink-0"
                            : "border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[10px] font-semibold shrink-0"
                      }
                    >
                      {s.status === "COMPLETED" ? "Completed" : s.status === "REVIEW_REQUIRED" ? "Review Required" : s.status}
                    </Badge>
                  </div>

                  <div className="pt-1 space-y-1">
                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs block line-clamp-1">
                      {s.testTitle}
                    </span>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="font-medium text-[#2A6AED] dark:text-blue-400">
                        Attempt #{s.attemptNumber}
                      </span>
                      <span>·</span>
                      <span><FormattedDate date={s.submittedAt} includeTime /></span>
                    </div>
                  </div>

                  {s.totalMarksAwarded !== null && s.maxMarks && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-500 font-medium">Evaluation Score:</span>
                      <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-sm">
                        {s.totalMarksAwarded} / {s.maxMarks} marks
                      </span>
                    </div>
                  )}
                </div>

                <Link href={`/admin/submissions/${s.id}`} className="block w-full pt-1">
                  <Button size="sm" variant="outline" className="w-full h-9 rounded-xl border-slate-200 dark:border-slate-800 text-[#2A6AED] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-semibold">
                    Inspect & Review
                  </Button>
                </Link>
              </div>
            )}
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
            renderCard={(a, idx, serialNumber) => (
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 shadow-2xs space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                  >
                    {a.action}
                  </Badge>
                  <span className="text-[11px] text-slate-400">
                    <FormattedDate date={a.createdAt} includeTime />
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {a.details}
                </p>
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Administrator:</span>
                  <strong className="text-slate-800 dark:text-slate-200 font-bold">{a.adminName}</strong>
                </div>
              </div>
            )}
            emptyTitle="No administrative audit events recorded"
            emptyDescription="Score adjustments, test publications, and extra attempt overrides appear here."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
