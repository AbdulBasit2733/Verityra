"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { SubmissionUploadForm } from "@/components/submission-upload-form"
import {
  AlertTriangle,
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Info,
  UploadCloud,
} from "lucide-react"

export interface WorkspaceQuestionScore {
  id: string
  questionNumber: string
  maxMarks: number
  marksAwarded: number
  feedback: string
  missingConcepts: string | null
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
  const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed)
  const [selectedAttemptNumber, setSelectedAttemptNumber] = React.useState<number>(
    submissions[0]?.attemptNumber || 1
  )

  React.useEffect(() => {
    if (submissions.length > 0 && !submissions.some((s) => s.attemptNumber === selectedAttemptNumber)) {
      setSelectedAttemptNumber(submissions[0].attemptNumber)
    }
  }, [submissions, selectedAttemptNumber])

  const activeSubmission =
    submissions.find((s) => s.attemptNumber === selectedAttemptNumber) || submissions[0]

  const questionColumns: DataTableColumn<WorkspaceQuestionScore>[] = [
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
  ]

  const questionFilters: DataTableFilter<WorkspaceQuestionScore>[] = [
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
  ]

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

      {/* Progress Bar Strip */}
      <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            3-Attempt Guarantee Progression ({attemptsUsed} of {maxAttempts} consumed)
          </span>
          <span className="font-bold text-[#2A6AED] dark:text-blue-400">
            {attemptsRemaining} remaining
          </span>
        </div>
        <Progress
          value={attemptsUsed}
          max={maxAttempts}
          indicatorClassName={attemptsRemaining === 0 ? "bg-amber-500" : "bg-[#2A6AED]"}
        />
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 dark:text-slate-500 pt-0.5">
          <span>Attempt 1: Diagnostic Baseline</span>
          <span>Attempt 2: Rubric Refinement</span>
          <span>Attempt 3: Exam Mastery</span>
        </div>
      </div>

      {/* Workspace Tabs */}
      <Tabs defaultValue={submissions.length > 0 ? "evaluations" : "upload"} className="space-y-6">
        <TabsList variant="line" className="border-b border-slate-200 dark:border-slate-800 w-full justify-start overflow-x-auto">
          <TabsTrigger value="evaluations" className="text-xs sm:text-sm font-semibold px-4 py-2">
            <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
            Evaluated Attempts & Rubric Breakdown ({submissions.length})
          </TabsTrigger>
          <TabsTrigger value="upload" className="text-xs sm:text-sm font-semibold px-4 py-2">
            <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
            Submit Handwritten Booklet ({attemptsRemaining} left)
          </TabsTrigger>
          <TabsTrigger value="resources" className="text-xs sm:text-sm font-semibold px-4 py-2">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Question Paper, Margin Sheet & Instructions
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
                    Select Attempt:
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
                        className={
                          isSelected
                            ? "h-9 px-4 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-bold shadow-2xs"
                            : "h-9 px-4 rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                        }
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
                      <a
                        href={activeSubmission.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#2A6AED] dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        View Scanned Booklet
                      </a>
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
                          {activeSubmission.evaluation.totalMarksAwarded}
                        </span>
                        <span className="text-sm font-bold text-slate-500">
                          / {activeSubmission.evaluation.maxMarks} marks
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

                  {/* Question-by-Question DataTable */}
                  <div className="space-y-3">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Question-by-Question Rubric Scoring
                    </h3>
                    <DataTable
                      data={activeSubmission.evaluation.questions || []}
                      columns={questionColumns}
                      keyExtractor={(q) => q.id}
                      searchPlaceholder="Search questions, feedback, or missing concepts..."
                      filters={questionFilters}
                      defaultSortColumn="questionNumber"
                      defaultSortDirection="asc"
                      defaultPageSize={10}
                      showSerialNumber={true}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Official Question Paper Downloads */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                Official Question Paper PDF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Download the question paper and solve all questions sequentially with pen and paper.
              </p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-1">
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{paper.title}</span>
                    <a
                      href={paper.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#2A6AED] text-white font-semibold hover:bg-[#1E55C7] text-[11px] shrink-0 shadow-2xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescribed Margin Template Downloads */}
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Download className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                Margin-Aligned Answer Sheet Template
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Print this ruled margin booklet so your handwritten answers match examination proportions.
              </p>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-1">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{tpl.title}</span>
                    <a
                      href={tpl.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 text-[11px] shrink-0 shadow-2xs"
                    >
                      <Download className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400" />
                      Print Template
                    </a>
                  </div>
                ))}
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
