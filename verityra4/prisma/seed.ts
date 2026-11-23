import fs from "node:fs"
import path from "node:path"
import {
  PrismaClient,
  Role,
  UserStatus,
  TestSeriesStatus,
  TestSeriesType,
} from "@prisma/client"
import bcrypt from "bcryptjs"

// Automatically load .env if not loaded
try {
  const envPath = path.resolve(process.cwd(), ".env")
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf-8").split("\n")
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const idx = trimmed.indexOf("=")
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim()
        let val = trimmed.slice(idx + 1).trim()
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
} catch (e) {
  // ignore
}

const prisma = new PrismaClient()

interface SubjectTestData {
  title: string
  slug: string
  subject: string
  price: number // in paise (e.g. 19900 = ₹199)
  maxMarks: number
  durationMinutes: number
  order: number
  studentInstructions: string
  privateEvaluationInstructions: string
  questionPaperUrl: string
}

interface TestSeriesBundleData {
  title: string
  slug: string
  description: string
  standard: string
  stream: string
  academicYear: string
  badge: string
  bundlePrice: number // in paise
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
  tests: SubjectTestData[]
}

const cbseCurriculumSeries: TestSeriesBundleData[] = [
  // =========================================================================
  // 1. CLASS 8TH CBSE
  // =========================================================================
  {
    title: "Class 8th CBSE All-Subject Comprehensive Test Series (2025-26)",
    slug: "cbse-class-8-all-subjects-series-2025-26",
    description:
      "Complete subjective preparation series for Class 8 CBSE students covering Mathematics, Science, Social Science, English, and Hindi designed according to NCERT and NEP guidelines.",
    standard: "Class 8th",
    stream: "CBSE Board",
    academicYear: "2025-26",
    badge: "NCERT Aligned",
    bundlePrice: 99900, // ₹999.00
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions:
      "1. All tests are full-length subjective mock exams (80 marks, 3 hours).\n2. Write answers clearly with black/blue pen on lined paper or the provided template.\n3. Show all calculation steps, units, and labeled diagrams where required.\n4. Scan and upload completed answer booklet as a single legible PDF.",
    privateEvaluationInstructions:
      "CLASS 8 CBSE EVALUATION RUBRIC:\n- Check step-wise clarity in Mathematics and Science.\n- Award marks for structured reasoning and correct keywords in Social Science.\n- Check grammar, spelling, and paragraph organization in languages.",
    paper: {
      title: "Class 8 CBSE All-Subject Sample Assessment Paper",
      fileUrl: "/api/files/download?file=papers/class-8-sample-paper.pdf",
      maxMarks: 80,
      rubricContent: "NCERT Class 8 curriculum benchmark marking criteria.",
    },
    template: {
      title: "Class 8 Standard 24-Page Ruled Answer Sheet Booklet",
      fileUrl: "/api/files/download?file=templates/class-8-template.pdf",
      templateRequired: true,
      description: "Standard ruled booklet format for Class 8 school exams.",
    },
    tests: [
      {
        title: "Class 8 CBSE Mathematics Annual Examination Mock",
        slug: "cbse-class-8-mathematics-mock",
        subject: "Mathematics",
        price: 19900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 1,
        studentInstructions:
          "Rational Numbers, Linear Equations in One Variable, Understanding Quadrilaterals, Data Handling, Squares & Square Roots, Cubes, Comparing Quantities, Algebraic Expressions, Mensuration, Exponents & Powers, Direct & Inverse Proportions, Factorisation, Introduction to Graphs.",
        privateEvaluationInstructions:
          "Award partial marks for formula statement and intermediate arithmetic steps. Deduct 0.5 marks for omitted units in mensuration.",
        questionPaperUrl: "/api/files/download?file=papers/class-8-maths.pdf",
      },
      {
        title: "Class 8 CBSE Science Annual Examination Mock",
        slug: "cbse-class-8-science-mock",
        subject: "Science",
        price: 19900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 2,
        studentInstructions:
          "Crop Production, Microorganisms, Coal & Petroleum, Combustion & Flame, Conservation of Plants & Animals, Reproduction in Animals, Reaching the Age of Adolescence, Force & Pressure, Friction, Sound, Chemical Effects of Electric Current, Some Natural Phenomena, Light.",
        privateEvaluationInstructions:
          "Diagrams carry 50% weightage in biological and physics questions. Require neat labeling.",
        questionPaperUrl: "/api/files/download?file=papers/class-8-science.pdf",
      },
      {
        title: "Class 8 CBSE Social Science Annual Examination Mock",
        slug: "cbse-class-8-social-science-mock",
        subject: "Social Science",
        price: 19900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 3,
        studentInstructions:
          "History (Our Pasts - III), Geography (Resources and Development), and Civics (Social and Political Life - III). Map pointing questions are compulsory.",
        privateEvaluationInstructions:
          "Map work carries 5 marks. In 3-mark and 5-mark questions, evaluate point-wise reasoning and historical evidence.",
        questionPaperUrl: "/api/files/download?file=papers/class-8-social-science.pdf",
      },
      {
        title: "Class 8 CBSE English Language & Literature Mock",
        slug: "cbse-class-8-english-mock",
        subject: "English",
        price: 19900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 4,
        studentInstructions:
          "Section A: Reading Comprehension (20m), Section B: Writing & Grammar (30m - Letter, Notice, Story, Tenses, Modals, Active/Passive), Section C: Literature (Honeydew & It So Happened, 30m).",
        privateEvaluationInstructions:
          "Letter & Notice format carry 1 mark each. Deduct for grammatical inconsistencies and spelling errors in comprehension.",
        questionPaperUrl: "/api/files/download?file=papers/class-8-english.pdf",
      },
      {
        title: "Class 8 CBSE Hindi (Vasant & Bharat Ki Khoj) Mock",
        slug: "cbse-class-8-hindi-mock",
        subject: "Hindi",
        price: 19900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 5,
        studentInstructions:
          "Section A: Unseen Passage (Apatith Gadyansh/Kavyansh), Section B: Vyakaran (Sandhi, Samas, Karak, Muhavare), Section C: Vasant & Bharat Ki Khoj, Section D: Creative Writing (Anuched, Patra Lekhan).",
        privateEvaluationInstructions:
          "Strict evaluation on matra correctness, Hindi vocabulary, and coherent sentence framing.",
        questionPaperUrl: "/api/files/download?file=papers/class-8-hindi.pdf",
      },
    ],
  },

  // =========================================================================
  // 2. CLASS 9TH CBSE
  // =========================================================================
  {
    title: "Class 9th CBSE All-Subject Foundation Series (2025-26)",
    slug: "cbse-class-9-foundation-series-2025-26",
    description:
      "Board-foundation preparatory series for Class 9 CBSE covering Mathematics, Science, Social Science, English Language & Literature, and Hindi with rigorous subjective evaluations.",
    standard: "Class 9th",
    stream: "CBSE Board",
    academicYear: "2025-26",
    badge: "Board Foundation",
    bundlePrice: 119900, // ₹1,199.00
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions:
      "1. Simulates official CBSE annual exam pattern.\n2. In Science, numerical calculations must specify S.I. units.\n3. In Mathematics, geometric proofs must state axioms/theorems explicitly.\n4. Upload completed booklet as a single clean PDF.",
    privateEvaluationInstructions:
      "CLASS 9 CBSE RIGOROUS EVALUATION:\n- Step marking is mandatory.\n- Verify theorem proofs (Lines & Angles, Triangles, Circles).\n- Evaluate numerical problem solving with formula statement (1m), substitution (1m), and final answer (1m).",
    paper: {
      title: "Class 9 CBSE Comprehensive Annual Model Paper",
      fileUrl: "/api/files/download?file=papers/class-9-sample-paper.pdf",
      maxMarks: 80,
      rubricContent: "CBSE Class 9 annual assessment weightage rubric.",
    },
    template: {
      title: "Class 9 Standard 28-Page Ruled Examination Template",
      fileUrl: "/api/files/download?file=templates/class-9-template.pdf",
      templateRequired: true,
      description: "28-page examination booklet with margins.",
    },
    tests: [
      {
        title: "Class 9 CBSE Mathematics Annual Foundation Mock",
        slug: "cbse-class-9-mathematics-mock",
        subject: "Mathematics",
        price: 24900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 1,
        studentInstructions:
          "Number Systems, Polynomials, Coordinate Geometry, Linear Equations in Two Variables, Lines & Angles, Triangles, Quadrilaterals, Circles, Heron's Formula, Surface Areas & Volumes, Statistics.",
        privateEvaluationInstructions:
          "Verify geometric reasoning, congruent criteria (SAS, ASA, SSS, RHS), and factorization steps.",
        questionPaperUrl: "/api/files/download?file=papers/class-9-maths.pdf",
      },
      {
        title: "Class 9 CBSE Science Annual Foundation Mock",
        slug: "cbse-class-9-science-mock",
        subject: "Science",
        price: 24900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 2,
        studentInstructions:
          "Matter in Our Surroundings, Is Matter Around Us Pure, Atoms & Molecules, Structure of the Atom, The Fundamental Unit of Life, Tissues, Motion, Force & Laws of Motion, Gravitation, Work & Energy, Sound, Improvement in Food Resources.",
        privateEvaluationInstructions:
          "Verify mole concept calculations, chemical formula formulation via valencies, and Newton's laws derivations.",
        questionPaperUrl: "/api/files/download?file=papers/class-9-science.pdf",
      },
      {
        title: "Class 9 CBSE Social Science Foundation Mock",
        slug: "cbse-class-9-social-science-mock",
        subject: "Social Science",
        price: 24900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 3,
        studentInstructions:
          "French Revolution, Socialism in Europe, Nazism, India Size & Location, Physical Features of India, Drainage, Climate, What is Democracy, Constitutional Design, Electoral Politics, Poverty as a Challenge.",
        privateEvaluationInstructions:
          "Historical causality, constitutional features analysis, and topographic map skills.",
        questionPaperUrl: "/api/files/download?file=papers/class-9-social-science.pdf",
      },
      {
        title: "Class 9 CBSE English Language & Literature Mock",
        slug: "cbse-class-9-english-mock",
        subject: "English",
        price: 24900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 4,
        studentInstructions:
          "Reading Comprehension (Discursive & Case-based), Descriptive Paragraph, Diary Entry, Story Writing, Integrated Grammar (Tenses, Modals, Determiners), Beehive & Moments literature.",
        privateEvaluationInstructions:
          "Check format of diary and story writing. Evaluate analytical depth of literary answers.",
        questionPaperUrl: "/api/files/download?file=papers/class-9-english.pdf",
      },
      {
        title: "Class 9 CBSE Hindi (Sparsh & Sanchayan) Mock",
        slug: "cbse-class-9-hindi-mock",
        subject: "Hindi",
        price: 24900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 5,
        studentInstructions:
          "Apatith Gadyansh, Vyakaran (Upsarg, Pratyay, Samas, Vakya Bhed), Sparsh & Sanchayan text chapters, Patra Lekhan, Samvad Lekhan, Sandesh Lekhan.",
        privateEvaluationInstructions:
          "Evaluate grammatical accuracy, shuddh vartani, and creative expression.",
        questionPaperUrl: "/api/files/download?file=papers/class-9-hindi.pdf",
      },
    ],
  },

  // =========================================================================
  // 3. CLASS 10TH CBSE
  // =========================================================================
  {
    title: "Class 10th CBSE Board Comprehensive Mock Series (2025-26)",
    slug: "cbse-class-10-board-examination-series-2025-26",
    description:
      "All-subject board examination test series for Class 10 CBSE 2025-26. Covers Mathematics (Standard/Basic), Science, Social Science, English Language & Literature, and Hindi with step-by-step board marking scheme.",
    standard: "Class 10th",
    stream: "CBSE Board",
    academicYear: "2025-26",
    badge: "Board Pre-Exam",
    bundlePrice: 149900, // ₹1,499.00
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions:
      "1. Full 80-mark board papers adhering strictly to the CBSE 2025-26 blueprint.\n2. Sections A (MCQs), B (VSA 2m), C (SA 3m), D (LA 5m), and E (Case-based 4m).\n3. Handwritten submissions on standardized answer sheet template required.\n4. Show all working steps, derivations, and diagrams neatly.",
    privateEvaluationInstructions:
      "CBSE OFFICIAL BOARD MARKING SCHEME:\n- Enforce strict step-wise credit.\n- Deduct 0.5 marks for arithmetic slips if procedure is correct.\n- Balanced chemical equations must state physical states.\n- Biological diagrams require at least 4 clear labeling points.",
    paper: {
      title: "Class 10 CBSE Board Official Pattern Mock Paper Set",
      fileUrl: "/api/files/download?file=papers/class-10-board-paper.pdf",
      maxMarks: 80,
      rubricContent: "CBSE Board 10th standard evaluation rubric.",
    },
    template: {
      title: "Class 10 Board Standard 32-Page Margin Booklet",
      fileUrl: "/api/files/download?file=templates/class-10-board-template.pdf",
      templateRequired: true,
      description: "Standard 32-page board examination answer booklet.",
    },
    tests: [
      {
        title: "Class 10 CBSE Mathematics (Standard) Board Mock",
        slug: "cbse-class-10-mathematics-board-mock",
        subject: "Mathematics",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 1,
        studentInstructions:
          "Real Numbers, Polynomials, Pair of Linear Equations, Quadratic Equations, Arithmetic Progressions, Triangles, Coordinate Geometry, Trigonometry, Some Applications of Trigonometry, Circles, Areas Related to Circles, Surface Areas & Volumes, Statistics, Probability.",
        privateEvaluationInstructions:
          "Formula identification (1m) + working (2m) + conclusion (1m) for 4-mark questions. Case study questions evaluated independently per sub-part.",
        questionPaperUrl: "/api/files/download?file=papers/class-10-maths.pdf",
      },
      {
        title: "Class 10 CBSE Science Board Mock Exam",
        slug: "cbse-class-10-science-board-mock",
        subject: "Science",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 2,
        studentInstructions:
          "Chemical Reactions, Acids Bases & Salts, Metals & Non-metals, Carbon Compounds, Life Processes, Control & Coordination, Reproduction, Heredity, Light Refraction/Reflection, Human Eye, Electricity, Magnetic Effects of Electric Current, Our Environment.",
        privateEvaluationInstructions:
          "Deduct 0.5 marks for missing ray arrows in optics. Ray diagrams must be straight and to scale.",
        questionPaperUrl: "/api/files/download?file=papers/class-10-science.pdf",
      },
      {
        title: "Class 10 CBSE Social Science Board Mock Exam",
        slug: "cbse-class-10-social-science-board-mock",
        subject: "Social Science",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 3,
        studentInstructions:
          "Rise of Nationalism in Europe, Nationalism in India, Making of a Global World, Resources & Development, Forest & Wildlife, Water Resources, Agriculture, Minerals & Energy, Power Sharing, Federalism, Gender Religion Caste, Sectors of Indian Economy, Money & Credit, Globalization.",
        privateEvaluationInstructions:
          "Map work carries 5 marks. Long answer questions (5m) require 5 distinct numbered points with historical/factual examples.",
        questionPaperUrl: "/api/files/download?file=papers/class-10-social-science.pdf",
      },
      {
        title: "Class 10 CBSE English Language & Literature Board Mock",
        slug: "cbse-class-10-english-board-mock",
        subject: "English",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 4,
        studentInstructions:
          "Reading Skills (20m), Writing Skills & Grammar (20m - Formal Letter, Analytical Paragraph), Language through Literature (40m - First Flight & Footprints Without Feet).",
        privateEvaluationInstructions:
          "Analytical paragraph: Content (2m), Organization (2m), Accuracy (1m). Check critical analysis in 6-mark literature questions.",
        questionPaperUrl: "/api/files/download?file=papers/class-10-english.pdf",
      },
      {
        title: "Class 10 CBSE Hindi Course A Board Mock",
        slug: "cbse-class-10-hindi-board-mock",
        subject: "Hindi",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 5,
        studentInstructions:
          "Apatith Bodh (14m), Vyakaran (16m - Rachna ke aadhar par vakya, Vachya, Pad Parichay, Alankar), Kshitij & Kritika (30m), Rachanatmak Lekhan (20m - Anuched, Patra, Bio-data, Vigyapan).",
        privateEvaluationInstructions:
          "Evaluate Pad Parichay accuracy (Pad, Bhed, Ling, Vachan, Karak). Strict penalty for incorrect Matras.",
        questionPaperUrl: "/api/files/download?file=papers/class-10-hindi.pdf",
      },
    ],
  },

  // =========================================================================
  // 4. CLASS 11TH CBSE (SCIENCE STREAM)
  // =========================================================================
  {
    title: "Class 11th CBSE Science Comprehensive Mock Series (2025-26)",
    slug: "cbse-class-11-science-series-2025-26",
    description:
      "Advanced theoretical and numerical mock examination series for Class 11 CBSE Science stream covering Physics, Chemistry, Mathematics, Biology, and English Core.",
    standard: "Class 11th",
    stream: "CBSE Science",
    academicYear: "2025-26",
    badge: "Senior Secondary Science",
    bundlePrice: 199900, // ₹1,999.00
    maxMarks: 70,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions:
      "1. Physics & Chemistry papers are 70 marks (3 hours) theory.\n2. Mathematics & English Core are 80 marks (3 hours).\n3. Derivations must show complete vector/differential steps.\n4. Upload completed booklet as a single clean PDF.",
    privateEvaluationInstructions:
      "SENIOR SECONDARY SCIENCE RUBRIC:\n- Derivations require diagram (1m), initial assumptions (0.5m), algebraic steps (2.5m), and vector expression (0.5m).\n- Organic chemistry mechanisms must display curved arrow notation.\n- Biology diagrams require functional annotations.",
    paper: {
      title: "Class 11 Science Model Examination Paper",
      fileUrl: "/api/files/download?file=papers/class-11-science-paper.pdf",
      maxMarks: 70,
      rubricContent: "CBSE Class 11 Science theory evaluation scheme.",
    },
    template: {
      title: "Senior Secondary Science 32-Page Answer Booklet",
      fileUrl: "/api/files/download?file=templates/class-11-science-template.pdf",
      templateRequired: true,
      description: "32-page booklet with millimeter graph inserts.",
    },
    tests: [
      {
        title: "Class 11 CBSE Physics Annual Examination Mock",
        slug: "cbse-class-11-physics-mock",
        subject: "Physics",
        price: 29900,
        maxMarks: 70,
        durationMinutes: 180,
        order: 1,
        studentInstructions:
          "Units & Measurements, Motion in a Straight Line, Motion in a Plane, Laws of Motion, Work Energy & Power, Rotational Motion, Gravitation, Mechanical Properties of Solids & Fluids, Thermal Properties, Thermodynamics, Kinetic Theory, Oscillations & Waves.",
        privateEvaluationInstructions:
          "Verify dimension analysis, free body diagrams, and integration steps in variable force problems.",
        questionPaperUrl: "/api/files/download?file=papers/class-11-physics.pdf",
      },
      {
        title: "Class 11 CBSE Chemistry Annual Examination Mock",
        slug: "cbse-class-11-chemistry-mock",
        subject: "Chemistry",
        price: 29900,
        maxMarks: 70,
        durationMinutes: 180,
        order: 2,
        studentInstructions:
          "Some Basic Concepts of Chemistry, Structure of Atom, Classification of Elements, Chemical Bonding & Molecular Structure, Chemical Thermodynamics, Equilibrium, Redox Reactions, Organic Chemistry Basics, Hydrocarbons.",
        privateEvaluationInstructions:
          "Verify molecular orbital diagrams, hybridisation geometries, and IUPAC nomenclature.",
        questionPaperUrl: "/api/files/download?file=papers/class-11-chemistry.pdf",
      },
      {
        title: "Class 11 CBSE Mathematics Annual Mock Exam",
        slug: "cbse-class-11-mathematics-mock",
        subject: "Mathematics",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 3,
        studentInstructions:
          "Sets, Relations & Functions, Trigonometric Functions, Complex Numbers, Linear Inequalities, Permutations & Combinations, Binomial Theorem, Sequences & Series, Straight Lines, Conic Sections, 3D Geometry, Limits & Derivatives, Statistics, Probability.",
        privateEvaluationInstructions:
          "State domain/range restrictions. Show L'Hopital theorem or standard limits expansions.",
        questionPaperUrl: "/api/files/download?file=papers/class-11-maths.pdf",
      },
      {
        title: "Class 11 CBSE Biology Annual Examination Mock",
        slug: "cbse-class-11-biology-mock",
        subject: "Biology",
        price: 29900,
        maxMarks: 70,
        durationMinutes: 180,
        order: 4,
        studentInstructions:
          "Diversity in Living World, Structural Organisation in Animals & Plants, Cell Structure & Function (Biomolecules, Cell Cycle), Plant Physiology (Photosynthesis, Respiration), Human Physiology (Breathing, Circulation, Excretion, Locomotion, Neural & Chemical Control).",
        privateEvaluationInstructions:
          "Check accurate biological terminology, schematic flowcharts of biochemical cycles (Calvin cycle, Krebs cycle).",
        questionPaperUrl: "/api/files/download?file=papers/class-11-biology.pdf",
      },
      {
        title: "Class 11 CBSE English Core Mock Exam",
        slug: "cbse-class-11-english-core-mock",
        subject: "English Core",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 5,
        studentInstructions:
          "Section A: Reading Comprehension (Unseen Passages & Note Making, 26m), Section B: Creative Writing Skills & Grammar (23m - Poster, Speech, Debate), Section C: Hornbill & Snapshots literature (31m).",
        privateEvaluationInstructions:
          "Note-making format: Title (1m), Numbering & Indenting (1m), Key/Abbreviations (1m), Summary (2m).",
        questionPaperUrl: "/api/files/download?file=papers/class-11-english.pdf",
      },
    ],
  },

  // =========================================================================
  // 5. CLASS 11TH CBSE (COMMERCE STREAM)
  // =========================================================================
  {
    title: "Class 11th CBSE Commerce Comprehensive Mock Series (2025-26)",
    slug: "cbse-class-11-commerce-series-2025-26",
    description:
      "Subjective mock exam bundle for Class 11 CBSE Commerce covering Accountancy, Business Studies, Economics, Mathematics, and English Core.",
    standard: "Class 11th",
    stream: "CBSE Commerce",
    academicYear: "2025-26",
    badge: "Senior Secondary Commerce",
    bundlePrice: 179900, // ₹1,799.00
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions:
      "1. Full 80-mark papers across all Commerce disciplines.\n2. In Accountancy, ledger accounts and balance sheets must have proper columnar formats with narrations.\n3. In Economics, illustrate graphical equilibria with clear axis labeling.",
    privateEvaluationInstructions:
      "COMMERCE EVALUATION RUBRIC:\n- Accountancy: Journal entries without narration lose 0.5 marks. Balance sheet totals must reconcile.\n- Economics: Diagrams carry 2 marks out of 4-6 mark analytical questions.\n- Business Studies: Evaluate case study questions identifying the specific concept and quoting lines from passage.",
    paper: {
      title: "Class 11 Commerce Model Examination Paper",
      fileUrl: "/api/files/download?file=papers/class-11-commerce-paper.pdf",
      maxMarks: 80,
      rubricContent: "CBSE Class 11 Commerce assessment framework.",
    },
    template: {
      title: "Senior Secondary Commerce Ledger & Ruled Answer Booklet",
      fileUrl: "/api/files/download?file=templates/class-11-commerce-template.pdf",
      templateRequired: true,
      description: "32-page answer booklet with ledger formats.",
    },
    tests: [
      {
        title: "Class 11 CBSE Accountancy Annual Mock Exam",
        slug: "cbse-class-11-accountancy-mock",
        subject: "Accountancy",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 1,
        studentInstructions:
          "Theoretical Framework, Accounting Process (Journal, Ledger, Trial Balance, Cash Book, Bank Reconciliation, Depreciation, Provisions, Reserves), Financial Statements of Sole Proprietorship (Trading & P&L Account, Balance Sheet with adjustments).",
        privateEvaluationInstructions:
          "Check debit/credit accuracy, adjustments treatment (closing stock, outstanding expenses, prepaid expenses, bad debts reserve).",
        questionPaperUrl: "/api/files/download?file=papers/class-11-accountancy.pdf",
      },
      {
        title: "Class 11 CBSE Business Studies Annual Mock",
        slug: "cbse-class-11-business-studies-mock",
        subject: "Business Studies",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 2,
        studentInstructions:
          "Nature & Purpose of Business, Forms of Business Organisation, Public Private & Global Enterprises, Business Services, Emerging Modes of Business, Social Responsibility & Ethics, Sources of Business Finance, Small Business, Internal Trade, International Business.",
        privateEvaluationInstructions:
          "Evaluate identification of business forms and finance sources. Check structured presentation.",
        questionPaperUrl: "/api/files/download?file=papers/class-11-bst.pdf",
      },
      {
        title: "Class 11 CBSE Economics Annual Mock Exam",
        slug: "cbse-class-11-economics-mock",
        subject: "Economics",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 3,
        studentInstructions:
          "Part A: Statistics for Economics (Measures of Central Tendency, Dispersion, Correlation, Index Numbers, 40m). Part B: Introductory Microeconomics (Consumer Equilibrium, Demand, Production, Cost, Revenue, Supply, Market Forms, 40m).",
        privateEvaluationInstructions:
          "Verify statistical calculation steps and formulas. Require consumer equilibrium indifference curve diagrams.",
        questionPaperUrl: "/api/files/download?file=papers/class-11-economics.pdf",
      },
      {
        title: "Class 11 CBSE Applied Mathematics Mock Exam",
        slug: "cbse-class-11-applied-mathematics-mock",
        subject: "Mathematics",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 4,
        studentInstructions:
          "Numbers & Quantifications, Numerical Applications, Algebra (Sets, Relations, Sequences), Calculus, Probability, Descriptive Statistics, Financial Mathematics (Interest, Annuity, Taxation), Coordinate Geometry.",
        privateEvaluationInstructions:
          "Check compound interest and annuity calculations with accurate step-by-step arithmetic.",
        questionPaperUrl: "/api/files/download?file=papers/class-11-applied-maths.pdf",
      },
      {
        title: "Class 11 CBSE English Core Commerce Mock",
        slug: "cbse-class-11-english-commerce-mock",
        subject: "English Core",
        price: 29900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 5,
        studentInstructions:
          "Reading Comprehension & Note Making (26m), Creative Writing & Business Communication (23m - Business Letters, Notice, Poster), Hornbill & Snapshots literature (31m).",
        privateEvaluationInstructions:
          "Business letter formats (enquiry, complaint, placing order) carry dedicated marks.",
        questionPaperUrl: "/api/files/download?file=papers/class-11-english.pdf",
      },
    ],
  },

  // =========================================================================
  // 6. CLASS 12TH CBSE (SCIENCE PRE-BOARD)
  // =========================================================================
  {
    title: "Class 12th CBSE Science Board Pre-Board Series (2025-26)",
    slug: "cbse-class-12-science-preboard-series-2025-26",
    description:
      "Premier senior secondary national board preparatory series for Class 12 CBSE Science candidates covering Physics, Chemistry, Mathematics, Biology, and English Core evaluated strictly per official CBSE rubrics.",
    standard: "Class 12th",
    stream: "CBSE Science",
    academicYear: "2025-26",
    badge: "Pre-Board National",
    bundlePrice: 249900, // ₹2,499.00
    maxMarks: 70,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions:
      "1. Full 3-hour theoretical board simulations matching the CBSE 2025-26 question paper blueprint.\n2. Physics & Chemistry: 70 marks. Mathematics & English Core: 80 marks.\n3. Show complete working, unit conversions, and labeled diagrams.\n4. Upload completed booklet as a single high-resolution PDF.",
    privateEvaluationInstructions:
      "CONFIDENTIAL SENIOR SECONDARY BOARD EVALUATION GUIDELINES:\n- Step marking is mandatory: Formula (1m) + Substitution (1m) + Answer with Unit (1m).\n- Deduct 0.5 marks for omitting the constant of integration (+ C) in indefinite integrals.\n- Circuit diagrams: Check diode bias and battery polarity.\n- Chemistry mechanisms: Curved arrows showing electron flow must be accurate.",
    paper: {
      title: "Class 12 Science Official Pre-Board Mock Paper",
      fileUrl: "/api/files/download?file=papers/class-12-science-paper.pdf",
      maxMarks: 70,
      rubricContent: "CBSE Class 12 Science National Pre-Board blueprint rubric.",
    },
    template: {
      title: "Class 12 Board Standard 36-Page National Booklet",
      fileUrl: "/api/files/download?file=templates/class-12-science-template.pdf",
      templateRequired: true,
      description: "36-page national examination answer booklet.",
    },
    tests: [
      {
        title: "Class 12 CBSE Physics Pre-Board Mock Examination",
        slug: "cbse-class-12-physics-preboard-mock",
        subject: "Physics",
        price: 34900,
        maxMarks: 70,
        durationMinutes: 180,
        order: 1,
        studentInstructions:
          "Electrostatics, Current Electricity, Magnetic Effects of Current & Magnetism, EMI & AC, EM Waves, Ray & Wave Optics, Dual Nature of Radiation & Matter, Atoms & Nuclei, Semiconductor Devices.",
        privateEvaluationInstructions:
          "Ray diagrams require directional arrows. Award 1 mark for Gauss's law / Ampere's law statements.",
        questionPaperUrl: "/api/files/download?file=papers/class-12-physics.pdf",
      },
      {
        title: "Class 12 CBSE Chemistry Pre-Board Mock Examination",
        slug: "cbse-class-12-chemistry-preboard-mock",
        subject: "Chemistry",
        price: 34900,
        maxMarks: 70,
        durationMinutes: 180,
        order: 2,
        studentInstructions:
          "Solutions, Electrochemistry, Chemical Kinetics, d & f Block Elements, Coordination Compounds, Haloalkanes & Haloarenes, Alcohols Phenols & Ethers, Aldehydes Ketones & Carboxylic Acids, Amines, Biomolecules.",
        privateEvaluationInstructions:
          "Verify Nernst equation calculations, crystal field splitting notations, and named organic reactions (Aldol, Cannizzaro, Sandmeyer).",
        questionPaperUrl: "/api/files/download?file=papers/class-12-chemistry.pdf",
      },
      {
        title: "Class 12 CBSE Mathematics Pre-Board Mock Examination",
        slug: "cbse-class-12-mathematics-preboard-mock",
        subject: "Mathematics",
        price: 34900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 3,
        studentInstructions:
          "Relations & Functions, Inverse Trigonometric Functions, Matrices, Determinants, Continuity & Differentiability, Application of Derivatives, Integrals, Differential Equations, Vector Algebra, 3D Geometry, Linear Programming, Probability.",
        privateEvaluationInstructions:
          "Matrix inversion: Cofactor calculation must be explicitly shown. LPP requires shaded feasible region with corner points table.",
        questionPaperUrl: "/api/files/download?file=papers/class-12-maths.pdf",
      },
      {
        title: "Class 12 CBSE Biology Pre-Board Mock Examination",
        slug: "cbse-class-12-biology-preboard-mock",
        subject: "Biology",
        price: 34900,
        maxMarks: 70,
        durationMinutes: 180,
        order: 4,
        studentInstructions:
          "Sexual Reproduction in Flowering Plants, Human Reproduction, Reproductive Health, Principles of Inheritance & Variation, Molecular Basis of Inheritance, Evolution, Human Health & Disease, Microbes in Human Welfare, Biotechnology Principles & Applications, Organisms & Populations, Ecosystem, Biodiversity & Conservation.",
        privateEvaluationInstructions:
          "Verify genetic cross Punnett squares, DNA replication fork diagrams, and Lac Operon schematics.",
        questionPaperUrl: "/api/files/download?file=papers/class-12-biology.pdf",
      },
      {
        title: "Class 12 CBSE English Core Pre-Board Mock Exam",
        slug: "cbse-class-12-english-core-mock",
        subject: "English Core",
        price: 34900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 5,
        studentInstructions:
          "Reading Comprehension (22m), Creative Writing (18m - Notice, Formal Invitation/Reply, Letter to Editor/Application for Job, Article/Report), Flamingo & Vistas literature (40m).",
        privateEvaluationInstructions:
          "Formal invitation & reply format (3m). Job application with bio-data (5m). Evaluated for nuance in 6-mark character analysis.",
        questionPaperUrl: "/api/files/download?file=papers/class-12-english.pdf",
      },
    ],
  },

  // =========================================================================
  // 7. CLASS 12TH CBSE (COMMERCE PRE-BOARD)
  // =========================================================================
  {
    title: "Class 12th CBSE Commerce Board Pre-Board Series (2025-26)",
    slug: "cbse-class-12-commerce-preboard-series-2025-26",
    description:
      "All-subject board preparatory series for Class 12 CBSE Commerce students covering Accountancy, Business Studies, Economics, Mathematics, and English Core.",
    standard: "Class 12th",
    stream: "CBSE Commerce",
    academicYear: "2025-26",
    badge: "Pre-Board National",
    bundlePrice: 219900, // ₹2,199.00
    maxMarks: 80,
    durationMinutes: 180,
    maxAttempts: 3,
    status: TestSeriesStatus.PUBLISHED,
    isPublished: true,
    resultsPublished: true,
    studentInstructions:
      "1. Simulates official Class 12 CBSE Commerce board examination.\n2. In Accountancy, show journal entries with narration and working notes.\n3. In Economics, show macro aggregates calculations and equilibrium charts.",
    privateEvaluationInstructions:
      "COMMERCE BOARD MARKING RUBRIC:\n- Accountancy: Partnership revaluation, goodwill adjustment, and share forfeiture journal entries.\n- Macroeconomics: National income accounting methods (value added, income, expenditure).\n- Business Studies: Management principles and financial management decisions.",
    paper: {
      title: "Class 12 Commerce Pre-Board Model Paper",
      fileUrl: "/api/files/download?file=papers/class-12-commerce-paper.pdf",
      maxMarks: 80,
      rubricContent: "CBSE Class 12 Commerce Pre-Board evaluation rubric.",
    },
    template: {
      title: "Class 12 Commerce Standard 36-Page Answer Booklet",
      fileUrl: "/api/files/download?file=templates/class-12-commerce-template.pdf",
      templateRequired: true,
      description: "36-page national examination booklet with financial columns.",
    },
    tests: [
      {
        title: "Class 12 CBSE Accountancy Pre-Board Mock Exam",
        slug: "cbse-class-12-accountancy-preboard-mock",
        subject: "Accountancy",
        price: 34900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 1,
        studentInstructions:
          "Accounting for Partnership Firms (Fundamentals, Goodwill, Admission, Retirement, Death, Dissolution), Accounting for Companies (Issue of Shares & Debentures, Forfeiture, Re-issue), Analysis of Financial Statements (Comparative, Common Size, Ratios, Cash Flow Statement).",
        privateEvaluationInstructions:
          "Working notes carry separate marks. Check cash flow from operating, investing, and financing activities.",
        questionPaperUrl: "/api/files/download?file=papers/class-12-accountancy.pdf",
      },
      {
        title: "Class 12 CBSE Business Studies Pre-Board Mock Exam",
        slug: "cbse-class-12-business-studies-preboard-mock",
        subject: "Business Studies",
        price: 34900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 2,
        studentInstructions:
          "Part A: Principles & Functions of Management (Nature, Principles, Business Environment, Planning, Organising, Staffing, Directing, Controlling). Part B: Business Finance & Marketing (Financial Management, Financial Markets, Marketing Management, Consumer Protection).",
        privateEvaluationInstructions:
          "Quote lines from case studies when justifying identified management principles and leadership styles.",
        questionPaperUrl: "/api/files/download?file=papers/class-12-bst.pdf",
      },
      {
        title: "Class 12 CBSE Economics Pre-Board Mock Exam",
        slug: "cbse-class-12-economics-preboard-mock",
        subject: "Economics",
        price: 34900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 3,
        studentInstructions:
          "Part A: Introductory Macroeconomics (National Income, Money & Banking, Determination of Income & Employment, Government Budget, Balance of Payments, 40m). Part B: Indian Economic Development (Development Experience 1947-90, Economic Reforms 1991, Current Challenges, Comparative Development with Neighbours, 40m).",
        privateEvaluationInstructions:
          "Investment multiplier derivations (k = 1 / (1 - MPC)) and deflationary/inflationary gap remedies.",
        questionPaperUrl: "/api/files/download?file=papers/class-12-economics.pdf",
      },
      {
        title: "Class 12 CBSE Applied / Core Mathematics Mock",
        slug: "cbse-class-12-applied-mathematics-mock",
        subject: "Mathematics",
        price: 34900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 4,
        studentInstructions:
          "Numbers & Quantification, Algebra (Matrices, Determinants), Calculus (Applications of Derivatives, Integrals), Probability Distributions (Binomial, Poisson, Normal), Index Numbers & Time Series, Financial Mathematics (Perpetuity, Sinking Funds, EMI).",
        privateEvaluationInstructions:
          "Evaluate EMI formula substitutions and linear programming formulation.",
        questionPaperUrl: "/api/files/download?file=papers/class-12-maths.pdf",
      },
      {
        title: "Class 12 CBSE English Core Commerce Mock",
        slug: "cbse-class-12-english-commerce-mock",
        subject: "English Core",
        price: 34900,
        maxMarks: 80,
        durationMinutes: 180,
        order: 5,
        studentInstructions:
          "Reading Comprehension (22m), Creative Writing & Formal Business Applications (18m - Letters, Invites, Reports), Flamingo & Vistas literature (40m).",
        privateEvaluationInstructions:
          "Report writing and letters to the editor evaluated on format, coherence, and grammar.",
        questionPaperUrl: "/api/files/download?file=papers/class-12-english.pdf",
      },
    ],
  },
]

