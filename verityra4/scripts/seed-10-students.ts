import { PrismaClient, Role, UserStatus, TestSeriesStatus, RegistrationStatus, SubmissionStatus, EvaluationStatus } from "@prisma/client"
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
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
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

interface QuestionSeed {
  questionNumber: string
  maxMarks: number
  marksAwarded: number
  scoreBand: string
  feedback: string
  strengths: string
  examinerExpectation: string
  improvementAdvice: string
  scoreExplanation: string
}

interface StudentSubmissionSeed {
  testSeriesSlug: string
  attemptNumber: number
  totalMarksAwarded: number
  maxMarks: number
  generalFeedback: string
  questions: QuestionSeed[]
}

interface StudentSeedData {
  email: string
  name: string
  educationLevel: string
  institution: string
  phoneNumber: string
  targetExam: string
  bio: string
  submissions: StudentSubmissionSeed[]
}

async function ensureTestSeries() {
  // Ensure Class 12 Physics is published
  await prisma.testSeries.updateMany({
    where: { slug: "cbse-class-12-physics-board-mock-series" },
    data: { isPublished: true, resultsPublished: true, status: TestSeriesStatus.PUBLISHED },
  })

  // Ensure NEET UG Series exists
  await prisma.testSeries.upsert({
    where: { slug: "neet-ug-biology-human-physiology-mock" },
    update: { isPublished: true, resultsPublished: true, status: TestSeriesStatus.PUBLISHED },
    create: {
      title: "NEET (UG) National Pre-Medical Mock Examination – Biology & Human Physiology",
      slug: "neet-ug-biology-human-physiology-mock",
      description: "Intensive NEET-UG mock assessment covering Cell Biology, Genetics, Human Physiology, Plant Physiology, and Biotechnology with detailed negative marking and NCERT-aligned solutions.",
      price: 0,
      maxMarks: 180,
      durationMinutes: 180,
      maxAttempts: 3,
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      resultsPublished: true,
      studentInstructions: "1. All questions are based strictly on latest NTA NEET (UG) syllabus.\n2. Handwritten subjective justifications for high-yield diagnostic questions must be clearly legible.\n3. Show clear biological schematic diagrams for physiological pathways.",
      privateEvaluationInstructions: "CONFIDENTIAL NEET RUBRIC: Award marks based on exact NCERT terminology and diagrammatic correctness. Deduct marks for omitted cellular pathways.",
    },
  })

  // Ensure JEE Main Series exists
  await prisma.testSeries.upsert({
    where: { slug: "jee-main-mathematics-physics-mock-series" },
    update: { isPublished: true, resultsPublished: true, status: TestSeriesStatus.PUBLISHED },
    create: {
      title: "JEE Main All-India Engineering Entrance Mock – Mathematics & Mechanics",
      slug: "jee-main-mathematics-physics-mock-series",
      description: "Rigorous full-length engineering entrance mock evaluating Calculus, Coordinate Geometry, Vectors, Classical Mechanics, Electrodynamics, and Thermodynamics.",
      price: 0,
      maxMarks: 100,
      durationMinutes: 180,
      maxAttempts: 3,
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      resultsPublished: true,
      studentInstructions: "1. Time allotted is 3 hours.\n2. Show all derivation intermediate steps and graphical representations.\n3. Keep units consistent and indicate vector notations explicitly.",
      privateEvaluationInstructions: "CONFIDENTIAL JEE MAIN RUBRIC: Strictly check step derivations and boundary condition validations. Award full credit only for verified mathematical steps.",
    },
  })
}

