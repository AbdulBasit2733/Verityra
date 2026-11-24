import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import {
  TestCatalogClient,
  TestCatalogItem,
} from "@/components/test-catalog-client"
import { BRAND_CONFIG } from "@/lib/brand"

export const revalidate = 300

export default async function TestsCatalogPage() {
  let testSeriesList: any[] = []

  try {
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
          select: {
            id: true,
            title: true,
            subject: true,
            price: true,
            maxMarks: true,
            durationMinutes: true,
          },
        },
        _count: {
          select: {
            papers: true,
            templates: true,
            tests: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  } catch (error) {
    console.error("[TestsCatalogPage] Database query error, using fallback:", error)
  }

  // Comprehensive hybrid fixtures covering Class 10 (Bundle + Single Tests), Class 11, Class 12, NEET, JEE
  if (testSeriesList.length === 0) {
    testSeriesList = [
      {
        id: "demo-class-10-bundle",
        title: "Class 10 CBSE Board Complete All-Subjects Test Series (Bundle)",
        slug: "cbse-class-10-all-subjects-complete-series",
        description:
          "The complete board examination preparation bundle for Class 10th. Includes all 4 major compulsory subjects: Mathematics, Science, Social Science, and English with dedicated 3-attempt evaluations per subject.",
        price: 29900, // INR 299.00 bundle price
        bundlePrice: 29900,
        type: "BUNDLE",
        standard: "10th",
        stream: "CBSE",
        badge: "All Subjects Bundle",
        maxMarks: 320,
        durationMinutes: 720,
        maxAttempts: 3,
        testsCount: 4,
        includedSubjects: ["Mathematics", "Science", "Social Science", "English"],
        studentInstructions:
          "Solve each subject mock paper sequentially on the official answer sheet templates. Each subject carries its own independent evaluation and attempt quota.",
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo-class-10-maths",
        title: "Class 10 CBSE Mathematics Board Examination Mock",
        slug: "cbse-class-10-mathematics-mock-series",
        description:
          "Single subject full-syllabus Class 10 Board mock covering Real Numbers, Polynomials, Linear Equations, Triangles, Trigonometry, and Statistics.",
        price: 9900, // INR 99.00
        type: "SINGLE_TEST",
        standard: "10th",
        subject: "Mathematics",
        maxMarks: 80,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Write formulas clearly before substituting values. Keep clear margins on both left and right sides.",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "demo-class-10-science",
        title: "Class 10 CBSE Science Board Examination Mock",
        slug: "cbse-class-10-science-board-mock-series",
        description:
          "Single subject full-syllabus Class 10 Science subjective mock covering Chemical Reactions, Acids & Bases, Life Processes, Light, Electricity, and Magnetic Effects.",
        price: 9900, // INR 99.00
        type: "SINGLE_TEST",
        standard: "10th",
        subject: "Science",
        maxMarks: 80,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Balance all chemical equations. Draw ray diagrams and biological illustrations neatly in pencil.",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "demo-class-10-social",
        title: "Class 10 CBSE Social Science Board Examination Mock",
        slug: "cbse-class-10-social-science-mock-series",
        description:
          "Single subject full-syllabus Class 10 Social Science mock covering History (Nationalism in India), Geography, Political Science, and Economics.",
        price: 9900, // INR 99.00
        type: "SINGLE_TEST",
        standard: "10th",
        subject: "Social Science",
        maxMarks: 80,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Answer structured questions with clear headings and bullet points. Mention constitutional articles where relevant.",
        createdAt: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: "demo-class-10-english",
        title: "Class 10 CBSE English Language & Literature Mock",
        slug: "cbse-class-10-english-language-mock-series",
        description:
          "Single subject Class 10 English mock covering Reading Comprehension, Grammar & Creative Writing Skills (Formal Letter & Analytical Paragraph), and Literature.",
        price: 0, // Free sample
        type: "SINGLE_TEST",
        standard: "10th",
        subject: "English",
        maxMarks: 80,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Adhere strictly to word limits. Maintain neat cursive or print handwriting.",
        createdAt: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        id: "demo-neet-ug-biology",
        title: "NEET-UG Biology & Chemistry Full-Syllabus Mock Series",
        slug: "neet-ug-biology-chemistry-mock",
        description:
          "Free full-length NTA-pattern medical entrance diagnostic test covering Human Physiology, Genetics, Organic Chemistry, and Chemical Bonding.",
        price: 0,
        type: "SINGLE_TEST",
        standard: "NEET",
        subject: "Biology & Chemistry",
        maxMarks: 360,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Write structured solutions clearly within margins. Label question numbers and balance all chemical equations.",
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "demo-jee-main-pcm",
        title: "JEE Main Physics & Mathematics Diagnostic Test Series",
        slug: "jee-main-physics-maths-diagnostic",
        description:
          "Step-by-step problem-solving test series covering Mechanics, Electromagnetism, Calculus, and Coordinate Geometry for JEE Main & Advanced.",
        price: 49900, // INR 499.00
        type: "SINGLE_TEST",
        standard: "JEE",
        subject: "Physics & Mathematics",
        maxMarks: 300,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions:
          "Show all intermediate derivations and final numerical units clearly. Maintain clean margins on both sides.",
        createdAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        id: "demo-class-12-pcm-bundle",
        title: "Class 12 CBSE Senior Secondary Pre-Board Complete Series (Bundle)",
        slug: "cbse-class-12-pcm-complete-preboard-series",
        description:
          "Comprehensive Senior Secondary Pre-Board examination package covering Class 12 Physics, Chemistry, and Mathematics with full examiner rubrics.",
        price: 49900, // INR 499.00
        bundlePrice: 49900,
        type: "BUNDLE",
        standard: "12th",
        stream: "CBSE",
        badge: "Senior Secondary Bundle",
        maxMarks: 230,
        durationMinutes: 540,
        maxAttempts: 3,
        testsCount: 3,
        includedSubjects: ["Physics", "Chemistry", "Mathematics"],
        studentInstructions:
          "Strict 3-hour handwritten exam conditions for each paper. Submit all derivations with clear diagrams.",
        createdAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ]
  }

  const catalogItems: TestCatalogItem[] = testSeriesList.map((test) => {
    const isBundle = test.type === "BUNDLE"
    const childTests = test.tests || []
    const includedSubjects =
      test.includedSubjects ||
      (childTests.length > 0
        ? Array.from(new Set(childTests.map((t: any) => t.subject).filter(Boolean)))
        : isBundle
          ? ["Mathematics", "Science", "Social Science", "English"]
          : undefined)

    return {
      id: test.id,
      title: test.title,
      slug: test.slug || test.id,
      description: test.description || "",
      price: test.price || 0,
      bundlePrice: test.bundlePrice || test.price || 0,
      maxMarks: test.maxMarks || 250,
      durationMinutes: test.durationMinutes || 180,
      maxAttempts: test.maxAttempts || 3,
      studentInstructions: test.studentInstructions || "",
      papersCount: test._count?.papers ?? test.papers?.length ?? 0,
      templatesCount: test._count?.templates ?? test.templates?.length ?? 0,
      type: test.type || "SINGLE_TEST",
      standard: test.standard || "10th",
      subject: test.subject || (isBundle ? "All Subjects" : undefined),
      testsCount: test._count?.tests ?? childTests.length ?? test.testsCount ?? 1,
      includedSubjects,
      badge: test.badge || (isBundle ? "All-Subjects Bundle" : undefined),
      createdAt: test.createdAt
        ? new Date(test.createdAt).toISOString()
        : new Date().toISOString(),
    }
  })

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
