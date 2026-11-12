import {
  PrismaClient,
  Role,
  UserStatus,
  TestSeriesStatus,
} from "@prisma/client"
import bcrypt from "bcryptjs"
import fs from "fs"
import path from "path"

function loadLocalEnv() {
  const envPath = path.resolve(process.cwd(), ".env")
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n")
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eqIdx = trimmed.indexOf("=")
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim()
        let val = trimmed.slice(eqIdx + 1).trim()
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1)
        }
        if (!process.env[key]) {
          process.env[key] = val
        }
      }
    }
  }
}

loadLocalEnv()

const prisma = new PrismaClient()

interface TestSeriesSeedData {
  title: string
  slug: string
  description: string
  price: number // in paise
  maxMarks: number
  durationMinutes: number
  maxAttempts: number
  status: TestSeriesStatus
  isPublished: boolean
  resultsPublished: boolean
  studentInstructions: string
  privateEvaluationInstructions: string
  paper: {
    title: string
    fileUrl: string
    maxMarks: number
    rubricContent: string
  }
  template: {
    title: string
    fileUrl: string
    templateRequired: boolean
    description: string
  }
}

const academicTestSeries: TestSeriesSeedData[] = [
  // 1. 10th Mathematics
  {
    title: "Class 10 CBSE Mathematics Board Examination Mock Series",
    slug: "cbse-class-10-mathematics-mock-series",
    description:
      "Comprehensive Class 10 Board mock examination covering Real Numbers, Polynomials, Linear Equations, Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, Trigonometry, and Statistics with step-by-step subjective marking.",
    price: 0,
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions: `1. The Question Paper consists of 38 questions divided into 5 Sections: A, B, C, D, and E.\n2. Section A comprises 20 MCQs (1 mark each). Section B has 5 Very Short Answer (VSA) questions (2 marks each).\n3. Section C has 6 Short Answer (SA) questions (3 marks each). Section D has 4 Long Answer (LA) questions (5 marks each).\n4. Section E comprises 3 source-based/case-based integrated units of assessment (4 marks each) with sub-parts.\n5. All steps of calculation and geometric constructions must be clearly shown. Write formulas before substituting values.\n6. Answers must be handwritten on the provided margin-ruled answer sheet template and uploaded as a single clean PDF.`,
    privateEvaluationInstructions: `CONFIDENTIAL EVALUATION RUBRIC - CLASS 10 MATHEMATICS:\n- Step-by-step marking must be strictly enforced. Do not award full marks for direct answers without derivation/working steps.\n- Formula identification: Award 0.5 to 1 mark for correct formula formulation.\n- Calculation and simplification: Deduct 0.5 marks for minor arithmetic slips if method is mathematically sound.\n- Geometry/Constructions: Deduct 1 mark if key construction arcs or labeling are omitted.\n- Case Study Units (Section E): Award marks independently for sub-parts; partial credit must be given for correct logical reasoning.`,
    paper: {
      title: "Class 10 Mathematics Board Standard Mock Question Paper",
      fileUrl: "/api/files/download?file=papers/class-10-mathematics-paper.pdf",
      maxMarks: 80,
      rubricContent:
        "CBSE Standard Marking Scheme: Real Numbers (6m), Algebra (20m), Coordinate Geometry (6m), Geometry (15m), Trigonometry (12m), Mensuration (10m), Statistics & Probability (11m).",
    },
    template: {
      title: "Class 10 Board 32-Page Ruled Answer Sheet Booklet Template",
      fileUrl: "/api/files/download?file=templates/class-10-maths-template.pdf",
      templateRequired: true,
      description:
        "Standard 32-page ruled answer booklet with left/right margin constraints and dedicated rough work margin.",
    },
  },
  // 2. 10th Science
  {
    title: "Class 10 CBSE Science Board Examination Mock Series",
    slug: "cbse-class-10-science-board-mock-series",
    description:
      "Rigorous full-length Class 10 Science subjective mock covering Chemical Reactions, Acids & Bases, Metals & Non-metals, Carbon Compounds, Life Processes, Control & Coordination, Heredity, Light, Human Eye, Electricity, and Magnetic Effects.",
    price: 0,
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions: `1. The Question Paper consists of 39 questions in 5 sections: Section A (20 MCQs), Section B (6 VSA, 2 marks each), Section C (7 SA, 3 marks each), Section D (3 LA, 5 marks each), and Section E (3 Case-based units, 4 marks each).\n2. All chemical equations must be balanced with physical states indicated where applicable.\n3. Ray diagrams and biological illustrations must be drawn neatly in pencil with clear labeling.\n4. Numerical questions in Electricity and Light must specify S.I. units in the final answer.\n5. Upload completed handwritten answer booklet as a single legible PDF before the submission cutoff.`,
    privateEvaluationInstructions: `CONFIDENTIAL EVALUATION RUBRIC - CLASS 10 SCIENCE:\n- Chemistry: Balanced equations carry 1 full mark. Deduct 0.5 marks if equation is unbalanced or wrong product formula is written.\n- Biology: Labeled diagrams carry 50% of the question marks. Deduct 0.5 to 1 mark for missing arrows or unlabeled functional parts.\n- Physics: Numerical problems require Formula (1m) + Substitution (1m) + Final Answer with correct SI Unit (1m).\n- Conceptual reasoning: Focus on key scientific terminology.`,
    paper: {
      title: "Class 10 Science Board Examination Question Paper",
      fileUrl: "/api/files/download?file=papers/class-10-science-paper.pdf",
      maxMarks: 80,
      rubricContent:
        "Chemical Substances (25m), World of Living (25m), Natural Phenomena (12m), Effects of Current (13m), Natural Resources (5m). Total: 80 Marks.",
    },
    template: {
      title: "Class 10 Science 32-Page Margin-Constrained Answer Booklet",
      fileUrl:
        "/api/files/download?file=templates/class-10-science-template.pdf",
      templateRequired: true,
      description:
        "Official 32-page booklet format with diagram framing grids.",
    },
  },
  // 3. 11th Mathematics
  {
    title: "Class 11 CBSE Mathematics Annual Examination Series",
    slug: "cbse-class-11-mathematics-annual-series",
    description:
      "Advanced Class 11 Mathematics subjective test paper covering Sets & Functions, Trigonometric Functions, Complex Numbers, Linear Inequalities, Permutations & Combinations, Binomial Theorem, Sequences & Series, Straight Lines, Conic Sections, Limits & Derivatives, and Statistics.",
    price: 49900,
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions: `1. Question Paper has 38 questions across Sections A to E.\n2. Internal choices provided in 2 questions of Section B, 2 of Section C, and 2 of Section D.\n3. Show complete algebraic manipulation and trigonometric transformation steps.\n4. Rough calculations must stay strictly in the designated margin.\n5. Upload completed handwritten answer sheet booklet as a PDF.`,
    privateEvaluationInstructions: `CONFIDENTIAL EVALUATION RUBRIC - CLASS 11 MATHEMATICS:\n- Calculus: Derivative calculations must show first principles or clear application of product/quotient/chain rule.\n- Conic Sections: Correct standard equation formulation (1 mark), finding foci/vertices/eccentricity (1.5 marks), sketch (0.5 mark).\n- Complex numbers: Modulus-amplitude form conversion must show quadrant check for argument principal value.\n- Permutations/Combinations: Deduct 1 mark if reasoning behind nPr vs nCr selection is absent.`,
    paper: {
      title: "Class 11 Mathematics Annual Mock Examination Paper",
      fileUrl: "/api/files/download?file=papers/class-11-mathematics-paper.pdf",
      maxMarks: 80,
      rubricContent:
        "Sets & Functions (23m), Algebra (25m), Coordinate Geometry (12m), Calculus (8m), Statistics & Probability (12m). Total: 80 Marks.",
    },
    template: {
      title: "Senior Secondary Ruled 32-Page Answer Booklet",
      fileUrl: "/api/files/download?file=templates/class-11-maths-template.pdf",
      templateRequired: true,
      description:
        "Standard 32-page senior secondary answer booklet with numbered margins.",
    },
  },
  // 4. 12th Mathematics
  {
    title: "Class 12 CBSE Mathematics All-India Board Mock Series",
    slug: "cbse-class-12-mathematics-board-mock-series",
    description:
      "Full Board syllabus simulation covering Relations & Functions, Inverse Trigonometric Functions, Matrices, Determinants, Continuity & Differentiability, Applications of Derivatives, Integrals, Differential Equations, Vector Algebra, Three-Dimensional Geometry, Linear Programming, and Probability.",
    price: 59900,
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions: `1. 38 questions divided into 5 Sections (A: 20 MCQs, B: 5 VSA, C: 6 SA, D: 4 LA, E: 3 Case Studies).\n2. Write clear integration constants (+ C) for indefinite integrals.\n3. LPP questions must clearly show corner point coordinates and feasible region shading.\n4. Vectors & 3D Geometry require correct vector notation (arrows or bold letters).\n5. Upload completed handwritten booklet as single high-contrast PDF.`,
    privateEvaluationInstructions: `CONFIDENTIAL EVALUATION RUBRIC - CLASS 12 MATHEMATICS:\n- Integrals: Omission of constant of integration (+ C) results in a mandatory 0.5 mark deduction per question.\n- Matrix Inversion / Linear Systems: Row/column operation method must maintain row equivalence throughout.\n- Differential Equations: Separation of variables (1m), Integrating Factor identification (1.5m), General Solution (1.5m).\n- Linear Programming: Feasible region must be properly shaded with corner points labeled. Deduction of 1 mark if boundedness test is omitted.`,
    paper: {
      title: "Class 12 Mathematics CBSE Board Examination Paper",
      fileUrl: "/api/files/download?file=papers/class-12-mathematics-paper.pdf",
      maxMarks: 80,
      rubricContent:
        "Relations & Functions (8m), Algebra (10m), Calculus (35m), Vectors & 3D Geometry (14m), Linear Programming (5m), Probability (8m). Total: 80 Marks.",
    },
    template: {
      title: "Class 12 Board 32-Page Ruled Answer Sheet Booklet with LPP Graph",
      fileUrl: "/api/files/download?file=templates/class-12-maths-template.pdf",
      templateRequired: true,
      description:
        "32-page official board format including embedded 1mm square graph sheet for LPP questions.",
    },
  },
  // 5. 12th Physics
  {
    title: "Class 12 CBSE Physics All-India Board Mock Series",
    slug: "cbse-class-12-physics-board-mock-series",
    description:
      "National standard Class 12 Physics mock covering Electrostatics, Current Electricity, Magnetic Effects of Current & Magnetism, Electromagnetic Induction & AC, Electromagnetic Waves, Optics, Dual Nature of Radiation & Matter, Atoms & Nuclei, and Electronic Devices.",
    price: 59900,
    maxMarks: 70,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions: `1. Question Paper has 33 questions in 5 Sections: A (16 MCQs/Assertion-Reason, 1m each), B (5 SA, 2m each), C (7 SA, 3m each), D (2 Case Studies, 4m each), E (3 LA, 5m each).\n2. You may use standard physical constants given on Page 1.\n3. Circuit diagrams and Ray diagrams must be neatly labeled with arrows indicating current/ray direction.\n4. Numerical problems must show formula, substitution, calculation, and final answer with correct units.\n5. Upload handwritten answer sheet as PDF.`,
    privateEvaluationInstructions: `CONFIDENTIAL EVALUATION RUBRIC - CLASS 12 PHYSICS:\n- Ray Optics: Mandatory deduction of 0.5 marks per diagram if arrow heads indicating light propagation direction are missing.\n- Circuit Diagrams: Must clearly show battery polarities (+ / -) and conventional current arrows.\n- Numerical accuracy: Formula (0.5m), Substitution with values (1m), Unit conversion (0.5m), Result with correct SI Unit (1m).\n- Semiconductors: Energy band diagrams must show valence band, conduction band, and donor/acceptor energy levels.`,
    paper: {
      title: "Class 12 Physics CBSE Board Standard Mock Paper",
      fileUrl: "/api/files/download?file=papers/class-12-physics-paper.pdf",
      maxMarks: 70,
      rubricContent:
        "Electrostatics & Current Electricity (16m), Magnetic Effects & EMI/AC (17m), EM Waves & Optics (18m), Dual Nature, Atoms & Nuclei (12m), Electronic Devices (7m). Total: 70 Marks.",
    },
    template: {
      title: "Class 12 Physics 32-Page Board Answer Booklet",
      fileUrl:
        "/api/files/download?file=templates/class-12-physics-template.pdf",
      templateRequired: true,
      description:
        "32-page board examination booklet with millimeter graphing inserts.",
    },
  },
]

