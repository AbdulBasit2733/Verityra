import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AdminScoreReviewEditor } from "@/components/admin-score-review-editor"
import { ArrowLeft } from "lucide-react"

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
      {/* Flat Page Header — No Card Wrapper */}
      <div className="space-y-3">
        <Link
          href="/admin/submissions"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#2A6AED] transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Submissions Queue
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-[#2A6AED] text-white text-[11px] font-bold border-0 px-2.5 py-0.5 rounded-lg">
                Attempt #{submission.attemptNumber}
              </Badge>
              <span className="text-xs text-[#64748B] font-medium">
                Submitted on {new Date(submission.submittedAt).toLocaleString()}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] tracking-tight">
              Review Candidate Answer Sheet
            </h1>
            <p className="text-xs sm:text-sm text-[#64748B]">
              {submission.testSeries?.title}
            </p>
          </div>

          <div className="sm:text-right border-l sm:border-l-0 pl-3 sm:pl-0 border-slate-200">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Candidate Identity
            </p>
            <p className="font-bold text-[#0F172A] text-xs sm:text-sm mt-0.5">
              {submission.user?.name}
            </p>
            <p className="text-[11px] text-[#64748B]">{submission.user?.email}</p>
          </div>
        </div>
      </div>

      <Separator className="bg-slate-200" />

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
