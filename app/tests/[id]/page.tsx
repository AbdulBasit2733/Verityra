import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TestRegistrationButton } from "@/components/test-registration-button"
import {
  Clock,
  Award,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  ArrowLeft,
  Download,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function TestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getCurrentUser()
  const dbConnected = await isDatabaseConnected()

  let testSeries: any = null
  let isRegistered = false

  if (dbConnected) {
    testSeries = await prisma.testSeries.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        isPublished: true,
      },
      include: {
        papers: true,
        templates: true,
      },
    })

    if (testSeries && user) {
      const reg = await prisma.testRegistration.findUnique({
        where: {
          userId_testSeriesId: {
            userId: user.id,
            testSeriesId: testSeries.id,
          },
        },
      })
      isRegistered = !!reg
    }
  }

  // Fallback demo mock if DB is offline/unseeded
  if (!testSeries) {
    if (id.startsWith("demo-") || id.startsWith("upsc-") || id === "test-1") {
      testSeries = {
        id,
        title: "UPSC Civil Services General Studies Paper I Mock",
        description:
          "Full-length authentic exam paper testing Indian Heritage, Art, Culture, World History, Physical Geography, and Society under 3-hour strict handwritten conditions.",
        price: 0,
        maxMarks: 250,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions: `1. The Question Paper contains 20 questions in official English/Hindi format.
2. All questions are compulsory. Questions 1 to 10 are 10-markers (150 words limit), and 11 to 20 are 15-markers (250 words limit).
3. Answers must be written exclusively by hand using the official margin-aligned printable answer sheet template.
4. Keep clear margins on both left and right sides. Do not write outside the prescribed answer boxes.
5. Once complete, convert your physical handwritten pages into a clean, single PDF scan and upload it before the cutoff deadline.`,
        templates: [
          {
            id: "tpl-1",
            title: "UPSC Standard Margin Answer Sheet Template (24 Pages)",
            fileUrl: "/api/files/download?file=templates/upsc-template.pdf",
            templateRequired: true,
          },
        ],
      }
    } else {
      notFound()
    }
  }

  const isFree = testSeries.price === 0
  const priceInRupees = testSeries.price / 100

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16 bg-slate-50/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/tests"
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#2A6AED] mb-8 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Test Series
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main content col */}
            <div className="lg:col-span-8 space-y-8">
              <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-card space-y-6">
                <div className="flex flex-wrap items-center gap-2.5">
                  {isFree ? (
                    <Badge className="bg-emerald-600 text-white font-bold text-xs border-0 px-3 py-1">
                      Free Test Series
                    </Badge>
                  ) : (
                    <Badge className="bg-[#2A6AED] text-white font-bold text-xs border-0 px-3 py-1">
                      ₹{priceInRupees}
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-xs font-semibold border-blue-200 text-[#2A6AED] bg-blue-50">
                    Standard Subjective Format
                  </Badge>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  {testSeries.title}
                </h1>
                <p className="text-base text-slate-600 leading-relaxed">
                  {testSeries.description}
                </p>

                <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-100 text-sm">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Duration</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                      <Clock className="h-4 w-4 text-[#2A6AED]" />
                      {testSeries.durationMinutes} Mins
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Maximum Marks</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5 mt-1">
                      <Award className="h-4 w-4 text-[#2A6AED]" />
                      {testSeries.maxMarks} Marks
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Attempt Limit</span>
                    <span className="font-bold text-[#2A6AED] flex items-center gap-1.5 mt-1">
                      <CheckCircle2 className="h-4 w-4 text-[#2A6AED]" />
                      {testSeries.maxAttempts} Attempts
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Instructions */}
              <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-card space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2.5">
                    <FileText className="h-5 w-5 text-[#2A6AED]" />
                    Candidate Instructions & Answer Guidelines
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Read thoroughly before attempting and submitting your answer sheets
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-800 whitespace-pre-line leading-relaxed font-sans border border-slate-200/80">
                  {testSeries.studentInstructions}
                </div>

                <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3.5">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Three-Attempt Policy:</p>
                    <p className="mt-1 leading-relaxed text-amber-800 text-xs sm:text-sm">
                      You can submit up to 3 accepted handwritten responses for this test. Each submission is evaluated individually against the rubric so you can iteratively refine your writing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Answer Sheet Template Info */}
              {testSeries.templates && testSeries.templates.length > 0 && (
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-card space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                      <Download className="h-5 w-5 text-[#2A6AED]" />
                      Prescribed Answer Sheet Template
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {testSeries.templates.map((tpl: any) => (
                      <div
                        key={tpl.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-2xl border border-slate-200 bg-slate-50 gap-4"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{tpl.title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {tpl.templateRequired ? "Mandatory for this examination" : "Recommended format"}
                          </p>
                        </div>
                        {isRegistered ? (
                          <a
                            href={tpl.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2A6AED] text-white font-semibold hover:bg-[#1E55C7] text-xs shadow-xs"
                          >
                            <Download className="h-4 w-4" />
                            Download Template
                          </a>
                        ) : (
                          <Badge variant="outline" className="border-blue-200 text-[#2A6AED] bg-blue-50">
                            Register to Download
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Registration Card Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-3xl border border-slate-200/90 bg-white p-8 shadow-card space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      Candidate Enrollment
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {isFree
                        ? "Free enrollment with full access to question paper and 3 evaluations."
                        : "One-time payment for complete evaluation and leaderboard ranking."}
                    </p>
                  </div>

                  <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enrollment Fee:</span>
                    <span className="text-3xl font-black text-[#2A6AED]">
                      {isFree ? "FREE" : `₹${priceInRupees}`}
                    </span>
                  </div>

                  <TestRegistrationButton
                    testSeriesId={testSeries.id}
                    isFree={isFree}
                    priceInRupees={priceInRupees}
                    isRegistered={isRegistered}
                    isSignedIn={!!user}
                  />

                  <div className="text-xs text-slate-600 space-y-2.5 pt-2">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Official answer sheet template included
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Question-by-question scoring breakdown
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Up to 3 iterations per registered test
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      Eligible for published live leaderboard
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
