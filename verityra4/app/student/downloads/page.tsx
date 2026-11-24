import { requireStudent } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { normalizePrivateFileUrl } from "@/lib/supabase"
import { StudentDownloadsClient } from "@/components/student/downloads/student-downloads-client"
import type { StudentDownloadGroup } from "@/components/student/downloads/types"
import {
  DEMO_QUESTION_PAPERS,
  QuestionPaperItem,
} from "@/lib/mock-question-papers"

export const dynamic = "force-dynamic"

export default async function StudentDownloadsPage() {
  const user = await requireStudent("/student/downloads")
  let groups: StudentDownloadGroup[] = []
  let libraryPapers: QuestionPaperItem[] = []

  try {
    const [registrations, records] = await Promise.all([
      prisma.testRegistration.findMany({
        where: { userId: user.id, status: "ACTIVE" },
        orderBy: { registeredAt: "desc" },
        select: {
          testSeriesId: true,
          testSeries: {
            select: {
              id: true,
              title: true,
              papers: {
                orderBy: { title: "asc" },
                select: {
                  id: true,
                  title: true,
                  fileUrl: true,
                  version: true,
                  createdAt: true,
                },
              },
              templates: {
                orderBy: { title: "asc" },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  fileUrl: true,
                  version: true,
                  createdAt: true,
                },
              },
            },
          },
        },
      }),
      (prisma as any).questionPaper.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      }).catch((err: any) => {
        console.error("[STUDENT DOWNLOADS QP QUERY ERROR]", err)
        return []
      }),
    ])

    const seen = new Set<string>()
    groups = registrations
      .filter((r) => r.testSeries != null)
      .map((registration) => ({
        testSeriesId: registration.testSeriesId || registration.testSeries!.id,
        testTitle: registration.testSeries!.title,
        resources: [
          ...registration.testSeries!.papers.map((paper) => ({
            id: paper.id,
            type: "paper" as const,
            title: paper.title,
            fileUrl: normalizePrivateFileUrl(paper.fileUrl) || "",
            version: paper.version,
            createdAt: paper.createdAt.toISOString(),
          })),
          ...registration.testSeries!.templates.map((template) => ({
            id: template.id,
            type: "template" as const,
            title: template.title,
            description: template.description,
            fileUrl: normalizePrivateFileUrl(template.fileUrl) || "",
            version: template.version,
            createdAt: template.createdAt.toISOString(),
          })),
        ]
          .filter((resource) => resource.fileUrl && !seen.has(resource.id))
          .filter((resource) => {
            seen.add(resource.id)
            return true
          }),
      }))
      .filter((group) => group.resources.length > 0)

    if (records && records.length > 0) {
      libraryPapers = records.map((r: any) => ({
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
        createdAt: r.createdAt
          ? new Date(r.createdAt).toISOString()
          : new Date().toISOString(),
      }))
    }
  } catch (error) {
    console.error("[StudentDownloadsPage] Database query error:", error)
  }

  if (libraryPapers.length === 0) {
    libraryPapers = DEMO_QUESTION_PAPERS.filter((p) => p.isPublished)
  }

  if (libraryPapers.length > 0) {
    const libraryGroup: StudentDownloadGroup = {
      testSeriesId: "question-papers-library",
      testTitle: "Official Practice Question Papers Library",
      isQuestionPaperLibrary: true,
      resources: libraryPapers.map((qp) => ({
        id: qp.id,
        type: "question-paper" as const,
        title: qp.title,
        category: qp.category,
        maxMarks: qp.maxMarks,
        description: `${qp.category}${qp.subject ? ` · ${qp.subject}` : ""}${qp.year ? ` · ${qp.year}` : ""} · ${qp.maxMarks} Marks${qp.durationMinutes ? ` · ${qp.durationMinutes} Mins` : ""}`,
        fileUrl: qp.fileUrl,
        version: 1,
        createdAt: qp.createdAt,
      })),
    }

    groups.push(libraryGroup)
  }

  return <StudentDownloadsClient groups={groups} />
}
