"use client"

import * as React from "react"
import Link from "next/link"
import dynamic from "next/dynamic"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { FormattedDate } from "@/components/ui/date-picker"
import { toast } from "@/components/ui/sonner"
import {
  buildQuestionBreakdownTree,
  type QuestionVerdict,
} from "@/lib/ai/question-breakdown"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Info,
  Lock,
  Printer,
  Search,
  Sparkles,
  UploadCloud,
} from "lucide-react"

const SubmissionUploadForm = dynamic(
  () =>
    import("@/components/student/workspace/submission-upload-form").then(
      (m) => m.SubmissionUploadForm
    ),
  {
    loading: () => (
      <div className="rounded-md border border-border bg-card p-8 text-center text-xs text-muted-foreground shadow-none">
        Loading submission upload interface...
      </div>
    ),
  }
)

const VERDICT_BADGE_STYLES: Record<QuestionVerdict["tone"], string> = {
  muted:
    "border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
  danger:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300",
  warning:
    "border-orange-200 bg-orange-50 text-orange-800 dark:border-orange-900 dark:bg-orange-950/60 dark:text-orange-300",
  amber:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/60 dark:text-amber-300",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300",
}

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
    questions: Array<
      WorkspaceQuestionScore & {
        examinerExpectation?: string
        improvementAdvice?: string
      }
    >
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
  durationMinutes?: number
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
    submissions.find((s) => s.attemptNumber === selectedAttemptNumber) ||
    submissions[0]
  const [activeTab, setActiveTab] = React.useState<string>(
    submissions.length > 0 ? "evaluations" : "upload"
  )
  const [selectedRunNumber, setSelectedRunNumber] = React.useState<
    number | null
  >(null)
  const selectedRun = activeSubmission?.evaluationRuns?.find(
    (run) => run.runNumber === selectedRunNumber
  )
  const reportQuestions = React.useMemo(
    () =>
      selectedRun?.questions || activeSubmission?.evaluation?.questions || [],
    [selectedRun, activeSubmission]
  )

  const [downloadingUrl, setDownloadingUrl] = React.useState<string | null>(null)

  const handleResourceDownload = React.useCallback(
    async (fileUrl: string, titleFallback: string) => {
      if (!fileUrl) return
      const targetUrl = fileUrl.includes("?")
        ? `${fileUrl}&download=1`
        : `${fileUrl}?download=1`

      setDownloadingUrl(fileUrl)
      try {
        const res = await fetch(targetUrl)
        if (!res.ok) {
          let errMsg = "This document could not be downloaded."
          try {
            const payload = await res.json()
            if (payload?.error) errMsg = payload.error
          } catch {
            // Non-JSON error response
          }
          toast.error("Download Unavailable", { description: errMsg })
          return
        }

        const blob = await res.blob()
        const disposition = res.headers.get("Content-Disposition") || ""
        const match = disposition.match(/filename="?([^";]+)"?/i)
        const filename =
          match?.[1] ||
          `${titleFallback.replace(/[^\w.-]+/g, "_").slice(0, 60) || "document"}.pdf`

        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = blobUrl
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
      } catch {
        toast.error("Download Failed", {
          description:
            "Network error while downloading the document. Please try again.",
        })
      } finally {
        setDownloadingUrl(null)
      }
    },
    []
  )

  const resolvedPapers = papers.filter((p) => Boolean(p.fileUrl))
  const resolvedTemplates = templates.filter((t) => Boolean(t.fileUrl))
  const isDemoWorkspace =
    testSeriesId.startsWith("demo-") ||
    testSeriesId.startsWith("upsc-") ||
    testSeriesId === "test-1"

  const [questionQuery, setQuestionQuery] = React.useState("")
  const [bandFilter, setBandFilter] = React.useState<
    "ALL" | "HIGH" | "MEDIUM" | "LOW"
  >("ALL")
  const [legibilityFilter, setLegibilityFilter] = React.useState<
    "ALL" | "CLEAR" | "UNCLEAR"
  >("ALL")

  const filteredQuestions = React.useMemo(() => {
    const query = questionQuery.trim().toLowerCase()
    return reportQuestions.filter((q) => {
      const ratio = q.maxMarks > 0 ? (q.marksAwarded / q.maxMarks) * 100 : 0
      const band = ratio >= 70 ? "HIGH" : ratio >= 40 ? "MEDIUM" : "LOW"
      if (bandFilter !== "ALL" && band !== bandFilter) return false
      if (legibilityFilter === "CLEAR" && !q.isLegible) return false
      if (legibilityFilter === "UNCLEAR" && q.isLegible) return false
      if (!query) return true

      const searchable = [
        q.questionNumber,
        q.feedback,
        q.scoreExplanation,
        q.strengths,
        q.missingConcepts,
        q.examinerExpectation,
        q.improvementAdvice,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
      return searchable.includes(query)
    })
  }, [reportQuestions, questionQuery, bandFilter, legibilityFilter])

  const breakdownGroups = React.useMemo(
    () => buildQuestionBreakdownTree(filteredQuestions),
    [filteredQuestions]
  )

  return (
    <div className="space-y-5">
      {/* 1. UNIFIED EXECUTIVE HEADER & SUMMARY BADGES */}
      <div className="flex flex-col gap-4 pb-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3.5 sm:items-center">
          <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-primary text-primary-foreground shadow-xs sm:mt-0 sm:h-12 sm:w-12">
            <BookOpen className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <div className="min-w-0 space-y-1.5">
            <h1 className="truncate text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {title}
            </h1>

            {/* High-Priority Summary Badges: Replaces repetitive stat cards with high-density badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="gap-1.5 border-slate-200 bg-slate-50/80 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
              >
                <Award className="h-3.5 w-3.5 text-indigo-500" />
                <span>{maxMarks} Max Marks</span>
              </Badge>

              <Badge
                variant={attemptsRemaining === 0 ? "destructive" : "secondary"}
                className={cn(
                  "gap-1.5 px-2.5 py-0.5 text-xs font-semibold",
                  attemptsRemaining > 0 &&
                    "border border-blue-200/80 bg-blue-50 text-[#2A6AED] dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
                )}
              >
                <FileCheck2 className="h-3.5 w-3.5" />
                <span>
                  Attempt {attemptsUsed} of {maxAttempts} ({attemptsRemaining}{" "}
                  remaining)
                </span>
              </Badge>

              <Badge
                variant="outline"
                className="gap-1.5 border-emerald-200 bg-emerald-50/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>{submissions.length} Evaluated</span>
              </Badge>

              {activeSubmission?.evaluation && (
                <Badge className="gap-1.5 border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  Score:{" "}
                  {selectedRun?.totalMarksAwarded ??
                    activeSubmission.evaluation.totalMarksAwarded}
                  /
                  {selectedRun?.maxMarks ??
                    activeSubmission.evaluation.maxMarks}{" "}
                  ({activeSubmission.evaluation.percentage}%)
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Right Header Navigation */}
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
          {resolvedPapers[0]?.fileUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={downloadingUrl === resolvedPapers[0].fileUrl}
              onClick={() =>
                handleResourceDownload(
                  resolvedPapers[0].fileUrl,
                  resolvedPapers[0].title
                )
              }
              className="h-9 gap-1.5 rounded-md border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {downloadingUrl === resolvedPapers[0].fileUrl
                  ? "Downloading..."
                  : "Download"}
              </span>{" "}
              Paper
            </Button>
          )}
          <Link href="/student/dashboard">
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5 rounded-md border-slate-200 px-3 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Back to</span> Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. PRIORITY ACTION & ATTEMPT HUB: Combines attempt navigation & timer sheet trigger */}
      <div className="rounded-md border border-slate-200/80 bg-white p-3.5 shadow-none sm:p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Attempt Selector Pills */}
          <div className="no-scrollbar flex max-w-full flex-nowrap items-center gap-2 overflow-x-auto scroll-smooth py-0.5">
            <span className="mr-1 shrink-0 text-xs font-bold text-slate-400 dark:text-slate-500">
              Attempt:
            </span>
            {Array.from({ length: maxAttempts }, (_, i) => i + 1).map(
              (attemptNumber) => {
                const sub = submissions.find(
                  (s) => s.attemptNumber === attemptNumber
                )
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
                      "h-8 shrink-0 gap-1.5 rounded-md px-3 text-xs font-bold transition-colors",
                      isSelected
                        ? "bg-[#2A6AED] text-white shadow-2xs hover:bg-[#1E55C7]"
                        : isEvaluated
                          ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                          : isAvailable
                            ? "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                            : "cursor-not-allowed border-dashed text-slate-400 opacity-40"
                    )}
                  >
                    {isEvaluated ? (
                      <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-500" />
                    ) : !isAvailable ? (
                      <Lock className="h-3 w-3 shrink-0" />
                    ) : null}
                    <span>Attempt #{attemptNumber}</span>
                    {sub?.evaluation && (
                      <span className="font-mono text-[11px] opacity-90">
                        ({sub.evaluation.totalMarksAwarded}/
                        {sub.evaluation.maxMarks})
                      </span>
                    )}
                    {!sub && isAvailable && (
                      <span className="text-[10px] font-normal opacity-75">
                        (Ready)
                      </span>
                    )}
                  </Button>
                )
              }
            )}
          </div>

          {/* Right: Upload Quick Nav */}
          <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
            {attemptsRemaining > 0 && activeTab !== "upload" && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setActiveTab("upload")}
                className="h-9 gap-1.5 rounded-md border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <UploadCloud className="h-3.5 w-3.5 text-[#2A6AED]" />
                <span className="hidden sm:inline">Submit</span> Booklet
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Workspace Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList
          variant="line"
          className="no-scrollbar w-full justify-start overflow-x-auto border-b border-slate-200 dark:border-slate-800"
        >
          <TabsTrigger
            value="resources"
            className="px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm"
          >
            <FileText className="mr-1.5 h-3.5 w-3.5" />
            <span className="sm:hidden">Resources</span>
            <span className="hidden sm:inline">
              Question Paper, Margin Sheet & Instructions
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="upload"
            className="px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm"
          >
            <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
            <span className="sm:hidden">
              Submit Booklet ({attemptsRemaining} left)
            </span>
            <span className="hidden sm:inline">
              Submit Handwritten Booklet ({attemptsRemaining} left)
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="evaluations"
            className="px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm"
          >
            <FileCheck2 className="mr-1.5 h-3.5 w-3.5" />
            <span className="sm:hidden">
              Evaluations ({submissions.length})
            </span>
            <span className="hidden sm:inline">
              Evaluated Attempts & Rubric Breakdown ({submissions.length})
            </span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: EVALUATIONS & ITEMIZED QUESTION DATATABLE */}
        <TabsContent value="evaluations" className="space-y-6 pt-1">
          {submissions.length === 0 ? (
            <div className="space-y-2 rounded-md border border-slate-200/80 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                No handwritten attempts submitted yet
              </p>
              <p className="mx-auto max-w-md text-xs text-slate-500 dark:text-slate-400">
                Download the question paper and margin-aligned answer template
                from the Resources tab, then upload your scanned response
                booklet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Submission Metadata & File Actions */}
              {activeSubmission && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 text-xs dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-slate-200 bg-slate-50/60 text-xs font-semibold dark:border-slate-800 dark:bg-slate-900/60"
                    >
                      Viewing Attempt #{activeSubmission.attemptNumber}
                    </Badge>
                    <span className="text-slate-500 dark:text-slate-400">
                      Submitted{" "}
                      <FormattedDate
                        date={activeSubmission.submittedAt}
                        includeTime
                      />
                    </span>
                  </div>

                  {activeSubmission.fileUrl && (
                    <div className="inline-flex items-center gap-2">
                      <a
                        href={activeSubmission.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-bold text-[#2A6AED] hover:underline dark:text-blue-400"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Booklet
                      </a>
                      <span className="text-slate-300 dark:text-slate-700">
                        ·
                      </span>
                      <a
                        href={
                          activeSubmission.fileUrl.includes("?")
                            ? `${activeSubmission.fileUrl}&download=1`
                            : `${activeSubmission.fileUrl}?download=1`
                        }
                        download
                        className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-[#2A6AED] dark:text-slate-300 dark:hover:text-blue-400"
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
                  <div className="grid grid-cols-1 divide-y divide-slate-200 overflow-hidden rounded-md border border-slate-200/80 bg-white shadow-none lg:grid-cols-12 lg:divide-x lg:divide-y-0 dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex flex-col justify-center bg-slate-50/60 p-5 lg:col-span-4 dark:bg-slate-950/60">
                      <span className="text-[11px] font-bold text-slate-400">
                        Attempt #{activeSubmission.attemptNumber} Final Score
                      </span>
                      <div className="mt-1 flex items-baseline gap-2.5">
                        <span className="text-3xl font-black text-[#2A6AED] dark:text-blue-400">
                          {selectedRun?.totalMarksAwarded ??
                            activeSubmission.evaluation.totalMarksAwarded}
                        </span>
                        <span className="text-sm font-bold text-slate-500">
                          /{" "}
                          {selectedRun?.maxMarks ??
                            activeSubmission.evaluation.maxMarks}{" "}
                          marks
                        </span>
                        <Badge className="rounded-sm border-0 bg-emerald-100 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                          {activeSubmission.evaluation.percentage}%
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-col justify-center p-5 lg:col-span-8">
                      <span className="mb-1 block text-[11px] font-bold text-slate-400">
                        Overall Evaluator Articulation Summary
                      </span>
                      <p className="text-xs leading-relaxed text-slate-800 sm:text-sm dark:text-slate-200">
                        {activeSubmission.evaluation.generalFeedback}
                      </p>
                    </div>
                  </div>

                  {activeSubmission.evaluation.legibilityWarning && (
                    <div className="flex items-center gap-2.5 rounded-md border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900 shadow-2xs sm:text-sm dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <span>
                        Legibility Notice: Portions of your handwritten script
                        had low contrast. Use dark ink and well-lit vertical
                        scanning on subsequent attempts.
                      </span>
                    </div>
                  )}

                  {(activeSubmission.evaluationRuns?.length || 0) > 0 && (
                    <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Evaluation runs:
                      </span>
                      <Button
                        type="button"
                        size="sm"
                        variant={
                          selectedRunNumber === null ? "default" : "outline"
                        }
                        onClick={() => setSelectedRunNumber(null)}
                      >
                        Latest
                      </Button>
                      {(activeSubmission.evaluationRuns || []).map((run) => (
                        <Button
                          key={run.id}
                          type="button"
                          size="sm"
                          variant={
                            selectedRunNumber === run.runNumber
                              ? "default"
                              : "outline"
                          }
                          onClick={() => setSelectedRunNumber(run.runNumber)}
                        >
                          Run {run.runNumber}
                        </Button>
                      ))}
                    </div>
                  )}

                  {/* Question-by-Question Hierarchical Breakdown */}
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 sm:text-base dark:text-slate-100">
                          Question-by-Question Rubric Breakdown
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Showing {filteredQuestions.length} of{" "}
                          {reportQuestions.length} evaluated question items
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <div className="relative w-full sm:w-64">
                          <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                          <Input
                            value={questionQuery}
                            onChange={(e) => setQuestionQuery(e.target.value)}
                            placeholder="Search Q1.A.1, verdict, concepts..."
                            className="h-8 pl-8 text-xs"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-1">
                          {(
                            [
                              { id: "ALL", label: "All" },
                              { id: "HIGH", label: "High ≥70%" },
                              { id: "MEDIUM", label: "Partial 40–69%" },
                              { id: "LOW", label: "Low <40%" },
                            ] as const
                          ).map((item) => (
                            <Button
                              key={item.id}
                              type="button"
                              size="sm"
                              variant={
                                bandFilter === item.id ? "default" : "outline"
                              }
                              onClick={() => setBandFilter(item.id)}
                              className="h-8 px-2.5 text-[11px]"
                            >
                              {item.label}
                            </Button>
                          ))}

                          <Button
                            type="button"
                            size="sm"
                            variant={
                              legibilityFilter === "UNCLEAR"
                                ? "default"
                                : "outline"
                            }
                            onClick={() =>
                              setLegibilityFilter((prev) =>
                                prev === "UNCLEAR" ? "ALL" : "UNCLEAR"
                              )
                            }
                            className="h-8 px-2.5 text-[11px]"
                          >
                            {legibilityFilter === "UNCLEAR"
                              ? "Unclear Only"
                              : "Filter Unclear"}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {breakdownGroups.length === 0 ? (
                      <div className="rounded-md border border-slate-200/80 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          No itemized question scores available
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          Adjust your search or score band filter to view
                          question breakdown items.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {breakdownGroups.map((group) => (
                          <div
                            key={group.parentKey}
                            className="overflow-hidden rounded-md border border-slate-200/90 bg-white dark:border-slate-800 dark:bg-slate-900"
                          >
                            {/* Parent Question Header */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 bg-slate-50/90 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/60">
                              <div className="flex items-center gap-2.5">
                                <Badge className="rounded-sm border-0 bg-[#2A6AED] px-2 py-0.5 text-xs font-bold text-white">
                                  {group.parentKey}
                                </Badge>
                                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                                  {group.parentLabel}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  ({group.questionCount}{" "}
                                  {group.questionCount === 1
                                    ? "question"
                                    : "questions"}
                                  )
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-[#2A6AED] dark:text-blue-400">
                                  {group.awarded} / {group.max} marks
                                </span>
                                <Badge
                                  variant="outline"
                                  className="rounded-sm text-[11px] font-semibold"
                                >
                                  {group.percentage}%
                                </Badge>
                              </div>
                            </div>

                            {/* Sections & Sub-questions */}
                            <div className="divide-y divide-slate-200/80 dark:divide-slate-800">
                              {group.sections.map((section) => (
                                <div
                                  key={`${group.parentKey}-${section.sectionKey ?? "flat"}`}
                                  className="divide-y divide-slate-100 dark:divide-slate-800/80"
                                >
                                  {group.hasSections && section.sectionLabel && (
                                    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50/40 px-4 py-2 text-xs dark:bg-slate-900/80">
                                      <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-[#2A6AED]" />
                                        <span className="font-bold tracking-wide text-slate-800 uppercase dark:text-slate-200">
                                          {section.sectionLabel}
                                        </span>
                                        <span className="text-slate-500 dark:text-slate-400">
                                          · {section.items.length} sub-questions
                                        </span>
                                      </div>
                                      <span className="font-bold text-slate-700 dark:text-slate-300">
                                        {section.awarded} / {section.max} marks (
                                        {section.percentage}%)
                                      </span>
                                    </div>
                                  )}

                                  {section.items.map((leaf) => {
                                    const q = leaf.question
                                    const hasDistinctScoreExplanation =
                                      Boolean(q.scoreExplanation?.trim()) &&
                                      q.scoreExplanation?.trim() !==
                                        q.feedback?.trim()

                                    return (
                                      <div
                                        key={q.id}
                                        className="space-y-3 p-4 sm:p-5"
                                      >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                          <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center justify-center rounded-sm bg-blue-50 px-2 py-0.5 text-xs font-extrabold text-[#2A6AED] dark:bg-blue-950/70 dark:text-blue-300">
                                              {leaf.parsed.canonicalNumber ||
                                                q.questionNumber}
                                            </span>
                                            <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                                              {q.marksAwarded} / {q.maxMarks}{" "}
                                              marks
                                            </span>
                                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                              ({leaf.percentage}% credit)
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "rounded-sm text-[11px] font-bold",
                                                VERDICT_BADGE_STYLES[
                                                  leaf.verdict.tone
                                                ]
                                              )}
                                            >
                                              {leaf.verdict.label}
                                            </Badge>
                                          </div>

                                          <Badge
                                            variant="outline"
                                            className={
                                              q.isLegible
                                                ? "rounded-sm border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
                                                : "rounded-sm border-amber-200 bg-amber-50 text-[10px] font-semibold text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-400"
                                            }
                                          >
                                            {q.isLegible
                                              ? "Clear Script"
                                              : "Unclear"}
                                          </Badge>
                                        </div>

                                        {/* Evaluation Verdict, Context & Length Justification */}
                                        <div className="space-y-2">
                                          <div>
                                            <span className="mb-0.5 block text-[11px] font-bold text-slate-400">
                                              Answer Summary & Rubric Feedback
                                            </span>
                                            <p className="text-xs leading-relaxed text-slate-800 sm:text-sm dark:text-slate-200">
                                              {q.feedback}
                                            </p>
                                          </div>

                                          {hasDistinctScoreExplanation && (
                                            <div className="rounded-sm border border-slate-200/80 bg-slate-50/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40">
                                              <span className="mb-0.5 block text-[11px] font-bold text-slate-500 dark:text-slate-400">
                                                Marks, Length & Context
                                                Justification
                                              </span>
                                              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                                                {q.scoreExplanation}
                                              </p>
                                            </div>
                                          )}
                                        </div>

                                        {/* Detailed Sub-Cards */}
                                        {(q.strengths ||
                                          q.missingConcepts ||
                                          q.examinerExpectation ||
                                          q.improvementAdvice) && (
                                          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                            {q.strengths && (
                                              <div className="rounded-sm border border-emerald-200/80 bg-emerald-50/70 p-2.5 text-xs text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                                                <span className="mb-0.5 block text-[11px] font-bold">
                                                  Strengths
                                                </span>
                                                <p className="leading-relaxed">
                                                  {q.strengths}
                                                </p>
                                              </div>
                                            )}

                                            {q.missingConcepts && (
                                              <div className="rounded-sm border border-amber-200/80 bg-amber-50/80 p-2.5 text-xs text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                                                <span className="mb-0.5 block text-[11px] font-bold">
                                                  Missing Concepts & Omissions
                                                </span>
                                                <p className="leading-relaxed">
                                                  {q.missingConcepts}
                                                </p>
                                              </div>
                                            )}

                                            {q.examinerExpectation && (
                                              <div className="rounded-sm border border-blue-200/80 bg-blue-50/70 p-2.5 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-200">
                                                <span className="mb-0.5 block text-[11px] font-bold">
                                                  Examiner Expectation
                                                </span>
                                                <p className="leading-relaxed">
                                                  {q.examinerExpectation}
                                                </p>
                                              </div>
                                            )}

                                            {q.improvementAdvice && (
                                              <div className="rounded-sm border border-indigo-200/80 bg-indigo-50/70 p-2.5 text-xs text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/30 dark:text-indigo-200">
                                                <span className="mb-0.5 block text-[11px] font-bold">
                                                  How to Improve
                                                </span>
                                                <p className="leading-relaxed">
                                                  {q.improvementAdvice}
                                                </p>
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )
                                  })}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="rounded-md border border-slate-200/80 bg-white p-8 text-center text-xs text-slate-500 shadow-none sm:text-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                  Evaluation for Attempt #{activeSubmission?.attemptNumber} is
                  currently in progress.
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
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* 1. Official Question Paper Downloads */}
            <div className="flex flex-col justify-between space-y-4 rounded-md border border-slate-200/80 bg-white p-5 shadow-none dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                    <FileText className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                    Official Question Paper PDF
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-blue-200 bg-blue-50/60 text-[10px] font-semibold text-[#2A6AED] dark:bg-blue-950/60 dark:text-blue-300"
                  >
                    Exam Paper
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Download or preview the question paper. Solve all questions
                  sequentially with pen and paper under timed conditions.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border-t border-slate-100 pt-1 dark:divide-slate-800 dark:border-slate-800">
                {resolvedPapers.length > 0 ? (
                  resolvedPapers.map((paper) => (
                    <div
                      key={paper.id}
                      className="flex flex-col justify-between gap-2.5 py-3 text-xs sm:flex-row sm:items-center"
                    >
                      <span
                        className="truncate font-semibold text-slate-800 dark:text-slate-200"
                        title={paper.title}
                      >
                        {paper.title}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <a
                          href={paper.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                          Preview
                        </a>
                        <button
                          type="button"
                          disabled={downloadingUrl === paper.fileUrl}
                          onClick={() =>
                            handleResourceDownload(paper.fileUrl, paper.title)
                          }
                          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md bg-[#2A6AED] px-3 text-[11px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#1E55C7] disabled:opacity-60"
                        >
                          <Download className="h-3.5 w-3.5" />
                          {downloadingUrl === paper.fileUrl
                            ? "Downloading..."
                            : "Download"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-xs text-slate-500 dark:text-slate-400">
                    Question paper has not been uploaded yet. Please check back
                    shortly.
                  </p>
                )}
              </div>
            </div>

            {/* 2. Prescribed Margin Template Downloads */}
            <div className="flex flex-col justify-between space-y-4 rounded-md border border-slate-200/80 bg-white p-5 shadow-none dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                    <Printer className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                    Margin Answer Sheet Template
                  </h3>
                  <Badge
                    variant="outline"
                    className="border-emerald-200 bg-emerald-50/60 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  >
                    Printable A4
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  Print this ruled margin booklet so your handwritten answers
                  match examination proportions and margin compliance rules.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border-t border-slate-100 pt-1 dark:divide-slate-800 dark:border-slate-800">
                {resolvedTemplates.length > 0 ? (
                  resolvedTemplates.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="flex flex-col justify-between gap-2.5 py-3 text-xs sm:flex-row sm:items-center"
                    >
                      <span
                        className="truncate font-semibold text-slate-800 dark:text-slate-200"
                        title={tpl.title}
                      >
                        {tpl.title}
                      </span>
                      <div className="flex shrink-0 items-center gap-2">
                        <a
                          href={tpl.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        >
                          <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                          Preview
                        </a>
                        <button
                          type="button"
                          disabled={downloadingUrl === tpl.fileUrl}
                          onClick={() =>
                            handleResourceDownload(tpl.fileUrl, tpl.title)
                          }
                          className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-[11px] font-semibold text-slate-800 shadow-2xs transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                        >
                          <Printer className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400" />
                          {downloadingUrl === tpl.fileUrl
                            ? "Downloading..."
                            : "Print / Save"}
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-xs text-slate-500 dark:text-slate-400">
                    No separate margin template attached — standard A4 ruled
                    margin sheets may be used.
                  </p>
                )}
              </div>
            </div>

            {/* 3. Benchmark Sample Answer Sheet (shown in demo/development workspaces) */}
            {isDemoWorkspace && (
              <div className="flex flex-col justify-between space-y-4 rounded-md border border-slate-200/80 bg-white p-5 shadow-none dark:border-slate-800 dark:bg-slate-900">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
                      <BookOpen className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                      Benchmark Sample Answer Sheet
                    </h3>
                    <Badge
                      variant="outline"
                      className="border-amber-200 bg-amber-50/60 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/60 dark:text-amber-300"
                    >
                      Model 73.8%
                    </Badge>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Inspect a verified handwritten candidate response booklet
                    demonstrating structured headings, margin discipline, and
                    examiner marks.
                  </p>
                </div>

                <div className="divide-y divide-slate-100 border-t border-slate-100 pt-1 dark:divide-slate-800 dark:border-slate-800">
                  <div className="flex flex-col justify-between gap-2.5 py-3 text-xs sm:flex-row sm:items-center">
                    <span
                      className="truncate font-semibold text-slate-800 dark:text-slate-200"
                      title="UPSC GS-1 Model Handwritten Booklet"
                    >
                      UPSC GS-1 Benchmark Booklet (PDF)
                    </span>
                    <div className="flex shrink-0 items-center gap-2">
                      <a
                        href="/api/files/download?file=submissions/demo/sample-attempt.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                      >
                        <Eye className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                        Preview
                      </a>
                      <a
                        href="/api/files/download?file=submissions/demo/sample-attempt.pdf&download=1"
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#2A6AED] px-3 text-[11px] font-semibold text-white shadow-2xs transition-colors hover:bg-[#1E55C7]"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {/* Candidate Instructions */}
          <div className="space-y-2 rounded-md border border-slate-200/80 bg-white p-5 shadow-none dark:border-slate-800 dark:bg-slate-900">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100">
              <Info className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
              Candidate Examination Instructions
            </h3>
            <p className="text-xs leading-relaxed whitespace-pre-line text-slate-600 sm:text-sm dark:text-slate-400">
              {studentInstructions}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
