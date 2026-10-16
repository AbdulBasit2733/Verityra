import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminTestDocumentForms, AdminPublishToggles } from "@/components/admin-test-actions"
import { ArrowLeft, FileText, ShieldCheck, UploadCloud } from "lucide-react"
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
      {/* Flat Page Header — No Card Wrapper */}
      <div className="space-y-3">
        <Link
          href="/admin/test-series"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#2A6AED] transition-colors"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Test Series List
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={
                  testSeries.isPublished
                    ? "border-emerald-200 text-emerald-700 bg-emerald-50 text-[11px] font-semibold"
                    : "border-slate-200 text-slate-600 bg-slate-50 text-[11px] font-semibold"
                }
              >
                {testSeries.status}
              </Badge>
              {testSeries.resultsPublished && (
                <Badge className="bg-purple-600 text-white text-[11px] font-semibold border-0 px-2.5 py-0.5 rounded-lg">
                  Results Live
                </Badge>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] tracking-tight">
              {testSeries.title}
            </h1>
          </div>

          <AdminPublishToggles
            testSeriesId={testSeries.id}
            isPublished={testSeries.isPublished}
            resultsPublished={testSeries.resultsPublished}
          />
        </div>
      </div>

      {/* Flat Divided Meta Strip — Replaces 4 Individual KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-y border-slate-200 bg-slate-50/40">
        <div className="py-3.5 px-4 sm:px-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Price
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-[#2A6AED]">
            {isFree ? "FREE" : `₹${priceInRupees}`}
          </span>
        </div>
        <div className="py-3.5 px-4 sm:px-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Max Marks
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
            {testSeries.maxMarks} Marks
          </span>
        </div>
        <div className="py-3.5 px-4 sm:px-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Enrolled Candidates
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-[#2A6AED]">
            {testSeries._count?.registrations || 0}
          </span>
        </div>
        <div className="py-3.5 px-4 sm:px-5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Submissions
          </span>
          <span className="text-lg sm:text-xl font-extrabold text-emerald-600">
            {testSeries._count?.submissions || 0}
          </span>
        </div>
      </div>

      {/* Tabs for Document Uploads & Instruction Isolation */}
      <Tabs defaultValue="assets" className="space-y-6">
        <TabsList variant="line" className="border-b border-slate-200 w-full justify-start">
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

          <Separator className="bg-slate-200" />

          {/* Flat Attached Documents Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="space-y-3 md:pr-6">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Attached Question Papers ({testSeries.papers?.length || 0})
              </h3>
              {testSeries.papers?.length > 0 ? (
                <div className="divide-y divide-slate-200 border-y border-slate-200">
                  {testSeries.papers.map((p: any) => (
                    <div key={p.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-[#0F172A] block">{p.title}</span>
                        <span className="text-[11px] text-[#64748B]">Max Marks: {p.maxMarks}</span>
                      </div>
                      <a
                        href={p.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2A6AED] font-bold hover:underline shrink-0"
                      >
                        View PDF
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748B]">No question papers uploaded yet.</p>
              )}
            </div>

            <div className="space-y-3 pt-6 md:pt-0 md:pl-6">
              <h3 className="text-sm font-bold text-[#0F172A]">
                Attached Margin Templates ({testSeries.templates?.length || 0})
              </h3>
              {testSeries.templates?.length > 0 ? (
                <div className="divide-y divide-slate-200 border-y border-slate-200">
                  {testSeries.templates.map((t: any) => (
                    <div key={t.id} className="py-3 flex items-center justify-between gap-2 text-xs">
                      <div>
                        <span className="font-bold text-[#0F172A] block">{t.title}</span>
                        <span className="text-[11px] text-[#64748B]">
                          {t.templateRequired ? "Mandatory for students" : "Optional format"}
                        </span>
                      </div>
                      <a
                        href={t.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#2A6AED] font-bold hover:underline shrink-0"
                      >
                        View Template
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#64748B]">No answer templates uploaded yet.</p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-6 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="space-y-2 md:pr-6">
              <h4 className="text-xs font-bold text-[#0F172A] uppercase tracking-wider">
                Student-Facing Instructions (Public)
              </h4>
              <p className="text-xs sm:text-sm text-[#64748B] whitespace-pre-line leading-relaxed">
                {testSeries.studentInstructions}
              </p>
            </div>

            <div className="space-y-2 pt-6 md:pt-0 md:pl-6">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                Private Evaluator Instructions (Strictly Confidential)
              </h4>
              <div className="border-l-4 border-amber-500 bg-amber-50/40 pl-3.5 py-2.5">
                <p className="text-xs text-amber-950 font-mono whitespace-pre-line leading-relaxed">
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
