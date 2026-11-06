"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { cn } from "@/lib/utils"
import { AttemptProgressTracker } from "@/components/shared/attempt-progress-tracker"
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  Info,
  Printer,
  UploadCloud,
  Timer,
} from "lucide-react"

const SubmissionUploadForm = dynamic(
  () => import("@/components/submission-upload-form").then((m) => m.SubmissionUploadForm),
  {
    loading: () => (
      <div className="rounded-2xl border border-border bg-card p-8 text-center text-xs text-muted-foreground shadow-xs">
        Loading submission upload interface...
      </div>
    ),
  }
)

export interface WorkspaceQuestionScore {
  id: string
  questionNumber: string
  maxMarks: number
  marksAwarded: number
  feedback: string
  missingConcepts: string | null
  scoreBand?: string
  scoreExplanation?: string
  strengths?: string
  examinerExpectation?: string
  improvementAdvice?: string
  isLegible: boolean
}

export interface WorkspaceSubmissionItem {
  id: string
  attemptNumber: number
  status: string
  fileUrl: string | null
  submittedAt: string
  evaluation: {
    id: string
    totalMarksAwarded: number
    maxMarks: number
    percentage: number
    generalFeedback: string
    legibilityWarning: boolean
    uncertaintyFlag: boolean
    questions: WorkspaceQuestionScore[]
  } | null
  evaluationRuns?: Array<{
    id: string
    runNumber: number
    trigger: string
    status: string
    totalMarksAwarded: number
    maxMarks: number
    questions: Array<WorkspaceQuestionScore & { examinerExpectation?: string; improvementAdvice?: string }>
  }>
}

export interface WorkspaceResourceItem {
  id: string
  title: string
  fileUrl: string
}

