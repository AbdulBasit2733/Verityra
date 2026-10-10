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

      <main className="flex-1 py-10 bg-[#F2F7FA]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/tests"
            className="inline-flex items-center text-xs font-medium text-[#4B6375] hover:text-[#0784B5] mb-6 transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to All Test Series
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main content col */}
            <div className="lg:col-span-8 space-y-6">
              <Card className="border-[#D5E5F2] bg-white shadow-sm">
                <CardHeader className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {isFree ? (
                      <Badge className="bg-emerald-600 text-white font-semibold text-xs border-0">
                        Free Test Series
                      </Badge>
                    ) : (
                      <Badge className="bg-[#0784B5] text-white font-semibold text-xs border-0">
                        ₹{priceInRupees}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs border-[#9BD4E4] text-[#0784B5] bg-[#CADEEF]/20">
                      Standard Subjective Format
                    </Badge>
                  </div>

                  <CardTitle className="text-2xl sm:text-3xl font-extrabold text-[#0B192C]">
                    {testSeries.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-[#4B6375] leading-relaxed">
                    {testSeries.description}
                  </CardDescription>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#D5E5F2] text-xs">
                    <div>
                      <span className="text-[#4B6375] block">Duration</span>
                      <span className="font-bold text-[#0B192C] flex items-center gap-1 mt-0.5">
                        <Clock className="h-3.5 w-3.5 text-[#0784B5]" />
                        {testSeries.durationMinutes} Minutes
                      </span>
                    </div>
                    <div>
                      <span className="text-[#4B6375] block">Maximum Marks</span>
                      <span className="font-bold text-[#0B192C] flex items-center gap-1 mt-0.5">
                        <Award className="h-3.5 w-3.5 text-[#0784B5]" />
                        {testSeries.maxMarks} Marks
                      </span>
                    </div>
                    <div>
                      <span className="text-[#4B6375] block">Attempt Allowance</span>
                      <span className="font-bold text-[#0784B5] flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#0784B5]" />
                        {testSeries.maxAttempts} Attempts Max
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Student Instructions */}
              <Card className="border-[#D5E5F2] bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-[#0B192C] flex items-center gap-2">
                    <FileText className="h-5 w-5 text-[#0784B5]" />
                    Candidate Instructions & Answer Guidelines
                  </CardTitle>
                  <CardDescription className="text-xs text-[#4B6375]">
                    Read thoroughly before attempting and submitting your answer sheets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-xl bg-[#F2F7FA] p-4 text-xs text-[#0B192C] whitespace-pre-line leading-relaxed font-sans border border-[#D5E5F2]">
                    {testSeries.studentInstructions}
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Three-Attempt Policy:</p>
                      <p className="mt-0.5 leading-relaxed text-amber-800">
                        You can submit up to 3 accepted handwritten responses for this test. Each submission is evaluated individually against the rubric so you can iteratively refine your writing.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Answer Sheet Template Info */}
              {testSeries.templates && testSeries.templates.length > 0 && (
                <Card className="border-[#D5E5F2] bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-base text-[#0B192C] flex items-center gap-2">
                      <Download className="h-4 w-4 text-[#0784B5]" />
                      Prescribed Answer Sheet Template
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {testSeries.templates.map((tpl: any) => (
                      <div
                        key={tpl.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-[#D5E5F2] bg-[#F2F7FA] text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[#0B192C]">{tpl.title}</p>
                          <p className="text-[11px] text-[#4B6375]">
                            {tpl.templateRequired ? "Mandatory for this examination" : "Recommended format"}
                          </p>
                        </div>
                        {isRegistered ? (
                          <a
                            href={tpl.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#0784B5] text-white font-medium hover:bg-[#0784B5]/90 text-xs"
                          >
                            <Download className="h-3.5 w-3.5" />
                            Download Template
                          </a>
                        ) : (
                          <Badge variant="outline" className="border-[#9BD4E4] text-[#4B6375]">
                            Register to Download
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Registration Card Sidebar */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 space-y-6">
                <Card className="border-[#9BD4E4] bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base text-[#0B192C]">
                      Candidate Enrollment
                    </CardTitle>
                    <CardDescription className="text-xs text-[#4B6375]">
                      {isFree
                        ? "Free enrollment with full access to question paper and 3 evaluations."
                        : "One-time payment for complete evaluation and leaderboard ranking."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between border-b border-[#D5E5F2] pb-3">
                      <span className="text-xs text-[#4B6375]">Enrollment Fee:</span>
                      <span className="text-2xl font-extrabold text-[#0784B5]">
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

                    <div className="text-[11px] text-[#4B6375] space-y-1.5 pt-2">
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Official answer sheet template included
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Question-by-question scoring breakdown
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Up to 3 iterations per registered test
                      </p>
                      <p className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Eligible for published live leaderboard
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
