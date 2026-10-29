import { PrismaClient, SubmissionStatus, EvaluationStatus, RegistrationStatus } from "@prisma/client"
import { getGeminiModelName } from "../lib/ai/gemini-evaluator"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding Class 10 Science Submission & Evaluation...")

  const student = await prisma.user.findUnique({
    where: { email: "student@verityra.com" },
  })

  if (!student) {
    throw new Error("Demo student not found.")
  }

  const testSeries = await prisma.testSeries.findUnique({
    where: { slug: "cbse-class-10-science-board-mock-series" },
    include: { papers: true, templates: true },
  })

  if (!testSeries) {
    throw new Error("Class 10 Science test series not found.")
  }

  // 1. Ensure registration exists
  const registration = await prisma.testRegistration.upsert({
    where: {
      userId_testSeriesId: {
        userId: student.id,
        testSeriesId: testSeries.id,
      },
    },
    update: {
      attemptsUsed: 1,
      maxAttempts: 3,
      status: RegistrationStatus.ACTIVE,
    },
    create: {
      userId: student.id,
      testSeriesId: testSeries.id,
      status: RegistrationStatus.ACTIVE,
      attemptsUsed: 1,
      maxAttempts: 3,
    },
  })

  console.log(`Registration ensured for ${student.email} on ${testSeries.title}`)

  // 2. Questions & evaluations structured according to seed.ts rubric
  const questionEvaluations = [
    // Section A: 1-mark questions (Q1 - Q20)
    {
      questionNumber: "Q1",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Correct identification of displacement reaction: Fe(s) + CuSO4(aq) -> FeSO4(aq) + Cu(s).",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q2",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Accurate pH observation: Lemon juice turns blue litmus red with pH approx 2.2.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q3",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Correct chemical formula for baking soda: NaHCO3 (Sodium hydrogen carbonate).",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q4",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Accurately noted that Amphoteric oxides react with both acids and bases (Al2O3, ZnO).",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q5",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Correct structural formula and IUPAC name for Butanoic acid (C3H7COOH).",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q6",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Correctly stated function of bile juice: emulsification of dietary fats and creating alkaline medium.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q7",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Right atrium receives deoxygenated blood from superior and inferior vena cava. Correct.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q8",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Accurate synapse definition: functional junction between two adjacent neurons transmitting neurotransmitters.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q9",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Plant growth inhibitor correctly identified as Abscisic Acid (ABA).",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q10",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Accurate monohybrid F2 phenotypic ratio: 3:1 (Tall : Dwarf).",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q11",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Law of reflection: Angle of incidence equals angle of reflection (i = r).",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q12",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Power of convex lens with f = +25cm correctly calculated as P = +4.0 Dioptres.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q13",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Atmospheric refraction causes twinkling of stars and advanced sunrise by ~2 minutes.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q14",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "SI unit of electric resistivity correctly stated as Ohm-meter (Omega*m).",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q15",
      maxMarks: 1,
      marksAwarded: 0,
      feedback: "Right Hand Thumb Rule misapplied: Magnetic field lines inside a long current-carrying solenoid are parallel and uniform, not circular.",
      missingConcepts: "Magnetic field lines inside a solenoid are parallel straight lines indicating uniform field.",
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q16",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Correctly identified Earth wire provides low-resistance path preventing electric shocks.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q17",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Assertion-Reason: Both Assertion and Reason are true and Reason is correct explanation for exothermic nature of respiration.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q18",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Assertion-Reason: Rusting of iron requires both oxygen and moisture. Correctly marked Option A.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q19",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Assertion-Reason: Chromosome count in human zygote restored by fertilization. Correctly identified.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q20",
      maxMarks: 1,
      marksAwarded: 1,
      feedback: "Assertion-Reason: Magnetic field lines never intersect because compass needle cannot point in two directions at once. Correct.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },

    // Section B: 2-mark questions (Q21 - Q26)
    {
      questionNumber: "Q21",
      maxMarks: 2,
      marksAwarded: 2,
      feedback: "Accurate decomposition reaction of Calcium carbonate with balanced equation: CaCO3(s) --heat--> CaO(s) + CO2(g). Both marks awarded.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q22",
      maxMarks: 2,
      marksAwarded: 1.5,
      feedback: "Balanced equation for reaction of Zinc with dilute Sulphuric acid: Zn + H2SO4 -> ZnSO4 + H2. Rubric check: 0.5 marks deducted for omitting physical state symbols (s, aq, g).",
      missingConcepts: "Physical state designations (s), (aq), (g) missing per seed instructions.",
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q23",
      maxMarks: 2,
      marksAwarded: 2,
      feedback: "Differences between Aerobic and Anaerobic respiration well tabulated: presence of O2 vs absence, 36/38 ATP vs 2 ATP, end products CO2+H2O vs Lactic acid/Ethanol.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q24",
      maxMarks: 2,
      marksAwarded: 2,
      feedback: "Refractive index calculation: n = c / v = (3 x 10^8 m/s) / (2 x 10^8 m/s) = 1.5. Clear formula, substitution, and dimensionless result.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q25",
      maxMarks: 2,
      marksAwarded: 2,
      feedback: "Two advantages of connecting electrical appliances in parallel: independent operation switch, equal voltage (220V), and minimal total resistance.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q26",
      maxMarks: 2,
      marksAwarded: 1.5,
      feedback: "Biological magnification defined accurately with trophic accumulation. Deduct 0.5 marks for omitting DDT or heavy metal example.",
      missingConcepts: "Classic illustrative pesticide/chemical example (DDT) omitted.",
      isLegible: true,
      isUncertain: false,
    },

    // Section C: 3-mark questions (Q27 - Q33)
    {
      questionNumber: "Q27",
      maxMarks: 3,
      marksAwarded: 3,
      feedback: "Electrolysis of water: Anode reaction (2H2O -> O2 + 4H+ + 4e-) and Cathode reaction (4H+ + 4e- -> 2H2). 2:1 volume ratio explained clearly.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q28",
      maxMarks: 3,
      marksAwarded: 2,
      feedback: "Structure of Nephron: Bowman's capsule and tubular filtration described. Rubric deduction: 1 mark deducted because glomerulus blood-flow directional arrows were omitted on diagram.",
      missingConcepts: "Directional afferent/efferent arteriolar arrows omitted from nephron illustration.",
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q29",
      maxMarks: 3,
      marksAwarded: 3,
      feedback: "Reflex Arc diagram and flow: Receptor -> Sensory neuron -> Relay neuron in spinal cord -> Motor neuron -> Effector muscle. Full marks awarded.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q30",
      maxMarks: 3,
      marksAwarded: 3,
      feedback: "Corrosion and Rancidity: Prevention methods (galvanization, painting, nitrogen flushing of fried food packets) thoroughly explained with chemical rationale.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q31",
      maxMarks: 3,
      marksAwarded: 2.5,
      feedback: "Resistors in combination: Equivalent resistance calculation R_p = 4 Omega and R_total = 10 Omega. Current I = V/R = 6V / 10 Omega = 0.6 A. Deduct 0.5m for missing intermediate resistance unit.",
      missingConcepts: "Omitted Ohm unit symbol in parallel sub-calculation step.",
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q32",
      maxMarks: 3,
      marksAwarded: 3,
      feedback: "Defects of vision: Myopia causes (elongated eyeball, excessive curvature of cornea) and concave lens correction ray diagram neatly drawn.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q33",
      maxMarks: 3,
      marksAwarded: 2.5,
      feedback: "Ozone layer depletion: Formation reaction (O2 + UV -> O + O; O + O2 -> O3) and CFC breakdown. Deduct 0.5m for not mentioning Montreal Protocol 1987.",
      missingConcepts: "International environmental treaty reference (Montreal Protocol) missing.",
      isLegible: true,
      isUncertain: false,
    },

    // Section D: 5-mark questions (Q34 - Q36)
    {
      questionNumber: "Q34",
      maxMarks: 5,
      marksAwarded: 4.5,
      feedback: "Extraction of metals: Roasting vs Calcination with balanced equations. Thermite reaction (Fe2O3 + 2Al -> 2Fe + Al2O3 + Heat) correctly written. Deduct 0.5 marks for omitting delta heat symbol.",
      missingConcepts: "Reaction enthalpy delta symbol on thermite equation arrow.",
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q35",
      maxMarks: 5,
      marksAwarded: 4.5,
      feedback: "Human female reproductive system: Ovaries, Fallopian tubes, Uterus, and Cervix described. Barrier, chemical, and surgical contraception explained. Minor deduction: diagram cervix label misaligned.",
      missingConcepts: "Slight anatomical displacement on cervix diagram marker.",
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q36",
      maxMarks: 5,
      marksAwarded: 4.5,
      feedback: "Lens numerical & ray diagram: Convex lens with f = +15cm, u = -30cm (at 2F1). Image distance v = +30cm (at 2F2), magnification m = -1. Real, inverted, same size. Complete ray diagram with arrows.",
      missingConcepts: null,
      isLegible: true,
      isUncertain: false,
    },

    // Section E: 4-mark case-based integrated units (Q37 - Q39)
    {
      questionNumber: "Q37",
      maxMarks: 4,
      marksAwarded: 3.5,
      feedback: "Case Study 1 (pH in Digestive Health & Tooth Decay): (a) Antacid action (1m), (b) Tooth decay threshold pH < 5.5 due to Calcium hydroxyapatite dissolution (1m), (c) Nettle sting neutralization by dock plant base (1.5/2m).",
      missingConcepts: "Methanoic acid chemical formula in nettle hair sting partially omitted.",
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q38",
      maxMarks: 4,
      marksAwarded: 3.5,
      feedback: "Case Study 2 (Electric Power & Heating Effect): (a) Joule's law of heating H = I^2 R t (1m), (b) Commercial unit of energy 1 kWh = 3.6 x 10^6 J (1m), (c) Monthly consumption cost calculation (1.5/2m - minor arithmetic rounding slip).",
      missingConcepts: "Intermediate rounding of rupee tariff to 2 decimal places.",
      isLegible: true,
      isUncertain: false,
    },
    {
      questionNumber: "Q39",
      maxMarks: 4,
      marksAwarded: 3.5,
      feedback: "Case Study 3 (Mendel's Dihybrid Cross): (a) Round-Yellow x Wrinkled-Green F1 generation RrYy (1m), (b) F2 phenotypic ratio 9:3:3:1 (1.5m), (c) Law of Independent Assortment definition (1/1.5m).",
      missingConcepts: "Complete Punnett square 16-cell gametic combinations abbreviated.",
      isLegible: true,
      isUncertain: false,
    },
  ]

  // Calculate totals
  let totalScore = 0
  questionEvaluations.forEach((q) => {
    totalScore += q.marksAwarded
  })
  const percentage = Number(((totalScore / testSeries.maxMarks) * 100).toFixed(2))

  console.log(`Total Score Computed: ${totalScore} / ${testSeries.maxMarks} (${percentage}%)`)

  // 3. Upsert submission for Attempt #1
  const existingSub = await prisma.submission.findUnique({
    where: {
      registrationId_attemptNumber: {
        registrationId: registration.id,
        attemptNumber: 1,
      },
    },
    include: { evaluation: true },
  })

  let submissionId = existingSub?.id

  if (!existingSub) {
    const newSub = await prisma.submission.create({
      data: {
        registrationId: registration.id,
        testSeriesId: testSeries.id,
        userId: student.id,
        attemptNumber: 1,
        fileUrl: "/api/files/download?file=submissions/class-10-science-attempt-1.pdf",
        fileType: "application/pdf",
        fileSizeBytes: 4892011, // ~4.8 MB
        pageCount: 28,
        status: SubmissionStatus.COMPLETED,
        submittedAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
    })
    submissionId = newSub.id
    console.log(`Created Submission: ${submissionId}`)
  } else {
    await prisma.submission.update({
      where: { id: existingSub.id },
      data: { status: SubmissionStatus.COMPLETED },
    })
    console.log(`Updated existing Submission: ${submissionId}`)
  }

  // 4. Upsert Evaluation record
  const existingEval = await prisma.evaluation.findUnique({
    where: { submissionId: submissionId! },
  })

  if (existingEval) {
    // Delete old question evaluations to replace with fresh rubric
    await prisma.questionEvaluation.deleteMany({
      where: { evaluationId: existingEval.id },
    })

    await prisma.evaluation.update({
      where: { id: existingEval.id },
      data: {
        totalMarksAwarded: totalScore,
        maxMarks: testSeries.maxMarks,
        percentage,
        generalFeedback: `EXEMPLARY PERFORMANCE (Class 10 CBSE Board Standard):
- Candidate displays exceptional conceptual grasp across Chemical Substances (23.5/25), World of Living (22.5/25), and Natural Phenomena & Current (27/30).
- Strengths: Concise answers in Section A MCQs (19/20), mathematically rigorous lens numerical with complete ray diagrams, and thorough explanation of reflex arc and nephron filtration.
- Areas for Improvement per Official Rubric:
  1. Always include physical state symbols (s, aq, g) on chemical equations to avoid losing 0.5-mark deductions.
  2. Ensure biological illustrations feature directional arrows (e.g., blood flow through Bowman's capsule).
  3. Ensure standard units (e.g., Omega, Dioptres) are maintained across intermediate working steps.`,
        legibilityWarning: false,
        uncertaintyFlag: false,
        status: EvaluationStatus.COMPLETED,
        evaluatorModel: getGeminiModelName(),
        evaluatedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: "Automated Evaluation Engine v1.0",
        questions: {
          create: questionEvaluations,
        },
      },
    })
    console.log(`Updated Evaluation: ${existingEval.id}`)
  } else {
    const newEval = await prisma.evaluation.create({
      data: {
        submissionId: submissionId!,
        totalMarksAwarded: totalScore,
        maxMarks: testSeries.maxMarks,
        percentage,
        generalFeedback: `EXEMPLARY PERFORMANCE (Class 10 CBSE Board Standard):
- Candidate displays exceptional conceptual grasp across Chemical Substances (23.5/25), World of Living (22.5/25), and Natural Phenomena & Current (27/30).
- Strengths: Concise answers in Section A MCQs (19/20), mathematically rigorous lens numerical with complete ray diagrams, and thorough explanation of reflex arc and nephron filtration.
- Areas for Improvement per Official Rubric:
  1. Always include physical state symbols (s, aq, g) on chemical equations to avoid losing 0.5-mark deductions.
  2. Ensure biological illustrations feature directional arrows (e.g., blood flow through Bowman's capsule).
  3. Ensure standard units (e.g., Omega, Dioptres) are maintained across intermediate working steps.`,
        legibilityWarning: false,
        uncertaintyFlag: false,
        status: EvaluationStatus.COMPLETED,
        evaluatorModel: getGeminiModelName(),
        evaluatedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: "Automated Evaluation Engine v1.0",
        questions: {
          create: questionEvaluations,
        },
      },
    })
    console.log(`Created Evaluation: ${newEval.id}`)
  }

  console.log("Class 10 Science submission & evaluation seed complete!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