function WorkspaceWritingTimer({
  testSeriesId,
  durationMinutes,
}: {
  testSeriesId: string
  durationMinutes: number
}) {
  const timerStorageKey = `verityra-writing-timer:${testSeriesId}`
  const [writingStartedAt, setWritingStartedAt] = React.useState<number | null>(null)
  const [clockNow, setClockNow] = React.useState(0)

  React.useEffect(() => {
    const stored = window.localStorage.getItem(timerStorageKey)
    if (stored) setWritingStartedAt(Number(stored))
  }, [timerStorageKey])

  React.useEffect(() => {
    if (!writingStartedAt) return
    setClockNow(Date.now())
    const interval = window.setInterval(() => setClockNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [writingStartedAt])

  const elapsedWritingMinutes = writingStartedAt && clockNow
    ? Math.floor((clockNow - writingStartedAt) / 60000)
    : 0

  const startWritingTimer = () => {
    const startedAt = Date.now()
    window.localStorage.setItem(timerStorageKey, String(startedAt))
    setWritingStartedAt(startedAt)
    setClockNow(startedAt)
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Timer className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-sm font-semibold text-foreground">Writing and upload time planner</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Plan {durationMinutes} minutes for writing, then keep approximately 15–30 minutes for photographing/scanning pages and converting them into one clear PDF under 1–2 MB.
            </p>
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={startWritingTimer}
          disabled={Boolean(writingStartedAt)}
          className="shrink-0 gap-2"
        >
          <Timer className="h-4 w-4" />
          {writingStartedAt ? `Writing time: ${elapsedWritingMinutes} min` : "Start writing timer"}
        </Button>
      </div>
      {writingStartedAt && (
        <p className="mt-3 border-t border-primary/15 pt-3 text-xs text-muted-foreground">
          Timer started locally for this test. Upload your scanned answer sheet from the Submit Handwritten Booklet section when ready.
        </p>
      )}
    </div>
  )
}

export function StudentWorkspaceClient({
  testSeriesId,
  title,
  maxMarks,
  durationMinutes,
  studentInstructions,
  attemptsUsed,
  maxAttempts,
  papers,
  templates,
  submissions,
}: {
  testSeriesId: string
  title: string
  maxMarks: number
  durationMinutes: number
  studentInstructions: string
  attemptsUsed: number
  maxAttempts: number
  papers: WorkspaceResourceItem[]
  templates: WorkspaceResourceItem[]
  submissions: WorkspaceSubmissionItem[]
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed)

  // Read attempt number from URL, fallback to latest submission or 1
  const attemptFromUrl = searchParams.get("attempt")
  const defaultAttempt = submissions[0]?.attemptNumber || 1
  const selectedAttemptNumber = attemptFromUrl
    ? parseInt(attemptFromUrl, 10)
    : defaultAttempt

  // Function to update URL with new attempt number (shallow update, no scroll)
  const setSelectedAttemptNumber = React.useCallback(
    (attemptNumber: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("attempt", attemptNumber.toString())
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  // Validate that selected attempt exists in submissions
  React.useEffect(() => {
    if (
      submissions.length > 0 &&
      !submissions.some((s) => s.attemptNumber === selectedAttemptNumber)
    ) {
      setSelectedAttemptNumber(submissions[0].attemptNumber)
    }
  }, [submissions, selectedAttemptNumber, setSelectedAttemptNumber])

  const activeSubmission =
    submissions.find((s) => s.attemptNumber === selectedAttemptNumber) || submissions[0]
  const [selectedRunNumber, setSelectedRunNumber] = React.useState<number | null>(null)
  const selectedRun = activeSubmission?.evaluationRuns?.find((run) => run.runNumber === selectedRunNumber)
  const reportQuestions = selectedRun?.questions || activeSubmission?.evaluation?.questions || []

  const resolvedPapers = papers.length > 0 ? papers : [
    {
      id: "default-paper",
      title: "Official Examination Question Paper (PDF)",
      fileUrl: "/api/files/download?file=papers/upsc-paper.pdf",
    },
  ]

  const resolvedTemplates = templates.length > 0 ? templates : [
    {
      id: "default-tpl",
      title: "Official 24-Page Ruled Margin Booklet (A4)",
      fileUrl: "/api/files/download?file=templates/upsc-template.pdf",
    },
  ]

  const questionColumns: DataTableColumn<WorkspaceQuestionScore>[] = React.useMemo(
    () => [
      {
        id: "questionNumber",
        header: "Question",
        sortable: true,
        sortAccessor: (q) => {
          const match = q.questionNumber.match(/\d+/)
          return match ? parseInt(match[0], 10) : q.questionNumber
        },
        searchAccessor: (q) =>
          `${q.questionNumber} ${q.feedback} ${q.missingConcepts || ""}`,
        className: "w-24 font-bold text-[#2A6AED] dark:text-blue-400",
        cell: (q) => q.questionNumber,
      },
      {
        id: "score",
        header: "Awarded / Max",
        sortable: true,
        sortAccessor: (q) => q.marksAwarded,
        className: "w-36",
        cell: (q) => {
          const ratio = q.maxMarks > 0 ? Math.round((q.marksAwarded / q.maxMarks) * 100) : 0
          return (
            <div className="space-y-0.5">
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                {q.marksAwarded} / {q.maxMarks}
              </span>
              <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {ratio}% credit
              </span>
            </div>
          )
        },
      },
      {
        id: "feedback",
        header: "Rubric Evaluation Feedback",
        sortable: false,
        className: "whitespace-normal min-w-[260px]",
        cell: (q) => (
          <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">{q.feedback}</p>
        ),
      },
      {
        id: "missingConcepts",
        header: "Improvement Notes & Omissions",
        sortable: false,
        className: "whitespace-normal min-w-[240px]",
        cell: (q) =>
          q.missingConcepts ? (
            <p className="text-xs text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900 leading-relaxed">
              {q.missingConcepts}
            </p>
          ) : (
            <span className="text-xs text-slate-400 italic">No omissions identified</span>
          ),
      },
      {
        id: "legibility",
        header: "Legibility",
        sortable: true,
        sortAccessor: (q) => (q.isLegible ? 1 : 0),
        className: "w-28 text-center",
        cell: (q) =>
          q.isLegible ? (
            <Badge
              variant="outline"
              className="border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-semibold rounded-full"
            >
              Clear
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 text-[10px] font-semibold rounded-full"
            >
              Unclear
            </Badge>
          ),
      },
    ],
    []
  )

  const questionFilters: DataTableFilter<WorkspaceQuestionScore>[] = React.useMemo(
    () => [
      {
        id: "scoreBand",
        label: "Score Band",
        accessor: (q) => {
          const ratio = q.maxMarks > 0 ? (q.marksAwarded / q.maxMarks) * 100 : 0
          if (ratio >= 70) return "HIGH"
          if (ratio >= 40) return "MEDIUM"
          return "LOW"
        },
        options: [
          { label: "High Marks (≥ 70%)", value: "HIGH" },
          { label: "Medium Marks (40–69%)", value: "MEDIUM" },
          { label: "Low Marks (< 40%)", value: "LOW" },
        ],
      },
      {
        id: "legibility",
        label: "Legibility",
        accessor: (q) => (q.isLegible ? "CLEAR" : "UNCLEAR"),
        options: [
          { label: "Clear Script", value: "CLEAR" },
          { label: "Unclear Script", value: "UNCLEAR" },
        ],
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={BookOpen}
        title={title}
        subtitle={`Examination Workspace: ${durationMinutes} mins · ${maxMarks} Max Marks`}
        showRefresh={false}
      >
        <Link href="/student/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Dashboard
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          label="Examination Duration"
          value={`${durationMinutes} Mins`}
          subtext="Standard UPSC test time"
          icon={Clock}
          variant="blue"
        />
        <KpiStatCard
          label="Maximum Marks"
          value={`${maxMarks} Marks`}
          subtext="Total syllabus weightage"
          icon={Award}
          variant="indigo"
        />
        <KpiStatCard
          label="3-Attempt Quota"
          value={`${attemptsUsed} / ${maxAttempts}`}
          subtext={`${attemptsRemaining} attempts remaining`}
          icon={FileCheck2}
          variant={attemptsRemaining === 0 ? "rose" : "amber"}
        />
        <KpiStatCard
          label="Evaluated Attempts"
          value={submissions.length}
          subtext="Detailed scorecards available"
          icon={CheckCircle2}
          variant="emerald"
        />
      </div>

      {/* Attempt Progress Tracker */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {maxAttempts > 3 ? "Extended Attempt Progression" : "3-Attempt Guarantee Progression"} ({attemptsUsed} of {maxAttempts} consumed)
          </span>
          <span className="font-bold text-[#2A6AED] dark:text-blue-400">
            {attemptsRemaining} remaining
          </span>
        </div>

        {/* Dynamic Attempt Progress Nodes */}
        <AttemptProgressTracker
          attemptsUsed={attemptsUsed}
          maxAttempts={maxAttempts}
          submissions={submissions}
          className="py-2"
        />

        {/* Progress Bar (Fallback Visual) */}
        <Progress
          value={attemptsUsed}
          max={maxAttempts}
          indicatorClassName={attemptsRemaining === 0 ? "bg-amber-500" : "bg-[#2A6AED]"}
        />
      </div>

      {/* Writing & Upload Time Planner (Isolated Timer Component) */}
      <WorkspaceWritingTimer testSeriesId={testSeriesId} durationMinutes={durationMinutes} />

      {/* Workspace Tabs */}
      <Tabs defaultValue={submissions.length > 0 ? "evaluations" : "upload"} className="space-y-6">
        <TabsList variant="line" className="border-b border-slate-200 dark:border-slate-800 w-full justify-start overflow-x-auto no-scrollbar">
          <TabsTrigger value="evaluations" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2">
            <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
            <span className="sm:hidden">Evaluations ({submissions.length})</span>
            <span className="hidden sm:inline">Evaluated Attempts & Rubric Breakdown ({submissions.length})</span>
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2">
            <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
            <span className="sm:hidden">Submit Booklet ({attemptsRemaining} left)</span>
            <span className="hidden sm:inline">Submit Handwritten Booklet ({attemptsRemaining} left)</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            <span className="sm:hidden">Resources</span>
            <span className="hidden sm:inline">Question Paper, Margin Sheet & Instructions</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: EVALUATIONS & ITEMIZED QUESTION DATATABLE */}
        <TabsContent value="evaluations" className="space-y-6 pt-1">
          {submissions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center space-y-2">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                No handwritten attempts submitted yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Download the question paper and margin-aligned answer template from the Resources tab, then upload your scanned response booklet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Attempt Selector Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex overflow-x-auto no-scrollbar scroll-smooth flex-nowrap items-center gap-2 py-1 max-w-full">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0">
                    Attempt:
                  </span>
                  {submissions.map((sub) => {
                    const isSelected = sub.attemptNumber === activeSubmission?.attemptNumber
                    return (
                      <Button
                        key={sub.id}
                        type="button"
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setSelectedAttemptNumber(sub.attemptNumber)}
                        className={cn(
                          "shrink-0",
                          isSelected
                            ? "h-9 px-4 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-bold shadow-2xs"
                            : "h-9 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                        )}
                      >
                        Attempt #{sub.attemptNumber}
                        {sub.evaluation && (
                          <span className="ml-1.5 opacity-90">
                            ({sub.evaluation.totalMarksAwarded}/{sub.evaluation.maxMarks})
                          </span>
                        )}
                      </Button>
                    )
                  })}
                </div>

                {activeSubmission && (
                  <div className="flex flex-wrap items-center gap-3 text-xs">
                    <span className="text-slate-500 dark:text-slate-400">
                      Submitted <FormattedDate date={activeSubmission.submittedAt} includeTime />
                    </span>
                    {activeSubmission.fileUrl && (
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={activeSubmission.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-[#2A6AED] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Booklet
                        </a>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <a
                          href={
                            activeSubmission.fileUrl.includes("?")
                              ? `${activeSubmission.fileUrl}&download=1`
                              : `${activeSubmission.fileUrl}?download=1`
                          }
                          download
                          className="font-semibold text-slate-600 dark:text-slate-300 hover:text-[#2A6AED] dark:hover:text-blue-400 inline-flex items-center gap-1"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {activeSubmission?.evaluation ? (
                <div className="space-y-5">
                  {/* Score & Articulation Summary Bar */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
                    <div className="lg:col-span-4 p-5 flex flex-col justify-center bg-slate-50/60 dark:bg-slate-950/60">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Attempt #{activeSubmission.attemptNumber} Final Score
                      </span>
                      <div className="flex items-baseline gap-2.5 mt-1">
                        <span className="text-3xl font-black text-[#2A6AED] dark:text-blue-400">
                          {selectedRun?.totalMarksAwarded ?? activeSubmission.evaluation.totalMarksAwarded}
                        </span>
                        <span className="text-sm font-bold text-slate-500">
                          / {selectedRun?.maxMarks ?? activeSubmission.evaluation.maxMarks} marks
                        </span>
                        <Badge className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-0 text-[11px] font-bold rounded-full">
                          {activeSubmission.evaluation.percentage}%
                        </Badge>
                      </div>
                    </div>

                    <div className="lg:col-span-8 p-5 flex flex-col justify-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Overall Evaluator Articulation Summary
                      </span>
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                        {activeSubmission.evaluation.generalFeedback}
                      </p>
                    </div>
                  </div>

                  {activeSubmission.evaluation.legibilityWarning && (
                    <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40 px-4 py-3 text-xs sm:text-sm text-amber-900 dark:text-amber-300 shadow-2xs">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>
                        Legibility Notice: Portions of your handwritten script had low contrast. Use dark ink and well-lit vertical scanning on subsequent attempts.
                      </span>
                    </div>
                  )}

                  {(activeSubmission.evaluationRuns?.length || 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Evaluation runs:</span>
                      <Button type="button" size="sm" variant={selectedRunNumber === null ? "default" : "outline"} onClick={() => setSelectedRunNumber(null)}>
                        Latest
                      </Button>
                      {(activeSubmission.evaluationRuns || []).map((run) => (
                        <Button key={run.id} type="button" size="sm" variant={selectedRunNumber === run.runNumber ? "default" : "outline"} onClick={() => setSelectedRunNumber(run.runNumber)}>
                          Run {run.runNumber}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Question-by-Question DataTable */}
                  <div className="space-y-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Question-by-Question Rubric Scoring
                    </h3>
                    <DataTable
                       data={reportQuestions}
                      columns={questionColumns}
                      keyExtractor={(q) => q.id}
                      searchPlaceholder="Search questions, feedback, or missing concepts..."
                      filters={questionFilters}
                      defaultSortColumn="questionNumber"
                      defaultSortDirection="asc"
                      defaultPageSize={10}
                      showSerialNumber={true}
                      renderCard={(q, idx, serialNumber) => {
                        const ratio = q.maxMarks > 0 ? Math.round((q.marksAwarded / q.maxMarks) * 100) : 0
                        return (
                          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-2xs space-y-3">
                            <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[11px] font-bold text-[#2A6AED] dark:text-blue-400">
                                  {q.questionNumber}
                                </span>
                                <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-sm">
                                  {q.marksAwarded} / {q.maxMarks} marks
                                </span>
                                <span className="text-[11px] font-semibold text-slate-400">
                                  ({ratio}% credit)
                                </span>
                                 {q.scoreBand && <Badge variant="outline" className="text-[10px]">{q.scoreBand}</Badge>}
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  q.isLegible
                                    ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-semibold rounded-full"
                                    : "border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 text-[10px] font-semibold rounded-full"
                                }
                              >
                                {q.isLegible ? "Clear Script" : "Unclear"}
                              </Badge>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                                Rubric Feedback
                              </span>
                               <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                                 {q.scoreExplanation || q.feedback}
                              </p>
                            </div>

                             {q.strengths && <p className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg">Strengths: {q.strengths}</p>}
                             {q.examinerExpectation && <p className="text-xs text-blue-800 bg-blue-50 p-2 rounded-lg">Examiner expected: {q.examinerExpectation}</p>}
                             {q.improvementAdvice && <p className="text-xs text-indigo-800 bg-indigo-50 p-2 rounded-lg">How to improve: {q.improvementAdvice}</p>}

                            {q.missingConcepts && (
                              <div className="pt-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
                                  Improvement & Omissions
                                </span>
                                <p className="text-xs text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900 leading-relaxed">
                                  {q.missingConcepts}
                                </p>
                              </div>
                            )}
                          </div>
                        )
                      }}
                      emptyTitle="No itemized question scores available"
                      emptyDescription="Adjust your search or score band filter to view question rows."
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400 shadow-xs">
                  Evaluation for Attempt #{activeSubmission?.attemptNumber} is currently in progress.
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB 2: UPLOAD HANDWRITTEN BOOKLET */}
        <TabsContent value="upload" className="pt-1">
          <SubmissionUploadForm
            testSeriesId={testSeriesId}
            attemptsUsed={attemptsUsed}
            maxAttempts={maxAttempts}
          />
        </TabsContent>

        {/* TAB 3: DOWNLOADABLE RESOURCES & CANDIDATE INSTRUCTIONS */}
        <TabsContent value="resources" className="space-y-6 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Official Question Paper Downloads */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                    Official Question Paper PDF
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-semibold border-blue-200 bg-blue-50/60 dark:bg-blue-950/60 text-[#2A6AED] dark:text-blue-300">
                    Exam Paper
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Download or preview the question paper. Solve all questions sequentially with pen and paper under timed conditions.
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-1">
                {resolvedPapers.map((paper) => {
                  const downloadUrl = paper.fileUrl.includes("?")
                    ? `${paper.fileUrl}&download=1`
                    : `${paper.fileUrl}?download=1`
                  return (
                    <div
                      key={paper.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={paper.title}>
                        {paper.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] shadow-2xs transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                          Preview
                        </a>
                        <a
                          href={downloadUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#2A6AED] text-white font-semibold hover:bg-[#1E55C7] text-[11px] shadow-2xs transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Download
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 2. Prescribed Margin Template Downloads */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Printer className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                    Margin Answer Sheet Template
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-semibold border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Printable A4
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Print this ruled margin booklet so your handwritten answers match examination proportions and margin compliance rules.
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-1">
                {resolvedTemplates.map((tpl) => {
                  const downloadUrl = tpl.fileUrl.includes("?")
                    ? `${tpl.fileUrl}&download=1`
                    : `${tpl.fileUrl}?download=1`
                  return (
                    <div
                      key={tpl.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                    >
                      <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={tpl.title}>
                        {tpl.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={tpl.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] shadow-2xs transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                          Preview
                        </a>
                        <a
                          href={downloadUrl}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] shadow-2xs transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400" />
                          Print / Save
                        </a>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 3. Benchmark Sample Answer Sheet */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                    Benchmark Sample Answer Sheet
                  </h3>
                  <Badge variant="outline" className="text-[10px] font-semibold border-amber-200 bg-amber-50/60 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    Model 73.8%
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Inspect a verified handwritten candidate response booklet demonstrating structured headings, margin discipline, and examiner marks.
                </p>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-1">
                <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate" title="UPSC GS-1 Model Handwritten Booklet">
                    UPSC GS-1 Benchmark Booklet (PDF)
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="/api/files/download?file=submissions/demo/sample-attempt.pdf"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] shadow-2xs transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                      Preview
                    </a>
                    <a
                      href="/api/files/download?file=submissions/demo/sample-attempt.pdf&download=1"
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#2A6AED] text-white font-semibold hover:bg-[#1E55C7] text-[11px] shadow-2xs transition-colors"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {/* Candidate Instructions */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Info className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
              Candidate Examination Instructions
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
              {studentInstructions}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
