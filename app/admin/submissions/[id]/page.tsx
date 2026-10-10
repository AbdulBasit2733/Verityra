import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminScoreReviewEditor } from "@/components/admin-score-review-editor"
import { ArrowLeft, User, BookOpen, AlertTriangle } from "lucide-react"

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
        testSeries: { title: "UPSC Civil Services General Studies Paper I Mock", maxMarks: 250 },
        evaluation: {
          id: "eval-1",
          totalMarksAwarded: 184.5,
          maxMarks: 250,
          percentage: 73.8,
          status: "REVIEW_REQUIRED",
          generalFeedback: "Overall solid presentation. Flagged for review due to question 2 diagram handwriting ambiguity.",
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
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        href="/admin/submissions"
        className="inline-flex items-center text-xs font-medium text-[#4B6375] hover:text-[#0784B5] transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to Submissions Queue
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#0784B5] text-white text-[10px] border-0">
              Attempt #{submission.attemptNumber}
            </Badge>
            <span className="text-xs text-[#4B6375]">
              Submitted on {new Date(submission.submittedAt).toLocaleString()}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B192C]">
            Review Candidate Answer Sheet
          </h1>
        </div>

        <div className="text-right">
          <p className="text-xs text-[#4B6375]">Candidate</p>
          <p className="font-bold text-[#0B192C]">{submission.user?.name}</p>
          <p className="text-[11px] text-[#4B6375]">{submission.user?.email}</p>
        </div>
      </div>

      {submission.evaluation ? (
        <AdminScoreReviewEditor
          submissionId={submission.id}
          initialEvaluation={submission.evaluation}
          fileUrl={submission.fileUrl}
        />
      ) : (
        <Card className="border-[#D5E5F2] bg-white p-8 text-center text-xs text-[#4B6375]">
          Evaluation has not been initialized for this submission yet.
        </Card>
      )}
    </div>
  )
}