const STUDENTS: StudentSeedData[] = [
  // Student 1: Aarav Sharma - Class 10 CBSE Mathematics
  {
    email: "student1@verityra.com",
    name: "Aarav Sharma",
    educationLevel: "Class 10",
    institution: "Delhi Public School, R.K. Puram",
    phoneNumber: "+91 98101 23401",
    targetExam: "CBSE Class 10 Board Examination 2026",
    bio: "Focused Class 10 board aspirant aiming for a 95%+ aggregate with a focus on Mathematics and Science.",
    submissions: [
      {
        testSeriesSlug: "cbse-class-10-mathematics-mock-series",
        attemptNumber: 1,
        totalMarksAwarded: 74,
        maxMarks: 80,
        generalFeedback: "Outstanding performance across all sections. Calculations and algebraic steps are structured neatly. Minor deduction in the Case Study geometry unit where one construction justification was brief.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 20,
            marksAwarded: 19,
            scoreBand: "FULL",
            feedback: "Excellent precision on Section A MCQs and VSA questions. All quadratic roots and AP common difference formulas correctly applied.",
            strengths: "Quick arithmetic resolution and flawless quadratic factoring.",
            examinerExpectation: "State general AP formula and show factoring steps.",
            improvementAdvice: "Double check sign conventions in negative common difference questions.",
            scoreExplanation: "Full marks awarded for 19 correct questions; 1 minor calculation oversight.",
          },
          {
            questionNumber: "Q2",
            maxMarks: 15,
            marksAwarded: 14,
            scoreBand: "FULL",
            feedback: "Triangles similarity proof (Basic Proportionality Theorem) was derived with clear construction lines.",
            strengths: "Neat geometric figures with proper vertex notation.",
            examinerExpectation: "State BPT theorem statement before mathematical proof.",
            improvementAdvice: "Highlight the final proportionality ratio in a neat box.",
            scoreExplanation: "14/15 awarded; proof is mathematically sound.",
          },
          {
            questionNumber: "Q3",
            maxMarks: 15,
            marksAwarded: 15,
            scoreBand: "FULL",
            feedback: "Perfect trigonometric identity evaluation. Used standard identities sin²θ + cos²θ = 1 and sec²θ - tan²θ = 1 flawlessly.",
            strengths: "Clear step-by-step LHS to RHS progression.",
            examinerExpectation: "Explicit mention of standard identities in right-hand margin.",
            improvementAdvice: "Maintain this high standard in the pre-boards.",
            scoreExplanation: "15/15 full credit awarded.",
          },
          {
            questionNumber: "Q4",
            maxMarks: 15,
            marksAwarded: 13.5,
            scoreBand: "PARTIAL",
            feedback: "Surface Areas and Volumes: Conical frustum and hemisphere composite solid volume computed accurately. Surface area calculation had a minor rounding discrepancy at the second decimal.",
            strengths: "Formula substitution was completely accurate.",
            examinerExpectation: "Keep π as 22/7 until the final algebraic simplification step.",
            improvementAdvice: "Avoid premature decimal truncation.",
            scoreExplanation: "13.5/15 awarded with 1.5 marks deducted for arithmetic approximation.",
          },
          {
            questionNumber: "Q5",
            maxMarks: 15,
            marksAwarded: 12.5,
            scoreBand: "PARTIAL",
            feedback: "Statistics Case Study: Mode and Median of grouped frequency distribution solved correctly. Graphical representation of ogive had slightly misaligned coordinates on the x-axis.",
            strengths: "Correct median class identification and formula application.",
            examinerExpectation: "Clearly label cumulative frequency axis on graph paper.",
            improvementAdvice: "Use a sharper pencil for plotting cumulative frequency points.",
            scoreExplanation: "12.5/15 awarded.",
          },
        ],
      },
    ],
  },

  // Student 2: Priya Patel - Class 10 CBSE Science
  {
    email: "student2@verityra.com",
    name: "Priya Patel",
    educationLevel: "Class 10",
    institution: "The Mother's International School, New Delhi",
    phoneNumber: "+91 98102 34502",
    targetExam: "CBSE Class 10 Boards & NTSE",
    bio: "Aspiring doctor preparing for Class 10 boards with keen interest in Life Processes and Chemistry.",
    submissions: [
      {
        testSeriesSlug: "cbse-class-10-science-board-mock-series",
        attemptNumber: 1,
        totalMarksAwarded: 71,
        maxMarks: 80,
        generalFeedback: "Very high conceptual mastery in Chemistry and Biology. Diagrams of the Human Alimentary Canal and Nephron were exceptionally well-labeled. Minor marks lost in Electricity circuit calculations.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 20,
            marksAwarded: 18.5,
            scoreBand: "FULL",
            feedback: "Chemical Reactions & Equations: All redox reactions identified correctly with oxidizing and reducing agents explicitly specified.",
            strengths: "Physical states (s, l, g, aq) included in balanced chemical equations.",
            examinerExpectation: "Balanced chemical equations with physical states.",
            improvementAdvice: "Ensure temperature and catalyst conditions are written above the reaction arrow.",
            scoreExplanation: "18.5/20 awarded.",
          },
          {
            questionNumber: "Q2",
            maxMarks: 20,
            marksAwarded: 19,
            scoreBand: "FULL",
            feedback: "Life Processes: Comprehensive explanation of double circulation in human heart with labeled four-chamber pathway.",
            strengths: "Excellent biological illustration and flow chart.",
            examinerExpectation: "Differentiate between pulmonary and systemic circulation clearly.",
            improvementAdvice: "Mention role of valves in preventing backflow of blood.",
            scoreExplanation: "19/20 awarded.",
          },
          {
            questionNumber: "Q3",
            maxMarks: 20,
            marksAwarded: 16.5,
            scoreBand: "PARTIAL",
            feedback: "Electricity & Magnetism: Ohm's law verification and equivalent resistance of series-parallel combination solved. Minor slip in power dissipation unit (wrote Ws instead of kWh for electrical energy).",
            strengths: "Correct circuit diagram with ammeter in series and voltmeter in parallel.",
            examinerExpectation: "Commercial unit of electrical energy must be in kWh.",
            improvementAdvice: "Be vigilant with final derived units.",
            scoreExplanation: "16.5/20 awarded.",
          },
          {
            questionNumber: "Q4",
            maxMarks: 20,
            marksAwarded: 17,
            scoreBand: "FULL",
            feedback: "Light - Reflection & Refraction: Convex lens ray diagrams for real, inverted and virtual, erect images drawn with ruler and proper arrows.",
            strengths: "Clean optical diagrams with focal points correctly scaled.",
            examinerExpectation: "Direction of propagation arrows on incident and refracted rays.",
            improvementAdvice: "Show principal axis clearly extending beyond 2F1 and 2F2.",
            scoreExplanation: "17/20 awarded.",
          },
        ],
      },
    ],
  },

  // Student 3: Rohan Verma - Class 11 CBSE Mathematics
  {
    email: "student3@verityra.com",
    name: "Rohan Verma",
    educationLevel: "Class 11",
    institution: "St. Xavier's Senior Secondary School, Jaipur",
    phoneNumber: "+91 98103 45603",
    targetExam: "CBSE Class 11 Annuals & JEE Main 2027",
    bio: "Class 11 Science (PCM) student focusing on higher secondary algebraic foundations and calculus.",
    submissions: [
      {
        testSeriesSlug: "cbse-class-11-mathematics-annual-series",
        attemptNumber: 1,
        totalMarksAwarded: 68.5,
        maxMarks: 80,
        generalFeedback: "Strong analytical grasp on Sets, Relations, Functions, and Complex Numbers. Conic sections parabola focus and directrix were derived cleanly.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 20,
            marksAwarded: 17.5,
            scoreBand: "FULL",
            feedback: "Sets, Relations & Functions: Domain and range of fractional and square root functions evaluated with interval notation.",
            strengths: "Precise bracket notation for open/closed intervals.",
            examinerExpectation: "Exclude points where denominator vanishes.",
            improvementAdvice: "Specify real domain condition x² - 9 >= 0 explicitly.",
            scoreExplanation: "17.5/20 awarded.",
          },
          {
            questionNumber: "Q2",
            maxMarks: 20,
            marksAwarded: 16,
            scoreBand: "PARTIAL",
            feedback: "Trigonometric Functions & Equations: Multiple angle transformations proven correctly. General solution missed one periodicity branch.",
            strengths: "Solid mastery of compound angle identities.",
            examinerExpectation: "Give general solution in form x = nπ + (-1)ⁿ α.",
            improvementAdvice: "Always state that n belongs to integers (n ∈ Z).",
            scoreExplanation: "16/20 awarded.",
          },
          {
            questionNumber: "Q3",
            maxMarks: 20,
            marksAwarded: 18,
            scoreBand: "FULL",
            feedback: "Conic Sections: Ellipse eccentricity, foci coordinates, and latus rectum length calculated with complete accuracy.",
            strengths: "Standard form x²/a² + y²/b² = 1 clearly established.",
            examinerExpectation: "Verify whether major axis lies along x-axis or y-axis.",
            improvementAdvice: "Sketch a small representative graph in margin.",
            scoreExplanation: "18/20 awarded.",
          },
          {
            questionNumber: "Q4",
            maxMarks: 20,
            marksAwarded: 17,
            scoreBand: "FULL",
            feedback: "Limits & Derivatives: First principle derivative of sin(x) derived using standard limit lim(h->0) sin(h)/h = 1.",
            strengths: "Rigorous delta-step algebraic development.",
            examinerExpectation: "State the standard limit identity before substituting.",
            improvementAdvice: "Maintain step numbering clearly.",
            scoreExplanation: "17/20 awarded.",
          },
        ],
      },
    ],
  },

  // Student 4: Ananya Iyer - Class 11 Science Theory
  {
    email: "student4@verityra.com",
    name: "Ananya Iyer",
    educationLevel: "Class 11",
    institution: "National Public School, Indiranagar, Bengaluru",
    phoneNumber: "+91 98104 56704",
    targetExam: "KVPY & CBSE Class 11 Science",
    bio: "Passionate science student exploring physical laws, cellular biology, and chemical bonding.",
    submissions: [
      {
        testSeriesSlug: "class-11-science-chapter-wise-theory-test-01-mw6rqzkv",
        attemptNumber: 1,
        totalMarksAwarded: 18.5,
        maxMarks: 20,
        generalFeedback: "Remarkable performance on short-answer and numerical theory questions. Clear conceptual depth demonstrated in Newton's second law and mitosis/meiosis comparison.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 4,
            marksAwarded: 4,
            scoreBand: "FULL",
            feedback: "All sub-questions (scalar quantities, SI unit of work, isotopes, and mitochondria function) answered with exact scientific terminology.",
            strengths: "Precise definitions with standard SI units.",
            examinerExpectation: "State scalar definition and identify ATP synthesis.",
            improvementAdvice: "None needed, excellent.",
            scoreExplanation: "4/4 full credit awarded.",
          },
          {
            questionNumber: "Q2",
            maxMarks: 2,
            marksAwarded: 2,
            scoreBand: "FULL",
            feedback: "Newton's second law defined as rate of change of momentum proportional to applied force with vector form F = ma.",
            strengths: "Correct calculus premise dp/dt = F.",
            examinerExpectation: "State law and provide mathematical relation.",
            improvementAdvice: "Mention that mass is assumed constant.",
            scoreExplanation: "2/2 full credit awarded.",
          },
          {
            questionNumber: "Q3",
            maxMarks: 2,
            marksAwarded: 2,
            scoreBand: "FULL",
            feedback: "Accurate definition of covalent bond with Lewis dot structure of H2 and O2 molecules.",
            strengths: "Neat electron pairing visualization.",
            examinerExpectation: "Show mutual sharing of electrons.",
            improvementAdvice: "Keep lone pairs clearly marked.",
            scoreExplanation: "2/2 full credit awarded.",
          },
          {
            questionNumber: "Q4",
            maxMarks: 3,
            marksAwarded: 3,
            scoreBand: "FULL",
            feedback: "Kinematics numerical solved methodically with given values, equation v² = u² + 2as, and correct unit ms⁻¹.",
            strengths: "Structured given-to-find workflow.",
            examinerExpectation: "State chosen kinematic equation of motion.",
            improvementAdvice: "Box the final answer.",
            scoreExplanation: "3/3 full credit awarded.",
          },
          {
            questionNumber: "Q5",
            maxMarks: 3,
            marksAwarded: 2.5,
            scoreBand: "PARTIAL",
            feedback: "Fluid Mosaic Model of plasma membrane described clearly with phospholipid bilayer and integral proteins.",
            strengths: "Detailed biochemical composition mentioned.",
            examinerExpectation: "Mention Singer & Nicolson (1972) reference model.",
            improvementAdvice: "Include the term 'selectively permeable'.",
            scoreExplanation: "2.5/3 awarded.",
          },
          {
            questionNumber: "Q6",
            maxMarks: 3,
            marksAwarded: 2.5,
            scoreBand: "PARTIAL",
            feedback: "Mitosis vs Meiosis differences tabulated cleanly across ploidy level, number of daughter cells, and crossing over.",
            strengths: "Structured 3-column comparative table.",
            examinerExpectation: "Mention occurrence in somatic vs germ cells.",
            improvementAdvice: "Cite anaphase I vs anaphase separation differences.",
            scoreExplanation: "2.5/3 awarded.",
          },
          {
            questionNumber: "Q7",
            maxMarks: 3,
            marksAwarded: 2.5,
            scoreBand: "PARTIAL",
            feedback: "Both laws of reflection stated correctly with clear ray diagram showing angle of incidence = angle of reflection.",
            strengths: "Normal ray drawn perpendicular to reflecting boundary.",
            examinerExpectation: "Specify that incident ray, normal, and reflected ray lie in same plane.",
            improvementAdvice: "Add direction arrows on the reflected ray.",
            scoreExplanation: "2.5/3 awarded.",
          },
        ],
      },
    ],
  },

  // Student 5: Vikram Malhotra - Class 12 CBSE Mathematics
  {
    email: "student5@verityra.com",
    name: "Vikram Malhotra",
    educationLevel: "Class 12",
    institution: "Modern School, Barakhamba Road, New Delhi",
    phoneNumber: "+91 98105 67805",
    targetExam: "CBSE Class 12 Board & B.Tech Admissions",
    bio: "Senior secondary student striving for centum in Class 12 CBSE Mathematics.",
    submissions: [
      {
        testSeriesSlug: "cbse-class-12-mathematics-board-mock-series",
        attemptNumber: 1,
        totalMarksAwarded: 73,
        maxMarks: 80,
        generalFeedback: "Exemplary solutions in Matrices, Determinants, and Differential Calculus. The 6-marker on Application of Derivatives (Optimization of Cylinder in Sphere) was a textbook-perfect derivation.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 20,
            marksAwarded: 18.5,
            scoreBand: "FULL",
            feedback: "Matrices & Determinants: Inverse by adjoint method and matrix method system of linear equations AX = B solved without calculation error.",
            strengths: "Clean cofactor matrix calculation and verified determinant value.",
            examinerExpectation: "State det(A) ≠ 0 before claiming unique solution.",
            improvementAdvice: "Check row operations if using elementary transformations.",
            scoreExplanation: "18.5/20 awarded.",
          },
          {
            questionNumber: "Q2",
            maxMarks: 20,
            marksAwarded: 19,
            scoreBand: "FULL",
            feedback: "Continuity & Differentiability: Proved continuity at critical point x = 0 and derived second-order derivative successfully.",
            strengths: "LHL and RHL computed independently with precise limits.",
            examinerExpectation: "Show f(a) = lim(x->a) f(x) condition explicitly.",
            improvementAdvice: "Maintain clear section dividers between parts.",
            scoreExplanation: "19/20 awarded.",
          },
          {
            questionNumber: "Q3",
            maxMarks: 20,
            marksAwarded: 17.5,
            scoreBand: "FULL",
            feedback: "Integrals & Differential Equations: Definite integral evaluated using property ∫[0,a] f(x)dx = ∫[0,a] f(a-x)dx. Linear differential equation integrating factor computed accurately.",
            strengths: "Correct identification of standard integrating factor e^(∫P dx).",
            examinerExpectation: "Explicitly state the integration constant C and solve for initial condition.",
            improvementAdvice: "Ensure the constant C is carried through until final condition.",
            scoreExplanation: "17.5/20 awarded.",
          },
          {
            questionNumber: "Q4",
            maxMarks: 20,
            marksAwarded: 18,
            scoreBand: "FULL",
            feedback: "Vectors & Three Dimensional Geometry: Shortest distance between skew lines derived using vector formula |(b1 × b2) · (a2 - a1)| / |b1 × b2|.",
            strengths: "Accurate determinant cross-product calculation.",
            examinerExpectation: "State conditions for lines to be coplanar if distance = 0.",
            improvementAdvice: "Write vector arrows on all directional coefficients.",
            scoreExplanation: "18/20 awarded.",
          },
        ],
      },
    ],
  },

  // Student 6: Neha Gupta - Class 12 CBSE Physics
  {
    email: "student6@verityra.com",
    name: "Neha Gupta",
    educationLevel: "Class 12",
    institution: "Bal Bharati Public School, Gangaram Hospital Marg, Delhi",
    phoneNumber: "+91 98106 78906",
    targetExam: "CBSE Class 12 Boards & NEET UG 2026",
    bio: "Pre-medical student excelling in Electromagnetism, Wave Optics, and Modern Physics.",
    submissions: [
      {
        testSeriesSlug: "cbse-class-12-physics-board-mock-series",
        attemptNumber: 1,
        totalMarksAwarded: 62.5,
        maxMarks: 70,
        generalFeedback: "Very strong conceptual grasp across all 5 units. Derivation of Electric Field due to Dipole on Equatorial axis and AC LCR resonance curve were thoroughly executed.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 16,
            marksAwarded: 14.5,
            scoreBand: "FULL",
            feedback: "Electrostatics & Current: Gauss's Law applied to uniformly charged infinite thin plane sheet. Kirchhoff's loop rule equations solved accurately.",
            strengths: "Proper cylindrical Gaussian surface depicted with flux vectors.",
            examinerExpectation: "Show E · dA for all three cylinder faces (curved + 2 end caps).",
            improvementAdvice: "State that charge enclosed q = σ A clearly.",
            scoreExplanation: "14.5/16 awarded.",
          },
          {
            questionNumber: "Q2",
            maxMarks: 17,
            marksAwarded: 15,
            scoreBand: "FULL",
            feedback: "Magnetism & EMI/AC: Mutual inductance between two coaxial solenoids derived with standard formula M = μ0 n1 n2 A l. Resonance condition in series LCR circuit verified.",
            strengths: "Clean phasor diagram showing voltage and current phase alignment.",
            examinerExpectation: "State condition XL = XC for resonance frequency ω = 1/√(LC).",
            improvementAdvice: "Label impedance minimum on frequency vs current curve.",
            scoreExplanation: "15/17 awarded.",
          },
          {
            questionNumber: "Q3",
            maxMarks: 18,
            marksAwarded: 16,
            scoreBand: "FULL",
            feedback: "Optics: Lens Maker's Formula derived by considering refraction at two spherical surfaces in sequence. Total Internal Reflection conditions verified.",
            strengths: "Sign convention properly applied for R1 and R2.",
            examinerExpectation: "State assumptions: thin lens, small apertures, paraxial rays.",
            improvementAdvice: "Highlight all three assumptions before beginning derivation.",
            scoreExplanation: "16/18 awarded.",
          },
          {
            questionNumber: "Q4",
            maxMarks: 19,
            marksAwarded: 17,
            scoreBand: "FULL",
            feedback: "Dual Nature & Semiconductors: Einstein's photoelectric equation hν = Φ + KE_max explained with stopping potential vs frequency graph. Forward/reverse bias V-I characteristics of p-n junction diode plotted.",
            strengths: "Threshold frequency intercept correctly marked on graph.",
            examinerExpectation: "Differentiate between breakdown mechanisms (Zener vs Avalanche).",
            improvementAdvice: "Indicate dynamic resistance formula ΔV/ΔI.",
            scoreExplanation: "17/19 awarded.",
          },
        ],
      },
    ],
  },

  // Student 7: Aditya Nair - UPSC Civil Services GS Paper I
  {
    email: "student7@verityra.com",
    name: "Aditya Nair",
    educationLevel: "Post-Graduate",
    institution: "St. Stephen's College, University of Delhi",
    phoneNumber: "+91 98107 89007",
    targetExam: "UPSC Civil Services Examination (Mains) 2026",
    bio: "Civil services aspirant with History & Geography optional background, training for UPSC Mains answer writing.",
    submissions: [
      {
        testSeriesSlug: "upsc-gs-1-mains-mock-1",
        attemptNumber: 1,
        totalMarksAwarded: 142,
        maxMarks: 250,
        generalFeedback: "Exceptional answer-writing structure adhering to the UPSC demand-supply matrix. Multi-dimensional perspectives covering cultural, socio-economic, and geographical factors. High-scoring Mains benchmark.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 50,
            marksAwarded: 32,
            scoreBand: "PARTIAL",
            feedback: "Art & Culture: Evaluated evolution of Nagara and Dravida temple architecture with schematic diagram of Shikara vs Vimana, Mandapa, and Garbhagriha.",
            strengths: "Hand-drawn schematic architectural layout and specific dynasty examples (Chola, Chandela).",
            examinerExpectation: "Include regional variations such as Vesara style (Chalukyan).",
            improvementAdvice: "Integrate socio-religious role of temple in medieval economy.",
            scoreExplanation: "32/50 awarded (top quartile marks for 10-markers).",
          },
          {
            questionNumber: "Q6",
            maxMarks: 50,
            marksAwarded: 30,
            scoreBand: "PARTIAL",
            feedback: "Modern Indian History: Analyzed the shift from moderate to extremist politics in the Indian national movement post-Partition of Bengal (1905).",
            strengths: "Balanced analysis of constitutional agitation vs mass mobilization (Swadeshi movement).",
            examinerExpectation: "Mention economic critique by Dadabhai Naoroji & R.C. Dutt.",
            improvementAdvice: "Conclude with the Surat Split (1907) synthesis and long-term impact on Gandhian era.",
            scoreExplanation: "30/50 awarded.",
          },
          {
            questionNumber: "Q11",
            maxMarks: 75,
            marksAwarded: 42,
            scoreBand: "PARTIAL",
            feedback: "Physical Geography: Mechanisms of Indian Monsoon, role of Tibetan Plateau heating, Somali Jet, and Indian Ocean Dipole (IOD).",
            strengths: "Good hand-sketched synoptic map of the Indian Ocean showing wind trajectories.",
            examinerExpectation: "Elaborate on Madden-Julian Oscillation (MJO) intra-seasonal variations.",
            improvementAdvice: "Connect ENSO cycles with contemporary drought mitigation policy.",
            scoreExplanation: "42/75 awarded.",
          },
          {
            questionNumber: "Q16",
            maxMarks: 75,
            marksAwarded: 38,
            scoreBand: "PARTIAL",
            feedback: "Indian Society: Impact of globalization on elderly care and traditional family structures in urban India.",
            strengths: "Empirical citations from NITI Aayog Senior Citizens reports.",
            examinerExpectation: "Highlight silver economy opportunities alongside social security challenges.",
            improvementAdvice: "Suggest policy way forward using Maintenance and Welfare of Parents Act.",
            scoreExplanation: "38/75 awarded.",
          },
        ],
      },
    ],
  },

  // Student 8: Sneha Kulkarni - State Judicial Services Law Mock
  {
    email: "student8@verityra.com",
    name: "Sneha Kulkarni",
    educationLevel: "LL.B Final Year",
    institution: "ILS Law College, Pune",
    phoneNumber: "+91 98108 90108",
    targetExam: "Civil Judge Junior Division (Judicial Services) 2026",
    bio: "Law scholar specializing in Criminal Law, Civil Procedure Code, and Constitutional Jurisprudence.",
    submissions: [
      {
        testSeriesSlug: "state-judiciary-mains-mock-1",
        attemptNumber: 1,
        totalMarksAwarded: 148,
        maxMarks: 200,
        generalFeedback: "Impeccable legal articulation with accurate statutory provisions and Supreme Court landmark citations. Logical synthesis of substantive law with procedural safeguards.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 50,
            marksAwarded: 38,
            scoreBand: "FULL",
            feedback: "Civil Procedure: Section 11 Res Judicata requirements, constructive res judicata (Explanation IV), and distinction from Res Sub Judice (Section 10).",
            strengths: "Cited Duchess of Kingston case and Daryao v. State of UP.",
            examinerExpectation: "State all eight explanations of Section 11 CPC systematically.",
            improvementAdvice: "Briefly discuss applicability to execution proceedings.",
            scoreExplanation: "38/50 awarded (distinction level legal drafting).",
          },
          {
            questionNumber: "Q2",
            maxMarks: 50,
            marksAwarded: 40,
            scoreBand: "FULL",
            feedback: "Indian Penal Code: Critical distinction between Culpable Homicide not amounting to murder (Section 299) and Murder (Section 300). Five exceptions analyzed.",
            strengths: "Regina v. Govinda analytical ratio cited and broken down into tabular matrix.",
            examinerExpectation: "Compare degree of probability of death in clauses (b) and (c).",
            improvementAdvice: "Cite recent Supreme Court rulings on sudden fight exception.",
            scoreExplanation: "40/50 awarded.",
          },
          {
            questionNumber: "Q3",
            maxMarks: 50,
            marksAwarded: 36,
            scoreBand: "FULL",
            feedback: "Law of Evidence: Section 32(1) Dying Declaration evidentiary value and corroboration guidelines.",
            strengths: "Sharad Birdhichand Sarda v. State of Maharashtra panchsheel principles highlighted.",
            examinerExpectation: "Examine admissibility when maker survives (Sections 157 & 145).",
            improvementAdvice: "Mention fitness certificate by medical practitioner.",
            scoreExplanation: "36/50 awarded.",
          },
          {
            questionNumber: "Q4",
            maxMarks: 50,
            marksAwarded: 34,
            scoreBand: "FULL",
            feedback: "Criminal Procedure: Bail jurisprudence in non-bailable offences under Section 437 and Section 439 CrPC.",
            strengths: "Gudikanti Narasimhulu 'bail is the rule, jail is the exception' doctrine explained.",
            examinerExpectation: "Distinguish statutory default bail under Section 167(2) CrPC.",
            improvementAdvice: "Elaborate on cancellation of bail principles.",
            scoreExplanation: "34/50 awarded.",
          },
        ],
      },
    ],
  },

  // Student 9: Kabir Mehta - NEET UG Medical Entrance
  {
    email: "student9@verityra.com",
    name: "Kabir Mehta",
    educationLevel: "Class 12 Dropper",
    institution: "Allen Career Institute, Kota",
    phoneNumber: "+91 98109 01209",
    targetExam: "NEET (UG) Medical 2026",
    bio: "Focused medical aspirant revising Zoology, Botany, and NCERT-oriented Human Anatomy.",
    submissions: [
      {
        testSeriesSlug: "neet-ug-biology-human-physiology-mock",
        attemptNumber: 1,
        totalMarksAwarded: 162,
        maxMarks: 180,
        generalFeedback: "Outstanding high-yield performance matching NTA 99th percentile standard. Flawless answers in Endocrine regulation and Mendelian inheritance.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 45,
            marksAwarded: 42,
            scoreBand: "FULL",
            feedback: "Human Physiology: Hormonal feedback loops involving Hypothalamus, Pituitary, and Adrenal cortex during emergency responses.",
            strengths: "Clear flowchart depicting ACTH and Cortisol negative feedback regulation.",
            examinerExpectation: "Identify renin-angiotensin-aldosterone system (RAAS) stimulus.",
            improvementAdvice: "Specify atrial natriuretic peptide (ANP) antagonistic action.",
            scoreExplanation: "42/45 awarded.",
          },
          {
            questionNumber: "Q2",
            maxMarks: 45,
            marksAwarded: 43,
            scoreBand: "FULL",
            feedback: "Genetics: Dihybrid cross phenotypic and genotypic ratios, law of independent assortment, and linkage deviations identified.",
            strengths: "Neat Punnett square with Morgan's Drosophila linkage explanation.",
            examinerExpectation: "State recombination frequency formula.",
            improvementAdvice: "Indicate map units (centimorgans) definition.",
            scoreExplanation: "43/45 awarded.",
          },
          {
            questionNumber: "Q3",
            maxMarks: 45,
            marksAwarded: 39,
            scoreBand: "FULL",
            feedback: "Biotechnology: Principles of recombinant DNA technology, restriction endonucleases (sticky ends), and PCR amplification stages.",
            strengths: "Clear distinction between Taq polymerase and standard DNA polymerase.",
            examinerExpectation: "Detail denaturation, annealing, and extension temperature profiles.",
            improvementAdvice: "Highlight the role of selectable markers (ampicillin/tetracycline resistance).",
            scoreExplanation: "39/45 awarded.",
          },
          {
            questionNumber: "Q4",
            maxMarks: 45,
            marksAwarded: 38,
            scoreBand: "FULL",
            feedback: "Ecology & Environment: Energy flow in trophic levels (10% rule), ecological pyramids, and biodiversity hotspots in India.",
            strengths: "Accurate inverted biomass pyramid of aquatic ecosystems highlighted.",
            examinerExpectation: "Mention Western Ghats and Indo-Burma biodiversity regions.",
            improvementAdvice: "Cite Ramsar wetland conventions in conservation section.",
            scoreExplanation: "38/45 awarded.",
          },
        ],
      },
    ],
  },

  // Student 10: Pooja Reddy - JEE Main Engineering Entrance
  {
    email: "student10@verityra.com",
    name: "Pooja Reddy",
    educationLevel: "Class 12",
    institution: "Sri Chaitanya Junior College, Hyderabad",
    phoneNumber: "+91 98110 12310",
    targetExam: "JEE Main & JEE Advanced 2026",
    bio: "Top-ranking engineering aspirant specializing in Advanced Calculus, Mechanics, and Modern Physics.",
    submissions: [
      {
        testSeriesSlug: "jee-main-mathematics-physics-mock-series",
        attemptNumber: 1,
        totalMarksAwarded: 88,
        maxMarks: 100,
        generalFeedback: "Phenomenal score demonstrating exceptional problem-solving speed and derivation rigor. Rotational inertia tensors and integral bounds evaluated flawlessly.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 25,
            marksAwarded: 23,
            scoreBand: "FULL",
            feedback: "Calculus & Optimization: Definite integration with Leibniz rule differentiation under integral sign. Maximum area under parabola solved cleanly.",
            strengths: "Applied Leibniz rule flawlessly with upper and lower chain differentiation.",
            examinerExpectation: "Check derivative sign test for true maximum.",
            improvementAdvice: "Verify continuity of integrand over integration limits.",
            scoreExplanation: "23/25 awarded.",
          },
          {
            questionNumber: "Q2",
            maxMarks: 25,
            marksAwarded: 22,
            scoreBand: "FULL",
            feedback: "Rotational Dynamics: Rolling without slipping on inclined plane with moment of inertia computation using parallel axis theorem.",
            strengths: "Correct friction direction and torque equation about center of mass.",
            examinerExpectation: "Equate translation acceleration a = R α.",
            improvementAdvice: "Show conservation of mechanical energy as verification.",
            scoreExplanation: "22/25 awarded.",
          },
          {
            questionNumber: "Q3",
            maxMarks: 25,
            marksAwarded: 22,
            scoreBand: "FULL",
            feedback: "Electromagnetism: Induced EMF in rotating conducting rod in uniform perpendicular magnetic field. LC oscillation differential equation solved.",
            strengths: "Derived E = 1/2 B ω L² from first principles of Lorentz force.",
            examinerExpectation: "State Faraday-Lenz law of electromagnetic induction.",
            improvementAdvice: "Include terminal polarity diagram of the rotating conductor.",
            scoreExplanation: "22/25 awarded.",
          },
          {
            questionNumber: "Q4",
            maxMarks: 25,
            marksAwarded: 21,
            scoreBand: "FULL",
            feedback: "Thermodynamics: Reversible cyclic process (Carnot cycle) efficiency derived using P-V and T-S state diagrams.",
            strengths: "Clear adiabatic expansion relation P V^γ = constant.",
            examinerExpectation: "Prove that net work done equals enclosed area on P-V diagram.",
            improvementAdvice: "Label all isothermal and adiabatic curve slopes clearly.",
            scoreExplanation: "21/25 awarded.",
          },
        ],
      },
    ],
  },
]

