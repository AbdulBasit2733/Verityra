import type { SeriesRecord, TestRecord } from "./test-catalog-projection"

// Offline fallback used only when the database returns nothing or is unreachable.
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600000).toISOString()

const subject = (
  id: string,
  name: string,
  price: number,
  description: string
): TestRecord => ({
  id: `demo-class-10-${id}`,
  title: `Class 10 CBSE ${name} Board Examination Mock`,
  slug: `cbse-class-10-${id}-mock`,
  subject: name,
  description,
  price,
  isStandalone: true,
  maxMarks: 80,
  durationMinutes: 180,
  maxAttempts: 3,
  isPublished: true,
  createdAt: hoursAgo(2),
})

export const DEMO_SERIES: SeriesRecord[] = [
  {
    id: "demo-class-10-bundle",
    title: "Class 10 CBSE Board Complete All-Subjects Test Series",
    slug: "cbse-class-10-all-subjects-complete-series",
    description:
      "Complete board preparation for Class 10 with Mathematics, Science, Social Science and English, each with its own 3 evaluated attempts.",
    price: 29900,
    bundlePrice: 29900,
    type: "BUNDLE",
    standard: "10th",
    stream: "CBSE",
    badge: "All Subjects",
    maxMarks: 320,
    durationMinutes: 720,
    maxAttempts: 3,
    studentInstructions:
      "Solve each subject paper on the official answer sheet template. Each subject has its own evaluation and attempt quota.",
    createdAt: hoursAgo(1),
    isPublished: true,
    tests: [
      subject("maths", "Mathematics", 9900, "Real Numbers, Polynomials, Linear Equations, Triangles, Trigonometry and Statistics."),
      subject("science", "Science", 9900, "Chemical Reactions, Acids and Bases, Life Processes, Light, Electricity and Magnetic Effects."),
      subject("social", "Social Science", 9900, "History, Geography, Political Science and Economics."),
      subject("english", "English", 0, "Reading Comprehension, Grammar, Writing Skills and Literature."),
    ],
  },
]

export const DEMO_STANDALONE_TESTS: TestRecord[] = [
  {
    id: "demo-neet-ug-biology",
    title: "NEET-UG Biology and Chemistry Full-Syllabus Mock",
    slug: "neet-ug-biology-chemistry-mock",
    subject: "Biology and Chemistry",
    description:
      "Full-length NTA-pattern diagnostic covering Human Physiology, Genetics, Organic Chemistry and Chemical Bonding.",
    price: 0,
    isStandalone: true,
    maxMarks: 360,
    durationMinutes: 180,
    maxAttempts: 3,
    isPublished: true,
    createdAt: hoursAgo(24),
  },
  {
    id: "demo-jee-main-pcm",
    title: "JEE Main Physics and Mathematics Diagnostic Test",
    slug: "jee-main-physics-maths-diagnostic",
    subject: "Physics and Mathematics",
    description:
      "Step-by-step problem solving across Mechanics, Electromagnetism, Calculus and Coordinate Geometry.",
    price: 49900,
    isStandalone: true,
    maxMarks: 300,
    durationMinutes: 180,
    maxAttempts: 3,
    isPublished: true,
    createdAt: hoursAgo(48),
  },
]
