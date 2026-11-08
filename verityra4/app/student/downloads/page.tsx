import { requireStudent } from "@/lib/auth-guard"
import { isDatabaseConnected, prisma } from "@/lib/prisma"
import { normalizePrivateFileUrl } from "@/lib/supabase"
import { StudentDownloadsClient } from "@/components/student/downloads/student-downloads-client"
import type { StudentDownloadGroup } from "@/components/student/downloads/types"

export const dynamic = "force-dynamic"

export default async function StudentDownloadsPage() {
  const user = await requireStudent("/student/downloads")
  const dbConnected = await isDatabaseConnected()
  let groups: StudentDownloadGroup[] = []

  if (dbConnected) {
    const registrations = await prisma.testRegistration.findMany({
      where: { userId: user.id, status: "ACTIVE" },
      orderBy: { registeredAt: "desc" },
      select: { testSeriesId: true, testSeries: { select: { title: true, papers: { orderBy: { title: "asc" }, select: { id: true, title: true, fileUrl: true, version: true, createdAt: true } }, templates: { orderBy: { title: "asc" }, select: { id: true, title: true, description: true, fileUrl: true, version: true, createdAt: true } } } } },
    })
    const seen = new Set<string>()
    groups = registrations.map((registration) => ({ testSeriesId: registration.testSeriesId, testTitle: registration.testSeries.title, resources: [...registration.testSeries.papers.map((paper) => ({ id: paper.id, type: "paper" as const, title: paper.title, fileUrl: normalizePrivateFileUrl(paper.fileUrl) || "", version: paper.version, createdAt: paper.createdAt.toISOString() })), ...registration.testSeries.templates.map((template) => ({ id: template.id, type: "template" as const, title: template.title, description: template.description, fileUrl: normalizePrivateFileUrl(template.fileUrl) || "", version: template.version, createdAt: template.createdAt.toISOString() }))].filter((resource) => resource.fileUrl && !seen.has(resource.id)).filter((resource) => { seen.add(resource.id); return true }) })).filter((group) => group.resources.length > 0)
  }

  return <StudentDownloadsClient groups={groups} />
}
