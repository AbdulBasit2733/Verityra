import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminTestDocumentForms, AdminPublishToggles } from "@/components/admin-test-actions"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { ArrowLeft, Award, BookOpen, CreditCard, FileCheck2, FileText, ShieldCheck, UploadCloud, Users } from "lucide-react"
import { TestSeriesStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

export default async function AdminTestSeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const dbConnected = await isDatabaseConnected()

  let testSeries: any = null

  if (dbConnected) {
    testSeries = await prisma.testSeries.findUnique({
      where: { id },
      include: {
        papers: true,
        templates: true,
        _count: {
          select: {
            registrations: true,
            submissions: true,
          },
        },
      },
    })
  }

  if (!testSeries) {
    if (id.startsWith("dev-") || id.startsWith("demo-")) {
      testSeries = {
        id,
        title: "UPSC Civil Services GS I Mock (Development)",
        slug: "upsc-gs-1-dev",
        description: "Full mock test for CSE Mains.",
        price: 0,
        maxMarks: 250,
        durationMinutes: 180,
        maxAttempts: 3,
        status: TestSeriesStatus.PUBLISHED,
        isPublished: true,
        resultsPublished: true,
        studentInstructions: "Standard candidate instructions.",
        privateEvaluationInstructions: "Confidential evaluation criteria.",
        papers: [],
        templates: [],
        _count: { registrations: 12, submissions: 8 },
      }
    } else {
      notFound()
    }
  }

  const isFree = testSeries.price === 0
  const priceInRupees = testSeries.price / 100

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Page Header */}
      <PageHeader
        icon={BookOpen}
        title={testSeries.title}
        subtitle={`Viewing: ${testSeries.slug} · Status: ${testSeries.status}`}
        showRefresh={false}
      >
        <Link href="/admin/test-series">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Catalog
          </Button>
        </Link>
      </PageHeader>

      {/* Publication Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge
            variant="outline"
            className={
              testSeries.isPublished
                ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-xs font-semibold rounded-full"
                : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 text-xs font-semibold rounded-full"
            }
          >
            {testSeries.status}
          </Badge>
          {testSeries.resultsPublished && (
            <Badge className="bg-purple-600 text-white text-xs font-semibold border-0 px-3 py-1 rounded-full shadow-2xs">
              Results Live
            </Badge>
          )}
        </div>

        <AdminPublishToggles
          testSeriesId={testSeries.id}
          isPublished={testSeries.isPublished}
          resultsPublished={testSeries.resultsPublished}
        />
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          label="Registration Fee"
          value={isFree ? "FREE" : `₹${priceInRupees}`}
          subtext="Enrollment price tier"
          icon={CreditCard}
          variant="blue"
        />
        <KpiStatCard
          label="Maximum Marks"
          value={`${testSeries.maxMarks} Marks`}
          subtext="Total syllabus weightage"
          icon={Award}
          variant="indigo"
        />
        <KpiStatCard
          label="Enrolled Aspirants"
          value={testSeries._count?.registrations || 0}
          subtext="Active student registrations"
          icon={Users}
          variant="emerald"
        />
        <KpiStatCard
          label="Answer Sheets"
          value={testSeries._count?.submissions || 0}
          subtext="Submitted attempts for review"
          icon={FileCheck2}
          variant="amber"
        />
      </div>

      {/* Tabs for Document Uploads & Instruction Isolation */}
      <Tabs defaultValue="assets" className="space-y-6">
        <TabsList variant="line" className="border-b border-slate-200 dark:border-slate-800 w-full justify-start">
          <TabsTrigger value="assets" className="text-xs sm:text-sm font-semibold px-4 py-2">
            <UploadCloud className="h-3.5 w-3.5 mr-1.5" />
            Question Papers & Margin Templates
          </TabsTrigger>
          <TabsTrigger value="instructions" className="text-xs sm:text-sm font-semibold px-4 py-2">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Isolated Instructions Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets" className="space-y-6 pt-1">
          <AdminTestDocumentForms testSeriesId={testSeries.id} />

          <Separator className="bg-slate-200 dark:bg-slate-800" />

          {/* Attached Documents Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Attached Question Papers ({testSeries.papers?.length || 0})
              </h3>
              {testSeries.papers?.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-1">
                  {testSeries.papers.map((p: any) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{p.title}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">Max Marks: {p.maxMarks}</span>
                      </div>
                      <a
                        href={p.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2A6AED] dark:text-blue-400 font-bold hover:underline shrink-0"
                      >
                        View PDF
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No question papers uploaded yet.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Attached Margin Templates ({testSeries.templates?.length || 0})
              </h3>
              {testSeries.templates?.length > 0 ? (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 pt-1">
                  {testSeries.templates.map((t: any) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-slate-100 block">{t.title}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {t.templateRequired ? "Mandatory for students" : "Optional format"}
                        </span>
                      </div>
                      <a
                        href={t.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2A6AED] dark:text-blue-400 font-bold hover:underline shrink-0"
                      >
                        View Template
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No answer templates uploaded yet.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-6 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Student-Facing Instructions (Public)
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                {testSeries.studentInstructions}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/30 p-5 shadow-xs space-y-2">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-amber-700 dark:text-amber-400 shrink-0" />
                Private Evaluator Instructions (Strictly Confidential)
              </h4>
              <div className="border-l-4 border-amber-500 pl-3.5 py-1">
                <p className="text-xs text-amber-950 dark:text-amber-200 font-mono whitespace-pre-line leading-relaxed">
                  {testSeries.privateEvaluationInstructions}
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
