export interface QuestionPaperItem {
  id: string
  title: string
  description?: string | null
  category: string
  subject?: string | null
  year?: number | null
  maxMarks: number
  durationMinutes?: number | null
  fileUrl: string
  fileSizeBytes?: number | null
  isPublished: boolean
  downloadsCount: number
  testSeriesId?: string | null
  testSeriesTitle?: string | null
  createdAt: string
  updatedAt?: string
}

export const EXAMINATION_STREAMS = [
  "CBSE Board",
  "ICSE / ISC Board",
  "State Board (Maharashtra)",
  "NEET-UG",
  "JEE Main",
  "JEE Advanced",
  "Foundation (Class VI–X)",
  "NTSE & Olympiads",
  "UGC NET",
  "English Grammar",
  "Primary & Pre-Primary (Jr. KG–V)",
  "General",
] as const

export const DEMO_QUESTION_PAPERS: QuestionPaperItem[] = [
  {
    id: "demo-qp-state-board-10-sci-2025",
    title: "Maharashtra State Board Class 10 — Science & Technology Part I",
    description:
      "Complete State Board Class 10 practice question paper covering Gravitation, Periodic Classification, Chemical Reactions, Refraction of Light, and Space Missions.",
    category: "State Board (Maharashtra)",
    subject: "Science & Technology",
    year: 2025,
    maxMarks: 40,
    durationMinutes: 120,
    fileUrl:
      "/api/files/download?bucket=verityra-private&file=question-papers/demo-state-board-10-sci-2025.pdf",
    fileSizeBytes: 1050000,
    isPublished: true,
    downloadsCount: 1540,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "demo-qp-cbse-10-maths-2025",
    title: "CBSE Class 10 Board Examination — Mathematics (Standard)",
    description:
      "Official CBSE Board pattern question paper with Sections A to E covering Real Numbers, Polynomials, Trigonometry, and Coordinate Geometry.",
    category: "CBSE Board",
    subject: "Mathematics",
    year: 2025,
    maxMarks: 80,
    durationMinutes: 180,
    fileUrl:
      "/api/files/download?bucket=verityra-private&file=question-papers/demo-cbse-10-maths-2025.pdf",
    fileSizeBytes: 980000,
    isPublished: true,
    downloadsCount: 1890,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "demo-qp-cbse-12-physics-2025",
    title: "CBSE Class 12 Board Examination — Physics Theoretical & Numerical",
    description:
      "Comprehensive Class 12 Senior Secondary Physics paper with Electrostatics, Current Electricity, Wave Optics, and Semiconductor Electronics.",
    category: "CBSE Board",
    subject: "Physics",
    year: 2025,
    maxMarks: 70,
    durationMinutes: 180,
    fileUrl:
      "/api/files/download?bucket=verityra-private&file=question-papers/demo-cbse-12-physics-2025.pdf",
    fileSizeBytes: 1120000,
    isPublished: true,
    downloadsCount: 1350,
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: "demo-qp-icse-10-chemistry-2025",
    title: "ICSE Class 10 Board Examination — Chemistry Science Paper 2",
    description:
      "Council for the Indian School Certificate Examinations Class 10 Chemistry paper with Periodic Properties, Metallurgy, and Organic Chemistry.",
    category: "ICSE / ISC Board",
    subject: "Chemistry",
    year: 2025,
    maxMarks: 80,
    durationMinutes: 120,
    fileUrl:
      "/api/files/download?bucket=verityra-private&file=question-papers/demo-icse-10-chemistry-2025.pdf",
    fileSizeBytes: 890000,
    isPublished: true,
    downloadsCount: 820,
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "demo-qp-neet-ug-biology-2025",
    title: "NEET UG Full Mock Diagnostic — Biology, Botany & Zoology",
    description:
      "NTA standard medical entrance diagnostic test with 100 questions covering Human Physiology, Genetics, Evolution, and Plant Biology.",
    category: "NEET-UG",
    subject: "Biology & Life Sciences",
    year: 2025,
    maxMarks: 360,
    durationMinutes: 100,
    fileUrl:
      "/api/files/download?bucket=verityra-private&file=question-papers/demo-neet-ug-biology-2025.pdf",
    fileSizeBytes: 1680000,
    isPublished: true,
    downloadsCount: 2450,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "demo-qp-jee-main-full-2025",
    title:
      "JEE Main Comprehensive All-India Test — Physics, Chemistry & Mathematics",
    description:
      "National Testing Agency pattern test covering Mechanics, Organic Reaction Mechanisms, Coordinate Geometry, and Differential Equations.",
    category: "JEE Main",
    subject: "PCM Comprehensive",
    year: 2025,
    maxMarks: 300,
    durationMinutes: 180,
    fileUrl:
      "/api/files/download?bucket=verityra-private&file=question-papers/demo-jee-main-full-2025.pdf",
    fileSizeBytes: 1950000,
    isPublished: true,
    downloadsCount: 2890,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "demo-qp-jee-adv-maths-2025",
    title: "JEE Advanced Paper 1 — Advanced Mathematics & Problem Solving",
    description:
      "IIT entrance pattern paper featuring single-correct, multi-correct, and numerical value questions in Integral Calculus and Vectors.",
    category: "JEE Advanced",
    subject: "Mathematics",
    year: 2025,
    maxMarks: 120,
    durationMinutes: 180,
    fileUrl:
      "/api/files/download?bucket=verityra-private&file=question-papers/demo-jee-adv-maths-2025.pdf",
    fileSizeBytes: 1540000,
    isPublished: true,
    downloadsCount: 1620,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "demo-qp-ntse-olympiad-2025",
    title: "NTSE & Science Olympiad Foundation — Mental Ability & STEM Paper",
    description:
      "Foundation (Class VIII–X) scholarship and Olympiad paper covering Verbal/Non-Verbal Reasoning, Physics, Chemistry, and Mathematical Puzzles.",
    category: "NTSE & Olympiads",
    subject: "MAT & Science",
    year: 2025,
    maxMarks: 100,
    durationMinutes: 120,
    fileUrl:
      "/api/files/download?bucket=verityra-private&file=question-papers/demo-ntse-olympiad-2025.pdf",
    fileSizeBytes: 1180000,
    isPublished: true,
    downloadsCount: 1190,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "demo-qp-ugc-net-paper1-2025",
    title: "UGC NET Paper I — Teaching, Research Aptitude & Logical Reasoning",
    description:
      "Complete Paper I practice set covering Teaching Aptitude, Research Methodology, Reading Comprehension, Communication, and Data Interpretation.",
    category: "UGC NET",
    subject: "Teaching & Research Aptitude",
    year: 2025,
    maxMarks: 100,
    durationMinutes: 60,
    fileUrl:
      "/api/files/download?bucket=verityra-private&file=question-papers/demo-ugc-net-paper1-2025.pdf",
    fileSizeBytes: 940000,
    isPublished: true,
    downloadsCount: 680,
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: "demo-qp-english-grammar-2025",
    title: "English Grammar & Composition Mastery — Syntax, Clauses & Writing",
    description:
      "Comprehensive grammar and academic writing paper covering Tenses, Active/Passive Voice, Direct-Indirect Speech, Clauses, and Essay Comprehension.",
    category: "English Grammar",
    subject: "Grammar & Composition",
    year: 2025,
    maxMarks: 80,
    durationMinutes: 90,
    fileUrl:
      "/api/files/download?bucket=verityra-private&file=question-papers/demo-english-grammar-2025.pdf",
    fileSizeBytes: 760000,
    isPublished: true,
    downloadsCount: 1320,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
]
