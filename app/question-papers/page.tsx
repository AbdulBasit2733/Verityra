import { Badge } from "@/components/ui/badge"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import {
  QuestionPaperLibrary,
  QuestionPaperItem,
} from "@/components/question-paper-library"
import { FileText } from "lucide-react"

export const revalidate = 300

export default async function QuestionPapersPage() {
  let papers: QuestionPaperItem[] = []

  if (await isDatabaseConnected()) {
    const records = await prisma.testPaper.findMany({
      where: { testSeries: { isPublished: true } },
      select: {
        id: true,
        title: true,
        fileUrl: true,
        maxMarks: true,
        testSeries: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    papers = records.map((paper) => ({
      id: paper.id,
      title: paper.title,
      fileUrl: paper.fileUrl,
      maxMarks: paper.maxMarks,
      testSeriesTitle: paper.testSeries.title,
      category: paper.testSeries.title,
    }))
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F1F6FF]">
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-[#DCE7FA] bg-gradient-to-br from-white via-[#F1F6FF] to-[#E4F0FF] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="relative mx-auto max-w-7xl">
            <Badge className="rounded-full border border-[#BFD5FA] bg-white text-[#145DEB] shadow-sm">
              <FileText data-icon="inline-start" /> Public document library
            </Badge>
            <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold tracking-tight text-[#071B3A] sm:text-5xl">
              Explore &amp; Download Question Papers
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#64748B] sm:text-lg">
              Access examination question papers across school education and
              competitive examinations. Practice, prepare, and strengthen your
              examination readiness.
            </p>
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <QuestionPaperLibrary papers={papers} />
        </section>
      </main>
    </div>
  )
}
