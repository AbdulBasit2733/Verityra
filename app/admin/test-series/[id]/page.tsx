import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminTestDocumentForms, AdminPublishToggles } from "@/components/admin-test-actions"
import {
  ArrowLeft,
  BookOpen,
  Award,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Download,
  AlertCircle,
} from "lucide-react"
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
    <div className="space-y-8 max-w-5xl mx-auto">
      <Link
        href="/admin/test-series"
        className="inline-flex items-center text-xs font-medium text-[#4B6375] hover:text-[#0784B5] transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to Test Series List
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold ${
                testSeries.isPublished
                  ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                  : "border-slate-300 text-slate-700 bg-slate-50"
              }`}
            >
              {testSeries.status}
            </Badge>
            {testSeries.resultsPublished && (
              <Badge className="bg-purple-600 text-white text-[10px] border-0">
                Results Live
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-[#0B192C]">{testSeries.title}</h1>
        </div>

        <AdminPublishToggles
          testSeriesId={testSeries.id}
          isPublished={testSeries.isPublished}
          resultsPublished={testSeries.resultsPublished}
        />
      </div>

      {/* Meta Specs Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-[#D5E5F2] bg-white p-4 shadow-sm">
          <span className="text-xs text-[#4B6375] block">Price</span>
          <span className="text-lg font-bold text-[#0784B5]">
            {isFree ? "FREE" : `₹${priceInRupees}`}
          </span>
        </Card>
        <Card className="border-[#D5E5F2] bg-white p-4 shadow-sm">
          <span className="text-xs text-[#4B6375] block">Max Marks</span>
          <span className="text-lg font-bold text-[#0B192C]">{testSeries.maxMarks}</span>
        </Card>
        <Card className="border-[#D5E5F2] bg-white p-4 shadow-sm">
          <span className="text-xs text-[#4B6375] block">Enrolled Candidates</span>
          <span className="text-lg font-bold text-[#0784B5]">
            {testSeries._count?.registrations || 0}
          </span>
        </Card>
        <Card className="border-[#D5E5F2] bg-white p-4 shadow-sm">
          <span className="text-xs text-[#4B6375] block">Submissions Received</span>
          <span className="text-lg font-bold text-emerald-600">
            {testSeries._count?.submissions || 0}
          </span>
        </Card>
      </div>

      {/* Upload Question Paper and Answer Template forms */}
      <AdminTestDocumentForms testSeriesId={testSeries.id} />

      {/* Uploaded Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-[#D5E5F2] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#0B192C]">
              Attached Papers ({testSeries.papers?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {testSeries.papers?.length > 0 ? (
              testSeries.papers.map((p: any) => (
                <div key={p.id} className="p-3 rounded-lg border border-[#D5E5F2] bg-[#F2F7FA] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0B192C]">{p.title}</span>
                    <a
                      href={p.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0784B5] font-medium hover:underline text-[11px]"
                    >
                      View File
                    </a>
                  </div>
                  <p className="text-[11px] text-[#4B6375]">Max Marks: {p.maxMarks}</p>
                </div>
              ))
            ) : (
              <p className="text-[#4B6375]">No question papers uploaded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#D5E5F2] bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-[#0B192C]">
              Attached Templates ({testSeries.templates?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            {testSeries.templates?.length > 0 ? (
              testSeries.templates.map((t: any) => (
                <div key={t.id} className="p-3 rounded-lg border border-[#D5E5F2] bg-[#F2F7FA] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0B192C]">{t.title}</span>
                    <a
                      href={t.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#0784B5] font-medium hover:underline text-[11px]"
                    >
                      View File
                    </a>
                  </div>
                  <p className="text-[11px] text-[#4B6375]">
                    {t.templateRequired ? "Mandatory for students" : "Optional format"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[#4B6375]">No answer templates uploaded yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Two Instruction Systems Review */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-[#0B192C]">Instructions Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-[#D5E5F2] bg-white shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-[#0B192C]">
                Student-Facing Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-[#4B6375] whitespace-pre-line leading-relaxed">
              {testSeries.studentInstructions}
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-700" />
                Private Evaluator Instructions (Confidential)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-amber-900 font-mono whitespace-pre-line leading-relaxed">
              {testSeries.privateEvaluationInstructions}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
