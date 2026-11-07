import { prisma, isDatabaseConnected } from "@/lib/prisma"
import {
  AdminTestSeriesClient,
  AdminTestSeriesRow,
} from "@/components/admin/test-series/admin-test-series-client"

export const dynamic = "force-dynamic"

export default async function AdminTestSeriesPage() {
  const dbConnected = await isDatabaseConnected()

  let testSeriesList: any[] = []

  if (dbConnected) {
    testSeriesList = await prisma.testSeries.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        status: true,
        maxMarks: true,
        maxAttempts: true,
        createdAt: true,
        _count: {
          select: {
            registrations: true,
            submissions: true,
            papers: true,
            templates: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } else {
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
    status: test.status,
    maxMarks: test.maxMarks || 250,
    maxAttempts: test.maxAttempts || 3,
    registrationsCount: test._count?.registrations || 0,
    papersCount: test._count?.papers || 0,
    templatesCount: test._count?.templates || 0,
    createdAt: new Date(test.createdAt).toISOString(),
  }))

  return <AdminTestSeriesClient testSeries={rows} />
}
