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
import { SubmissionUploadForm } from "@/components/submission-upload-form"
import {
  AlertTriangle,
  ArrowLeft,
  Award,
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
      sortAccessor: (q) => q.questionNumber,
      searchAccessor: (q) =>
        `${q.questionNumber} ${q.feedback} ${q.missingConcepts || ""}`,
      className: "w-24 font-bold text-[#2A6AED]",
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
            <span className="font-extrabold text-[#0F172A]">
              {q.marksAwarded} / {q.maxMarks}
            </span>
            <span className="block text-[11px] font-semibold text-[#64748B]">
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
        <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed">{q.feedback}</p>
      ),
    },
    {
      id: "missingConcepts",
      header: "Improvement Notes & Omissions",
      sortable: false,
      className: "whitespace-normal min-w-[240px]",
      cell: (q) => (
        <p className="text-xs sm:text-sm text-[#64748B] italic leading-relaxed">
          {q.missingConcepts || "None noted — complete coverage."}
        </p>
      ),
    },
    {
      id: "legibility",
      header: "Script Clarity",
      sortable: true,
      sortAccessor: (q) => (q.isLegible ? "LEGIBLE" : "WARNING"),
      className: "w-28",
      cell: (q) =>
        q.isLegible ? (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-semibold"
          >
            Clear Scan
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="border-amber-200 bg-amber-50 text-amber-700 text-[10px] font-semibold"
          >
            Low Contrast
          </Badge>
        ),
    },
  ]

  const questionFilters: DataTableFilter<WorkspaceQuestionScore>[] = [
    {
      id: "band",
      label: "Score Band",
      accessor: (q) => {
        const pct = q.maxMarks > 0 ? (q.marksAwarded / q.maxMarks) * 100 : 0
        if (pct >= 70) return "HIGH"
        if (pct >= 45) return "MODERATE"
        return "NEEDS_WORK"
      },
      options: [
        { label: "Strong (70%+)", value: "HIGH" },
        { label: "Moderate (45% - 69%)", value: "MODERATE" },
        { label: "Needs Revision (<45%)", value: "NEEDS_WORK" },
      ],
    },
    {
      id: "legibility",
      label: "Legibility",
      accessor: (q) => (q.isLegible ? "CLEAR" : "FAINT"),
      options: [
        { label: "Clear Handwriting", value: "CLEAR" },
        { label: "Faint / Low Contrast", value: "FAINT" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Flat Page Header — No Card Wrapper */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div className="space-y-1.5">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#2A6AED] transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Candidate Dashboard
          </Link>
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 text-[10px] font-semibold px-2.5 py-0.5">
              Examination Workspace
            </Badge>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B]">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {durationMinutes} mins
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#64748B]">
              <Award className="h-3.5 w-3.5 text-[#2A6AED]" />
              {maxMarks} Max Marks
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] tracking-tight">
            {title}
          </h1>
        </div>

        {/* Flat 3-Attempt Progress Indicator */}
        <div className="w-full lg:w-72 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#0F172A]">
              3-Attempt Allowance ({attemptsUsed}/{maxAttempts})
            </span>
            <span className="font-semibold text-[#2A6AED]">{attemptsRemaining} left</span>
          </div>
          <Progress
            value={attemptsUsed}
            max={maxAttempts}
            indicatorClassName={attemptsRemaining === 0 ? "bg-amber-500" : "bg-[#2A6AED]"}
          />
          <div className="flex items-center justify-between text-[10px] font-semibold text-[#64748B]">
            <span>1. Baseline</span>
            <span>2. Refinement</span>
            <span>3. Exam Mastery</span>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-200" />

      {/* Workspace Tabs — Replaces Stacked Cards */}
      <Tabs defaultValue={submissions.length > 0 ? "evaluations" : "upload"} className="space-y-6">
        <TabsList variant="line" className="border-b border-slate-200 w-full justify-start overflow-x-auto">
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
            <div className="border-y border-slate-200 py-10 text-center space-y-2">
              <p className="text-sm font-bold text-[#0F172A]">
                No handwritten attempts submitted yet
              </p>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                Download the question paper and margin-aligned answer template from the Resources tab, then upload your scanned response booklet.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Attempt Selector Strip */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">
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
                            ? "h-8 px-3.5 rounded-lg bg-[#2A6AED] text-white text-xs font-semibold"
                            : "h-8 px-3.5 rounded-lg border-slate-200 text-slate-700 text-xs font-semibold"
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
                    <span className="text-[#64748B]">
                      Submitted <FormattedDate date={activeSubmission.submittedAt} includeTime />
                    </span>
                    {activeSubmission.fileUrl && (
                      <a
                        href={activeSubmission.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#2A6AED] hover:underline inline-flex items-center gap-1"
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
                  {/* Flat Divided Score & Articulation Summary Bar */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 border-y border-slate-200 bg-slate-50/50">
                    <div className="lg:col-span-4 py-4 px-4 sm:px-6 flex flex-col justify-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Attempt #{activeSubmission.attemptNumber} Final Score
                      </span>
                      <div className="flex items-baseline gap-2.5 mt-1">
                        <span className="text-2xl sm:text-3xl font-black text-[#2A6AED]">
                          {activeSubmission.evaluation.totalMarksAwarded}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-slate-500">
                          / {activeSubmission.evaluation.maxMarks} marks
                        </span>
                        <Badge className="bg-emerald-100 text-emerald-800 border-0 text-[11px] font-bold">
                          {activeSubmission.evaluation.percentage}%
                        </Badge>
                      </div>
                    </div>

                    <div className="lg:col-span-8 py-4 px-4 sm:px-6 flex flex-col justify-center">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Overall Evaluator Articulation Summary
                      </span>
                      <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed">
                        {activeSubmission.evaluation.generalFeedback}
                      </p>
                    </div>
                  </div>

                  {activeSubmission.evaluation.legibilityWarning && (
                    <div className="flex items-center gap-2.5 border-l-4 border-amber-500 bg-amber-50/70 px-4 py-3 text-xs sm:text-sm text-amber-900">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        Legibility Notice: Portions of your handwritten script had low contrast. Use dark ink and well-lit vertical scanning on subsequent attempts.
                      </span>
                    </div>
                  )}

                  {/* Question-by-Question DataTable with Search, Sort, Filter, and GlobalPagination */}
                  <div className="space-y-2">
                    <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
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
                      emptyTitle="No itemized question scores available"
                      emptyDescription="Adjust your search or score band filter to view question rows."
                    />
                  </div>
                </div>
              ) : (
                <div className="border-y border-slate-200 py-8 text-center text-xs sm:text-sm text-[#64748B]">
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
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2A6AED]" />
                Official Question Paper PDF
              </h3>
              <p className="text-xs text-[#64748B]">
                Download the question paper and solve all questions sequentially with pen and paper.
              </p>
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {papers.map((paper) => (
                  <div
                    key={paper.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-semibold text-[#0F172A] truncate">{paper.title}</span>
                    <a
                      href={paper.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#2A6AED] text-white font-semibold hover:bg-[#1E55C7] text-[11px] shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download PDF
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescribed Margin Template Downloads */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                <Download className="h-4 w-4 text-[#2A6AED]" />
                Margin-Aligned Answer Sheet Template
              </h3>
              <p className="text-xs text-[#64748B]">
                Print this ruled margin booklet so your handwritten answers match examination proportions.
              </p>
              <div className="divide-y divide-slate-200 border-y border-slate-200">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-semibold text-[#0F172A] truncate">{tpl.title}</span>
                    <a
                      href={tpl.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-slate-200 bg-white text-[#0F172A] font-semibold hover:bg-slate-50 text-[11px] shrink-0"
                    >
                      <Download className="h-3.5 w-3.5 text-[#2A6AED]" />
                      Print Template
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator className="bg-slate-200" />

          {/* Candidate Instructions (Strictly isolated from privateEvaluationInstructions) */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
              <Info className="h-4 w-4 text-[#2A6AED]" />
              Candidate Examination Instructions
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] whitespace-pre-line leading-relaxed">
              {studentInstructions}
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
