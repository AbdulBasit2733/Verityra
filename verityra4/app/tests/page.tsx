import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  TestCatalogClient,
  TestCatalogItem,
} from "@/components/test-catalog-client"

export const revalidate = 300

export default async function TestsCatalogPage() {
  const dbConnected = await isDatabaseConnected()

  let testSeriesList: any[] = []

  if (dbConnected) {
    testSeriesList = await prisma.testSeries.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        price: true,
        maxMarks: true,
        durationMinutes: true,
        maxAttempts: true,
        studentInstructions: true,
        createdAt: true,
        _count: {
          select: {
            papers: true,
            templates: true,
          },
        },
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
        description:
          "Standard 20-question mock simulating real CSE Mains examination. Focus on Indian Heritage, History, Geography, and Society.",
        price: 0,
        maxMarks: 250,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Write answers using black/blue ballpoint pen. Maintain margin constraints. Clearly label Question numbers.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-state-psc-essay",
        title: "State PSC Advanced Essay & Analytical Writing",
        slug: "state-psc-essay",
        description:
          "In-depth essay module assessing thematic depth, structural flow, coherence, and analytical rigor under 3-hour examination format.",
        price: 49900, // INR 499.00
        maxMarks: 150,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Choose two themes. Word limit: 1000 words per essay. Strict presentation guidelines apply.",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "demo-judiciary-paper",
        title: "Judicial Services Criminal & Civil Law Practice Paper",
        slug: "judiciary-law-practice",
        description:
          "Problem-based procedural law questions evaluating case-law synthesis, factual framing, and statutory citation accuracy.",
        price: 69900, // INR 699.00
        maxMarks: 200,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Handwrite precise legal solutions. Cite relevant sections of IPC/CrPC/CPC wherever applicable.",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "demo-class-10-maths",
        title: "Class 10 CBSE Mathematics Board Examination Mock Series",
        slug: "cbse-class-10-mathematics-mock-series",
        description:
          "Comprehensive Class 10 Board mock examination covering Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Triangles, Trigonometry, and Statistics.",
        price: 0,
        maxMarks: 80,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Write formulas clearly before substituting values. Keep clear margins on both left and right sides.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-class-10-science",
        title: "Class 10 CBSE Science Board Examination Mock Series",
        slug: "cbse-class-10-science-board-mock-series",
        description:
          "Rigorous full-length Class 10 Science subjective mock covering Chemical Reactions, Acids & Bases, Life Processes, Light, Electricity, and Magnetic Effects.",
        price: 0,
        maxMarks: 80,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Balance all chemical equations. Draw ray diagrams and biological illustrations neatly in pencil.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-class-11-maths",
        title: "Class 11 CBSE Mathematics & Calculus Foundation Series",
        slug: "cbse-class-11-mathematics-mastery-series",
        description:
          "In-depth diagnostic examination for Class 11 Mathematics covering Sets, Functions, Trigonometry, Complex Numbers, Conic Sections, and Limits & Derivatives.",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Show all domain and range restrictions. State standard trigonometric identities in brackets.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-class-12-maths",
        title: "Class 12 CBSE Mathematics Pre-Board Mock Examination Series",
        slug: "cbse-class-12-mathematics-preboard-series",
        description:
          "Senior secondary board preparatory series covering Relations & Functions, Matrices, Determinants, Calculus, Integrals, Vectors & 3D Geometry, and Probability.",
        price: 39900,
        maxMarks: 80,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Calculators are strictly prohibited. In Integration, constant of integration C must be explicitly stated.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-class-12-physics",
        title: "Class 12 CBSE Physics Pre-Board Mock Examination Series",
        slug: "cbse-class-12-physics-preboard-series",
        description:
          "Board-standard 70-mark theoretical and analytical mock covering Electrostatics, Current Electricity, Magnetism, Optics, and Semiconductor Electronics.",
        price: 39900,
        maxMarks: 70,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Derivations must begin with a clear diagram. Numerical answers must contain unit conversions and final units.",
        createdAt: new Date().toISOString(),
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
    papersCount: test._count?.papers ?? test.papers?.length ?? 0,
    templatesCount: test._count?.templates ?? test.templates?.length ?? 0,
    createdAt: test.createdAt
      ? new Date(test.createdAt).toISOString()
      : new Date().toISOString(),
  }))

  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-[#0B1120]">
      <main className="flex-1 bg-slate-50/60 py-12 lg:py-16 dark:bg-slate-950/40">
        <div className="mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <Badge className="border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-[#2A6AED] dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-400">
              Official Examination Catalog
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
              Subjective Test Series Catalog
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Explore official examination papers, download standardized margin
              templates, review detailed guidelines, and practice with 3
              dedicated attempts.
            </p>
          </div>

          <TestCatalogClient testSeriesList={catalogItems} />
        </div>
      </main>
    </div>
  )
}
