import { PrismaClient, Role, UserStatus, TestSeriesStatus, RegistrationStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

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
    price: 0, // Free candidate practice
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions: `1. The Question Paper consists of 38 questions divided into 5 Sections: A, B, C, D, and E.
2. Section A comprises 20 MCQs (1 mark each). Section B has 5 Very Short Answer (VSA) questions (2 marks each).
3. Section C has 6 Short Answer (SA) questions (3 marks each). Section D has 4 Long Answer (LA) questions (5 marks each).
4. Section E comprises 3 source-based/case-based integrated units of assessment (4 marks each) with sub-parts.
5. All steps of calculation and geometric constructions must be clearly shown. Write formulas before substituting values.
6. Answers must be handwritten on the provided margin-ruled answer sheet template and uploaded as a single clean PDF.`,
    privateEvaluationInstructions: `CONFIDENTIAL EVALUATION RUBRIC - CLASS 10 MATHEMATICS:
- Step-by-step marking must be strictly enforced. Do not award full marks for direct answers without derivation/working steps.
- Formula identification: Award 0.5 to 1 mark for correct formula formulation (e.g., Quadratic formula, Section formula, Trigonometric identities).
- Calculation and simplification: Deduct 0.5 marks for minor arithmetic slips if method is mathematically sound.
- Geometry/Constructions: Deduct 1 mark if key construction arcs or labeling are omitted.
- Case Study Units (Section E): Award marks independently for sub-parts; partial credit must be given for correct logical reasoning.`,
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
    studentInstructions: `1. The Question Paper consists of 39 questions in 5 sections: Section A (20 MCQs), Section B (6 VSA, 2 marks each), Section C (7 SA, 3 marks each), Section D (3 LA, 5 marks each), and Section E (3 Case-based units, 4 marks each).
2. All chemical equations must be balanced with physical states indicated where applicable.
3. Ray diagrams and biological illustrations (e.g., Human Heart, Nephron, Refraction through Prism) must be drawn neatly in pencil with clear labeling.
4. Numerical questions in Electricity and Light must specify S.I. units in the final answer.
5. Upload completed handwritten answer booklet as a single legible PDF before the submission cutoff.`,
    privateEvaluationInstructions: `CONFIDENTIAL EVALUATION RUBRIC - CLASS 10 SCIENCE:
- Chemistry: Balanced equations carry 1 full mark. Deduct 0.5 marks if equation is unbalanced or wrong product formula is written.
- Biology: Labeled diagrams carry 50% of the question marks. Deduct 0.5 to 1 mark for missing arrows or unlabeled functional parts.
- Physics: Numerical problems require Formula (1m) + Substitution (1m) + Final Answer with correct SI Unit (1m). Deduct 0.5 marks for missing or wrong unit.
- Conceptual reasoning: Focus on key scientific terminology (e.g., 'hyperpolarization', 'corrosion', 'isomerism', 'refractive index').`,
    paper: {
      title: "Class 10 Science Board Examination Question Paper",
      fileUrl: "/api/files/download?file=papers/class-10-science-paper.pdf",
      maxMarks: 80,
      rubricContent:
        "CBSE Science Unit Distribution: Chemical Substances (25m), World of Living (25m), Natural Phenomena (12m), Effects of Current (13m), Natural Resources (5m).",
    },
    template: {
      title: "Class 10 Science Margin-Aligned Examination Template",
      fileUrl: "/api/files/download?file=templates/class-10-science-template.pdf",
      templateRequired: true,
      description:
        "28-page examination booklet with dedicated grid space for ray diagrams and scientific tables.",
    },
  },

  // 3. 11th Standard: Mathematics & Calculus
  {
    title: "Class 11 CBSE Mathematics & Calculus Foundation Series",
    slug: "cbse-class-11-mathematics-mastery-series",
    description:
      "In-depth diagnostic examination for Class 11 Mathematics covering Sets, Relations & Functions, Trigonometric Identities, Complex Numbers, Permutations & Combinations, Binomial Theorem, Sequences & Series, Straight Lines, Conic Sections, and Limits & Derivatives.",
    price: 29900, // ₹299.00
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions: `1. The paper contains 38 questions across Sections A through E simulating the annual Class 11 CBSE examination pattern.
2. In Trigonometric proofs, state standard identities clearly in brackets.
3. Show all domain and range restrictions when solving relations and logarithmic/calculus questions.
4. Write answers by hand on the designated booklet template and upload single PDF scan.`,
    privateEvaluationInstructions: `CONFIDENTIAL EVALUATION RUBRIC - CLASS 11 MATHEMATICS:
- Deduct 0.5 marks if domain/range conditions are neglected in function proofs.
- Limits: Evaluation of indeterminate forms must explicitly demonstrate standard limits or L'Hopital theorem steps.
- Conic Sections: Verify standard equations and focal coordinates. Partial credit for correct vertex and directrix computation.`,
    paper: {
      title: "Class 11 Mathematics Annual Examination Model Paper",
      fileUrl: "/api/files/download?file=papers/class-11-maths-paper.pdf",
      maxMarks: 80,
      rubricContent:
        "CBSE Class 11 Weightage: Sets and Functions (23m), Algebra (25m), Coordinate Geometry (12m), Calculus (8m), Statistics and Probability (12m).",
    },
    template: {
      title: "Senior Secondary Mathematics Ruled Answer Booklet Template",
      fileUrl: "/api/files/download?file=templates/class-11-maths-template.pdf",
      templateRequired: true,
      description: "32-page standard senior secondary format booklet with left margins.",
    },
  },

  // 4. 12th Standard: Mathematics Pre-Board
  {
    title: "Class 12 CBSE Mathematics Pre-Board Mock Examination Series",
    slug: "cbse-class-12-mathematics-preboard-series",
    description:
      "Senior secondary board preparatory series covering Relations & Functions, Inverse Trigonometric Functions, Matrices, Determinants, Continuity & Differentiability, Applications of Derivatives, Integrals, Differential Equations, Vector Algebra, Three-Dimensional Geometry, and Probability.",
    price: 39900, // ₹399.00
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions: `1. The question paper contains 38 questions divided into 5 Sections: A (20 MCQs), B (5 VSA, 2m), C (6 SA, 3m), D (4 LA, 5m), and E (3 Case Studies, 4m).
2. Use of calculators is strictly prohibited.
3. In Integration and Differential Equations questions, constant of integration C must be explicitly stated.
4. In 3D Geometry and Vector questions, vector arrows and directional cosines must be written with mathematical rigor.
5. Upload scanned handwritten answer sheet before the test deadline.`,
    privateEvaluationInstructions: `CONFIDENTIAL EVALUATION RUBRIC - CLASS 12 MATHEMATICS:
- Integrals: Deduct 0.5 marks for omitting the constant of integration (+ C) in indefinite integrals.
- Differential Equations: Separation of variables or integrating factor method must be explicitly indicated.
- Matrices & Determinants: Method of finding inverse (A^-1 = 1/|A| adj(A)) must show cofactor matrix calculation. Direct answer without cofactors receives at most 1 mark out of 5.
- Linear Programming / 3D Geometry: Feasible region shading and corner point table are mandatory for full marks.`,
    paper: {
      title: "Class 12 Mathematics Official Pre-Board Mock Paper (PDF)",
      fileUrl: "/api/files/download?file=papers/class-12-maths-paper.pdf",
      maxMarks: 80,
      rubricContent:
        "Relations and Functions (8m), Algebra: Matrices & Determinants (10m), Calculus: Diff & Integrals (35m), Vectors & 3D Geometry (14m), Linear Programming (5m), Probability (8m). Total: 80 marks.",
    },
    template: {
      title: "Class 12 Senior Secondary Board Answer Sheet Template (36 Pages)",
      fileUrl: "/api/files/download?file=templates/class-12-maths-template.pdf",
      templateRequired: true,
      description:
        "36-page national board standardized answer booklet with candidate identification strip and barcode placeholder.",
    },
  },

  // 5. 12th Standard: Physics Pre-Board
  {
    title: "Class 12 CBSE Physics Pre-Board Mock Examination Series",
    slug: "cbse-class-12-physics-preboard-series",
    description:
      "Board-standard 70-mark theoretical and analytical mock covering Electrostatics, Current Electricity, Magnetic Effects, EMI & AC, Electromagnetic Waves, Ray & Wave Optics, Dual Nature of Radiation, Atoms & Nuclei, and Semiconductor Electronics.",
    price: 39900, // ₹399.00
    maxMarks: 70,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions: `1. All 33 questions are compulsory across Sections A (16 MCQs/Reasoning), B (5 SA, 2m), C (7 SA, 3m), D (2 Case Studies, 4m), and E (3 LA, 5m).
2. Derivations must begin with a clear diagram, assumption list, and standard mathematical steps.
3. State all physical laws (Gauss's law, Ampere's circuital law, Faraday's laws, Huygens' principle) with precision.
4. Numerical answers must contain unit conversions (e.g., cm -> m, uF -> F) and final units.`,
    privateEvaluationInstructions: `CONFIDENTIAL EVALUATION RUBRIC - CLASS 12 PHYSICS:
- Derivations: Diagram (1m) + Statement/Premise (1m) + Mathematical Steps (2.5m) + Final Result with vector form where applicable (0.5m).
- Circuit diagrams: Deduct 0.5 marks if diode bias polarity or battery polarity is inverted.
- Optics: Deduct 0.5 marks if ray direction arrows are missing on wavefront or ray diagrams.
- Numerical problems: Method carrying correct formula (1m), intermediate substitution (1m), final answer with unit (1m).`,
    paper: {
      title: "Class 12 Physics Theory Pre-Board Examination Paper",
      fileUrl: "/api/files/download?file=papers/class-12-physics-paper.pdf",
      maxMarks: 70,
      rubricContent:
        "Electrostatics & Current (16m), Magnetic Effects & EMI/AC (17m), Optics (18m), Dual Nature & Atoms/Nuclei (12m), Electronic Devices (7m). Total: 70 marks.",
    },
    template: {
      title: "Class 12 Science Standard Answer Booklet Template (32 Pages)",
      fileUrl: "/api/files/download?file=templates/class-12-physics-template.pdf",
      templateRequired: true,
      description: "32-page board examination booklet with millimeter graphing inserts.",
    },
  },
]

