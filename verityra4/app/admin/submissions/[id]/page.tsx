import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminScoreReviewEditor } from "@/components/admin/submissions/admin-score-review-editor"
import {
  AdminEvaluationLiveBanner,
  AdminSubmissionEvaluationTrigger,
} from "@/components/admin/submissions/admin-submissions-client"
import { PageHeader } from "@/components/ui/page-header"
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  ExternalLink,
  FileCheck2,
  FileText,
  UserRound,
} from "lucide-react"
import { formatDateTimeFull } from "@/lib/format"
import { normalizePrivateFileUrl } from "@/lib/supabase"
import { getEvaluationStatus } from "@/lib/queue/evaluation-queue"

export const dynamic = "force-dynamic"

export default async function AdminSubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let submission: any = null

  try {
    await getEvaluationStatus(id).catch(() => null)

    submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: true,
        testSeries: {
          include: {
            tests: true,
          },
        },
        test: true,
        registration: {
          include: {
            test: true,
          },
        },
        evaluationJob: true,
        evaluation: {
          include: { questions: { orderBy: { questionNumber: "asc" } } },
        },
        evaluationRuns: {
          orderBy: { runNumber: "asc" },
          include: { questions: { orderBy: { questionNumber: "asc" } } },
        },
      },
    })
  } catch (error) {
    console.error("[AdminSubmissionReviewPage] Database query error:", error)
  }

  if (!submission) {
    if (id.startsWith("sub-") || id.startsWith("demo-")) {
      submission = {
        id,
        attemptNumber: 1,
        status: "REVIEW_REQUIRED",
        fileUrl: "/api/files/download?file=submissions/demo/sample-attempt.pdf",
        submittedAt: new Date(),
        user: { name: "Aarav Sharma", email: "aarav@example.com" },
        testSeries: {
          title: "UPSC Civil Services General Studies Paper I Mock",
          maxMarks: 250,
        },
        evaluation: {
          id: "eval-1",
          totalMarksAwarded: 184.5,
          maxMarks: 250,
          percentage: 73.8,
          status: "REVIEW_REQUIRED",
          generalFeedback:
            "Overall solid presentation. Flagged for review due to question 2 diagram handwriting ambiguity.",
          uncertaintyFlag: true,
          questions: [
            {
              id: "q-1",
              questionNumber: "Q1",
              maxMarks: 10,
              marksAwarded: 7.5,
              feedback: "Accurate historical chronology.",
              missingConcepts: "Could cite the Ashokan rock edicts.",
            },
            {
              id: "q-2",
              questionNumber: "Q2",
              maxMarks: 15,
              marksAwarded: 10,
              feedback:
                "Handwriting in diagram annotations required educator verification.",
              missingConcepts: "Omitted microclimatic impact.",
            },
          ],
        },
        evaluationRuns: [],
        aiEvaluationRuns: 0,
      }
    } else notFound()
  }

  const fileUrl = normalizePrivateFileUrl(submission.fileUrl) || "#"
  const seriesTests = submission.testSeries?.tests || []
  const effectiveTest =
    submission.test ||
    submission.registration?.test ||
    (seriesTests.length === 1 ? seriesTests[0] : null)
  const configuredMaxMarks =
    effectiveTest?.maxMarks ?? submission.testSeries?.maxMarks ?? 100
  const subjectTitle = effectiveTest
    ? effectiveTest.subject &&
      !effectiveTest.title
        .toLowerCase()
        .startsWith(effectiveTest.subject.toLowerCase())
      ? `${effectiveTest.subject}: ${effectiveTest.title}`
      : effectiveTest.title
    : null
  const headerSubtitle = subjectTitle
    ? `${subjectTitle} · ${submission.testSeries?.title || "Test Series"} (${configuredMaxMarks} Max Marks)`
    : `${submission.testSeries?.title || "Candidate answer sheet"} (${configuredMaxMarks} Max Marks)`

  const statusLabel =
    submission.status === "REVIEW_REQUIRED"
      ? "Review required"
      : submission.status === "COMPLETED"
        ? "Completed"
        : submission.status
  const statusClass =
    submission.status === "COMPLETED"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : submission.status === "REVIEW_REQUIRED"
        ? "border-amber-200 bg-amber-50 text-amber-800"
        : submission.status === "FAILED"
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-blue-200 bg-blue-50 text-blue-700"

  const isActivelyProcessing =
    submission.status === "PROCESSING" ||
    submission.evaluationJob?.status === "QUEUED" ||
    submission.evaluationJob?.status === "PROCESSING" ||
    submission.evaluationJob?.status === "RETRYING"

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        icon={FileCheck2}
        title="Submission Review"
        subtitle={headerSubtitle}
        showRefresh={false}
      >
        <Link href="/admin/submissions">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-md px-3.5 text-xs font-semibold"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to submissions
          </Button>
        </Link>
      </PageHeader>

      <section className="border-y border-border bg-card px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-base font-bold text-foreground">
                  {submission.user?.name || "Unknown candidate"}
                </h2>
                <Badge variant="outline" className="text-[11px] font-semibold">
                  Attempt #{submission.attemptNumber}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-[11px] font-semibold ${statusClass}`}
                >
                  {statusLabel}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {submission.user?.email || "No email"} · Submitted{" "}
                {formatDateTimeFull(submission.submittedAt)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted"
            >
              <FileText className="h-3.5 w-3.5" /> Open answer sheet{" "}
              <ExternalLink className="h-3 w-3" />
            </a>
            {submission.evaluation &&
            (submission.status === "COMPLETED" ||
              submission.status === "REVIEW_REQUIRED" ||
              submission.status === "FAILED" ||
              submission.status === "PROCESSING") ? (
              <AdminSubmissionEvaluationTrigger
                submissionId={submission.id}
                aiEvaluationRuns={submission.aiEvaluationRuns || 0}
                isProcessing={submission.status === "PROCESSING"}
                compact
              />
            ) : null}
          </div>
        </div>
      </section>

      {isActivelyProcessing && (
        <AdminEvaluationLiveBanner
          submissionId={submission.id}
          initialJobStatus={submission.evaluationJob?.status}
          initialAttempts={submission.evaluationJob?.attempts || 0}
          runNumber={Math.max(1, submission.aiEvaluationRuns || 1)}
        />
      )}

      {submission.evaluation ? (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
          <main className="min-w-0">
            <AdminScoreReviewEditor
              key={`${submission.evaluation.id}-${submission.evaluation.evaluatedAt?.toISOString?.() || ""}-${submission.aiEvaluationRuns || 0}`}
              submissionId={submission.id}
              initialEvaluation={submission.evaluation}
              configuredMaxMarks={configuredMaxMarks}
              evaluationRuns={submission.evaluationRuns || []}
              fileUrl={fileUrl}
            />
          </main>
          <aside className="space-y-4 xl:sticky xl:top-6">
            <section className="space-y-3 border border-border bg-card p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">
                  Review checklist
                </h2>
              </div>
              <ChecklistRow
                label="Candidate identity"
                value={submission.user?.name || "Available"}
              />
              <ChecklistRow
                label="Evaluation runs"
                value={`${submission.aiEvaluationRuns || 0} run(s) recorded`}
              />
              <ChecklistRow
                label="Score status"
                value={submission.evaluation.status}
              />
              {submission.evaluation.uncertaintyFlag ||
              submission.evaluation.legibilityWarning ? (
                <p className="border-l-2 border-amber-500 bg-amber-50/60 px-3 py-2 text-xs leading-relaxed text-amber-900">
                  Scan or evaluation uncertainty requires human verification.
                </p>
              ) : (
                <p className="border-l-2 border-emerald-500 bg-emerald-50/60 px-3 py-2 text-xs leading-relaxed text-emerald-800">
                  No uncertainty flags were reported.
                </p>
              )}
            </section>
            <section className="border border-border bg-card p-4">
              <p className="text-xs font-semibold text-muted-foreground">
                Current score
              </p>
              <p className="mt-1 text-3xl font-extrabold text-primary">
                {submission.evaluation.totalMarksAwarded}
                <span className="text-base font-semibold text-muted-foreground">
                  {" "}
                  / {configuredMaxMarks}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {configuredMaxMarks > 0
                  ? Number(
                      (
                        (submission.evaluation.totalMarksAwarded /
                          configuredMaxMarks) *
                        100
                      ).toFixed(2)
                    )
                  : 0}
                % overall
              </p>
              {Math.abs(
                (submission.evaluation.maxMarks || 0) - configuredMaxMarks
              ) > 0.01 && (
                <p className="mt-2 rounded-sm border border-amber-200 bg-amber-50/70 px-2.5 py-1.5 text-[11px] leading-relaxed text-amber-900">
                  Previous AI run graded out of {submission.evaluation.maxMarks}
                  . Click <b>Re-evaluate</b> above to re-grade against{" "}
                  {configuredMaxMarks} max marks.
                </p>
              )}
            </section>
          </aside>
        </div>
      ) : (
        <section className="border border-dashed border-border px-6 py-12 text-center">
          <Clock3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h2 className="text-sm font-bold text-foreground">
            Evaluation is not available yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
            {submission.evaluationJob?.lastError
              ? `Last worker error: ${submission.evaluationJob.lastError}`
              : "The submission is waiting for evaluation or needs to be retried. You can open the answer sheet while the queue is processing."}
          </p>
          {submission.evaluationJob && (
            <p className="mt-2 text-[11px] font-medium text-muted-foreground">
              Queue Status: {submission.evaluationJob.status} · Attempts:{" "}
              {submission.evaluationJob.attempts}
            </p>
          )}
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <a
              href={fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-semibold"
            >
              <FileText className="h-3.5 w-3.5" /> Open answer sheet
            </a>
            {(submission.status === "PENDING" ||
              submission.status === "FAILED" ||
              submission.status === "PROCESSING") && (
              <AdminSubmissionEvaluationTrigger
                submissionId={submission.id}
                aiEvaluationRuns={submission.aiEvaluationRuns || 0}
                isProcessing={submission.status === "PROCESSING"}
              />
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function ChecklistRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-t border-border pt-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  )
}
