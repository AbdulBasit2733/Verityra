"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconActionButton } from "@/components/ui/icon-action-button"
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
} from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Edit,
  FileCheck2,
  FileText,
  Loader2,
  RotateCcw,
} from "lucide-react"
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
  subjectTestTitle?: string | null
  testSeriesTitle?: string | null
  attemptNumber: number
  status: string
  totalMarksAwarded: number | null
  maxMarks: number | null
  evaluatedMaxMarks?: number | null
  uncertaintyFlag: boolean
  fileUrl?: string | null
  submittedAt: string
  aiEvaluationRuns: number
  jobStatus?: string | null
  jobAttempts?: number | null
  jobError?: string | null
}

export function AdminEvaluationLiveBanner({
  submissionId,
  initialJobStatus,
  initialAttempts = 0,
  runNumber = 1,
}: {
  submissionId: string
  initialJobStatus?: string | null
  initialAttempts?: number
  runNumber?: number
}) {
  const router = useRouter()
  const [liveState, setLiveState] = React.useState<{
    jobStatus: string
    progress: number
    attempts: number
    error: string | null
  }>({
    jobStatus: initialJobStatus || "PROCESSING",
    progress: 15,
    attempts: initialAttempts,
    error: null,
  })

  React.useEffect(() => {
    let cancelled = false
    let polls = 0
    const maxPolls = 120 // 6 minutes @ 3s

    const timer = setInterval(async () => {
      polls += 1
      if (polls > maxPolls) {
        clearInterval(timer)
        return
      }
      try {
        const res = await fetch(`/api/submissions/${submissionId}/status`, {
          cache: "no-store",
        })
        if (!res.ok || cancelled) return
        const data = await res.json()
        if (cancelled) return

        if (data.isComplete) {
          clearInterval(timer)
          toast.success(`AI Evaluation Run #${runNumber} Completed`, {
            description:
              data.totalMarksAwarded != null
                ? `Updated score: ${data.totalMarksAwarded} / ${data.maxMarks} marks (${data.percentage}%).`
                : "Updated question review is now ready.",
          })
          router.refresh()
          return
        }

        if (data.isFailed) {
          clearInterval(timer)
          toast.error("AI Evaluation Failed", {
            description:
              data.jobError ||
              "Worker encountered an error. You can force-retry from this page.",
          })
          router.refresh()
          return
        }

        setLiveState((prev) => ({
          jobStatus: data.jobStatus || data.submissionStatus || prev.jobStatus,
          progress:
            data.progress > 0
              ? data.progress
              : Math.min(92, prev.progress + 10),
          attempts: data.jobAttempts ?? prev.attempts,
          error: data.jobError || null,
        }))
      } catch {
        // Ignore transient network hiccups while polling
      }
    }, 3000)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [submissionId, runNumber, router])

  return (
    <div className="space-y-2.5 rounded-md border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/40">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#2A6AED]" />
          <div>
            <p className="text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100">
              AI Evaluation Run #{runNumber} in progress ({liveState.jobStatus})
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Checking handwritten sheet against official Question Paper, Model
              Answer, and board step-marking rules. Page will refresh
              automatically when done.
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="border-blue-300 bg-white text-[11px] font-semibold text-[#2A6AED]"
        >
          Attempt {Math.max(1, liveState.attempts)} · {liveState.progress}%
        </Badge>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-blue-200/70 dark:bg-blue-900/50">
        <div
          className="h-full origin-left rounded-full bg-[#2A6AED] transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(8, liveState.progress))}%` }}
        />
      </div>
    </div>
  )
}

export function AdminSubmissionEvaluationTrigger({
  submissionId,
  compact = false,
  iconOnly = false,
  aiEvaluationRuns = 0,
  isProcessing = false,
}: {
  submissionId: string
  compact?: boolean
  iconOnly?: boolean
  aiEvaluationRuns?: number
  isProcessing?: boolean
}) {
  const router = useRouter()
  const { showError } = useGlobalError()
  const confirm = useConfirm()
  const [loading, setLoading] = React.useState(false)

  async function handleEvaluate() {
    const confirmed = await confirm({
      title: isProcessing
        ? "Force retry stalled evaluation?"
        : "Queue AI re-evaluation?",
      description: isProcessing
        ? `This submission is currently marked PROCESSING. Force-retrying will mark the stalled run failed and queue run #${aiEvaluationRuns + 1}.`
        : `This will trigger administrative AI evaluation run #${aiEvaluationRuns + 1}.`,
      confirmText: isProcessing ? "Force Retry" : "Re-evaluate",
      cancelText: "Cancel",
      variant: "default",
    })
    if (!confirmed) return
    setLoading(true)
    try {
      const result = await adminReevaluateSubmissionAction(submissionId, {
        force: isProcessing,
      })
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
        message:
          "An unexpected error occurred while evaluating the answer sheet.",
        code: "SUBMISSION_EVALUATION_ERR",
      })
    } finally {
      setLoading(false)
    }
  }

  if (iconOnly) {
    const label = loading
      ? "Queueing re-evaluation"
      : `Re-evaluate submission (Run #${aiEvaluationRuns + 1})`

    return (
      <IconActionButton
        label={label}
        variant="outline"
        disabled={loading}
        onClick={handleEvaluate}
        className="border-amber-200 text-amber-800 hover:bg-amber-50 dark:border-amber-900/60 dark:text-amber-300 dark:hover:bg-amber-950/40"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RotateCcw className="h-4 w-4" />
        )}
      </IconActionButton>
    )
  }

  return (
    <Button
      type="button"
      size="sm"
      variant={compact ? "outline" : "default"}
      className={
        compact
          ? "h-8 rounded-md border-amber-200 px-3 text-xs font-semibold text-amber-800 hover:bg-amber-50"
          : "h-10 rounded-md bg-[#2A6AED] px-4 text-white hover:bg-[#1E55C7]"
      }
      disabled={loading}
      onClick={handleEvaluate}
    >
      {loading ? (
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
      ) : (
        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
      )}
      {loading ? "Queueing..." : `Re-evaluate (Run #${aiEvaluationRuns + 1})`}
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
  const completedCount = submissions.filter(
    (s) => s.status === "COMPLETED"
  ).length

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
        `${s.candidateName} ${s.candidateEmail} ${s.subjectTestTitle || ""} ${s.testSeriesTitle || ""} ${s.testTitle} ${s.status}`,
      cell: (s) => (
        <div>
          <span className="block font-bold text-slate-900 dark:text-slate-100">
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
      header: "Subject Test & Series",
      sortable: true,
      sortAccessor: (s) => s.subjectTestTitle || s.testTitle,
      cell: (s) => (
        <div className="min-w-0">
          <h1
            className="max-w-xs truncate text-xs font-bold text-slate-900 sm:text-sm dark:text-slate-100"
            title={s.subjectTestTitle || s.testSeriesTitle || s.testTitle}
          >
            {s.subjectTestTitle || s.testSeriesTitle || s.testTitle}
          </h1>
          {s.subjectTestTitle && s.testSeriesTitle && (
            <span
              className="mt-0.5 block max-w-xs truncate text-[11px] font-normal text-slate-500 dark:text-slate-400"
              title={s.testSeriesTitle}
            >
              {s.testSeriesTitle}
            </span>
          )}
        </div>
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
          className="rounded-sm border-blue-200 bg-blue-50 text-[11px] font-semibold text-[#2A6AED] dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400"
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
        <div className="space-y-1">
          <Badge
            variant={
              s.status === "COMPLETED"
                ? "success"
                : s.status === "REVIEW_REQUIRED"
                  ? "warning"
                  : "info"
            }
            className={
              s.status === "FAILED"
                ? "rounded-sm border-red-200 bg-red-50 text-[11px] font-semibold text-red-700"
                : "rounded-sm text-[11px] font-semibold"
            }
          >
            {s.status === "COMPLETED"
              ? "Completed"
              : s.status === "REVIEW_REQUIRED"
                ? "Review Required"
                : s.status}
          </Badge>
          {s.jobError && s.status !== "COMPLETED" && (
            <p
              title={s.jobError}
              className="max-w-[180px] truncate text-[10px] text-red-600 dark:text-red-400"
            >
              {s.jobError}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "score",
      header: "Awarded Marks",
      sortable: true,
      sortAccessor: (s) => s.totalMarksAwarded ?? -1,
      cell: (s) =>
        s.totalMarksAwarded !== null ? (
          <div className="space-y-0.5">
            <span className="block text-xs font-extrabold text-[#2A6AED] sm:text-sm dark:text-blue-400">
              {s.totalMarksAwarded} / {s.maxMarks}
            </span>
            {s.evaluatedMaxMarks != null &&
              s.maxMarks != null &&
              Math.abs(s.evaluatedMaxMarks - s.maxMarks) > 0.01 && (
                <span
                  title={`Previous AI run used ${s.evaluatedMaxMarks} max marks instead of configured ${s.maxMarks}. Click Re-evaluate to refresh.`}
                  className="block text-[10px] font-medium text-amber-700 dark:text-amber-400"
                >
                  Graded /{s.evaluatedMaxMarks} · Re-evaluate
                </span>
              )}
          </div>
        ) : (
          <span className="text-xs text-slate-400">
            {s.status === "FAILED" ? `— / ${s.maxMarks}` : `Processing / ${s.maxMarks}`}
          </span>
        ),
    },
    {
      id: "flags",
      header: "Confidence Flags",
      sortable: true,
      sortAccessor: (s) => (s.uncertaintyFlag ? 1 : 0),
      cell: (s) =>
        s.uncertaintyFlag ? (
          <span className="inline-flex items-center gap-1 rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
            <AlertTriangle className="h-3 w-3" /> Flagged
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
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
        <div className="flex items-center justify-end gap-1">
          {(s.status === "COMPLETED" ||
            s.status === "FAILED" ||
            s.status === "REVIEW_REQUIRED" ||
            s.status === "PROCESSING" ||
            s.status === "PENDING") && (
            <AdminSubmissionEvaluationTrigger
              submissionId={s.id}
              compact
              iconOnly
              aiEvaluationRuns={s.aiEvaluationRuns}
              isProcessing={s.status === "PROCESSING"}
            />
          )}
          {s.fileUrl && (
            <IconActionButton
              label="Download scanned candidate booklet"
              render={
                <a
                  href={
                    s.fileUrl.includes("?")
                      ? `${s.fileUrl}&download=1`
                      : `${s.fileUrl}?download=1`
                  }
                  target="_blank"
                  rel="noreferrer"
                  download
                />
              }
              nativeButton={false}
              variant="outline"
              className="border-slate-200 text-slate-500 hover:border-blue-200 hover:bg-blue-50 hover:text-[#2A6AED] dark:border-slate-800 dark:hover:bg-blue-950"
            >
              <Download className="h-3.5 w-3.5" />
            </IconActionButton>
          )}
          <IconActionButton
            label="Review score"
            render={<Link href={`/admin/submissions/${s.id}`} />}
            nativeButton={false}
            variant="outline"
            className="border-slate-200 text-[#2A6AED] hover:border-blue-200 hover:bg-blue-50 dark:border-slate-800 dark:text-blue-400 dark:hover:bg-blue-950"
          >
            <Edit className="h-3.5 w-3.5" />
          </IconActionButton>
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
        { label: "Failed", value: "FAILED" },
        { label: "Pending", value: "PENDING" },
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
        { label: "High Marks (â‰¥ 70%)", value: "HIGH" },
        { label: "Average Marks (50â€“69%)", value: "AVERAGE" },
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            className="flex flex-col justify-between gap-4 rounded-md border border-border bg-background p-4 shadow-none transition-colors hover:border-primary/40 sm:p-5"
          >
            <div className="space-y-3">
              {/* Card Header: SN + Attempt + Status */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-slate-100 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    #{sn}
                  </span>
                  <Badge
                    variant="outline"
                    className="rounded-sm border-blue-200 bg-blue-50 text-[10px] font-semibold text-[#2A6AED] dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400"
                  >
                    Attempt #{s.attemptNumber} of 3
                  </Badge>
                </div>

                <Badge
                  variant="outline"
                  className={
                    s.status === "COMPLETED"
                      ? "rounded-sm border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
                      : s.status === "REVIEW_REQUIRED"
                        ? "rounded-sm border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400"
                        : "rounded-sm border-blue-200 bg-blue-50 text-[10px] font-semibold text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400"
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
                <h4 className="text-sm leading-snug font-bold text-slate-900 dark:text-slate-100">
                  {s.candidateName}
                </h4>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {s.candidateEmail}
                </p>
              </div>

              {/* Subject Test & Series Title */}
              <div className="border-t border-slate-100 pt-2.5 dark:border-slate-800">
                <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  <FileText className="h-3 w-3" />
                  <span>Subject Test & Series</span>
                </div>
                <h1 className="line-clamp-1 text-xs font-bold text-slate-900 dark:text-slate-100">
                  {s.subjectTestTitle || s.testSeriesTitle || s.testTitle}
                </h1>
                {s.subjectTestTitle && s.testSeriesTitle && (
                  <span className="mt-0.5 block line-clamp-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {s.testSeriesTitle}
                  </span>
                )}
              </div>

              {/* Marks & Uncertainty Flag */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
                <div>
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    Awarded Marks
                  </span>
                  {s.totalMarksAwarded !== null ? (
                    <span className="text-sm font-black text-[#2A6AED] dark:text-blue-400">
                      {s.totalMarksAwarded} / {s.maxMarks}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">Processing</span>
                  )}
                </div>

                <div className="text-right">
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                    Confidence
                  </span>
                  {s.uncertaintyFlag ? (
                    <span className="inline-flex items-center gap-1 rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                      <AlertTriangle className="h-3 w-3" /> Flagged
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
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
            <div className="flex items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              {(s.status === "COMPLETED" ||
                s.status === "FAILED" ||
                s.status === "REVIEW_REQUIRED") && (
                <AdminSubmissionEvaluationTrigger
                  submissionId={s.id}
                  compact
                  aiEvaluationRuns={s.aiEvaluationRuns}
                />
              )}
              {s.fileUrl && (
                <a
                  href={
                    s.fileUrl.includes("?")
                      ? `${s.fileUrl}&download=1`
                      : `${s.fileUrl}?download=1`
                  }
                  target="_blank"
                  rel="noreferrer"
                  download
                  title="Download booklet"
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-blue-50 hover:text-[#2A6AED] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-blue-950"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </a>
              )}
              <Link href={`/admin/submissions/${s.id}`} className="flex-1">
                <Button
                  size="sm"
                  className="h-8 w-full rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-none hover:bg-primary/90"
                >
                  <Edit className="mr-1 h-3.5 w-3.5" />
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
