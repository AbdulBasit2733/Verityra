import Link from "next/link"
import { notFound } from "next/navigation"
import {
  ArrowLeft,
  Download,
  FileText,
  Award,
  Clock,
  Calendar,
  ExternalLink,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import {
  DEMO_QUESTION_PAPERS,
  QuestionPaperItem,
} from "@/lib/mock-question-papers"

export const revalidate = 300

export default async function QuestionPaperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let paper: QuestionPaperItem | null = null

  if (await isDatabaseConnected()) {
    try {
      const record = await (prisma as any).questionPaper.findFirst({
        where: { id, isPublished: true },
      })

      if (record) {
        paper = {
          id: record.id,
          title: record.title,
          description: record.description,
          category: record.category,
          subject: record.subject,
          year: record.year,
          maxMarks: record.maxMarks,
          durationMinutes: record.durationMinutes,
          fileUrl: record.fileUrl,
          fileSizeBytes: record.fileSizeBytes,
          isPublished: record.isPublished,
          downloadsCount: record.downloadsCount || 0,
          createdAt: record.createdAt
            ? new Date(record.createdAt).toISOString()
            : new Date().toISOString(),
        }
      }
    } catch (err) {
      console.error("[QUESTION PAPER DETAIL QUERY ERROR]", err)
    }
  }

  // Fallback to demo fixture
  if (!paper) {
    const demo = DEMO_QUESTION_PAPERS.find((p) => p.id === id)
    if (demo) {
      paper = demo
    }
  }

  if (!paper) {
    notFound()
  }

  const downloadUrl = `${paper.fileUrl}${paper.fileUrl.includes("?") ? "&" : "?"}download=1`

  return (
    <div className="flex min-h-screen flex-col bg-[#F1F6FF]/60">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 lg:py-12">
        <Link
          href="/question-papers"
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "w-fit gap-1.5 text-xs font-semibold text-[#145DEB] hover:bg-white"
          )}
        >
          <ArrowLeft className="h-4 w-4" /> Back to question papers
        </Link>

        <Card className="overflow-hidden border-[#DCE7FA] bg-white shadow-sm">
          <CardHeader className="gap-4 border-b border-[#DCE7FA] bg-gradient-to-br from-white via-white to-[#F1F6FF]/40 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Badge className="rounded-full border border-[#BFD5FA]/60 bg-[#F1F6FF] text-xs font-bold tracking-wide text-[#145DEB] uppercase">
                  {paper.category}
                </Badge>
                {paper.year && (
                  <Badge
                    variant="outline"
                    className="border-slate-300 text-xs font-semibold text-slate-600"
                  >
                    <Calendar className="mr-1 h-3 w-3 text-slate-400" />{" "}
                    {paper.year} Examination
                  </Badge>
                )}
              </div>
              <Badge
                variant="secondary"
                className="border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700"
              >
                Free Download
              </Badge>
            </div>

            <CardTitle className="font-heading text-2xl leading-tight font-extrabold text-[#071B3A] sm:text-3xl">
              {paper.title}
            </CardTitle>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] sm:text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-[#071B3A]">
                <Award className="h-4 w-4 text-[#145DEB]" /> {paper.maxMarks}{" "}
                Marks
              </span>
              {paper.durationMinutes && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />{" "}
                  {paper.durationMinutes} Minutes
                </span>
              )}
              {paper.subject && (
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-slate-400" />{" "}
                  {paper.subject}
                </span>
              )}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
            {paper.description && (
              <div className="space-y-2 rounded-2xl border border-[#DCE7FA] bg-[#F1F6FF]/60 p-5">
                <h3 className="font-heading text-sm font-bold text-[#071B3A]">
                  Examination Information &amp; Syllabus Coverage
                </h3>
                <p className="text-xs leading-relaxed text-[#64748B] sm:text-sm">
                  {paper.description}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={downloadUrl}
                download
                className={cn(
                  buttonVariants(),
                  "rounded-xl bg-[#145DEB] px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0F4DC7] sm:text-sm"
                )}
              >
                <Download className="mr-2 h-4 w-4" /> Download PDF Document
              </a>

              <a
                href={paper.fileUrl}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-xl border-[#BFD5FA] px-4 py-2.5 text-xs font-semibold text-[#145DEB] hover:bg-[#F1F6FF] sm:text-sm"
                )}
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Open in New Tab
              </a>
            </div>

            {/* Embedded PDF Viewer */}
            <div className="mt-4 overflow-hidden rounded-2xl border border-[#DCE7FA] bg-slate-100 shadow-inner">
              <div className="flex items-center justify-between border-b border-[#DCE7FA] bg-slate-50 px-4 py-2.5 text-xs text-slate-500">
                <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                  <FileText className="h-3.5 w-3.5 text-[#145DEB]" /> Live
                  Document Preview
                </span>
                <span>PDF Format</span>
              </div>
              <iframe
                src={`${paper.fileUrl}#toolbar=0`}
                title={paper.title}
                className="h-[650px] w-full border-0"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
