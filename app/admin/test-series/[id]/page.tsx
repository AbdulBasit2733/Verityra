import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { AdminPublishToggles } from "@/components/admin-test-actions"
import { AdminTestSeriesEditor } from "@/components/admin-test-series-editor"
import { AdminTestDocumentForms } from "@/components/admin-test-actions"
import { ArrowLeft, BookOpen } from "lucide-react"
import { TestSeriesStatus } from "@prisma/client"
import { normalizePrivateFileUrl } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function AdminTestSeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const dbConnected = await isDatabaseConnected()
  let testSeries: any = null

  if (dbConnected) {
    testSeries = await prisma.testSeries.findUnique({
      where: { id },
      include: { papers: true, templates: true, _count: { select: { registrations: true, submissions: true } } },
    })
  }

  if (!testSeries) {
    if (id.startsWith("dev-") || id.startsWith("demo-")) {
      testSeries = {
        id, title: "UPSC Civil Services GS I Mock (Development)", slug: "upsc-gs-1-dev",
        description: "Full mock test for CSE Mains.", price: 0, maxMarks: 250, durationMinutes: 180,
        maxAttempts: 3, status: TestSeriesStatus.PUBLISHED, isPublished: true, resultsPublished: true,
        studentInstructions: "Standard candidate instructions.", privateEvaluationInstructions: "Confidential evaluation criteria.",
        papers: [], templates: [], _count: { registrations: 12, submissions: 8 },
      }
    } else notFound()
  }

  const documents = (
    <div className="space-y-6">
      <AdminTestDocumentForms testSeriesId={testSeries.id} />
      <div className="grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 md:grid-cols-2 dark:border-slate-800">
        <DocumentList title={`Attached Question Papers (${testSeries.papers?.length || 0})`} empty="No question papers uploaded yet." items={testSeries.papers} linkLabel="View PDF" />
        <DocumentList title={`Attached Margin Templates (${testSeries.templates?.length || 0})`} empty="No answer templates uploaded yet." items={testSeries.templates} linkLabel="View Template" template />
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader icon={BookOpen} title={testSeries.title} subtitle={`Edit configuration · ${testSeries.slug} · ${testSeries.status}`} showRefresh={false}>
        <Link href="/admin/test-series"><Button variant="outline" size="sm" className="h-10 rounded-xl px-3.5 text-xs font-semibold"><ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Catalog</Button></Link>
      </PageHeader>

      <div className="flex flex-col gap-4 border border-slate-200/80 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="outline" className="text-xs font-semibold">{testSeries.status}</Badge>
          {testSeries.resultsPublished && <Badge className="bg-purple-600 text-xs font-semibold text-white">Results Live</Badge>}
        </div>
        <AdminPublishToggles testSeriesId={testSeries.id} isPublished={testSeries.isPublished} resultsPublished={testSeries.resultsPublished} />
      </div>

      <AdminTestSeriesEditor
        testSeriesId={testSeries.id}
        initialValues={{
          title: testSeries.title,
          description: testSeries.description,
          price: testSeries.price / 100,
          maxMarks: testSeries.maxMarks,
          durationMinutes: testSeries.durationMinutes,
          maxAttempts: testSeries.maxAttempts,
          studentInstructions: testSeries.studentInstructions,
          privateEvaluationInstructions: testSeries.privateEvaluationInstructions,
        }}
        documents={documents}
      />
    </div>
  )
}

function DocumentList({ title, empty, items, linkLabel, template = false }: { title: string; empty: string; items: any[]; linkLabel: string; template?: boolean }) {
  return (
    <section className="space-y-3 border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{title}</h3>
      {items?.length ? <div className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">{items.map((item: any) => <div key={item.id} className="flex items-center justify-between gap-3 py-3 text-xs"><div><span className="block font-bold text-slate-900 dark:text-slate-100">{item.title}</span><span className="text-[11px] text-slate-500">{template ? (item.templateRequired ? "Mandatory for students" : "Optional format") : `Max Marks: ${item.maxMarks}`}</span></div><a href={normalizePrivateFileUrl(item.fileUrl) || "#"} target="_blank" rel="noreferrer" className="shrink-0 font-bold text-[#2A6AED] hover:underline">{linkLabel}</a></div>)}</div> : <p className="text-xs text-slate-500">{empty}</p>}
    </section>
  )
}
