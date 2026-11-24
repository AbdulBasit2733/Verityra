import { requireAdmin } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import {
  DEMO_QUESTION_PAPERS,
  QuestionPaperItem,
} from "@/lib/mock-question-papers"
import { AdminQuestionPapersClient } from "@/components/admin/question-papers/admin-question-papers-client"

export const dynamic = "force-dynamic"

export default async function AdminQuestionPapersPage() {
  await requireAdmin("/admin/question-papers")

  let papers: QuestionPaperItem[] = []
  const dbConnected = await isDatabaseConnected()

  if (dbConnected) {
    try {
      const records = await (prisma as any).questionPaper.findMany({
        include: {
          testSeries: {
            select: { id: true, title: true, standard: true, type: true },
          },
        },
        orderBy: { createdAt: "desc" },
      })

      if (records && records.length > 0) {
        papers = records.map((r: any) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          category: r.category,
          subject: r.subject,
          year: r.year,
          maxMarks: r.maxMarks,
          durationMinutes: r.durationMinutes,
          fileUrl: r.fileUrl,
          fileSizeBytes: r.fileSizeBytes,
          isPublished: r.isPublished,
          downloadsCount: r.downloadsCount || 0,
          testSeriesId: r.testSeriesId || null,
          testSeriesTitle: r.testSeries?.title || null,
          createdAt: r.createdAt
            ? new Date(r.createdAt).toISOString()
            : new Date().toISOString(),
          updatedAt: r.updatedAt
            ? new Date(r.updatedAt).toISOString()
            : new Date().toISOString(),
        }))
      }
    } catch (err) {
      console.error("[ADMIN QUESTION PAPERS QUERY ERROR]", err)
    }
  }

  // Use rich demo fixtures when no database records exist yet
  if (papers.length === 0) {
    papers = DEMO_QUESTION_PAPERS
  }

  return <AdminQuestionPapersClient initialPapers={papers} />
}
