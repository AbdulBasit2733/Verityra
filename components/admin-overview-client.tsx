"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CreditCard,
  FileCheck2,
  History,
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
          <span className="font-bold text-[#0F172A] block">{s.candidateName}</span>
          <span className="text-[11px] text-[#64748B]">{s.candidateEmail}</span>
        </div>
      ),
    },
    {
      id: "testTitle",
      header: "Test Series",
      sortable: true,
      sortAccessor: (s) => s.testTitle,
      cell: (s) => (
        <span className="font-semibold text-[#0F172A] max-w-xs truncate block">
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
          className="text-[11px] font-semibold border-blue-200 text-[#2A6AED] bg-[#EFF6FF]"
        >
          Attempt #{s.attemptNumber} / 3
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
              ? "border-emerald-200 text-emerald-700 bg-emerald-50 text-[11px] font-semibold"
              : s.status === "REVIEW_REQUIRED"
                ? "border-amber-200 text-amber-700 bg-amber-50 text-[11px] font-semibold"
                : "border-blue-200 text-blue-700 bg-blue-50 text-[11px] font-semibold"
          }
        >
          {s.status}
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
          <span className="font-extrabold text-[#2A6AED]">
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
            className="h-8 px-3 rounded-lg border-slate-200 text-[#2A6AED] hover:bg-[#EFF6FF] font-semibold text-xs"
          >
            Inspect & Review
          </Button>
        </Link>
      ),
    },
  ]

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
      id: "attempt",
      label: "Attempt #",
      accessor: (s) => String(s.attemptNumber),
      options: [
        { label: "Attempt #1", value: "1" },
        { label: "Attempt #2", value: "2" },
        { label: "Attempt #3", value: "3" },
      ],
    },
  ]

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
          className="text-[11px] font-mono border-blue-200 text-[#2A6AED] bg-[#EFF6FF]"
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
      cell: (a) => <span className="font-bold text-[#0F172A]">{a.adminName}</span>,
    },
    {
      id: "details",
      header: "Audit Log Description",
      sortable: false,
      className: "whitespace-normal min-w-[280px]",
      cell: (a) => <span className="text-xs sm:text-sm text-[#64748B]">{a.details}</span>,
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
      options: [
        { label: "Test Published", value: "TEST_PUBLISHED" },
        { label: "Score Adjusted", value: "SCORE_ADJUSTED" },
        { label: "Extra Attempt Granted", value: "EXTRA_ATTEMPT_GRANTED" },
        { label: "Results Published", value: "RESULTS_PUBLISHED" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Flat Page Header — No Card Wrapper */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#2A6AED]">
            Governance & Evaluation Console
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] tracking-tight">
            Administrator Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Real-time platform metrics, evaluation review queue, and immutable score governance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link href="/admin/test-series/new">
            <Button className="bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-xs sm:text-sm h-10 px-4 rounded-xl">
              <Plus className="mr-1.5 h-4 w-4" />
              Create Test Series
            </Button>
          </Link>
        </div>
      </div>

      {/* Flat Divided KPI Strip — Replaces 4 Individual Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-y border-slate-200 bg-slate-50/40">
        <div className="py-4 px-4 sm:px-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Total Candidates
            </span>
            <p className="text-2xl font-extrabold text-[#0F172A] mt-0.5">{totalStudents}</p>
            <span className="text-xs text-[#64748B]">Registered student accounts</span>
          </div>
          <Users className="h-5 w-5 text-[#2A6AED] shrink-0" />
        </div>

        <div className="py-4 px-4 sm:px-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Active Enrollments
            </span>
            <p className="text-2xl font-extrabold text-[#2A6AED] mt-0.5">{totalRegistrations}</p>
            <span className="text-xs text-[#64748B]">
              {publishedTests} published · {draftTests} draft
            </span>
          </div>
          <BookOpen className="h-5 w-5 text-[#2A6AED] shrink-0" />
        </div>

        <div className="py-4 px-4 sm:px-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Pending Reviews
            </span>
            <p className="text-2xl font-extrabold text-amber-600 mt-0.5">{pendingReviews}</p>
            <span className="text-xs text-[#64748B]">Flagged for educator check</span>
          </div>
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
        </div>

        <div className="py-4 px-4 sm:px-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Verified Revenue
            </span>
            <p className="text-2xl font-extrabold text-emerald-700 mt-0.5">
              ₹{totalRevenueInRupees.toLocaleString()}
            </p>
            <span className="text-xs text-[#64748B]">Captured Razorpay orders</span>
          </div>
          <CreditCard className="h-5 w-5 text-emerald-600 shrink-0" />
        </div>
      </div>

      {/* shadcn Tabs for Submissions Queue & Audit Logs DataTables */}
      <Tabs defaultValue="submissions" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList variant="line" className="border-b border-slate-200 w-full sm:w-auto justify-start">
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
            className="text-xs font-semibold text-[#2A6AED] hover:underline inline-flex items-center shrink-0"
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
            emptyTitle="No administrative audit events recorded"
            emptyDescription="Score adjustments, test publications, and extra attempt overrides appear here."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
