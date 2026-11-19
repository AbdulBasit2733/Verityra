import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import {
  getCurrentUser,
  getPersistedCurrentUser,
  PersistedUserLookupError,
} from "@/lib/auth-guard"
import { Badge } from "@/components/ui/badge"
import { TestRegistrationButton } from "@/components/test-registration-button"
import {
  AlertCircle,
  ArrowLeft,
  Award,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileText,
} from "lucide-react"
import { normalizePrivateFileUrl } from "@/lib/supabase"
import { PaymentStatus, RegistrationStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

export default async function TestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let user = null
  try {
    user = await getPersistedCurrentUser()
  } catch (err) {
    if (err instanceof PersistedUserLookupError) {
      user = await getCurrentUser()
    } else {
      throw err
    }
  }
  const dbConnected = await isDatabaseConnected()
  let testSeries: any = null
  let isRegistered = false

  if (dbConnected) {
    testSeries = await prisma.testSeries.findFirst({
      where: { OR: [{ id }, { slug: id }], isPublished: true },
      include: { papers: true, templates: true },
    })
    if (testSeries && user) {
      const registration = await prisma.testRegistration.findUnique({
        where: {
          userId_testSeriesId: { userId: user.id, testSeriesId: testSeries.id },
        },
        include: { payment: { select: { status: true } } },
      })
      isRegistered = Boolean(
        registration &&
        registration.status !== RegistrationStatus.CANCELLED &&
        (testSeries.price === 0 ||
          registration.payment?.status === PaymentStatus.COMPLETED)
      )
    }
  }

  if (!testSeries) {
    if (!(id.startsWith("demo-") || id.startsWith("upsc-") || id === "test-1"))
      notFound()
    testSeries = {
      id,
      title: "UPSC Civil Services General Studies Paper I Mock",
      description:
        "Full-length authentic exam paper testing Indian Heritage, Art, Culture, World History, Physical Geography, and Society under 3-hour strict handwritten conditions.",
      price: 0,
      maxMarks: 250,
      durationMinutes: 180,
      maxAttempts: 3,
      studentInstructions: `1. The Question Paper contains 20 questions in official English/Hindi format.\n2. All questions are compulsory. Questions 1 to 10 are 10-markers (150 words limit), and 11 to 20 are 15-markers (250 words limit).\n3. Answers must be written exclusively by hand using the official margin-aligned printable answer sheet template.\n4. Keep clear margins on both left and right sides. Do not write outside the prescribed answer boxes.\n5. Once complete, convert your physical handwritten pages into a clean, single PDF scan and upload it before the cutoff deadline.`,
      templates: [
        {
          id: "tpl-1",
          title: "UPSC Standard Margin Answer Sheet Template (24 Pages)",
          fileUrl: "/api/files/download?file=templates/upsc-template.pdf",
          templateRequired: true,
        },
      ],
    }
  }

  const isFree = testSeries.price === 0
  const priceInRupees = testSeries.price / 100

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-br from-secondary via-background to-primary/10">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_410px] lg:px-8 lg:py-12">
            <div className="min-w-0 lg:py-8">
              <Link
                href="/tests"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Test library
              </Link>
              <div className="mt-10 flex flex-wrap items-center gap-2">
                <Badge className="border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {isFree ? "Free access" : `₹${priceInRupees}`}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Subjective practice series
                </span>
              </div>
              <h1 className="mt-5 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                {testSeries.title}
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg">
                {testSeries.description}
              </p>
              <div className="mt-9 flex flex-wrap gap-x-8 gap-y-5 border-t border-border pt-6 text-sm">
                <div>
                  <span className="block text-xs text-muted-foreground">
                    Duration
                  </span>
                  <span className="mt-1 flex items-center gap-2 font-semibold">
                    <Clock className="h-4 w-4 text-primary" />
                    {testSeries.durationMinutes} minutes
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">
                    Maximum marks
                  </span>
                  <span className="mt-1 flex items-center gap-2 font-semibold">
                    <Award className="h-4 w-4 text-primary" />
                    {testSeries.maxMarks} marks
                  </span>
                </div>
                <div>
                  <span className="block text-xs text-muted-foreground">
                    Attempts
                  </span>
                  <span className="mt-1 flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {testSeries.maxAttempts} allowed
                  </span>
                </div>
              </div>
            </div>
            <aside className="order-first lg:fixed lg:top-1/2 lg:right-8 lg:z-20 lg:order-last lg:w-[410px] lg:-translate-y-1/2 xl:right-[max(2rem,calc((100vw-80rem)/2))]">
              <div className="max-h-[calc(100vh-2rem)] [scrollbar-width:none] overflow-y-auto rounded-md border-2 border-primary/30 bg-card p-6 shadow-sm sm:p-7 [&::-webkit-scrollbar]:hidden">
                <p className="text-xs font-semibold text-muted-foreground">
                  Enrollment
                </p>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold">Start this series</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {isFree
                        ? "Immediate access at no cost."
                        : "One-time access to the complete practice series."}
                    </p>
                  </div>
                  <span className="shrink-0 text-2xl font-bold text-primary">
                    {isFree ? "FREE" : `₹${priceInRupees}`}
                  </span>
                </div>
                <div className="mt-6">
                  <TestRegistrationButton
                    testSeriesId={testSeries.id}
                    isFree={isFree}
                    priceInRupees={priceInRupees}
                    isRegistered={isRegistered}
                    isSignedIn={!!user}
                  />
                </div>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  Secure enrollment · access after registration
                </p>
                <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
                  <p className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-chart-3" />
                    Official answer sheet template
                  </p>
                  <p className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-chart-3" />
                    Question-by-question score report
                  </p>
                  <p className="flex gap-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-chart-3" />
                    Up to {testSeries.maxAttempts} attempts
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_410px] lg:px-8 lg:py-10">
          <div className="min-w-0 rounded-md border border-border bg-card p-5 shadow-none sm:p-8">
            <section className="border-b border-border pb-10">
              <h2 className="text-2xl font-semibold tracking-tight">
                What you will practice
              </h2>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">
                Build a complete written response under realistic examination
                conditions. Follow the prescribed format and use the report
                after submission to improve future attempts.
              </p>
            </section>
            <section className="border-b border-border py-10">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-secondary text-primary">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">
                    Instructions before you begin
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Keep these guidelines open while preparing your answer
                    sheet.
                  </p>
                </div>
              </div>
              <div className="mt-6 border-l-2 border-primary/35 pl-5 text-sm leading-7 whitespace-pre-line text-foreground/80">
                {testSeries.studentInstructions}
              </div>
              <div className="mt-6 flex items-start gap-3 rounded-md border border-score-accent/30 bg-score-accent/10 px-4 py-3 text-sm">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-score-accent" />
                <p>
                  <span className="font-semibold">Attempt policy:</span> You can
                  submit up to {testSeries.maxAttempts} accepted responses. Each
                  submission is evaluated separately.
                </p>
              </div>
            </section>
            {testSeries.templates && testSeries.templates.length > 0 && (
              <section className="pt-10">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-secondary text-primary">
                    <Download className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">
                      Answer sheet template
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use the prescribed format for a consistent evaluation.
                    </p>
                  </div>
                </div>
                <div className="mt-6 divide-y divide-border border-y border-border">
                  {testSeries.templates.map((tpl: any) => {
                    const fileUrl = normalizePrivateFileUrl(tpl.fileUrl) || "#"
                    const downloadUrl = fileUrl.includes("?")
                      ? `${fileUrl}&download=1`
                      : `${fileUrl}?download=1`
                    return (
                      <div
                        key={tpl.id}
                        className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold">{tpl.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {tpl.templateRequired
                              ? "Required for this series"
                              : "Recommended format"}
                          </p>
                        </div>
                        {isRegistered ? (
                          <div className="flex items-center gap-2">
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                            >
                              <Eye className="h-3.5 w-3.5" />
                              Preview
                            </a>
                            <a
                              href={downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              download
                              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-2xs transition-colors hover:bg-hover-accent"
                            >
                              <Download className="h-3.5 w-3.5" />
                              Download
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground">
                            Available after enrollment
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>
          <div className="hidden lg:block" aria-hidden="true" />
        </div>
      </main>
    </div>
  )
}
