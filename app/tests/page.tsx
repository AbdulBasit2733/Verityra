import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { TestCatalogClient, TestCatalogItem } from "@/components/test-catalog-client"

export const dynamic = "force-dynamic"

export default async function TestsCatalogPage() {
  const dbConnected = await isDatabaseConnected()

  let testSeriesList: any[] = []

  if (dbConnected) {
    testSeriesList = await prisma.testSeries.findMany({
      where: {
        isPublished: true,
      },
      include: {
        papers: true,
        templates: true,
      },
      orderBy: { createdAt: "desc" },
    })
  }

  // Fallback demo tests if database has not been seeded yet
  if (testSeriesList.length === 0) {
    testSeriesList = [
      {
        id: "demo-upsc-mains-1",
        title: "UPSC Civil Services General Studies Paper I Mock",
        slug: "upsc-gs-1",
        description: "Standard 20-question mock simulating real CSE Mains examination. Focus on Indian Heritage, History, Geography, and Society.",
        price: 0,
        maxMarks: 250,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions: "Write answers using black/blue ballpoint pen. Maintain margin constraints. Clearly label Question numbers.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-state-psc-essay",
        title: "State PSC Advanced Essay & Analytical Writing",
        slug: "state-psc-essay",
        description: "In-depth essay module assessing thematic depth, structural flow, coherence, and analytical rigor under 3-hour examination format.",
        price: 49900, // INR 499.00
        maxMarks: 150,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions: "Choose two themes. Word limit: 1000 words per essay. Strict presentation guidelines apply.",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "demo-judiciary-paper",
        title: "Judicial Services Criminal & Civil Law Practice Paper",
        slug: "judiciary-law-practice",
        description: "Problem-based procedural law questions evaluating case-law synthesis, factual framing, and statutory citation accuracy.",
        price: 69900, // INR 699.00
        maxMarks: 200,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions: "Handwrite precise legal solutions. Cite relevant sections of IPC/CrPC/CPC wherever applicable.",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
    ]
  }

  const catalogItems: TestCatalogItem[] = testSeriesList.map((test) => ({
    id: test.id,
    title: test.title,
    slug: test.slug || test.id,
    description: test.description || "",
    price: test.price || 0,
    maxMarks: test.maxMarks || 250,
    durationMinutes: test.durationMinutes || 180,
    maxAttempts: test.maxAttempts || 3,
    studentInstructions: test.studentInstructions || "",
    papersCount: test.papers?.length || 0,
    templatesCount: test.templates?.length || 0,
    createdAt: test.createdAt ? new Date(test.createdAt).toISOString() : new Date().toISOString(),
  }))

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0B1120]">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16 bg-slate-50/60 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-3">
            <Badge className="bg-blue-50 dark:bg-blue-950/60 text-[#2A6AED] dark:text-blue-400 border border-blue-200 dark:border-blue-900 text-xs px-3.5 py-1 font-bold">
              Official Examination Catalog
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Subjective Test Series Catalog
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Explore official examination papers, download standardized margin templates, review detailed guidelines, and practice with 3 dedicated attempts.
            </p>
          </div>

          <TestCatalogClient testSeriesList={catalogItems} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
