"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DataTable, DataTableColumn } from "@/components/ui/data-table"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { Loader2, ShieldCheck, FileText } from "lucide-react"
import { adminReviewScoreAction } from "@/actions/evaluation-actions"

export function AdminScoreReviewEditor({
  submissionId,
  initialEvaluation,
  evaluationRuns = [],
  fileUrl,
}: {
  submissionId: string
  initialEvaluation: any
  evaluationRuns?: any[]
  fileUrl: string
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()

  const [questions, setQuestions] = useState<any[]>(initialEvaluation.questions || [])
  const [adminNotes, setAdminNotes] = useState(initialEvaluation.adminNotes || "")
  const [loading, setLoading] = useState(false)

  // Recalculate total dynamically based on edited question scores
  const calculatedTotal = questions.reduce(
    (acc, q) => acc + (parseFloat(q.marksAwarded) || 0),
    0
  )
  const percentage = Number(
    ((calculatedTotal / initialEvaluation.maxMarks) * 100).toFixed(2)
  )

  function handleScoreChange(questionId: string, newScore: number, maxMarks: number) {
    const clamped = Math.max(0, Math.min(maxMarks, newScore))
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, marksAwarded: clamped } : q))
    )
  }

  function handleNotesChange(questionId: string, notes: string) {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, adminNotes: notes } : q))
    )
  }

  async function handleSaveReview(e: React.FormEvent) {
    e.preventDefault()

    const confirmed = await confirm({
      title: "Save Adjusted Scores & Finalize Evaluation?",
      description: `This will set the candidate's total score to ${calculatedTotal} / ${initialEvaluation.maxMarks} (${percentage}%) and record an immutable entry in the administrative audit log.`,
      confirmText: "Approve & Write Audit Log",
      cancelText: "Continue Editing",
      variant: "default",
      badgeText: "Audited Score Override",
    })
    if (!confirmed) return

    setLoading(true)

    try {
      const adjustments = questions.map((q) => ({
        questionEvaluationId: q.id,
        newMarksAwarded: Number(q.marksAwarded),
        adminNotes: q.adminNotes,
      }))

      const res = await adminReviewScoreAction(submissionId, adjustments, adminNotes)

      if (!res.success) {
        showError({
          title: "Score Review Update Failed",
          message: res.error || "Failed to update evaluation review.",
          code: "SCORE_REVIEW_ERR",
        })
        setLoading(false)
        return
      }

      toast.success("Evaluation score finalized", {
        description: `Total updated to ${calculatedTotal}/${initialEvaluation.maxMarks} (${percentage}%) with audit log recorded.`,
      })
      setLoading(false)
      router.refresh()
    } catch {
      showError({
        title: "Unexpected Server Error",
        message: "An unexpected server error occurred while saving score adjustments.",
        code: "SYS_ERR",
      })
      setLoading(false)
    }
  }

  const columns: DataTableColumn<any>[] = [
    {
      id: "questionNumber",
      header: "Question",
      sortable: true,
      sortAccessor: (q) => q.questionNumber,
      searchAccessor: (q) =>
        `${q.questionNumber} ${q.feedback || ""} ${q.missingConcepts || ""} ${q.adminNotes || ""}`,
      className: "w-24 font-bold text-[#2A6AED]",
      cell: (q) => q.questionNumber,
    },
    {
      id: "maxMarks",
      header: "Max Marks",
      sortable: true,
      sortAccessor: (q) => q.maxMarks,
      className: "w-28 font-semibold text-slate-700",
      cell: (q) => `${q.maxMarks} Marks`,
    },
    {
      id: "marksAwarded",
      header: "Awarded Marks",
      sortable: true,
      sortAccessor: (q) => Number(q.marksAwarded),
      className: "w-36",
      cell: (q) => (
        <Input
          type="number"
          step={0.5}
          min={0}
          max={q.maxMarks}
          value={q.marksAwarded}
          onChange={(e) =>
            handleScoreChange(q.id, parseFloat(e.target.value) || 0, q.maxMarks)
          }
          className="border-slate-200 bg-white h-9 w-24 text-xs sm:text-sm font-bold text-[#2A6AED] rounded-lg"
        />
      ),
    },
    {
      id: "feedback",
      header: "Evaluator Feedback & Missing Concepts",
      sortable: false,
      className: "whitespace-normal min-w-[260px]",
      cell: (q) => (
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed">{q.feedback}</p>
          {q.missingConcepts && (
            <p className="text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 italic inline-block">
              Missing: {q.missingConcepts}
            </p>
          )}
          <p className="text-[11px] text-slate-600">Why: {q.scoreExplanation || q.feedback}</p>
          <p className="text-[11px] text-emerald-800">Strengths: {q.strengths || "Not recorded"}</p>
          <p className="text-[11px] text-blue-800">Examiner expected: {q.examinerExpectation || "Core concepts and clear reasoning."}</p>
          <p className="text-[11px] text-indigo-800">Improve: {q.improvementAdvice || "Strengthen the missing concepts."}</p>
        </div>
      ),
    },
    {
      id: "adminNotes",
      header: "Admin Override Notes",
      sortable: false,
      className: "min-w-[200px]",
      cell: (q) => (
        <Input
          value={q.adminNotes || ""}
          onChange={(e) => handleNotesChange(q.id, e.target.value)}
          placeholder="Audit reason..."
          className="border-slate-200 bg-white h-9 text-xs rounded-lg"
        />
      ),
    },
  ]

  return (
    <form onSubmit={handleSaveReview} className="space-y-6">
      {/* Flat Divided Summary & Booklet Strip — Replaces 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-y border-slate-200 bg-slate-50/40">
        <div className="py-3.5 px-4 sm:px-5">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Calculated Total
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#2A6AED] mt-0.5 block">
            {calculatedTotal} / {initialEvaluation.maxMarks}
          </span>
        </div>

        <div className="py-3.5 px-4 sm:px-5">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Calculated Percentage
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5 block">
            {percentage}%
          </span>
        </div>

        <div className="py-3.5 px-4 sm:px-5">
          <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
            Evaluation Status
          </span>
          <Badge
            variant="outline"
            className="mt-1 border-blue-200 bg-[#EFF6FF] text-[#2A6AED] text-xs font-semibold"
          >
            {initialEvaluation.status}
          </Badge>
        </div>

        <div className="py-3.5 px-4 sm:px-5 flex items-center justify-between sm:justify-center">
          <a
            href={fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-[#2A6AED] text-white text-xs font-semibold hover:bg-[#1E55C7] transition-colors w-full"
          >
            <FileText className="h-3.5 w-3.5" />
            Open Scanned Booklet
          </a>
        </div>
      </div>

      {evaluationRuns.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2">
          <h3 className="text-sm font-bold text-slate-900">AI Evaluation History</h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {evaluationRuns.map((run) => (
              <div key={run.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
                <p className="font-bold">Run {run.runNumber} · {run.trigger === "AUTOMATIC" ? "Automatic" : "Admin re-evaluation"}</p>
                <p className="text-slate-600">{run.totalMarksAwarded}/{run.maxMarks} · {run.status}</p>
                <p className="text-slate-500">{run.questions?.length || 0} question reports</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Question-wise Score Adjustment DataTable */}
      <div className="space-y-2">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
            Question-wise Score Adjustment & Override
          </h3>
          <p className="text-xs text-[#64748B]">
            Verify each question score against the student scan and marking rubric. All edits are clamped to [0, maxMarks] and logged in AuditLog.
          </p>
        </div>

        <DataTable
          data={questions}
          columns={columns}
          keyExtractor={(q) => q.id}
          searchPlaceholder="Search questions or feedback notes..."
          defaultSortColumn="questionNumber"
          defaultSortDirection="asc"
          defaultPageSize={10}
          defaultViewMode="auto"
          gridClassName="grid grid-cols-1 md:grid-cols-2 gap-4"
          renderCard={(q) => (
            <div
              key={q.id}
              className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs"
            >
              {/* Question Header & Max Marks */}
              <div className="flex items-center justify-between gap-2">
                <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-sm">
                  {q.questionNumber}
                </span>
                <Badge variant="outline" className="text-xs font-semibold">
                  Max: {q.maxMarks} Marks
                </Badge>
              </div>

              {/* Score Input */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Awarded Marks (0 – {q.maxMarks})
                </Label>
                <Input
                  type="number"
                  step={0.5}
                  min={0}
                  max={q.maxMarks}
                  value={q.marksAwarded}
                  onChange={(e) =>
                    handleScoreChange(q.id, parseFloat(e.target.value) || 0, q.maxMarks)
                  }
                  className="border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 h-10 text-sm font-bold text-[#2A6AED] dark:text-blue-400 rounded-xl"
                />
              </div>

              {/* Feedback & Missing Concepts */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  Rubric Evaluation
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  {q.feedback}
                </p>
                {q.missingConcepts && (
                  <p className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 p-2 rounded-lg border border-amber-200 dark:border-amber-900 italic">
                    Missing Concepts: {q.missingConcepts}
                  </p>
                )}
              </div>

              {/* Admin Override Notes */}
              <div className="space-y-1 pt-1">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Admin Audit Reason / Note
                </Label>
                <Input
                  value={q.adminNotes || ""}
                  onChange={(e) => handleNotesChange(q.id, e.target.value)}
                  placeholder="Reason for adjustment..."
                  className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 h-9 text-xs rounded-xl"
                />
              </div>
            </div>
          )}
          emptyTitle="No question evaluations found"
          emptyDescription="No question records match your search query."
        />
      </div>

      <Separator className="bg-slate-200" />

      {/* Flat Overall Admin Audit Notes */}
      <div className="space-y-2">
        <Label className="text-xs sm:text-sm font-bold text-[#0F172A]">
          Overall Admin Review Audit Justification
        </Label>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Record justification for score adjustments or confirmation of review..."
          rows={3}
          className="border-slate-200 bg-white text-xs sm:text-sm rounded-lg"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-xs sm:text-sm h-10 px-6 rounded-lg"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <ShieldCheck className="h-4 w-4 mr-2" />
          )}
          Save Adjusted Scores & Approve Result (Write Audit Log)
        </Button>
      </div>
    </form>
  )
}
