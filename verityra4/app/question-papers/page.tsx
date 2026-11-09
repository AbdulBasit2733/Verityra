import { Badge } from "@/components/ui/badge"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { QuestionPaperLibrary } from "@/components/question-paper-library"
import { DEMO_QUESTION_PAPERS, QuestionPaperItem } from "@/lib/mock-question-papers"
import { FileText, Download, Award, Layers } from "lucide-react"

export const revalidate = 300

export default async function QuestionPapersPage() {
  let papers: QuestionPaperItem[] = []

  if (await isDatabaseConnected()) {
    try {
      const records = await (prisma as any).questionPaper.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      })

      if (records && records.length > 0) {
        papers = records.map((paper: any) => ({
          id: paper.id,
          title: paper.title,
          description: paper.description,
          category: paper.category,
          subject: paper.subject,
          year: paper.year,
          maxMarks: paper.maxMarks,
          durationMinutes: paper.durationMinutes,
          fileUrl: paper.fileUrl,
          fileSizeBytes: paper.fileSizeBytes,
          isPublished: paper.isPublished,
          downloadsCount: paper.downloadsCount || 0,
          createdAt: paper.createdAt ? new Date(paper.createdAt).toISOString() : new Date().toISOString(),
        }))
      }
    } catch (err) {
      console.error("[QUESTION PAPERS QUERY ERROR]", err)
    }
  }

  // Fallback demo papers if database has not been populated
  if (papers.length === 0) {
    papers = DEMO_QUESTION_PAPERS.filter((p) => p.isPublished)
  }

  const totalDownloads = papers.reduce((sum, p) => sum + (p.downloadsCount || 0), 0)
  const uniqueSubjects = new Set(papers.map((p) => p.subject).filter(Boolean)).size

  return (
    <div className="flex min-h-screen flex-col bg-[#F1F6FF]/60">
      <main className="flex-1">
        {/* Modernized Hero Header Section */}
        <section className="relative overflow-hidden border-b border-[#DCE7FA] bg-gradient-to-br from-white via-[#F1F6FF] to-[#E4F0FF] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="relative mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="rounded-full border border-[#BFD5FA] bg-white text-[#145DEB] shadow-xs px-3 py-1 text-xs font-semibold">
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Public Question Paper Repository
              </Badge>
              <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1">
                Free Instant Download
              </Badge>
            </div>

            <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 items-end gap-6">
              <div className="lg:col-span-8">
                <h1 className="font-heading text-3xl font-extrabold tracking-tight text-[#071B3A] sm:text-5xl">
                  Explore &amp; Download Question Papers
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#64748B] sm:text-base">
                  Access authentic examination question papers across school education, board examinations, and competitive exams. Practice with actual formats, inspect marking schemes, and strengthen your preparation.
                </p>
              </div>

              {/* Quick Metrics Bar */}
              <div className="lg:col-span-4 flex flex-wrap gap-4 sm:justify-end">
                <div className="flex items-center gap-3 rounded-2xl border border-[#DCE7FA] bg-white/90 px-4 py-3 shadow-xs">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F1F6FF] text-[#145DEB]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#071B3A] leading-none">{papers.length}</p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">Available Papers</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[#DCE7FA] bg-white/90 px-4 py-3 shadow-xs">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xl font-black text-[#071B3A] leading-none">{totalDownloads}+</p>
                    <p className="text-[11px] font-semibold text-slate-500 mt-1">Free Downloads</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Catalog Workspace Section */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <QuestionPaperLibrary papers={papers} />
        </section>
      </main>
    </div>
  )
}
