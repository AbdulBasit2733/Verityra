import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { TestCatalogClient } from "@/components/test-catalog-client"
import { BRAND_CONFIG } from "@/lib/brand"
import { buildCatalogItems } from "@/lib/test-catalog-projection"
import { DEMO_SERIES, DEMO_STANDALONE_TESTS } from "@/lib/test-catalog-demo"

export const revalidate = 300

const testSelect = {
  id: true,
  title: true,
  slug: true,
  subject: true,
  description: true,
  price: true,
  isStandalone: true,
  maxMarks: true,
  durationMinutes: true,
  maxAttempts: true,
  studentInstructions: true,
  createdAt: true,
} as const

export default async function TestsCatalogPage() {
  let seriesList: any[] = []
  let standaloneTests: any[] = []

  try {
    ;[seriesList, standaloneTests] = await Promise.all([
      prisma.testSeries.findMany({
        where: { isPublished: true },
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          price: true,
          bundlePrice: true,
          type: true,
          standard: true,
          stream: true,
          badge: true,
          maxMarks: true,
          durationMinutes: true,
          maxAttempts: true,
          studentInstructions: true,
          createdAt: true,
          tests: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
            select: testSelect,
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.test.findMany({
        where: { isPublished: true, testSeriesId: null },
        select: testSelect,
        orderBy: { createdAt: "desc" },
      }),
    ])
  } catch (error) {
    console.error("[TestsCatalogPage] Database query error, using fallback:", error)
  }

  if (seriesList.length === 0 && standaloneTests.length === 0) {
    seriesList = DEMO_SERIES
    standaloneTests = DEMO_STANDALONE_TESTS
  }

  const catalogItems = buildCatalogItems(seriesList, standaloneTests)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-1 bg-muted/40 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <Badge variant="secondary" className="px-3.5 py-1 text-xs font-semibold">
              {BRAND_CONFIG.instituteName} Online Test Portal
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Free and paid online test series
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Buy a complete test series or a single subject test. Browse
              CBSE, ICSE and State Board (Jr. KG to XII), NEET-UG, JEE (Main
              and Advanced), NTSE and Olympiads, UGC NET, and English Grammar,
              each with 3 dedicated attempts.
            </p>
          </div>

          <TestCatalogClient testSeriesList={catalogItems} />
        </div>
      </main>
    </div>
  )
}
