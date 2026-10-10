import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { requireStudent } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SubmissionUploadForm } from "@/components/submission-upload-form"
import {
  FileText,
  Download,
  Clock,
  Award,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  ShieldAlert,
  Info,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StudentTestWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireStudent(`/student/tests/${id}`)
  const dbConnected = await isDatabaseConnected()

  let registration: any = null
  let testSeries: any = null

  if (dbConnected) {
    registration = await prisma.testRegistration.findFirst({
      where: {
        userId: user.id,
        OR: [{ testSeriesId: id }, { testSeries: { slug: id } }],
      },
      include: {
        testSeries: {
          include: {
            papers: true,
            templates: true,
          },
        },
        submissions: {
          include: {
            evaluation: {
              include: {
                questions: {
                  orderBy: { questionNumber: "asc" },
                },
              },
            },
          },
          orderBy: { attemptNumber: "desc" },
        },
      },
    })

    if (registration) {
      testSeries = registration.testSeries
    }
  }

  // Fallback demo mock if DB is offline
  if (!registration) {
    if (id.startsWith("demo-") || id.startsWith("upsc-") || id === "test-1") {
      testSeries = {
        id,
        title: "UPSC Civil Services General Studies Paper I Mock",
        maxMarks: 250,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions: `1. Solve all 20 questions sequentially.
2. Use printable answer sheet with official margins.
3. Keep handwriting clean and legible.`,
        papers: [
          {
            id: "paper-1",
            title: "UPSC GS Paper I Official Mock Paper (PDF)",
            fileUrl: "/api/files/download?file=papers/upsc-paper.pdf",
            maxMarks: 250,
          },
        ],
        templates: [
          {
            id: "tpl-1",
            title: "Standard Margin Answer Sheet Template (24 Pages)",
            fileUrl: "/api/files/download?file=templates/upsc-template.pdf",
            templateRequired: true,
          },
        ],
      }
      registration = {
        id: "demo-reg-1",
        attemptsUsed: 1,
        maxAttempts: 3,
        submissions: [
          {
            id: "demo-sub-1",
            attemptNumber: 1,
            status: "COMPLETED",
            fileUrl: "/api/files/download?file=submissions/demo/sample-attempt.pdf",
            submittedAt: new Date(Date.now() - 3600000 * 5),
            evaluation: {
              id: "eval-1",
              totalMarksAwarded: 184.5,
              maxMarks: 250,
              percentage: 73.8,
              generalFeedback:
                "Commendable conceptual clarity. Excellent structure with introductory definitions and tabular comparisons in Question 2. Improve conclusion depth in Question 3.",
              legibilityWarning: false,
              uncertaintyFlag: false,
              questions: [
                {
                  id: "q-1",
                  questionNumber: "Q1",
                  maxMarks: 10,
                  marksAwarded: 7.5,
                  feedback: "Strong historical framing and accurate chronology.",
                  missingConcepts: "Could cite the specific rock edict inscriptions.",
                  isLegible: true,
                },
                {
                  id: "q-2",
                  questionNumber: "Q2",
                  maxMarks: 15,
                  marksAwarded: 11.0,
                  feedback: "Clear geographical analysis with neat climatic flow diagram.",
                  missingConcepts: "Omitted microclimatic impact on coastal plains.",
                  isLegible: true,
                },
                {
                  id: "q-3",
                  questionNumber: "Q3",
                  maxMarks: 15,
                  marksAwarded: 10.5,
                  feedback: "Well-structured arguments regarding urban demographic pressures.",
                  missingConcepts: "Could propose actionable civic governance interventions.",
                  isLegible: true,
                },
              ],
            },
          },
        ],
      }
    } else {
      redirect(`/tests/${id}`)
    }
  }

  const attemptsUsed = registration.attemptsUsed
  const maxAttempts = registration.maxAttempts
  const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed)

  return (
    <div className="flex min-h-screen flex-col bg-[#F2F7FA]">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Breadcrumb & Title */}
          <div>
            <Link
              href="/student/dashboard"
              className="inline-flex items-center text-xs font-medium text-[#4B6375] hover:text-[#0784B5] mb-3 transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to Dashboard
            </Link>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[11px] font-semibold text-[#0784B5] uppercase tracking-wider">
                  Candidate Workspace
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C]">
                  {testSeries.title}
                </h1>
              </div>

              {/* Attempt status pill */}
              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-[#9BD4E4] bg-white px-4 py-2 shadow-sm">
                  <p className="text-[10px] uppercase font-bold text-[#4B6375]">Attempt Allowance</p>
                  <p className="text-base font-extrabold text-[#0784B5]">
                    {attemptsUsed} / {maxAttempts} Used
                    <span className="text-xs font-normal text-[#4B6375] ml-2">
                      ({attemptsRemaining} remaining)
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Paper & Template Download Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card className="border-[#D5E5F2] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-[#0B192C] flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#0784B5]" />
                  Question Paper & Instructions
                </CardTitle>
                <CardDescription className="text-xs text-[#4B6375]">
                  Download the official paper and solve questions sequentially.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {testSeries.papers && testSeries.papers.length > 0 ? (
                  testSeries.papers.map((paper: any) => (
                    <div
                      key={paper.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[#D5E5F2] bg-[#F2F7FA] text-xs"
                    >
                      <span className="font-medium text-[#0B192C] truncate max-w-[200px]">
                        {paper.title}
                      </span>
                      <a
                        href={paper.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0784B5] text-white font-medium hover:bg-[#0784B5]/90 text-[11px]"
                      >
                        <Download className="h-3 w-3" />
                        Download Paper
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#4B6375]">Question paper is active.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-[#D5E5F2] bg-white shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-[#0B192C] flex items-center gap-2">
                  <Download className="h-4 w-4 text-[#0784B5]" />
                  Prescribed Answer Sheet Template
                </CardTitle>
                <CardDescription className="text-xs text-[#4B6375]">
                  Print this sheet to ensure answers fit official margin dimensions.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {testSeries.templates && testSeries.templates.length > 0 ? (
                  testSeries.templates.map((tpl: any) => (
                    <div
                      key={tpl.id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-[#D5E5F2] bg-[#F2F7FA] text-xs"
                    >
                      <span className="font-medium text-[#0B192C] truncate max-w-[200px]">
                        {tpl.title}
                      </span>
                      <a
                        href={tpl.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0784B5] text-white font-medium hover:bg-[#0784B5]/90 text-[11px]"
                      >
                        <Download className="h-3 w-3" />
                        Print Template
                      </a>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#4B6375]">Use standard margin ruled sheets.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upload Answer Sheet Section (enforces 3-attempt limit) */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-[#0B192C]">Upload Handwritten Submission</h2>
            <SubmissionUploadForm
              testSeriesId={testSeries.id}
              attemptsUsed={attemptsUsed}
              maxAttempts={maxAttempts}
            />
          </div>

          {/* Submissions & Evaluations Breakdown */}
          <div className="space-y-5 pt-4">
            <h2 className="text-lg font-bold text-[#0B192C]">
              Submission History & Evaluated Results ({registration.submissions.length})
            </h2>

            {registration.submissions.length === 0 ? (
              <Card className="border-[#D5E5F2] bg-white p-6 text-center text-xs text-[#4B6375]">
                No answer sheets submitted yet for this test series. Upload your first attempt above to receive scoring.
              </Card>
            ) : (
              registration.submissions.map((sub: any) => {
                const evalData = sub.evaluation

                return (
                  <Card key={sub.id} className="border-[#D5E5F2] bg-white shadow-sm overflow-hidden">
                    {/* Submission Header */}
                    <div className="bg-[#CADEEF]/20 border-b border-[#D5E5F2] px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-[#0784B5] text-white font-bold text-xs border-0">
                          Attempt #{sub.attemptNumber}
                        </Badge>
                        <span className="text-xs text-[#4B6375]">
                          Submitted on {new Date(sub.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={`text-xs font-semibold ${
                            sub.status === "COMPLETED"
                              ? "border-emerald-300 text-emerald-800 bg-emerald-50"
                              : sub.status === "REVIEW_REQUIRED"
                              ? "border-amber-300 text-amber-800 bg-amber-50"
                              : "border-blue-300 text-blue-800 bg-blue-50"
                          }`}
                        >
                          {sub.status === "COMPLETED"
                            ? "Evaluation Finalized"
                            : sub.status === "REVIEW_REQUIRED"
                            ? "Educator Review Underway"
                            : "Evaluation In Progress"}
                        </Badge>

                        {sub.fileUrl && (
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-[#0784B5] hover:underline flex items-center gap-1"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View Scanned Sheet
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Evaluation Details */}
                    {evalData ? (
                      <CardContent className="p-6 space-y-6">
                        {/* Overall Score Summary */}
                        <div className="p-4 rounded-xl bg-[#F2F7FA] border border-[#D5E5F2] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <span className="text-[11px] font-bold uppercase text-[#4B6375] tracking-wide">
                              Final Awarded Score
                            </span>
                            <div className="flex items-baseline gap-2 mt-0.5">
                              <span className="text-3xl font-extrabold text-[#0784B5]">
                                {evalData.totalMarksAwarded}
                              </span>
                              <span className="text-sm font-semibold text-[#4B6375]">
                                / {evalData.maxMarks} marks
                              </span>
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full ml-2">
                                {evalData.percentage}%
                              </span>
                            </div>
                          </div>

                          <div className="max-w-xl text-xs text-[#4B6375] leading-relaxed">
                            <span className="font-semibold text-[#0B192C] block mb-0.5">
                              Overall Articulation Assessment:
                            </span>
                            {evalData.generalFeedback}
                          </div>
                        </div>

                        {/* Legibility or Uncertainty Alerts */}
                        {evalData.legibilityWarning && (
                          <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                            <span>
                              Legibility Warning: Portions of handwriting were faint or difficult to read. Ensure high contrast scanning for future attempts.
                            </span>
                          </div>
                        )}

                        {/* Question-wise Breakdown Table */}
                        {evalData.questions && evalData.questions.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-[#0B192C]">
                              Question-by-Question Scoring & Rubric Feedback
                            </h4>

                            <div className="border border-[#D5E5F2] rounded-xl overflow-hidden bg-white">
                              <Table>
                                <TableHeader className="bg-[#CADEEF]/20 text-xs font-semibold text-[#0B192C]">
                                  <TableRow>
                                    <TableHead className="w-[80px]">Question</TableHead>
                                    <TableHead className="w-[120px]">Score / Max</TableHead>
                                    <TableHead>Evaluator Feedback</TableHead>
                                    <TableHead className="w-[240px]">Improvement Notes / Omissions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody className="text-xs">
                                  {evalData.questions.map((q: any) => (
                                    <TableRow key={q.id}>
                                      <TableCell className="font-bold text-[#0784B5]">
                                        {q.questionNumber}
                                      </TableCell>
                                      <TableCell className="font-semibold text-[#0B192C]">
                                        {q.marksAwarded} / {q.maxMarks}
                                      </TableCell>
                                      <TableCell className="text-[#4B6375] leading-relaxed">
                                        {q.feedback}
                                      </TableCell>
                                      <TableCell className="text-[#0B192C] italic leading-relaxed">
                                        {q.missingConcepts || "None noted. Solid reasoning."}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    ) : (
                      <CardContent className="p-6 text-center text-xs text-[#4B6375]">
                        Evaluation is currently being processed against the test rubric. Check back in a few moments.
                      </CardContent>
                    )}
                  </Card>
                )
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
