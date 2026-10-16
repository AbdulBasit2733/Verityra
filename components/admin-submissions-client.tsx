"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { AlertTriangle, CheckCircle2, Edit } from "lucide-react"

export interface AdminSubmissionRow {
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

export function AdminSubmissionsClient({
  submissions,
}: {
  submissions: AdminSubmissionRow[]
}) {
  const flaggedCount = submissions.filter(
    (s) => s.uncertaintyFlag || s.status === "REVIEW_REQUIRED"
  ).length
  const completedCount = submissions.filter((s) => s.status === "COMPLETED").length

  const columns: DataTableColumn<AdminSubmissionRow>[] = [
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
      header: "Test Module",
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
      header: "Awarded Marks",
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
      id: "flags",
      header: "Uncertainty Flags",
      sortable: true,
      sortAccessor: (s) => (s.uncertaintyFlag ? 1 : 0),
      cell: (s) =>
        s.uncertaintyFlag ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
            <AlertTriangle className="h-3 w-3" /> Flagged
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" /> Clear
          </span>
        ),
    },
    {
      id: "submittedAt",
      header: "Submitted",
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
            className="h-8 px-3 border-slate-200 text-[#2A6AED] hover:bg-[#EFF6FF] font-semibold text-xs rounded-lg"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Review Score
          </Button>
        </Link>
      ),
    },
  ]

  const filters: DataTableFilter<AdminSubmissionRow>[] = [
    {
      id: "status",
      label: "Evaluation Status",
      accessor: (s) => s.status,
      options: [
        { label: "Review Required", value: "REVIEW_REQUIRED" },
        { label: "Completed", value: "COMPLETED" },
        { label: "Evaluating", value: "EVALUATING" },
      ],
    },
    {
      id: "flag",
      label: "Flag Status",
      accessor: (s) => (s.uncertaintyFlag ? "FLAGGED" : "CLEAR"),
      options: [
        { label: "Flagged for Review", value: "FLAGGED" },
        { label: "Clear Confidence", value: "CLEAR" },
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

  return (
    <div className="space-y-6">
      {/* Flat Page Header */}
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#2A6AED]">
          Evaluation Verification Queue
        </p>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] tracking-tight">
          Candidate Submissions & Reviews
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Inspect handwritten responses, verify flagged evaluations, and adjust question scores with immutable audit trails.
        </p>
      </div>

      {/* Flat Divided Summary Strip */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 bg-slate-50/40">
        <div className="py-3.5 px-4 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Submissions
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-[#0F172A]">{submissions.length}</p>
        </div>
        <div className="py-3.5 px-4 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Flagged for Review
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-amber-600">{flaggedCount}</p>
        </div>
        <div className="py-3.5 px-4 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Finalized & Approved
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-700">{completedCount}</p>
        </div>
      </div>

      {/* Interactive DataTable */}
      <DataTable
        data={submissions}
        columns={columns}
        keyExtractor={(s) => s.id}
        searchPlaceholder="Search candidate name, email, or test series..."
        filters={filters}
        dateAccessor={(s) => s.submittedAt}
        dateFilterLabel="Submitted Date"
        defaultSortColumn="submittedAt"
        defaultSortDirection="desc"
        defaultPageSize={10}
        emptyTitle="No candidate submissions found"
        emptyDescription="No student submissions match your current search or filter criteria."
      />
    </div>
  )
}
