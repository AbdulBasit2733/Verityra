"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { AlertTriangle, CheckCircle2, Download, Edit, FileCheck2, FileText, Loader2, RotateCcw } from "lucide-react"
import { adminReevaluateSubmissionAction } from "@/actions/evaluation-actions"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { useRouter } from "next/navigation"

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
  fileUrl?: string | null
  submittedAt: string
  aiEvaluationRuns: number
}

export function AdminSubmissionEvaluationTrigger({
  submissionId,
  compact = false,
  aiEvaluationRuns = 0,
  maxAiEvaluationRuns = 3,
}: {
  submissionId: string
  compact?: boolean
  aiEvaluationRuns?: number
  maxAiEvaluationRuns?: number
}) {
  const router = useRouter()
  const { showError } = useGlobalError()
  const confirm = useConfirm()
  const [loading, setLoading] = React.useState(false)

  async function handleEvaluate() {
    const confirmed = await confirm({
      title: "Queue AI re-evaluation?",
      description: `This will use AI evaluation run ${aiEvaluationRuns + 1} of ${maxAiEvaluationRuns}.`,
      confirmText: "Re-evaluate",
      cancelText: "Cancel",
      variant: "default",
    })
    if (!confirmed) return
    setLoading(true)
    try {
      const result = await adminReevaluateSubmissionAction(submissionId)
      if (!result.success) {
        showError({
          title: "AI Evaluation Failed",
          message: result.error || "Could not evaluate this submission.",
          code: "SUBMISSION_EVALUATION_ERR",
        })
        return
      }

      toast.success("Re-evaluation queued", { description: result.message })
      router.refresh()
    } catch {
      showError({
        title: "AI Evaluation Failed",
        message: "An unexpected error occurred while evaluating the answer sheet.",
        code: "SUBMISSION_EVALUATION_ERR",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={compact ? "outline" : "default"}
      className={compact
        ? "h-8 px-3 border-amber-200 text-amber-800 hover:bg-amber-50 font-semibold text-xs rounded-lg"
        : "h-10 px-4 bg-[#2A6AED] hover:bg-[#1E55C7] text-white rounded-xl"}
      disabled={loading}
      onClick={handleEvaluate}
    >
      {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-1.5 h-3.5 w-3.5" />}
      {loading ? "Queueing..." : `Re-evaluate (${aiEvaluationRuns}/${maxAiEvaluationRuns})`}
    </Button>
  )
}

export function AdminSubmissionsClient({
  submissions,
  currentPage,
  totalPages,
  pageSize,
}: {
  submissions: AdminSubmissionRow[]
  currentPage?: number
  totalPages?: number
  pageSize?: number
}) {
  const flaggedCount = submissions.filter(
    (s) => s.uncertaintyFlag || s.status === "REVIEW_REQUIRED"
  ).length
  const completedCount = submissions.filter((s) => s.status === "COMPLETED").length

  // Extract distinct test titles for dynamic filtering
  const distinctTestTitles = React.useMemo(() => {
    const set = new Set<string>()
    submissions.forEach((s) => {
      if (s.testTitle) set.add(s.testTitle)
    })
    return Array.from(set)
  }, [submissions])

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
          variant={
            s.status === "COMPLETED"
              ? "success"
              : s.status === "REVIEW_REQUIRED"
                ? "warning"
                : "info"
          }
          className="text-[11px] font-semibold rounded-full"
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
      header: "Awarded Marks",
      sortable: true,
      sortAccessor: (s) => s.totalMarksAwarded ?? -1,
      cell: (s) =>
        s.totalMarksAwarded !== null ? (
          <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-xs sm:text-sm">
            {s.totalMarksAwarded} / {s.maxMarks}
          </span>
        ) : (
          <span className="text-xs text-slate-400">Processing</span>
        ),
    },
    {
      id: "flags",
      header: "Confidence Flags",
      sortable: true,
      sortAccessor: (s) => (s.uncertaintyFlag ? 1 : 0),
      cell: (s) =>
        s.uncertaintyFlag ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">
            <AlertTriangle className="h-3 w-3" /> Flagged
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
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
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (s) => (
        <div className="flex items-center justify-end gap-1.5">
          {(s.status === "COMPLETED" || s.status === "FAILED" || s.status === "REVIEW_REQUIRED") && s.aiEvaluationRuns < 3 && (
            <AdminSubmissionEvaluationTrigger submissionId={s.id} compact aiEvaluationRuns={s.aiEvaluationRuns} />
          )}
          {s.fileUrl && (
            <a
              href={s.fileUrl.includes("?") ? `${s.fileUrl}&download=1` : `${s.fileUrl}?download=1`}
              target="_blank"
              rel="noreferrer"
              download
              title="Download scanned candidate booklet"
              className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-[#2A6AED] hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
            </a>
          )}
          <Link href={`/admin/submissions/${s.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="h-8 px-3 border-slate-200 dark:border-slate-800 text-[#2A6AED] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold text-xs rounded-lg shadow-2xs"
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Review Score
            </Button>
          </Link>
        </div>
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
        { label: "Processing", value: "PROCESSING" },
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
    ...(distinctTestTitles.length > 1
      ? [
          {
            id: "testSeries",
            label: "Test Series Paper",
            accessor: (s: AdminSubmissionRow) => s.testTitle,
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
        if (s.totalMarksAwarded === null || !s.maxMarks) return "UNSCORED"
        const pct = (s.totalMarksAwarded / s.maxMarks) * 100
        if (pct >= 70) return "HIGH"
        if (pct >= 50) return "AVERAGE"
        return "LOW"
      },
      options: [
        { label: "High Marks (≥ 70%)", value: "HIGH" },
        { label: "Average Marks (50–69%)", value: "AVERAGE" },
        { label: "Low Marks (< 50%)", value: "LOW" },
        { label: "Unscored / Processing", value: "UNSCORED" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={FileCheck2}
        title="Candidate Submissions & Reviews"
        subtitle="Viewing: All Evaluated Answer Sheets & Pending Educator Reviews"
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiStatCard
          label="Total Submissions"
          value={submissions.length}
          subtext="Processed candidate attempts"
          icon={FileCheck2}
          variant="blue"
        />
        <KpiStatCard
          label="Flagged for Review"
          value={flaggedCount}
          subtext="Awaiting educator inspection"
          icon={AlertTriangle}
          variant="amber"
        />
        <KpiStatCard
          label="Finalized & Approved"
          value={completedCount}
          subtext="Audited score evaluations"
          icon={CheckCircle2}
          variant="emerald"
        />
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
        showSerialNumber={true}
        defaultViewMode="auto"
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        renderCard={(s, _index, sn) => (
          <div
            key={s.id}
            className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-none hover:border-primary/40 transition-colors flex flex-col justify-between gap-4"
          >
            <div className="space-y-3">
              {/* Card Header: SN + Attempt + Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    #{sn}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-semibold border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-full"
                  >
                    Attempt #{s.attemptNumber} of 3
                  </Badge>
                </div>

                <Badge
                  variant="outline"
                  className={
                    s.status === "COMPLETED"
                      ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-semibold rounded-full"
                      : s.status === "REVIEW_REQUIRED"
                        ? "border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 text-[10px] font-semibold rounded-full"
                        : "border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[10px] font-semibold rounded-full"
                  }
                >
                  {s.status === "COMPLETED"
                    ? "Completed"
                    : s.status === "REVIEW_REQUIRED"
                      ? "Review Required"
                      : s.status}
                </Badge>
              </div>

              {/* Candidate Info */}
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                  {s.candidateName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {s.candidateEmail}
                </p>
              </div>

              {/* Test Series Title */}
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
                  <FileText className="h-3 w-3" />
                  <span>Test Series</span>
                </div>
                <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 line-clamp-1">
                  {s.testTitle}
                </p>
              </div>

              {/* Marks & Uncertainty Flag */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Awarded Marks</span>
                  {s.totalMarksAwarded !== null ? (
                    <span className="font-black text-[#2A6AED] dark:text-blue-400 text-sm">
                      {s.totalMarksAwarded} / {s.maxMarks}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Processing</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Confidence</span>
                  {s.uncertaintyFlag ? (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 px-2 py-0.5 rounded-full">
                      <AlertTriangle className="h-3 w-3" /> Flagged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Clear
                    </span>
                  )}
                </div>
              </div>

              {/* Submitted Date */}
              <div className="text-[11px] text-slate-400 dark:text-slate-500">
                Submitted <FormattedDate date={s.submittedAt} includeTime />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              {(s.status === "COMPLETED" || s.status === "FAILED" || s.status === "REVIEW_REQUIRED") && s.aiEvaluationRuns < 3 && (
                <AdminSubmissionEvaluationTrigger submissionId={s.id} compact aiEvaluationRuns={s.aiEvaluationRuns} />
              )}
              {s.fileUrl && (
                <a
                  href={s.fileUrl.includes("?") ? `${s.fileUrl}&download=1` : `${s.fileUrl}?download=1`}
                  target="_blank"
                  rel="noreferrer"
                  download
                  title="Download booklet"
                  className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#2A6AED] hover:bg-blue-50 dark:hover:bg-blue-950 text-xs font-semibold gap-1 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </a>
              )}
              <Link href={`/admin/submissions/${s.id}`} className="flex-1">
                <Button
                  size="sm"
                  className="w-full h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg shadow-none"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Review Score
                </Button>
              </Link>
            </div>
          </div>
        )}
        emptyTitle="No candidate submissions found"
        emptyDescription="No student submissions match your current search or filter criteria."
      />
    </div>
  )
}