async function clearDatabase() {
  console.log("--> Clearing database tables in reverse foreign key order...")
  
  // 1. Evaluations and jobs
  await prisma.evaluationJob.deleteMany({})
  await prisma.evaluationRunQuestion.deleteMany({})
  await prisma.evaluationRun.deleteMany({})
  await prisma.questionEvaluation.deleteMany({})
  await prisma.evaluation.deleteMany({})
  
  // 2. Submissions
  await prisma.submission.deleteMany({})
  
  // 3. Payments and ledger
  await prisma.paymentLedger.deleteMany({})
  await prisma.paymentRefund.deleteMany({})
  await prisma.payment.deleteMany({})
  
  // 4. Registrations
  await prisma.testRegistration.deleteMany({})
  
  // 5. Question papers & materials
  await prisma.questionPaper.deleteMany({})
  await prisma.testPaper.deleteMany({})
  await prisma.answerSheetTemplate.deleteMany({})
  
  // 6. Tests and Test Series
  await prisma.test.deleteMany({})
  await prisma.testSeries.deleteMany({})
  
  // 7. User profiles and auth
  await prisma.studentProfile.deleteMany({})
  await prisma.auditLog.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.verificationToken.deleteMany({})
  await prisma.passwordResetToken.deleteMany({})
  await prisma.user.deleteMany({})
  
  // 8. Academic Masters
  await prisma.subjectMaster.deleteMany({})
  await prisma.standardMaster.deleteMany({})
  await prisma.boardMaster.deleteMany({})
  
  console.log("--> Database cleared successfully.")
}