async function main() {
  console.log("Seeding Verityra database...")

  // 1. Provision Administrator
  const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || "admin@verityra.com").toLowerCase().trim()
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "AdminSecurePassword123!"
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: process.env.ADMIN_INITIAL_NAME || "Verityra Administrator",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })
  console.log(`Administrator provisioned: ${admin.email}`)

  // 2. Provision Demo Student
  const studentEmail = "student@verityra.com"
  const studentPassword = "StudentSecurePassword123!"
  const studentPasswordHash = await bcrypt.hash(studentPassword, 12)

  const student = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {},
    create: {
      name: "Aarav Sharma",
      email: studentEmail,
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      profile: {
        create: {
          educationLevel: "Senior Secondary / Aspirant",
          institution: "Delhi Public School / State Board",
          targetExam: "CBSE Boards / Competitive",
        },
      },
    },
  })
  console.log(`Demo Student provisioned: ${student.email}`)

  // 2b. Provision deterministic student fixtures for admin/list/table tests.
  // These upserts are safe to run repeatedly and use a dedicated seed domain.
  const testStudentPasswordHash = await bcrypt.hash("StudentTestPassword123!", 12)
  const testStudents = await Promise.all(
    Array.from({ length: 10 }, async (_, index) => {
      const number = String(index + 1).padStart(2, "0")
      return prisma.user.upsert({
        where: { email: `test.student${number}@seed.verityra.com` },
        update: {},
        create: {
          name: `Test Student ${number}`,
          email: `test.student${number}@seed.verityra.com`,
          passwordHash: testStudentPasswordHash,
          role: Role.STUDENT,
          status: UserStatus.ACTIVE,
          emailVerified: new Date(),
          profile: {
            create: {
              educationLevel: "Seeded test candidate",
              institution: "Verityra QA Fixtures",
              targetExam: "Admin panel testing",
            },
          },
        },
      })
    })
  )
  console.log(`Test students provisioned: ${testStudents.length}`)

  // 3. Seed Existing Base Series (UPSC & State PSC)
  const baseSeries = [
    {
      title: "UPSC Civil Services General Studies Paper I Mock",
      slug: "upsc-gs-1-mains-mock-1",
      description:
        "Full-length authentic exam paper testing Indian Heritage, Art, Culture, World History, Physical Geography, and Society under 3-hour strict handwritten conditions.",
      price: 0,
      maxMarks: 250,
      durationMinutes: 180,
      maxAttempts: 3,
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      resultsPublished: true,
      studentInstructions: `1. The Question Paper contains 20 questions in official English/Hindi format.\n2. All questions are compulsory. Questions 1 to 10 are 10-markers (150 words limit), and 11 to 20 are 15-markers (250 words limit).\n3. Answers must be written exclusively by hand using the official margin-aligned printable answer sheet template.\n4. Keep clear margins on both left and right sides. Do not write outside the prescribed answer boxes.\n5. Once complete, convert your physical handwritten pages into a clean, single PDF scan and upload it before the cutoff deadline.`,
      privateEvaluationInstructions: `CONFIDENTIAL EVALUATOR INSTRUCTIONS:\n- Q1 to Q10: 10 marks max each. Criteria: Intro & Definition (2.5m), Main Body & Arguments (5m), Conclusion/Way Forward (2.5m).\n- Q11 to Q20: 15 marks max each. Criteria: Contextual framing (3m), Comprehensive thematic analysis with examples/case laws (9m), Balanced conclusion (3m).\n- Award partial marks liberally for logical reasoning and structured presentation.\n- If diagram is included and labeled neatly, award 1 bonus presentation mark within maximum bounds.\n- If illegible, flag 'isLegible: false' and route for educator review.`,
      paper: {
        title: "UPSC GS Paper I Official Mock Paper (PDF)",
        fileUrl: "/api/files/download?file=papers/upsc-gs1-paper.pdf",
        maxMarks: 250,
        rubricContent:
          "Questions 1-20 rubric specifications covering Art, Architecture, Modern Indian History, and Geography.",
      },
      template: {
        title: "Standard Margin Answer Sheet Template (24 Pages)",
        fileUrl: "/api/files/download?file=templates/upsc-template.pdf",
        templateRequired: true,
        description: "24-page margin-ruled booklet designed for standard UPSC Mains format.",
      },
    },
    {
      title: "State PSC Advanced Essay & Analytical Writing",
      slug: "state-psc-advanced-essay",
      description:
        "Thematic essay writing under timed conditions. Evaluated against rigorous articulation, coherence, and structure rubrics.",
      price: 49900,
      maxMarks: 150,
      durationMinutes: 180,
      maxAttempts: 3,
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      resultsPublished: true,
      studentInstructions: `1. Select two essay topics from Section A and Section B.\n2. Word limit: 1,000 to 1,200 words per essay.\n3. Use the prescribed printable template.\n4. Upload clean scanned PDF.`,
      privateEvaluationInstructions: `CONFIDENTIAL EVALUATOR INSTRUCTIONS:\n- Section A: 75 marks max. Section B: 75 marks max.\n- Evaluate depth of argument, balance of perspectives, coherence, and grammatical accuracy.`,
      paper: {
        title: "State PSC Advanced Essay Prompt Document",
        fileUrl: "/api/files/download?file=papers/state-psc-essay.pdf",
        maxMarks: 150,
        rubricContent: "Section A (75m) and Section B (75m) scoring rubrics.",
      },
      template: {
        title: "State PSC Essay Sheet Template (16 Pages)",
        fileUrl: "/api/files/download?file=templates/state-psc-template.pdf",
        templateRequired: true,
        description: "16-page ruled essay booklet.",
      },
    },
  ]

  // Combine all test series to seed
  const allTestSeriesToSeed = [...baseSeries, ...academicTestSeries]

  for (const item of allTestSeriesToSeed) {
    const testSeries = await prisma.testSeries.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
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
      create: {
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

    // Upsert or create paper
    const existingPaper = await prisma.testPaper.findFirst({
      where: { testSeriesId: testSeries.id },
    })
    if (!existingPaper) {
      await prisma.testPaper.create({
        data: {
          testSeriesId: testSeries.id,
          title: item.paper.title,
          fileUrl: item.paper.fileUrl,
          maxMarks: item.paper.maxMarks,
          rubricContent: item.paper.rubricContent,
        },
      })
    }

    // Upsert or create template
    const existingTemplate = await prisma.answerSheetTemplate.findFirst({
      where: { testSeriesId: testSeries.id },
    })
    if (!existingTemplate) {
      await prisma.answerSheetTemplate.create({
        data: {
          testSeriesId: testSeries.id,
          title: item.template.title,
          fileUrl: item.template.fileUrl,
          templateRequired: item.template.templateRequired,
          description: item.template.description,
        },
      })
    }

    console.log(`Seeded test series: ${testSeries.title} (${testSeries.slug})`)
  }

  // 4. Register demo student for the 10th Mathematics test as well as UPSC mock
  const maths10th = await prisma.testSeries.findUnique({
    where: { slug: "cbse-class-10-mathematics-mock-series" },
  })

  if (maths10th) {
    await prisma.testRegistration.upsert({
      where: {
        userId_testSeriesId: {
          userId: student.id,
          testSeriesId: maths10th.id,
        },
      },
      update: {},
      create: {
        userId: student.id,
        testSeriesId: maths10th.id,
        status: RegistrationStatus.ACTIVE,
        attemptsUsed: 0,
        maxAttempts: 3,
      },
    })
    console.log(`Registered demo student for Class 10 Mathematics mock.`)

    for (const testStudent of testStudents) {
      await prisma.testRegistration.upsert({
        where: {
          userId_testSeriesId: {
            userId: testStudent.id,
            testSeriesId: maths10th.id,
          },
        },
        update: {},
        create: {
          userId: testStudent.id,
          testSeriesId: maths10th.id,
          status: RegistrationStatus.ACTIVE,
          attemptsUsed: 0,
          maxAttempts: 3,
        },
      })
    }
    console.log(`Registered ${testStudents.length} test students for Class 10 Mathematics mock.`)
  }

  console.log("Database seed complete.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
