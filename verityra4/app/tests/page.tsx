import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  TestCatalogClient,
  TestCatalogItem,
} from "@/components/test-catalog-client"
import { BRAND_CONFIG } from "@/lib/brand"

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
        id: "demo-neet-ug-biology",
        title: "NEET-UG Biology & Chemistry Full-Syllabus Mock Series",
        slug: "neet-ug-biology-chemistry-mock",
        description:
          "Free full-length NTA-pattern medical entrance diagnostic test covering Human Physiology, Genetics, Organic Chemistry, and Chemical Bonding.",
        price: 0,
        maxMarks: 360,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Write structured solutions clearly within margins. Label question numbers and balance all chemical equations.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-jee-main-pcm",
        title: "JEE Main Physics & Mathematics Diagnostic Test Series",
        slug: "jee-main-physics-maths-diagnostic",
        description:
          "Step-by-step problem-solving test series covering Mechanics, Electromagnetism, Calculus, and Coordinate Geometry for JEE Main & Advanced.",
        price: 49900, // INR 499.00
        maxMarks: 300,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Show all intermediate derivations and final numerical units clearly. Maintain clean margins on both sides.",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "demo-foundation-olympiad",
        title: "Foundation (Class VIII–X) NTSE & Science Olympiad Series",
        slug: "foundation-ntse-science-olympiad",
        description:
          "Analytical aptitude, Science Olympiad, and NTSE Stage-I/II foundation series for Class VI–X CBSE, ICSE, and State Board learners.",
        price: 29900, // INR 299.00
        maxMarks: 100,
        durationMinutes: 120,
        maxAttempts: 3,
        studentInstructions:
          "Show logical reasoning steps for MAT questions and neat labeled diagrams for Science problems.",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "demo-english-grammar",
        title: "English Grammar, Comprehension & Composition Mastery Series",
        slug: "english-grammar-composition-mastery",
        description:
          "Free grammar and writing practice series covering Tenses, Clauses, Transformation of Sentences, Formal Letters, and Unseen Comprehension.",
        price: 0,
        maxMarks: 100,
        durationMinutes: 90,
        maxAttempts: 3,
        studentInstructions:
          "Write complete sentences in neat handwriting and respect word limits on composition tasks.",
        createdAt: new Date(Date.now() - 259200000).toISOString(),
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
              {BRAND_CONFIG.instituteName} · Online Test Portal
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
              Free &amp; Paid Online Test Series
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-400">
              Browse online test series for CBSE, ICSE &amp; State Board (Jr.
              KG–XII), NEET-UG, JEE (Main &amp; Advanced), NTSE &amp; Olympiads,
              UGC NET, and English Grammar — practice with structured booklets
              and 3 dedicated attempts.
            </p>
          </div>

          <TestCatalogClient testSeriesList={catalogItems} />
        </div>
      </main>
    </div>
  )
}
