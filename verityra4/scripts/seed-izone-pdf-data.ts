import fs from "fs"
import path from "path"
import {
  PrismaClient,
  TestSeriesStatus,
  TestSeriesType,
  RegistrationStatus,
  SubmissionStatus,
  EvaluationStatus,
  EvaluationTrigger,
} from "@prisma/client"

// Native .env parser
try {
  const envPath = path.resolve(__dirname, "../.env")
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8")
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith("#")) {
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
  }
} catch (e) {
  // ignore
}

const prisma = new PrismaClient()

async function main() {
  console.log("==> Seeding IZONE Authentic PDF Data into Database...")

  // 1. Upsert Board Masters
  const boardMSBSHSE = await prisma.boardMaster.upsert({
    where: { name: "Maharashtra State Board (Urdu Medium)" },
    update: {
      code: "MSBSHSE-URD",
      description: "Maharashtra State Board of Secondary and Higher Secondary Education (SSC/HSC) - Urdu Medium",
      isActive: true,
    },
    create: {
      name: "Maharashtra State Board (Urdu Medium)",
      code: "MSBSHSE-URD",
      description: "Maharashtra State Board of Secondary and Higher Secondary Education (SSC/HSC) - Urdu Medium",
      isActive: true,
    },
  })
  console.log(`[Master] Board ready: ${boardMSBSHSE.name} (${boardMSBSHSE.code})`)

  // 2. Upsert Subject Masters
  const subjectSci2Urdu = await prisma.subjectMaster.upsert({
    where: { name: "Science & Technology Part 2 (Urdu)" },
    update: {
      code: "SCI2-URD",
      description: "Class 10 Science and Technology Part 2 (حسیاتیات، ماحولیاتی سائنس و جینیات) - Urdu Medium",
      isActive: true,
    },
    create: {
      name: "Science & Technology Part 2 (Urdu)",
      code: "SCI2-URD",
      description: "Class 10 Science and Technology Part 2 (حسیاتیات، ماحولیاتی سائنس و جینیات) - Urdu Medium",
      isActive: true,
    },
  })
  console.log(`[Master] Subject ready: ${subjectSci2Urdu.name} (${subjectSci2Urdu.code})`)

  const subjectSci1Urdu = await prisma.subjectMaster.upsert({
    where: { name: "Science & Technology Part 1 (Urdu)" },
    update: {
      code: "SCI1-URD",
      description: "Class 10 Science and Technology Part 1 (طبیعیات و کیمیا) - Urdu Medium",
      isActive: true,
    },
    create: {
      name: "Science & Technology Part 1 (Urdu)",
      code: "SCI1-URD",
      description: "Class 10 Science and Technology Part 1 (طبیعیات و کیمیا) - Urdu Medium",
      isActive: true,
    },
  })
  console.log(`[Master] Subject ready: ${subjectSci1Urdu.name} (${subjectSci1Urdu.code})`)

  // 3. Upsert Standard Master
  const standard10th = await prisma.standardMaster.upsert({
    where: { name: "Class 10th" },
    update: { code: "STD-10", order: 10, isActive: true },
    create: { name: "Class 10th", code: "STD-10", order: 10, isActive: true },
  })
  console.log(`[Master] Standard ready: ${standard10th.name}`)

  // 4. Create/Upsert Test Series Bundle
  const seriesSlug = "izone-class-10-urdu-medium-preboard-series-2025-26"
  const testSeries = await prisma.testSeries.upsert({
    where: { slug: seriesSlug },
    update: {
      title: "Class 10th Urdu Medium Pre-Board Mock Exam Series 2026",
      description:
        "Official Class 10th Maharashtra State Board Urdu Medium Examination Series by IZONE Coaching Classes & Training Academy, Jaswantpura, Aurangabad. Includes authentic Question Papers, Marking Rubrics, Model Answers, and teacher evaluation criteria for Science & Technology Part 2.",
      price: 39900,
      bundlePrice: 29900,
      type: TestSeriesType.BUNDLE,
      standard: "10th",
      stream: "Maharashtra State Board (Urdu Medium)",
      badge: "IZONE Official · Urdu Medium",
      academicYear: "2025-26",
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      resultsPublished: true,
      maxMarks: 40,
      durationMinutes: 120,
      studentInstructions:
        "۱. وقت: ۲ گھنٹے، کل نمبرات: ۴۰۔\n۲. تمام سوالات حل کرنا لازمی ہیں۔\n۳. اشکال اور روانی خاکے صاف ستھرے بنائیں۔\n۴. ہر نئے سوال کا جواب نئے صفحے سے شروع کریں۔\n۵. آئی زون اکیڈمی کے امتحانی اصولوں کے مطابق نقل کرنا سخت منع ہے۔",
      privateEvaluationInstructions:
        "IZONE COACHING ACADEMY CONFIDENTIAL EVALUATION RUBRIC:\n1. Total Marks: 40. Qualifying Threshold: 14/40 (35%).\n2. Q1 (MCQ & Match/Names): Strict key adherence. 1 mark per correct answer.\n3. Q2 (Scientific Reasons & 2-mark concepts): Award 1 mark for accurate concept, 1 mark for scientific terminology in Urdu.\n4. Q3 (Flowchart & 3-mark questions): Award step marks for Glycolysis/Krebs cycle flow chart and evolutionary evidence.\n5. Q4 (Diagram & Environmental awareness): Award up to 5 marks for complete reasoning on thermal power generation and symbols.\n6. Flag handwriting/legibility errors if Urdu nastaliq script cannot be verified.",
    },
    create: {
      title: "Class 10th Urdu Medium Pre-Board Mock Exam Series 2026",
      slug: seriesSlug,
      description:
        "Official Class 10th Maharashtra State Board Urdu Medium Examination Series by IZONE Coaching Classes & Training Academy, Jaswantpura, Aurangabad. Includes authentic Question Papers, Marking Rubrics, Model Answers, and teacher evaluation criteria for Science & Technology Part 2.",
      price: 39900,
      bundlePrice: 29900,
      type: TestSeriesType.BUNDLE,
      standard: "10th",
      stream: "Maharashtra State Board (Urdu Medium)",
      badge: "IZONE Official · Urdu Medium",
      academicYear: "2025-26",
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      resultsPublished: true,
      maxMarks: 40,
      durationMinutes: 120,
      studentInstructions:
        "۱. وقت: ۲ گھنٹے، کل نمبرات: ۴۰۔\n۲. تمام سوالات حل کرنا لازمی ہیں۔\n۳. اشکال اور روانی خاکے صاف ستھرے بنائیں۔\n۴. ہر نئے سوال کا جواب نئے صفحے سے شروع کریں۔\n۵. آئی زون اکیڈمی کے امتحانی اصولوں کے مطابق نقل کرنا سخت منع ہے۔",
      privateEvaluationInstructions:
        "IZONE COACHING ACADEMY CONFIDENTIAL EVALUATION RUBRIC:\n1. Total Marks: 40. Qualifying Threshold: 14/40 (35%).\n2. Q1 (MCQ & Match/Names): Strict key adherence. 1 mark per correct answer.\n3. Q2 (Scientific Reasons & 2-mark concepts): Award 1 mark for accurate concept, 1 mark for scientific terminology in Urdu.\n4. Q3 (Flowchart & 3-mark questions): Award step marks for Glycolysis/Krebs cycle flow chart and evolutionary evidence.\n5. Q4 (Diagram & Environmental awareness): Award up to 5 marks for complete reasoning on thermal power generation and symbols.\n6. Flag handwriting/legibility errors if Urdu nastaliq script cannot be verified.",
    },
  })
  console.log(`[TestSeries] Upserted: ${testSeries.title} (${testSeries.id})`)

  // 5. Upsert TestPaper for TestSeries
  const existingPaper = await prisma.testPaper.findFirst({
    where: { testSeriesId: testSeries.id, title: "Science & Technology Part 2 Urdu Question Paper" },
  })
  if (!existingPaper) {
    await prisma.testPaper.create({
      data: {
        testSeriesId: testSeries.id,
        title: "Science & Technology Part 2 Urdu Question Paper",
        fileUrl: "/samples/izone-class-10-urdu-science-2-question-paper.pdf",
        maxMarks: 40,
        rubricContent:
          "IZONE Standard Marking Key: Q1: 10M, Q2: 10M, Q3: 15M, Q4: 5M. Urdu medium scientific terminology strictly graded.",
      },
    })
    console.log("[TestPaper] Created TestPaper for Series")
  }

  // 6. Upsert AnswerSheetTemplate for TestSeries
  const existingTemplate = await prisma.answerSheetTemplate.findFirst({
    where: { testSeriesId: testSeries.id, title: "IZONE Standard Exam Answer Sheet Template" },
  })
  if (!existingTemplate) {
    await prisma.answerSheetTemplate.create({
      data: {
        testSeriesId: testSeries.id,
        title: "IZONE Standard Exam Answer Sheet Template",
        fileUrl: "/samples/izone-class-10-urdu-science-2-answer-sheet.pdf",
        templateRequired: true,
        description: "Official 4-page answer sheet with IZONE Coaching Classes & Training Academy header.",
      },
    })
    console.log("[AnswerSheetTemplate] Created Template for Series")
  }

  // 7. Upsert Subject Test
  const testSlug = "class-10-urdu-medium-science-part-2-preboard-mock"
  const subjectTest = await prisma.test.upsert({
    where: { slug: testSlug },
    update: {
      testSeriesId: testSeries.id,
      title: "Class 10 Urdu Medium Science & Technology Part 2 Pre-Board Mock Exam",
      subject: "Science & Technology Part 2 (Urdu)",
      subjectId: subjectSci2Urdu.id,
      description:
        "Official 40-mark Science and Technology Part 2 (مضمون: سائنس اور ٹیکنالوجی حصہ دوم) mock paper for Class 10th Urdu Medium by IZONE Coaching Classes & Training Academy Aurangabad. Covers MCQs, genetics, cell division, aerobic/anaerobic respiration flowcharts, and thermal power plant analysis.",
      price: 9900,
      isStandalone: true,
      maxMarks: 40,
      durationMinutes: 120,
      maxAttempts: 3,
      order: 1,
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      questionPaperUrl: "/samples/izone-class-10-urdu-science-2-question-paper.pdf",
      answerSheetUrl: "/samples/izone-class-10-urdu-science-2-answer-sheet.pdf",
      studentInstructions:
        "وقت: ۲ گھنٹے | کل نمبرات: ۴۰\nمضمون: سائنس اور ٹیکنالوجی حصہ دوم (دہم جماعت - اردو میڈیم)\n\nہدایات برائے طلبہ:\n۱. پرچے میں ۴ اہم سوالات ہیں۔ تمام سوالات حل کرنا لازمی ہے۔\n۲. سوال ۱ (الف): کثیر متبادل سوالات (۵ نمبرات)\n۳. سوال ۱ (ب): جوڑیاں ملائیے و مختصر جوابات (۵ نمبرات)\n۴. سوال ۲ (الف): سائنسی وجوہات (۴ نمبرات)\n۵. سوال ۲ (ب): ۳ ذیلی سوالات حل کیجیے (۶ نمبرات)\n۶. سوال ۳: ۵ ذیلی سوالات مع روانی خاکہ (۱۵ نمبرات)\n۷. سوال ۴: ماحولیاتی علامات و تھرمل پاور اسٹیشن کا تفصیلی تجزیہ (۵ نمبرات)",
      privateEvaluationInstructions:
        "IZONE EVALUATION STANDARD:\n- Q1: 10 marks total (5 MCQs + 5 objective questions).\n- Q2: 10 marks total (Scientific reasons 4 marks + solve any 3 questions for 6 marks).\n- Q3: 15 marks total (Solve any 5 questions for 15 marks, including cellular respiration flowchart and DNA).\n- Q4: 5 marks total (Solve any 1 question on environmental symbols or thermal power plant).\n- Total: 40 marks.",
    },
    create: {
      testSeriesId: testSeries.id,
      title: "Class 10 Urdu Medium Science & Technology Part 2 Pre-Board Mock Exam",
      slug: testSlug,
      subject: "Science & Technology Part 2 (Urdu)",
      subjectId: subjectSci2Urdu.id,
      description:
        "Official 40-mark Science and Technology Part 2 (مضمون: سائنس اور ٹیکنالوجی حصہ دوم) mock paper for Class 10th Urdu Medium by IZONE Coaching Classes & Training Academy Aurangabad. Covers MCQs, genetics, cell division, aerobic/anaerobic respiration flowcharts, and thermal power plant analysis.",
      price: 9900,
      isStandalone: true,
      maxMarks: 40,
      durationMinutes: 120,
      maxAttempts: 3,
      order: 1,
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      questionPaperUrl: "/samples/izone-class-10-urdu-science-2-question-paper.pdf",
      answerSheetUrl: "/samples/izone-class-10-urdu-science-2-answer-sheet.pdf",
      studentInstructions:
        "وقت: ۲ گھنٹے | کل نمبرات: ۴۰\nمضمون: سائنس اور ٹیکنالوجی حصہ دوم (دہم جماعت - اردو میڈیم)\n\nہدایات برائے طلبہ:\n۱. پرچے میں ۴ اہم سوالات ہیں۔ تمام سوالات حل کرنا لازمی ہے۔\n۲. سوال ۱ (الف): کثیر متبادل سوالات (۵ نمبرات)\n۳. سوال ۱ (ب): جوڑیاں ملائیے و مختصر جوابات (۵ نمبرات)\n۴. سوال ۲ (الف): سائنسی وجوہات (۴ نمبرات)\n۵. سوال ۲ (ب): ۳ ذیلی سوالات حل کیجیے (۶ نمبرات)\n۶. سوال ۳: ۵ ذیلی سوالات مع روانی خاکہ (۱۵ نمبرات)\n۷. سوال ۴: ماحولیاتی علامات و تھرمل پاور اسٹیشن کا تفصیلی تجزیہ (۵ نمبرات)",
      privateEvaluationInstructions:
        "IZONE EVALUATION STANDARD:\n- Q1: 10 marks total (5 MCQs + 5 objective questions).\n- Q2: 10 marks total (Scientific reasons 4 marks + solve any 3 questions for 6 marks).\n- Q3: 15 marks total (Solve any 5 questions for 15 marks, including cellular respiration flowchart and DNA).\n- Q4: 5 marks total (Solve any 1 question on environmental symbols or thermal power plant).\n- Total: 40 marks.",
    },
  })
  console.log(`[Test] Upserted Subject Test: ${subjectTest.title} (${subjectTest.id})`)

  // 8. Upsert QuestionPaper in Question Paper Bank
  const existingQPaper = await prisma.questionPaper.findFirst({
    where: { title: "Class 10 Science & Technology Part 2 (Urdu Medium) - IZONE Pre-Board Paper" },
  })
  if (existingQPaper) {
    await prisma.questionPaper.update({
      where: { id: existingQPaper.id },
      data: {
        testSeriesId: testSeries.id,
        fileUrl: "/samples/izone-class-10-urdu-science-2-question-paper.pdf",
        maxMarks: 40,
        durationMinutes: 120,
        subject: "Science & Technology Part 2 (Urdu)",
        subjectId: subjectSci2Urdu.id,
      },
    })
    console.log("[QuestionPaper Bank] Updated existing paper")
  } else {
    await prisma.questionPaper.create({
      data: {
        title: "Class 10 Science & Technology Part 2 (Urdu Medium) - IZONE Pre-Board Paper",
        description:
          "Authentic 40-mark examination paper from IZONE Coaching Classes & Training Academy, Aurangabad for Class 10th Maharashtra State Board Urdu Medium candidates.",
        category: "School Education",
        subject: "Science & Technology Part 2 (Urdu)",
        subjectId: subjectSci2Urdu.id,
        year: 2026,
        maxMarks: 40,
        durationMinutes: 120,
        fileUrl: "/samples/izone-class-10-urdu-science-2-question-paper.pdf",
        fileSizeBytes: 808747,
        isPublished: true,
        downloadsCount: 42,
        testSeriesId: testSeries.id,
      },
    })
    console.log("[QuestionPaper Bank] Created question paper entry")
  }

  // 9. Upsert Student User (Tahseem Fatima Shaikh Abdul Razzak from PDF 1)
  const studentEmail = "tahseem.fatima@student.izonecc.in"
  const studentUser = await prisma.user.upsert({
    where: { email: studentEmail },
    update: {
      name: "Tahseem Fatima Shaikh Abdul Razzak",
      role: "STUDENT",
      status: "ACTIVE",
    },
    create: {
      name: "Tahseem Fatima Shaikh Abdul Razzak",
      email: studentEmail,
      role: "STUDENT",
      status: "ACTIVE",
    },
  })
  console.log(`[User] Upserted Student: ${studentUser.name} (${studentUser.id})`)

  // 10. Upsert Student Profile
  await prisma.studentProfile.upsert({
    where: { userId: studentUser.id },
    update: {
      educationLevel: "Class 10th (Urdu Medium)",
      institution: "IZONE Coaching Classes & Training Academy, Aurangabad",
      phoneNumber: "+91 9860447370",
      targetExam: "Maharashtra State Board (SSC Urdu Medium)",
      bio: "Class 10th student preparing for Board Examinations at IZONE Academy, Jaswantpura, Aurangabad.",
    },
    create: {
      userId: studentUser.id,
      educationLevel: "Class 10th (Urdu Medium)",
      institution: "IZONE Coaching Classes & Training Academy, Aurangabad",
      phoneNumber: "+91 9860447370",
      targetExam: "Maharashtra State Board (SSC Urdu Medium)",
      bio: "Class 10th student preparing for Board Examinations at IZONE Academy, Jaswantpura, Aurangabad.",
    },
  })
  console.log("[StudentProfile] Upserted profile for Tahseem Fatima")

  // 11. Upsert Test Registration (to Series and Test)
  const registrationSeries = await prisma.testRegistration.upsert({
    where: {
      userId_testSeriesId: {
        userId: studentUser.id,
        testSeriesId: testSeries.id,
      },
    },
    update: {
      status: RegistrationStatus.ACTIVE,
      attemptsUsed: 1,
      maxAttempts: 3,
    },
    create: {
      userId: studentUser.id,
      testSeriesId: testSeries.id,
      status: RegistrationStatus.ACTIVE,
      attemptsUsed: 1,
      maxAttempts: 3,
    },
  })

  const registrationTest = await prisma.testRegistration.upsert({
    where: {
      userId_testId: {
        userId: studentUser.id,
        testId: subjectTest.id,
      },
    },
    update: {
      status: RegistrationStatus.ACTIVE,
      attemptsUsed: 1,
      maxAttempts: 3,
    },
    create: {
      userId: studentUser.id,
      testId: subjectTest.id,
      status: RegistrationStatus.ACTIVE,
      attemptsUsed: 1,
      maxAttempts: 3,
    },
  })
  console.log("[TestRegistration] Enrolled Tahseem Fatima in Series & Test")

  // 12. Upsert Submission Record
  let submission = await prisma.submission.findFirst({
    where: {
      userId: studentUser.id,
      testId: subjectTest.id,
      attemptNumber: 1,
    },
  })

  const evaluationFeedbackText =
    "Teacher Evaluation (IZONE Academy, Exam Date: 12/01/2026):\nMark: 40 | Obtained: 02 | Areas of improvement: Handwriting, Spelling Errors, Concept, Presentation.\n\nSummary Feedback:\nCandidate Tahseem Fatima showed poor concept clarity in cellular division (mitosis/meiosis) and biochemical respiration pathways. Major spelling and grammatical errors in Urdu scientific vocabulary. The Glycolysis and Krebs cycle flow chart on page 4 was left incomplete. Recommended urgent remedial revision of Science Part 2 syllabus and diagram practice."

  if (!submission) {
    submission = await prisma.submission.create({
      data: {
        userId: studentUser.id,
        testSeriesId: testSeries.id,
        testId: subjectTest.id,
        registrationId: registrationTest.id,
        attemptNumber: 1,
        status: SubmissionStatus.COMPLETED,
        fileUrl: "/samples/izone-class-10-urdu-science-2-answer-sheet.pdf",
        fileSizeBytes: 1952447,
        pageCount: 4,
        submittedAt: new Date("2026-01-12T11:00:00Z"),
      },
    })
    console.log(`[Submission] Created submission for Tahseem Fatima (${submission.id})`)
  } else {
    submission = await prisma.submission.update({
      where: { id: submission.id },
      data: {
        fileUrl: "/samples/izone-class-10-urdu-science-2-answer-sheet.pdf",
        fileSizeBytes: 1952447,
        status: SubmissionStatus.COMPLETED,
      },
    })
    console.log(`[Submission] Updated submission (${submission.id})`)
  }

  // 13. Upsert Evaluation Record
  const evaluation = await prisma.evaluation.upsert({
    where: { submissionId: submission.id },
    update: {
      totalMarksAwarded: 2.0,
      maxMarks: 40.0,
      percentage: 5.0,
      generalFeedback: evaluationFeedbackText,
      status: EvaluationStatus.COMPLETED,
      evaluatorModel: "IZONE Teacher Examiner",
      evaluatedAt: new Date("2026-01-12T14:30:00Z"),
    },
    create: {
      submissionId: submission.id,
      totalMarksAwarded: 2.0,
      maxMarks: 40.0,
      percentage: 5.0,
      generalFeedback: evaluationFeedbackText,
      status: EvaluationStatus.COMPLETED,
      evaluatorModel: "IZONE Teacher Examiner",
      evaluatedAt: new Date("2026-01-12T14:30:00Z"),
    },
  })
  console.log(`[Evaluation] Upserted evaluation record (${evaluation.id}): Score 2.0/40.0 (5%)`)

  // 14. Upsert QuestionEvaluations
  const questionsData = [
    {
      questionNumber: "Q1",
      maxMarks: 10.0,
      marksAwarded: 2.0,
      scoreBand: "POOR",
      scoreExplanation:
        "Student scored only 2 marks out of 10. Concept errors in biological reproduction, plant organs, and scientific nomenclature.",
      strengths: "Attempted objective match-the-pair questions.",
      missingConcepts:
        "Correct understanding of asexual reproduction in organisms, plant reproduction, and Mendel's terminology.",
      examinerExpectation: "Accurate MCQs selection and correct matching pairs.",
      improvementAdvice: "Revise Chapter 1 & 2 definitions thoroughly in Urdu.",
    },
    {
      questionNumber: "Q2",
      maxMarks: 10.0,
      marksAwarded: 0.0,
      scoreBand: "POOR",
      scoreExplanation:
        "Zero marks awarded. Explanation for fatigue after exercise and cessation of human height was biologically incorrect.",
      strengths: "Attempted question 2.",
      missingConcepts: "Cellular respiration during exercise, lactic acid buildup, mitosis vs meiosis differences.",
      examinerExpectation:
        "Clear 2-point scientific distinction between مساوی تقسیم (Mitosis) and تخفیلی تقسیم (Meiosis).",
      improvementAdvice: "Practice writing scientific reasons with exact Urdu biology terms.",
    },
    {
      questionNumber: "Q3",
      maxMarks: 15.0,
      marksAwarded: 0.0,
      scoreBand: "POOR",
      scoreExplanation:
        "Flow chart of Glycolysis/Krebs Cycle on page 4 was incomplete and incorrectly labeled. Questions on DNA notes and evolution evidence were omitted.",
      strengths: "Attempted to draw the flow chart blocks.",
      missingConcepts: "Complete Glycolysis pathway (گلوکوز -> پائرووک ایسڈ -> ایسیٹل Co-A -> کریب چکر).",
      examinerExpectation: "Complete 4-stage sequential flowchart with chemical intermediates.",
      improvementAdvice: "Memorize and redraw cellular respiration and metabolic flow charts repeatedly.",
    },
    {
      questionNumber: "Q4",
      maxMarks: 5.0,
      marksAwarded: 0.0,
      scoreBand: "POOR",
      scoreExplanation:
        "Question on thermal energy generating station and environmental eco-symbols was either unattempted or completely inaccurate.",
      strengths: "None.",
      missingConcepts: "Environmental awareness symbols and working of thermal power station.",
      examinerExpectation: "Proper analysis of fuel usage and pollution problems in thermal power generation.",
      improvementAdvice: "Review environmental management chapters and energy generation units.",
    },
  ]

  for (const q of questionsData) {
    const existingQ = await prisma.questionEvaluation.findFirst({
      where: { evaluationId: evaluation.id, questionNumber: q.questionNumber },
    })
    if (existingQ) {
      await prisma.questionEvaluation.update({
        where: { id: existingQ.id },
        data: {
          marksAwarded: q.marksAwarded,
          maxMarks: q.maxMarks,
          feedback: q.scoreExplanation,
          scoreExplanation: q.scoreExplanation,
          strengths: q.strengths,
          missingConcepts: q.missingConcepts,
          examinerExpectation: q.examinerExpectation,
          improvementAdvice: q.improvementAdvice,
          scoreBand: q.scoreBand,
        },
      })
    } else {
      await prisma.questionEvaluation.create({
        data: {
          evaluationId: evaluation.id,
          questionNumber: q.questionNumber,
          marksAwarded: q.marksAwarded,
          maxMarks: q.maxMarks,
          feedback: q.scoreExplanation,
          scoreExplanation: q.scoreExplanation,
          strengths: q.strengths,
          missingConcepts: q.missingConcepts,
          examinerExpectation: q.examinerExpectation,
          improvementAdvice: q.improvementAdvice,
          scoreBand: q.scoreBand,
        },
      })
    }
  }
  console.log("[QuestionEvaluation] Recorded question-by-question marks and feedback")

  // 15. Also record EvaluationRun
  let evalRun = await prisma.evaluationRun.findUnique({
    where: {
      submissionId_runNumber: {
        submissionId: submission.id,
        runNumber: 1,
      },
    },
  })

  if (!evalRun) {
    evalRun = await prisma.evaluationRun.create({
      data: {
        submissionId: submission.id,
        runNumber: 1,
        trigger: EvaluationTrigger.AUTOMATIC,
        status: EvaluationStatus.COMPLETED,
        totalMarksAwarded: 2.0,
        maxMarks: 40.0,
        percentage: 5.0,
        evaluatorModel: "IZONE Teacher Examiner",
        generalFeedback:
          "Mark: 40 | Obtained: 02. Handwriting, spelling in Urdu scientific terms, and conceptual definitions require intensive remedial work.",
        startedAt: new Date("2026-01-12T14:00:00Z"),
        completedAt: new Date("2026-01-12T14:30:00Z"),
      },
    })
    console.log(`[EvaluationRun] Created EvaluationRun (${evalRun.id})`)
  }

  console.log("\n==================================================")
  console.log("==> IZONE AUTHENTIC DATA SEEDED SUCCESSFULLY! <====")
  console.log("==================================================")
  console.log(`- Test Series: "${testSeries.title}" (${testSeries.slug})`)
  console.log(`- Subject Test: "${subjectTest.title}" (${subjectTest.slug})`)
  console.log(`- Student: "${studentUser.name}" (${studentUser.email})`)
  console.log(`- Submission: 4 pages, Score 2/40 (5%)`)
  console.log(`- Question Paper PDF: /samples/izone-class-10-urdu-science-2-question-paper.pdf`)
  console.log(`- Student Answer PDF: /samples/izone-class-10-urdu-science-2-answer-sheet.pdf`)
  console.log("==================================================\n")
}

main()
  .catch((e) => {
    console.error("Error seeding IZONE data:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

