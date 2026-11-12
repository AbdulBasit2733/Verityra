"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { cn } from "@/lib/utils"
import { ExamWorkspaceTimer } from "@/components/student/workspace/exam-workspace-timer"
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
  Lock,
  Printer,
  Sparkles,
  UploadCloud,
  Timer,
} from "lucide-react"

const SubmissionUploadForm = dynamic(
  () => import("@/components/student/workspace/submission-upload-form").then((m) => m.SubmissionUploadForm),
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
  const [activeTab, setActiveTab] = React.useState<string>(
    submissions.length > 0 ? "evaluations" : "upload"
  )
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
    <div className="space-y-5">
      {/* 1. UNIFIED EXECUTIVE HEADER & SUMMARY BADGES */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-1">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs shrink-0 mt-0.5 sm:mt-0">
            <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-foreground tracking-tight truncate">
              {title}
            </h1>

            {/* High-Priority Summary Badges: Replaces repetitive stat cards with high-density badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 py-0.5 px-2.5 text-xs font-semibold border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300"
              >
                <Clock className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400" />
                <span>{durationMinutes} Mins</span>
              </Badge>

              <Badge
                variant="outline"
                className="gap-1.5 py-0.5 px-2.5 text-xs font-semibold border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300"
              >
                <Award className="h-3.5 w-3.5 text-indigo-500" />
                <span>{maxMarks} Max Marks</span>
              </Badge>

              <Badge
                variant={attemptsRemaining === 0 ? "destructive" : "secondary"}
                className={cn(
                  "gap-1.5 py-0.5 px-2.5 text-xs font-semibold",
                  attemptsRemaining > 0 &&
                    "bg-blue-50 dark:bg-blue-950/60 text-[#2A6AED] dark:text-blue-300 border border-blue-200/80 dark:border-blue-900"
                )}
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>
                  Attempt {attemptsUsed} of {maxAttempts} ({attemptsRemaining} remaining)
                </span>
              </Badge>

              <Badge
                variant="outline"
                className="gap-1.5 py-0.5 px-2.5 text-xs font-semibold border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{submissions.length} Evaluated</span>
              </Badge>

              {activeSubmission?.evaluation && (
                <Badge className="gap-1.5 py-0.5 px-2.5 text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  Score:{" "}
                  {selectedRun?.totalMarksAwarded ?? activeSubmission.evaluation.totalMarksAwarded}/
                  {selectedRun?.maxMarks ?? activeSubmission.evaluation.maxMarks} (
                  {activeSubmission.evaluation.percentage}%)
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Header Navigation */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {resolvedPapers[0]?.fileUrl && (
            <a
              href={
                resolvedPapers[0].fileUrl.includes("?")
                  ? `${resolvedPapers[0].fileUrl}&download=1`
                  : `${resolvedPapers[0].fileUrl}?download=1`
              }
              download
              className="inline-flex"
            >
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span> Paper
              </Button>
            </a>
          )}
          <Link href="/student/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to</span> Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. PRIORITY ACTION & ATTEMPT HUB: Combines attempt navigation & timer sheet trigger */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Attempt Selector Pills */}
          <div className="flex overflow-x-auto no-scrollbar scroll-smooth flex-nowrap items-center gap-2 py-0.5 max-w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0">
              Attempt:
            </span>
            {Array.from({ length: maxAttempts }, (_, i) => i + 1).map((attemptNumber) => {
              const sub = submissions.find((s) => s.attemptNumber === attemptNumber)
              const isSelected = attemptNumber === selectedAttemptNumber
              const isAvailable = attemptNumber <= attemptsUsed + 1
              const isEvaluated = Boolean(sub?.evaluation)

              return (
                <Button
                  key={attemptNumber}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  disabled={!isAvailable && !sub}
                  onClick={() => setSelectedAttemptNumber(attemptNumber)}
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-bold transition-all gap-1.5 shrink-0",
                    isSelected
                      ? "bg-[#2A6AED] hover:bg-[#1E55C7] text-white shadow-2xs"
                      : isEvaluated
                        ? "border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/40"
                        : isAvailable
                          ? "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                          : "opacity-40 cursor-not-allowed border-dashed text-slate-400"
                  )}
                >
                  {isEvaluated ? (
                    <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  ) : !isAvailable ? (
                    <Lock className="h-3 w-3 shrink-0" />
                  ) : null}
                  <span>Attempt #{attemptNumber}</span>
                  {sub?.evaluation && (
                    <span className="opacity-90 font-mono text-[11px]">
                      ({sub.evaluation.totalMarksAwarded}/{sub.evaluation.maxMarks})
                    </span>
                  )}
                  {!sub && isAvailable && (
                    <span className="text-[10px] opacity-75 font-normal">(Ready)</span>
                  )}
                </Button>
              )
            })}
          </div>

          {/* Right: Exam Timer Trigger (opens shadcn Sheet) & Upload Quick Nav */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <ExamWorkspaceTimer
              variant="compact"
              testSeriesId={testSeriesId}
              durationMinutes={durationMinutes}
              currentAttemptNumber={selectedAttemptNumber}
              onNavigateToUpload={() => {
                setActiveTab("upload")
                setTimeout(() => {
                  const uploadEl = document.getElementById("submission-upload-box")
                  if (uploadEl) {
                    const prefersReducedMotion =
                      typeof window !== "undefined" &&
                      window.matchMedia("(prefers-reduced-motion: reduce)").matches
                    uploadEl.scrollIntoView({
                      behavior: prefersReducedMotion ? "auto" : "smooth",
                      block: "center",
                    })
                  }
                }, 50)
              }}
            />

            {attemptsRemaining > 0 && activeTab !== "upload" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("upload")}
                className="h-9 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs gap-1.5"
              >
                <UploadCloud className="h-3.5 w-3.5 text-[#2A6AED]" />
                <span className="hidden sm:inline">Submit</span> Booklet
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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
              {/* Submission Metadata & File Actions */}
              {activeSubmission && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs font-semibold border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60"
                    >
                      Viewing Attempt #{activeSubmission.attemptNumber}
                    </Badge>
                    <span className="text-slate-500 dark:text-slate-400">
                      Submitted <FormattedDate date={activeSubmission.submittedAt} includeTime />
                    </span>
                  </div>

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
          <div id="submission-upload-box">
            <SubmissionUploadForm
              testSeriesId={testSeriesId}
              attemptsUsed={attemptsUsed}
              maxAttempts={maxAttempts}
            />
          </div>
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