async function clearAndInitialize() {
  console.log("==================================================")
  console.log("          VERITYRA DATABASE PURGE & SETUP         ")
  console.log("==================================================")

  console.log(
    "\n[1/3] Purging all user data, tokens, submissions & registrations..."
  )

  // Delete dependent rows in reverse dependency order
  await prisma.auditLog.deleteMany()
  await prisma.webhookEvent.deleteMany()
  await prisma.paymentLedger.deleteMany()
  await prisma.paymentRefund.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.questionEvaluation.deleteMany()
  await prisma.evaluationRunQuestion.deleteMany()
  await prisma.evaluationRun.deleteMany()
  await prisma.evaluationJob.deleteMany()
  await prisma.evaluation.deleteMany()
  await prisma.submission.deleteMany()
  await prisma.testRegistration.deleteMany()
  await prisma.answerSheetTemplate.deleteMany()
  await prisma.testPaper.deleteMany()
  await prisma.testSeries.deleteMany()
  await prisma.studentProfile.deleteMany()
  await prisma.account.deleteMany()
  await prisma.session.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.user.deleteMany()

  console.log("✓ All tables purged successfully. Zero leftover records.")

  console.log("\n[2/3] Provisioning single official Administrator account...")

  const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || "admin@verityra.com")
    .toLowerCase()
    .trim()
  const adminPassword =
    process.env.ADMIN_INITIAL_PASSWORD || "AdminSecurePassword123!"
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.create({
    data: {
      name: process.env.ADMIN_INITIAL_NAME || "Verityra Administrator",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })
  console.log(`✓ Official Administrator created: ${admin.email}`)
  console.log(`✓ Role: ${admin.role} | Status: ${admin.status}`)
  console.log(`✓ Zero demo students provisioned. Zero demo credentials.`)

  console.log("\n[3/3] Seeding official curriculum test series...")

  // UPSC and State PSC base series
  const baseSeries = [
    {
      title: "UPSC Civil Services General Studies Paper I Mock",
      slug: "upsc-gs-1-mains-mock-1",
      description:
        "Full-length authentic exam paper testing Indian Heritage, Art, Culture, World History, Physical Geography, and Society under 3-hour strict handwritten conditions.",
      price: 49900,
      maxMarks: 250,
      durationMinutes: 180,
      maxAttempts: 3,
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      resultsPublished: true,
      studentInstructions:
        "1. Write answers in the authentic UPSC format.\n2. Word limits: 150 words for 10-markers, 250 words for 15-markers.\n3. Content and contextual relevance are paramount.\n4. Upload completed booklet as a PDF.",
      privateEvaluationInstructions:
        "Strict UPSC CSE Mains criteria. Structure, intro-body-conclusion, empirical data, schematic diagrams, neutral analytical balance.",
      paper: {
        title: "UPSC GS Paper I Authentic Mock Question Paper",
        fileUrl: "/api/files/download?file=papers/upsc-gs1-question-paper.pdf",
        maxMarks: 250,
        rubricContent:
          "Section A: 10 Qs x 10 marks = 100m. Section B: 10 Qs x 15 marks = 150m. Total = 250 Marks.",
      },
      template: {
        title: "UPSC Standard Margin-Ruled 36-Page Answer Booklet",
        fileUrl: "/api/files/download?file=templates/upsc-gs1-template.pdf",
        templateRequired: true,
        description: "Official UPSC format booklet with margins.",
      },
    },
    {
      title: "State Judicial Services Procedural & Substantive Law Mock",
      slug: "state-judiciary-mains-mock-1",
      description:
        "Specialized answer writing series covering CPC, CrPC, Indian Evidence Act, IPC, and Constitutional Law.",
      price: 79900,
      maxMarks: 200,
      durationMinutes: 180,
      maxAttempts: 3,
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      resultsPublished: true,
      studentInstructions:
        "1. Cite statutory provisions and landmark judgments.\n2. Issues and ratio decidendi must be structured.\n3. Upload handwritten booklet as PDF.",
      privateEvaluationInstructions:
        "Legal accuracy, statutory interpretation, judicial precedents, doctrine application, and reasoning.",
      paper: {
        title: "Judiciary Services Paper I Mock Question Paper",
        fileUrl: "/api/files/download?file=papers/judiciary-paper-1.pdf",
        maxMarks: 200,
        rubricContent:
          "Procedural Law (100m) and Substantive Law (100m). Total: 200 Marks.",
      },
      template: {
        title: "Judicial Services 40-Page Answer Sheet Booklet Template",
        fileUrl: "/api/files/download?file=templates/judiciary-template.pdf",
        templateRequired: true,
        description: "40-page judicial examination format answer booklet.",
      },
    },
  ]

  const allSeries = [...baseSeries, ...academicTestSeries]

  for (const item of allSeries) {
    const testSeries = await prisma.testSeries.create({
      data: {
        title: item.title,
        slug: item.slug,
        description: item.description,
        price: item.price,
        maxMarks: item.maxMarks,
        durationMinutes: item.durationMinutes,
        maxAttempts: item.maxAttempts,
        status: item.status,
        isPublished: item.isPublished,
        resultsPublished: item.resultsPublished,
        studentInstructions: item.studentInstructions,
        privateEvaluationInstructions: item.privateEvaluationInstructions,
      },
    })

    await prisma.testPaper.create({
      data: {
        testSeriesId: testSeries.id,
        title: item.paper.title,
        fileUrl: item.paper.fileUrl,
        maxMarks: item.paper.maxMarks,
        rubricContent: item.paper.rubricContent,
      },
    })

    await prisma.answerSheetTemplate.create({
      data: {
        testSeriesId: testSeries.id,
        title: item.template.title,
        fileUrl: item.template.fileUrl,
        templateRequired: item.template.templateRequired,
        description: item.template.description,
      },
    })

    console.log(
      `  ✓ Test series created: ${testSeries.title} (${testSeries.slug})`
    )
  }

  const finalCounts = {
    users: await prisma.user.count(),
    adminUsers: await prisma.user.count({ where: { role: Role.ADMIN } }),
    studentUsers: await prisma.user.count({ where: { role: Role.STUDENT } }),
    testSeries: await prisma.testSeries.count(),
    registrations: await prisma.testRegistration.count(),
    submissions: await prisma.submission.count(),
    payments: await prisma.payment.count(),
    tokens:
      (await prisma.verificationToken.count()) +
      (await prisma.passwordResetToken.count()),
  }

  console.log("\n==================================================")
  console.log("               VERIFICATION COUNTS                ")
  console.log("==================================================")
  console.log(
    `Total Users          : ${finalCounts.users} (Admin: ${finalCounts.adminUsers}, Students: ${finalCounts.studentUsers})`
  )
  console.log(`Test Series Published: ${finalCounts.testSeries}`)
  console.log(`Registrations        : ${finalCounts.registrations}`)
  console.log(`Submissions          : ${finalCounts.submissions}`)
  console.log(`Payments             : ${finalCounts.payments}`)
  console.log(`Tokens               : ${finalCounts.tokens}`)
  console.log("==================================================")
  console.log("Database reset complete. Platform is completely clean!")
}

clearAndInitialize()
  .catch((e) => {
    console.error("Purge Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