async function main() {
  console.log("================================================================================")
  console.log("            SEEDING 10 TEST STUDENTS & AUTO-FILLED SUBMISSIONS")
  console.log("================================================================================")

  // Step 1: Ensure all test series are available
  await ensureTestSeries()
  console.log("Ensured target test series are published and active.")

  // Step 2: Hash common password: "Student@2026!"
  const passwordToSet = "Student@2026!"
  const passwordHash = await bcrypt.hash(passwordToSet, 12)
  console.log(`Common password hashed: "${passwordToSet}"`)

  const summaryList: Array<{
    number: number
    name: string
    email: string
    password: string
    education: string
    targetExam: string
    testTitle: string
    marks: string
    percentage: string
  }> = []

  let idx = 1
  for (const item of STUDENTS) {
    console.log(`\n--- Provisioning Student ${idx}: ${item.name} (${item.email}) ---`)

    // 1. Create or update student user (ROLE MUST BE STUDENT)
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        passwordHash: passwordHash,
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
      },
      create: {
        name: item.name,
        email: item.email,
        passwordHash: passwordHash,
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,
        emailVerified: new Date(),
      },
    })
    console.log(`  ✓ User record verified: ID ${user.id}`)

    // 2. Create or update student profile
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {
        educationLevel: item.educationLevel,
        institution: item.institution,
        phoneNumber: item.phoneNumber,
        targetExam: item.targetExam,
        bio: item.bio,
      },
      create: {
        userId: user.id,
        educationLevel: item.educationLevel,
        institution: item.institution,
        phoneNumber: item.phoneNumber,
        targetExam: item.targetExam,
        bio: item.bio,
      },
    })
    console.log(`  ✓ Student profile updated: ${item.educationLevel} | ${item.institution}`)

    // 3. Process test submissions
    for (const sub of item.submissions) {
      const testSeries = await prisma.testSeries.findUnique({
        where: { slug: sub.testSeriesSlug },
      })

      if (!testSeries) {
        console.warn(`  ⚠ Warning: Test series "${sub.testSeriesSlug}" not found! Skipping submission.`)
        continue
      }

      // Create or update registration (Free enrollment, payment = null)
      const registration = await prisma.testRegistration.upsert({
        where: {
          userId_testSeriesId: {
            userId: user.id,
            testSeriesId: testSeries.id,
          },
        },
        update: {
          status: RegistrationStatus.ACTIVE,
          attemptsUsed: 1,
          maxAttempts: testSeries.maxAttempts,
        },
        create: {
          userId: user.id,
          testSeriesId: testSeries.id,
          status: RegistrationStatus.ACTIVE,
          attemptsUsed: 1,
          maxAttempts: testSeries.maxAttempts,
          registeredAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
        },
      })
      console.log(`  ✓ Registered for: ${testSeries.title}`)

      // Create or update submission
      const percentage = Math.round((sub.totalMarksAwarded / sub.maxMarks) * 10000) / 100
      const existingSubmission = await prisma.submission.findUnique({
        where: {
          registrationId_attemptNumber: {
            registrationId: registration.id,
            attemptNumber: sub.attemptNumber,
          },
        },
        include: { evaluation: true },
      })

      let submissionId = existingSubmission?.id

      if (!existingSubmission) {
        const newSub = await prisma.submission.create({
          data: {
            registrationId: registration.id,
            testSeriesId: testSeries.id,
            userId: user.id,
            attemptNumber: sub.attemptNumber,
            fileUrl: `/api/files/download?bucket=verityra-private&file=submissions/${testSeries.id}/${user.id}/attempt_${sub.attemptNumber}_handwritten_sheet.pdf`,
            fileType: "application/pdf",
            fileSizeBytes: 148500,
            status: SubmissionStatus.COMPLETED,
            aiEvaluationRuns: 1,
            submittedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
          },
        })
        submissionId = newSub.id
        console.log(`  ✓ Created submission: Attempt ${sub.attemptNumber}`)
      } else {
        await prisma.submission.update({
          where: { id: existingSubmission.id },
          data: {
            status: SubmissionStatus.COMPLETED,
            aiEvaluationRuns: 1,
          },
        })
        console.log(`  ✓ Existing submission refreshed: ${submissionId}`)
      }

      // Create or update evaluation
      if (submissionId) {
        const existingEval = await prisma.evaluation.findUnique({
          where: { submissionId },
        })

        let evalId: string
        if (existingEval) {
          const updatedEval = await prisma.evaluation.update({
            where: { id: existingEval.id },
            data: {
              totalMarksAwarded: sub.totalMarksAwarded,
              maxMarks: sub.maxMarks,
              percentage: percentage,
              generalFeedback: sub.generalFeedback,
              status: EvaluationStatus.COMPLETED,
              evaluatorModel: "gemini-3.5-flash-lite",
              evaluatorVersion: "v1",
              evaluatedAt: new Date(Date.now() - 86400000 * 1), // 1 day ago
            },
          })
          evalId = updatedEval.id
          // Clean existing questions to avoid duplicates
          await prisma.questionEvaluation.deleteMany({
            where: { evaluationId: evalId },
          })
        } else {
          const newEval = await prisma.evaluation.create({
            data: {
              submissionId,
              totalMarksAwarded: sub.totalMarksAwarded,
              maxMarks: sub.maxMarks,
              percentage: percentage,
              generalFeedback: sub.generalFeedback,
              legibilityWarning: false,
              uncertaintyFlag: false,
              status: EvaluationStatus.COMPLETED,
              evaluatorModel: "gemini-3.5-flash-lite",
              evaluatorVersion: "v1",
              evaluatedAt: new Date(Date.now() - 86400000 * 1),
            },
          })
          evalId = newEval.id
        }

        // Insert structured question-by-question evaluations
        for (const q of sub.questions) {
          await prisma.questionEvaluation.create({
            data: {
              evaluationId: evalId,
              questionNumber: q.questionNumber,
              maxMarks: q.maxMarks,
              marksAwarded: q.marksAwarded,
              scoreBand: q.scoreBand,
              feedback: q.feedback,
              strengths: q.strengths,
              examinerExpectation: q.examinerExpectation,
              improvementAdvice: q.improvementAdvice,
              scoreExplanation: q.scoreExplanation,
              isLegible: true,
              isUncertain: false,
            },
          })
        }
        console.log(`  ✓ Evaluation saved: ${sub.totalMarksAwarded}/${sub.maxMarks} (${percentage}%) with ${sub.questions.length} questions`)

        summaryList.push({
          number: idx,
          name: item.name,
          email: item.email,
          password: passwordToSet,
          education: item.educationLevel,
          targetExam: item.targetExam,
          testTitle: testSeries.title,
          marks: `${sub.totalMarksAwarded} / ${sub.maxMarks}`,
          percentage: `${percentage}%`,
        })
      }
    }

    idx++
  }

  console.log("\n================================================================================")
  console.log("                      10 STUDENTS SEEDING COMPLETE")
  console.log("================================================================================")
  console.table(summaryList)
}

main()
  .catch((e) => {
    console.error("FATAL SEED ERROR:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
