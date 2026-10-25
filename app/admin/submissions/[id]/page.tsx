import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { AdminScoreReviewEditor } from "@/components/admin-score-review-editor"
import { PageHeader } from "@/components/ui/page-header"
import { ArrowLeft, FileCheck2 } from "lucide-react"
import { formatDateTimeFull } from "@/lib/format"

export const dynamic = "force-dynamic"

export default async function AdminSubmissionReviewPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dbConnected = await isDatabaseConnected()

  let submission: any = null

  if (dbConnected) {
    submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        user: true,
        testSeries: true,
        evaluation: {
          include: {
            questions: {
              orderBy: { questionNumber: "asc" },
            },
          },
        },
      },
    })
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
              marksAwarded: 10.0,
              feedback: "Handwriting in diagram annotations required educator verification.",
              missingConcepts: "Omitted microclimatic impact.",
            },
          ],
        },
      }
    } else {
      notFound()
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <PageHeader
        icon={FileCheck2}
        title="Review Candidate Answer Sheet"
        subtitle={`Viewing: ${submission.testSeries?.title || "Test Series"} · Attempt #${submission.attemptNumber} by ${submission.user?.name || "Candidate"}`}
        showRefresh={false}
      >
        <Link href="/admin/submissions">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Submissions
          </Button>
        </Link>
      </PageHeader>

      {/* Candidate Summary Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Badge className="bg-[#2A6AED] text-white text-xs font-bold border-0 px-3 py-1 rounded-full shadow-2xs">
            Attempt #{submission.attemptNumber}
          </Badge>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Submitted on {formatDateTimeFull(submission.submittedAt)}
          </span>
        </div>
        <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Candidate Identity
          </span>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
            {submission.user?.name}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{submission.user?.email}</span>
        </div>
      </div>

      {submission.evaluation ? (
        <AdminScoreReviewEditor
          submissionId={submission.id}
          initialEvaluation={submission.evaluation}
          fileUrl={submission.fileUrl}
        />
      ) : (
        <div className="border-y border-slate-200 py-10 text-center text-xs sm:text-sm text-[#64748B]">
          Evaluation has not been initialized for this submission yet.
        </div>
      )}
    </div>
  )
}