async function seedAdmin() {
  console.log("--> Provisioning administrator credentials...")
  const adminEmail = (process.env.ADMIN_INITIAL_EMAIL || "admin@izonecc.in")
    .toLowerCase()
    .trim()
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || "izone@2027"
  const adminPasswordHash = await bcrypt.hash(adminPassword, 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      name: "i ZONE Administrator",
    },
    create: {
      name: "i ZONE Administrator",
      email: adminEmail,
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
    },
  })

  console.log(`--> Administrator provisioned: ${admin.email}`)
  return admin
}

async function seedMasters() {
  console.log("--> Seeding academic master tables (Boards, Standards, Subjects)...")

  // Boards
  const boards = [
    { name: "CBSE Board", code: "CBSE", description: "Central Board of Secondary Education" },
    { name: "Maharashtra State Board", code: "MSBSHSE", description: "Maharashtra State Board of Secondary and Higher Secondary Education" },
    { name: "ICSE Board", code: "ICSE", description: "Council for the Indian School Certificate Examinations" },
  ]
  for (const b of boards) {
    await prisma.boardMaster.create({ data: b })
  }

  // Standards
  const standards = [
    { name: "Class 8th", code: "8TH", order: 1, description: "Middle School Standard 8th" },
    { name: "Class 9th", code: "9TH", order: 2, description: "Secondary School Standard 9th" },
    { name: "Class 10th", code: "10TH", order: 3, description: "Secondary School Board Standard 10th" },
    { name: "Class 11th", code: "11TH", order: 4, description: "Senior Secondary Standard 11th" },
    { name: "Class 12th", code: "12TH", order: 5, description: "Senior Secondary Board Standard 12th" },
    { name: "NEET", code: "NEET", order: 6, description: "National Eligibility cum Entrance Test" },
    { name: "JEE", code: "JEE", order: 7, description: "Joint Entrance Examination (Main & Advanced)" },
  ]
  for (const s of standards) {
    await prisma.standardMaster.create({ data: s })
  }

  // Subjects
  const subjects = [
    { name: "Mathematics", code: "MATH", description: "Core & Advanced Mathematics" },
    { name: "Science", code: "SCI", description: "General Science (Physics, Chemistry, Biology)" },
    { name: "Social Science", code: "SST", description: "History, Geography, Political Science, Economics" },
    { name: "English", code: "ENG", description: "English Language & Literature" },
    { name: "Hindi", code: "HIN", description: "Hindi Course A & B" },
    { name: "Physics", code: "PHY", description: "Senior Secondary Physics Theory & Numericals" },
    { name: "Chemistry", code: "CHEM", description: "Physical, Inorganic, and Organic Chemistry" },
    { name: "Biology", code: "BIO", description: "Botany and Zoology Theory & Applications" },
    { name: "Accountancy", code: "ACC", description: "Financial Accounting, Partnership & Company Accounts" },
    { name: "Business Studies", code: "BST", description: "Principles and Functions of Management & Finance" },
    { name: "Economics", code: "ECO", description: "Microeconomics, Macroeconomics & Indian Economy" },
    { name: "English Core", code: "ENG-CORE", description: "Senior Secondary English Core" },
    { name: "Marathi", code: "MAR", description: "Marathi Language & Literature" },
    { name: "Urdu", code: "URD", description: "Urdu Course A & B / Core Literature" },
  ]
  for (const sub of subjects) {
    await prisma.subjectMaster.create({ data: sub })
  }

  console.log("--> Masters seeded successfully.")
}

