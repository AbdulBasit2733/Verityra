"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumn } from "@/components/ui/data-table"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { Download, FileText, Loader2, ShieldCheck } from "lucide-react"
import { adminReviewScoreAction } from "@/actions/evaluation-actions"

function compareQuestionLabels(a: string, b: string): number {
  return String(a || "").localeCompare(String(b || ""), undefined, {
    numeric: true,
    sensitivity: "base",
  })
}

export function AdminScoreReviewEditor({
  submissionId,
  initialEvaluation,
  configuredMaxMarks,
  evaluationRuns = [],
  fileUrl,
}: {
  submissionId: string
  initialEvaluation: any
  configuredMaxMarks?: number
  evaluationRuns?: any[]
  fileUrl: string
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()
  const effectiveMaxMarks =
    configuredMaxMarks && configuredMaxMarks > 0
      ? configuredMaxMarks
      : initialEvaluation.maxMarks
  const [questions, setQuestions] = useState<any[]>(() =>
    [...(initialEvaluation.questions || [])].sort((a, b) =>
      compareQuestionLabels(a.questionNumber, b.questionNumber)
    )
  )
  const [adminNotes, setAdminNotes] = useState(
    initialEvaluation.adminNotes || ""
  )
  const [loading, setLoading] = useState(false)
  const calculatedTotal = Number(
    questions
      .reduce((sum, question) => sum + (Number(question.marksAwarded) || 0), 0)
      .toFixed(2)
  )
  const percentage =
    effectiveMaxMarks > 0
      ? Number(((calculatedTotal / effectiveMaxMarks) * 100).toFixed(2))
      : 0

  function handleScoreChange(
    questionId: string,
    value: number,
    maxMarks: number
  ) {
    const score = Math.max(0, Math.min(maxMarks, value))
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? { ...question, marksAwarded: score }
          : question
      )
    )
  }

  function handleNotesChange(questionId: string, notes: string) {
    setQuestions((current) =>
      current.map((question) =>
        question.id === questionId
          ? { ...question, adminNotes: notes }
          : question
      )
    )
  }

  async function handleSaveReview(event: React.FormEvent) {
    event.preventDefault()
    const confirmed = await confirm({
      title: "Save Adjusted Scores & Finalize Evaluation?",
      description: `This will set the candidate's total score to ${calculatedTotal} / ${effectiveMaxMarks} (${percentage}%) and write an immutable audit entry.`,
      confirmText: "Approve & Write Audit Log",
      cancelText: "Continue Editing",
      badgeText: "Audited Score Override",
    })
    if (!confirmed) return
    setLoading(true)
    try {
      const result = await adminReviewScoreAction(
        submissionId,
        questions.map((question) => ({
          questionEvaluationId: question.id,
          newMarksAwarded: Number(question.marksAwarded),
          adminNotes: question.adminNotes,
        })),
        adminNotes
      )
      if (!result.success) {
        showError({
          title: "Score Review Update Failed",
          message: result.error || "Failed to update evaluation review.",
          code: "SCORE_REVIEW_ERR",
        })
        return
      }
      toast.success("Evaluation score finalized", {
        description: `${calculatedTotal}/${effectiveMaxMarks} saved with an audit log.`,
      })
      router.refresh()
    } catch {
      showError({
        title: "Unexpected Server Error",
        message: "An unexpected error occurred while saving score adjustments.",
        code: "SYS_ERR",
      })
    } finally {
      setLoading(false)
    }
  }

  const columns: DataTableColumn<any>[] = [
    {
      id: "questionNumber",
      header: "Question",
      sortable: true,
      sortAccessor: (q) => {
        const match = String(q.questionNumber || "").match(/\d+/)
        return match ? parseInt(match[0], 10) : String(q.questionNumber || "")
      },
      searchAccessor: (q) =>
        `${q.questionNumber} ${q.feedback || ""} ${q.missingConcepts || ""} ${q.adminNotes || ""}`,
      className: "w-24 font-bold text-primary",
      cell: (q) => q.questionNumber,
    },
    {
      id: "maxMarks",
      header: "Max marks",
      sortable: true,
      sortAccessor: (q) => q.maxMarks,
      className: "w-28 font-semibold",
      cell: (q) => `${q.maxMarks} Marks`,
    },
    {
      id: "marksAwarded",
      header: "Awarded marks",
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
          onChange={(event) =>
            handleScoreChange(q.id, Number(event.target.value) || 0, q.maxMarks)
          }
          className="h-9 w-24 rounded-md font-bold text-primary"
        />
      ),
    },
    {
      id: "feedback",
      header: "Evaluator feedback",
      sortable: false,
      className: "min-w-[360px] whitespace-normal align-top",
      cell: (q) => (
        <div className="max-w-[520px] space-y-1.5 leading-relaxed">
          <p className="text-sm font-medium text-foreground">{q.feedback}</p>
          {q.missingConcepts && (
            <p className="inline-block rounded-sm border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-800 italic">
              Missing: {q.missingConcepts}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            <b>Why:</b> {q.scoreExplanation || q.feedback}
          </p>
          <p className="text-[11px] text-emerald-800">
            <b>Strengths:</b> {q.strengths || "Not recorded"}
          </p>
          <p className="text-[11px] text-blue-800">
            <b>Expected:</b>{" "}
            {q.examinerExpectation || "Core concepts and clear reasoning."}
          </p>
          <p className="text-[11px] text-indigo-800">
            <b>Improve:</b>{" "}
            {q.improvementAdvice || "Strengthen the missing concepts."}
          </p>
        </div>
      ),
    },
    {
      id: "adminNotes",
      header: "Admin note",
      sortable: false,
      className: "min-w-[220px] align-top",
      cell: (q) => (
        <Input
          value={q.adminNotes || ""}
          onChange={(event) => handleNotesChange(q.id, event.target.value)}
          placeholder="Audit reason..."
          className="h-9 rounded-md text-xs"
        />
      ),
    },
  ]

  return (
    <form onSubmit={handleSaveReview} className="space-y-5">
      <Tabs defaultValue="questions" className="space-y-5">
        <TabsList
          variant="line"
          className="w-full justify-start overflow-x-auto border-b border-border"
        >
          <TabsTrigger
            value="summary"
            className="px-4 py-2 text-xs font-semibold sm:text-sm"
          >
            Summary
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="px-4 py-2 text-xs font-semibold sm:text-sm"
          >
            History{" "}
            <span className="ml-1 rounded-sm bg-muted px-1.5 py-0.5 text-[10px]">
              {evaluationRuns.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="questions"
            className="px-4 py-2 text-xs font-semibold sm:text-sm"
          >
            Question review{" "}
            <span className="ml-1 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
              {questions.length}
            </span>
          </TabsTrigger>
          <TabsTrigger
            value="finalize"
            className="px-4 py-2 text-xs font-semibold sm:text-sm"
          >
            Finalize
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-5 pt-1">
          <div className="grid grid-cols-1 divide-y border-y border-border bg-muted/20 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            <SummaryMetric
              label="Calculated total"
              value={`${calculatedTotal} / ${effectiveMaxMarks}`}
            />
            <SummaryMetric
              label="Calculated percentage"
              value={`${percentage}%`}
              valueClass="text-emerald-600"
            />
            <div className="px-4 py-4 sm:px-5">
              <span className="block text-[11px] font-semibold text-muted-foreground">
                Evaluation status
              </span>
              <Badge variant="outline" className="mt-2 text-xs font-semibold">
                {initialEvaluation.status}
              </Badge>
            </div>
          </div>
          {initialEvaluation.generalFeedback && (
            <div className="rounded-md border border-border bg-card p-4">
              <p className="text-[11px] font-semibold text-muted-foreground">
                General evaluator feedback
              </p>
              <p className="mt-2 text-sm leading-relaxed text-foreground">
                {initialEvaluation.generalFeedback}
              </p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <FileText className="h-3.5 w-3.5" /> Open scanned booklet
            </a>
            <a
              href={
                fileUrl.includes("?")
                  ? `${fileUrl}&download=1`
                  : `${fileUrl}?download=1`
              }
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Download className="h-3.5 w-3.5" /> Download booklet
            </a>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-3 pt-1">
          {evaluationRuns.length ? (
            evaluationRuns.map((run) => (
              <div
                key={run.id}
                className="flex flex-col gap-2 border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Run {run.runNumber} ·{" "}
                    {run.trigger === "AUTOMATIC"
                      ? "Automatic evaluation"
                      : "Admin re-evaluation"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {run.questions?.length || 0} question reports
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-sm font-bold text-primary">
                    {run.totalMarksAwarded ?? "—"} / {run.maxMarks ?? "—"}
                  </p>
                  <Badge variant="outline" className="mt-1 text-[11px]">
                    {run.status}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-border px-5 py-10 text-center text-sm text-muted-foreground">
              No evaluation history is available.
            </div>
          )}
        </TabsContent>

        <TabsContent value="questions" className="space-y-3 pt-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground sm:text-base">
                Question-wise score adjustment
              </h3>
              <p className="text-xs text-muted-foreground">
                Review each score and feedback item. Changes are clamped and
                logged.
              </p>
            </div>
            <span className="inline-flex w-fit rounded-sm border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              Scroll horizontally to explore all columns
            </span>
          </div>
          <DataTable
            data={questions}
            columns={columns}
            keyExtractor={(q) => q.id}
            searchPlaceholder="Search questions or feedback..."
            defaultSortColumn="questionNumber"
            defaultSortDirection="asc"
            defaultPageSize={10}
            defaultViewMode="auto"
            tableClassName="min-w-[1180px]"
            gridClassName="grid grid-cols-1 gap-4 md:grid-cols-2"
            renderCard={(q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onScoreChange={handleScoreChange}
                onNotesChange={handleNotesChange}
              />
            )}
            emptyTitle="No question evaluations found"
            emptyDescription="No question records match your search query."
          />
        </TabsContent>

        <TabsContent value="finalize" className="space-y-5 pt-1">
          <div className="rounded-md border border-amber-200 bg-amber-50/60 p-4 text-xs leading-relaxed text-amber-900">
            Review all question marks before saving. The final score will be
            written to the audit log and shown as an admin override.
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-foreground">
              Overall admin review justification
            </Label>
            <Textarea
              value={adminNotes}
              onChange={(event) => setAdminNotes(event.target.value)}
              placeholder="Record why scores were adjusted or confirm the review..."
              rows={7}
              className="rounded-md text-sm"
            />
          </div>
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          Current review total:{" "}
          <span className="font-bold text-foreground">
            {calculatedTotal} / {effectiveMaxMarks} ({percentage}%)
          </span>
        </p>
        <Button
          type="submit"
          disabled={loading}
          className="h-10 w-full rounded-md bg-primary px-6 text-xs font-semibold text-primary-foreground hover:bg-primary/90 sm:w-auto"
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ShieldCheck className="mr-2 h-4 w-4" />
          )}{" "}
          Save review & write audit log
        </Button>
      </div>
    </form>
  )
}

function SummaryMetric({
  label,
  value,
  valueClass = "text-primary",
}: {
  label: string
  value: string
  valueClass?: string
}) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <span className="block text-[11px] font-semibold text-muted-foreground">
        {label}
      </span>
      <span className={`mt-1 block text-2xl font-extrabold ${valueClass}`}>
        {value}
      </span>
    </div>
  )
}

function QuestionCard({
  question,
  onScoreChange,
  onNotesChange,
}: {
  question: any
  onScoreChange: (id: string, score: number, max: number) => void
  onNotesChange: (id: string, notes: string) => void
}) {
  return (
    <div className="space-y-3 rounded-md border border-border bg-background p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-extrabold text-primary">
          {question.questionNumber}
        </span>
        <Badge variant="outline" className="text-xs">
          Max: {question.maxMarks} Marks
        </Badge>
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-bold">Awarded marks</Label>
        <Input
          type="number"
          step={0.5}
          min={0}
          max={question.maxMarks}
          value={question.marksAwarded}
          onChange={(event) =>
            onScoreChange(
              question.id,
              Number(event.target.value) || 0,
              question.maxMarks
            )
          }
          className="h-10 rounded-md font-bold text-primary"
        />
      </div>
      <div className="space-y-1.5">
        <span className="text-[11px] font-semibold text-muted-foreground">
          Rubric evaluation
        </span>
        <p className="rounded-sm border border-border bg-muted/40 p-2.5 text-xs leading-relaxed text-foreground">
          {question.feedback}
        </p>
        {question.missingConcepts && (
          <p className="rounded-sm border border-amber-200 bg-amber-50 p-2 text-[11px] text-amber-800">
            Missing: {question.missingConcepts}
          </p>
        )}
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-bold">Admin audit note</Label>
        <Input
          value={question.adminNotes || ""}
          onChange={(event) => onNotesChange(question.id, event.target.value)}
          placeholder="Reason for adjustment..."
          className="h-9 rounded-md text-xs"
        />
      </div>
    </div>
  )
}
