import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { requireStudent } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  UploadCloud,
  FileText,
  AlertCircle,
  TrendingUp,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StudentDashboardPage() {
  const user = await requireStudent("/student/dashboard")
  const dbConnected = await isDatabaseConnected()

  let registrations: any[] = []
  let submissions: any[] = []

  if (dbConnected) {
    registrations = await prisma.testRegistration.findMany({
      where: { userId: user.id },
      include: {
        testSeries: {
          include: {
            papers: true,
            templates: true,
          },
        },
        submissions: {
          include: {
            evaluation: true,
          },
          orderBy: { attemptNumber: "desc" },
        },
      },
      orderBy: { registeredAt: "desc" },
    })

    submissions = await prisma.submission.findMany({
      where: { userId: user.id },
      include: {
        testSeries: true,
        evaluation: true,
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    })
  }

  // Fallback demo records if DB is not yet running
  if (registrations.length === 0) {
    registrations = [
      {
        id: "demo-reg-1",
        testSeriesId: "demo-upsc-mains-1",
        attemptsUsed: 1,
        maxAttempts: 3,
        registeredAt: new Date(),
        testSeries: {
          id: "demo-upsc-mains-1",
          title: "UPSC Civil Services General Studies Paper I Mock",
          maxMarks: 250,
          durationMinutes: 180,
          resultsPublished: true,
        },
        submissions: [
          {
            id: "demo-sub-1",
            attemptNumber: 1,
            status: "COMPLETED",
            submittedAt: new Date(Date.now() - 86400000),
            evaluation: {
              totalMarksAwarded: 182.5,
              maxMarks: 250,
              percentage: 73.0,
              generalFeedback: "Solid structural articulation and relevant constitutional citations. Diagrammatic presentation can be refined.",
            },
          },
        ],
      },
    ]
  }

  const totalRegistered = registrations.length
  const totalAttemptsUsed = registrations.reduce((acc, r) => acc + r.attemptsUsed, 0)
  const totalAttemptsRemaining = registrations.reduce((acc, r) => acc + (r.maxAttempts - r.attemptsUsed), 0)

  return (
    <div className="flex min-h-screen flex-col bg-[#F2F7FA]">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">
                Candidate Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-[#4B6375] mt-1">
                Welcome back, <span className="font-semibold text-[#0784B5]">{user.name || "Candidate"}</span>. Monitor your test series and attempt allowances.
              </p>
            </div>
            <Link href="/tests">
              <Button className="bg-[#0784B5] hover:bg-[#0784B5]/90 text-white text-xs font-semibold">
                <BookOpen className="mr-1.5 h-4 w-4" />
                Browse More Tests
              </Button>
            </Link>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Card className="border-[#D5E5F2] bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-[#4B6375]">Registered Test Series</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#0784B5]">{totalRegistered}</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-[#4B6375]">
                Active practice examination enrollments
              </CardContent>
            </Card>

            <Card className="border-[#D5E5F2] bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-[#4B6375]">Attempts Utilized</CardDescription>
                <CardTitle className="text-2xl font-bold text-[#0B192C]">{totalAttemptsUsed}</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-[#4B6375]">
                Handwritten answer sheets evaluated
              </CardContent>
            </Card>

            <Card className="border-[#D5E5F2] bg-white shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs text-[#4B6375]">Attempts Remaining</CardDescription>
                <CardTitle className="text-2xl font-bold text-emerald-600">{totalAttemptsRemaining}</CardTitle>
              </CardHeader>
              <CardContent className="text-[11px] text-[#4B6375]">
                Available submissions across tests
              </CardContent>
            </Card>
          </div>

          {/* Registered Test Series List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0B192C]">My Registered Test Series</h2>

            {registrations.length === 0 ? (
              <Card className="border-[#D5E5F2] bg-white p-8 text-center">
                <BookOpen className="h-10 w-10 text-[#0784B5] mx-auto mb-3 opacity-60" />
                <h3 className="font-semibold text-sm text-[#0B192C]">No tests registered yet</h3>
                <p className="text-xs text-[#4B6375] mt-1 mb-4">
                  Enroll in a free or paid mock test to access templates and start submitting handwritten answers.
                </p>
                <Link href="/tests">
                  <Button className="bg-[#0784B5] text-white text-xs">Explore Test Series</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registrations.map((reg) => {
                  const attemptsLeft = reg.maxAttempts - reg.attemptsUsed
                  const latestSub = reg.submissions?.[0]
                  const latestEval = latestSub?.evaluation

                  return (
                    <Card key={reg.id} className="border-[#D5E5F2] bg-white shadow-sm flex flex-col justify-between">
                      <CardHeader>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-semibold ${
                              attemptsLeft > 0
                                ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                                : "border-red-300 text-red-700 bg-red-50"
                            }`}
                          >
                            {reg.attemptsUsed} / {reg.maxAttempts} Attempts Used
                          </Badge>
                          <span className="text-[11px] text-[#4B6375]">
                            Max Marks: {reg.testSeries.maxMarks}
                          </span>
                        </div>
                        <CardTitle className="text-base text-[#0B192C] line-clamp-1">
                          {reg.testSeries.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-3 pt-0 text-xs">
                        {latestEval ? (
                          <div className="p-3 rounded-lg bg-[#CADEEF]/30 border border-[#9BD4E4] space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-[#4B6375]">Latest Score:</span>
                              <span className="font-bold text-[#0784B5]">
                                {latestEval.totalMarksAwarded} / {latestEval.maxMarks} ({latestEval.percentage}%)
                              </span>
                            </div>
                            <p className="text-[11px] text-[#4B6375] line-clamp-2 italic">
                              &ldquo;{latestEval.generalFeedback}&rdquo;
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 rounded-lg bg-[#F2F7FA] border border-[#D5E5F2] text-[#4B6375] text-[11px]">
                            {reg.attemptsUsed === 0
                              ? "No submissions made yet. Download template and submit your first attempt."
                              : "Evaluation in progress."}
                          </div>
                        )}
                      </CardContent>

                      <div className="px-6 pb-6 pt-0">
                        <Link href={`/student/tests/${reg.testSeriesId}`} className="w-full">
                          <Button className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white text-xs font-semibold">
                            Open Workspace & Submissions
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
