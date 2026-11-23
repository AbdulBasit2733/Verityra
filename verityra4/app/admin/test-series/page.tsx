import { prisma } from "@/lib/prisma"
import {
  AdminTestSeriesClient,
  AdminTestSeriesRow,
} from "@/components/admin/test-series/admin-test-series-client"
import {
  getSubjectsAction,
  getStandardsAction,
  getBoardsAction,
} from "@/actions/master-actions"

export const dynamic = "force-dynamic"

export default async function AdminTestSeriesPage() {
  let testSeriesList: any[] = []

  const [subjectsRes, standardsRes, boardsRes] = await Promise.all([
    getSubjectsAction({ activeOnly: true }),
    getStandardsAction({ activeOnly: true }),
    getBoardsAction({ activeOnly: true }),
  ])

  const masterSubjects = subjectsRes.success && subjectsRes.data ? subjectsRes.data.subjects : []
  const masterStandards = standardsRes.success && standardsRes.data ? standardsRes.data.standards : []
  const masterBoards = boardsRes.success && boardsRes.data ? boardsRes.data.boards : []

  try {
    testSeriesList = await prisma.testSeries.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        bundlePrice: true,
        type: true,
        standard: true,
        stream: true,
        badge: true,
        status: true,
        maxMarks: true,
        maxAttempts: true,
        createdAt: true,
        tests: {
          select: {
            subject: true,
          },
        },
        _count: {
          select: {
            registrations: true,
            submissions: true,
            papers: true,
            templates: true,
            tests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("[AdminTestSeriesPage] Database query error, using fallback:", error)
    testSeriesList = [
      {
        id: "demo-upsc-mains-1",
        title: "UPSC Civil Services General Studies Paper I Mock",
        slug: "upsc-gs-paper-1-mock",
        price: 0,
        status: "PUBLISHED",
        maxMarks: 250,
        maxAttempts: 3,
        createdAt: new Date(),
        _count: {
          registrations: 18,
          submissions: 24,
          papers: 1,
          templates: 1,
        },
      },
    ]
  }

  const rows: AdminTestSeriesRow[] = testSeriesList.map((test) => ({
    id: test.id,
    title: test.title,
    slug: test.slug || test.id,
    price: test.price || 0,
    bundlePrice: test.bundlePrice,
    type: test.type || "BUNDLE",
    standard: test.standard || null,
    stream: test.stream || null,
    badge: test.badge || null,
    status: test.status,
    maxMarks: test.maxMarks || 250,
    maxAttempts: test.maxAttempts || 3,
    registrationsCount: test._count?.registrations || 0,
    papersCount: test._count?.papers || 0,
    templatesCount: test._count?.templates || 0,
    testsCount: test._count?.tests || 0,
    subjects: Array.isArray(test.tests)
      ? Array.from(new Set(test.tests.map((t: any) => t.subject).filter(Boolean)))
      : [],
    createdAt: new Date(test.createdAt).toISOString(),
  }))

  return (
    <AdminTestSeriesClient
      testSeries={rows}
      masterSubjects={masterSubjects}
      masterStandards={masterStandards}
      masterBoards={masterBoards}
    />
  )
}