async function seedTestSeriesAndTests() {
  console.log("--> Seeding CBSE Class 8th to 12th test series bundles and subject tests...")

  for (const seriesData of cbseCurriculumSeries) {
    const series = await prisma.testSeries.create({
      data: {
        title: seriesData.title,
        slug: seriesData.slug,
        description: seriesData.description,
        standard: seriesData.standard,
        stream: seriesData.stream,
        academicYear: seriesData.academicYear,
        badge: seriesData.badge,
        type: TestSeriesType.BUNDLE,
        bundlePrice: seriesData.bundlePrice,
        price: seriesData.bundlePrice,
        maxMarks: seriesData.maxMarks,
        durationMinutes: seriesData.durationMinutes,
        maxAttempts: seriesData.maxAttempts,
        status: seriesData.status,
        isPublished: seriesData.isPublished,
        resultsPublished: seriesData.resultsPublished,
        studentInstructions: seriesData.studentInstructions,
        privateEvaluationInstructions: seriesData.privateEvaluationInstructions,
      },
    })

    // Attach sample test paper
    await prisma.testPaper.create({
      data: {
        testSeriesId: series.id,
        title: seriesData.paper.title,
        fileUrl: seriesData.paper.fileUrl,
        maxMarks: seriesData.paper.maxMarks,
        rubricContent: seriesData.paper.rubricContent,
      },
    })

    // Attach sample answer sheet booklet template
    await prisma.answerSheetTemplate.create({
      data: {
        testSeriesId: series.id,
        title: seriesData.template.title,
        fileUrl: seriesData.template.fileUrl,
        templateRequired: seriesData.template.templateRequired,
        description: seriesData.template.description,
      },
    })

    // Create child subject tests
    for (const testData of seriesData.tests) {
      await prisma.test.create({
        data: {
          testSeriesId: series.id,
          title: testData.title,
          slug: testData.slug,
          subject: testData.subject,
          price: testData.price,
          isStandalone: true,
          maxMarks: testData.maxMarks,
          durationMinutes: testData.durationMinutes,
          maxAttempts: seriesData.maxAttempts,
          order: testData.order,
          questionPaperUrl: testData.questionPaperUrl,
          studentInstructions: testData.studentInstructions,
          privateEvaluationInstructions: testData.privateEvaluationInstructions,
          status: TestSeriesStatus.PUBLISHED,
          isPublished: true,
        },
      })
    }

    console.log(`  + Seeded Series: "${series.title}" with ${seriesData.tests.length} tests.`)
  }
}

async function main() {
  console.log("==================================================")
  console.log("Starting i ZONE Database Reset & Seeding Engine")
  console.log("==================================================")

  await clearDatabase()
  await seedAdmin()
  await seedMasters()
  await seedTestSeriesAndTests()

  console.log("==================================================")
  console.log("Database reset and CBSE seeding completed successfully!")
  console.log("Admin Credentials: admin@izonecc.in / izone@2027")
  console.log("==================================================")
}

main()
  .catch((e) => {
    console.error("FATAL ERROR DURING DATABASE SEED:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
