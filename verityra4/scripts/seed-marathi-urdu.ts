import fs from "fs"
import path from "path"
import { PrismaClient } from "@prisma/client"

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
  console.log("==> Seeding Marathi and Urdu Subject Masters and Tests...")

  // 1. Upsert Subject Masters
  const marathiMaster = await prisma.subjectMaster.upsert({
    where: { name: "Marathi" },
    update: { code: "MAR", description: "Marathi Language & Literature", isActive: true },
    create: { name: "Marathi", code: "MAR", description: "Marathi Language & Literature", isActive: true },
  })
  console.log(`[Master] Marathi ready (${marathiMaster.id})`)

  const urduMaster = await prisma.subjectMaster.upsert({
    where: { name: "Urdu" },
    update: { code: "URD", description: "Urdu Course A & B / Core Literature", isActive: true },
    create: { name: "Urdu", code: "URD", description: "Urdu Course A & B / Core Literature", isActive: true },
  })
  console.log(`[Master] Urdu ready (${urduMaster.id})`)

  // 2. Fetch series for 10th, 11th, 12th
  const allSeries = await prisma.testSeries.findMany({
    select: { id: true, title: true, standard: true, stream: true },
  })

  const series10 = allSeries.find((s) => s.standard?.includes("10") || s.title.includes("10th"))
  const series11 = allSeries.find((s) => s.standard?.includes("11") || s.title.includes("11th"))
  const series12 = allSeries.find((s) => s.standard?.includes("12") || s.title.includes("12th"))

  console.log("Target Series found:")
  console.log("- 10th:", series10?.title || "None")
  console.log("- 11th:", series11?.title || "None")
  console.log("- 12th:", series12?.title || "None")

  const targetTests = [
    // Class 10th
    {
      title: "Class 10 CBSE Marathi Board Examination Mock",
      slug: "cbse-class-10-marathi-mock",
      subject: "Marathi",
      testSeriesId: series10?.id || null,
      maxMarks: 80,
      durationMinutes: 180,
      price: 29900,
      isStandalone: true,
      maxAttempts: 3,
      order: 6,
      studentInstructions:
        "विभाग १: गद्य (पठित व अपठित), विभाग २: पद्य, विभाग ३: स्थूलवाचन, विभाग ४: भाषाभ्यास (व्याकरण - वाक्यप्रचार, समास, समानार्थी/विरुद्धार्थी शब्द), विभाग ५: उपयोजित लेखन (पत्रलेखन, सारांशलेखन, जाहिरातलेखन, बातमीलेखन, निबंध).",
      privateEvaluationInstructions:
        "१. शुद्धलेखन, व्याकरण आणि विरामचिन्हे यांच्या अचूकतेवर विशेष भर द्या.\n२. निबंध व स्वमत लेखनात विचार मांडणी, भाषेचे सौंदर्य व परिच्छेद रचना तपासा.\n३. स्थूलवाचनात थेट मुद्देसूद उत्तरांना पूर्ण गुण द्या.",
      questionPaperUrl: "/api/files/download?file=papers/class-10-marathi.pdf",
    },
    {
      title: "Class 10 CBSE Urdu Course Board Examination Mock",
      slug: "cbse-class-10-urdu-mock",
      subject: "Urdu",
      testSeriesId: series10?.id || null,
      maxMarks: 80,
      durationMinutes: 180,
      price: 29900,
      isStandalone: true,
      maxAttempts: 3,
      order: 7,
      studentInstructions:
        "حصہ اول: غیر درسی عبارت و اشعار (فہم و ادراک)، حصہ دوم: تحریری صلاحیت (خطوط، درخواست، مضمون نویسی)، حصہ سوم: قواعد (صفت، موصوف، تشبیہ، تضاد، محاورات)، حصہ چہارم: درسی کتب (نواۓ اردو و گلزار اردو).",
      privateEvaluationInstructions:
        "1. Evaluate correct Urdu orthography, imla, and grammatically sound sentence construction.\n2. In prose and poetry comprehension, credit analytical understanding and context-appropriate vocabulary.\n3. Verify essay structure: Introduction (Tamheed), Body (Nafs-e-Mazmoon), and Conclusion (Ikhtetaam).",
      questionPaperUrl: "/api/files/download?file=papers/class-10-urdu.pdf",
    },

    // Class 11th
    {
      title: "Class 11 CBSE Marathi Annual Examination Mock",
      slug: "cbse-class-11-marathi-mock",
      subject: "Marathi",
      testSeriesId: series11?.id || null,
      maxMarks: 80,
      durationMinutes: 180,
      price: 29900,
      isStandalone: true,
      maxAttempts: 3,
      order: 6,
      studentInstructions:
        "विभाग १: गद्य (पठित व अपठित), विभाग २: पद्य (रसग्रहण व काव्यसौंदर्य), विभाग ३: साहित्य प्रकार (कथा), विभाग ४: उपयोजित मराठी (मुलाखत, माहितीपत्रक), विभाग ५: व्याकरण व लेखन (वाक्यरूपांतर, समास, निबंधलेखन).",
      privateEvaluationInstructions:
        "१. रसग्रहण व काव्यसौंदर्य प्रश्नांमध्ये आशयसौंदर्य, काव्यसौंदर्य आणि भाषिक वैशिष्ट्ये या तीन मुद्द्यांनुसार गुण विभागणी करा.\n२. उपयोजित मराठीतील आराखडा आणि परिपूर्णता तपासा.",
      questionPaperUrl: "/api/files/download?file=papers/class-11-marathi.pdf",
    },
    {
      title: "Class 11 CBSE Urdu Core Annual Examination Mock",
      slug: "cbse-class-11-urdu-mock",
      subject: "Urdu",
      testSeriesId: series11?.id || null,
      maxMarks: 80,
      durationMinutes: 180,
      price: 29900,
      isStandalone: true,
      maxAttempts: 3,
      order: 7,
      studentInstructions:
        "Hissa-A: Reading Comprehension (Ghair Darsi Iqtebaas), Hissa-B: Creative Writing & Applied Grammar (Mazmoon, Report, Sanaye Badaye), Hissa-C: Literature (Dhanak & Gulistan-e-Adab - Ghazal, Nazm, Dastaan).",
      privateEvaluationInstructions:
        "Evaluate classical and modern literary appraisal, adherence to formal Urdu poetic analysis (Tashreeh), and grammatical mastery.",
      questionPaperUrl: "/api/files/download?file=papers/class-11-urdu.pdf",
    },

    // Class 12th
    {
      title: "Class 12 CBSE Marathi Board Examination Mock",
      slug: "cbse-class-12-marathi-mock",
      subject: "Marathi",
      testSeriesId: series12?.id || null,
      maxMarks: 80,
      durationMinutes: 180,
      price: 34900,
      isStandalone: true,
      maxAttempts: 3,
      order: 6,
      studentInstructions:
        "१२ वी बोर्ड परीक्षा नमुना प्रश्नपत्रिका. विभाग १: गद्य (पठित व अपठित), विभाग २: पद्य (रसग्रहण व समीक्षा), विभाग ३: साहित्यप्रकार (कथा), विभाग ४: उपयोजित मराठी (मुलाखत, अहवाललेखन), विभाग ५: व्याकरण व लेखन.",
      privateEvaluationInstructions:
        "१. १२ वी बोर्ड मूल्यांकन पद्धतीनुसार रसग्रहणासाठी गुणदान करा.\n२. उपयोजित लेखनातील औपचारिक मांडणी, भाषाशैली व व्याकरण तपासणे बंधनकारक आहे.",
      questionPaperUrl: "/api/files/download?file=papers/class-12-marathi.pdf",
    },
    {
      title: "Class 12 CBSE Urdu Core Board Examination Mock",
      slug: "cbse-class-12-urdu-mock",
      subject: "Urdu",
      testSeriesId: series12?.id || null,
      maxMarks: 80,
      durationMinutes: 180,
      price: 34900,
      isStandalone: true,
      maxAttempts: 3,
      order: 7,
      studentInstructions:
        "Class 12 CBSE Board Examination Pattern. Section A: Reading Comprehension (Unseen Prose & Poetry), Section B: Advanced Writing & Composition, Section C: Applied Grammar & Rhetoric (Ilm-e-Bayan, Tazad, Laf-o-Nashr), Section D: Literature (Gulistan-e-Adab & Khayaban-e-Urdu).",
      privateEvaluationInstructions:
        "Board-level rigorous grading rubric: 1. Tashreeh must include reference to poet/author (Hawaala), context (Siyaaq-o-Sibaaq), and aesthetic critical appraisal (Husn-e-Kalaam). 2. Stringent deduction for grammatical and orthographic errors.",
      questionPaperUrl: "/api/files/download?file=papers/class-12-urdu.pdf",
    },
  ]

  for (const t of targetTests) {
    const upserted = await prisma.test.upsert({
      where: { slug: t.slug },
      update: {
        title: t.title,
        subject: t.subject,
        testSeriesId: t.testSeriesId,
        maxMarks: t.maxMarks,
        durationMinutes: t.durationMinutes,
        price: t.price,
        isStandalone: t.isStandalone,
        maxAttempts: t.maxAttempts,
        order: t.order,
        status: "PUBLISHED",
        isPublished: true,
        studentInstructions: t.studentInstructions,
        privateEvaluationInstructions: t.privateEvaluationInstructions,
        questionPaperUrl: t.questionPaperUrl,
      },
      create: {
        title: t.title,
        slug: t.slug,
        subject: t.subject,
        testSeriesId: t.testSeriesId,
        maxMarks: t.maxMarks,
        durationMinutes: t.durationMinutes,
        price: t.price,
        isStandalone: t.isStandalone,
        maxAttempts: t.maxAttempts,
        order: t.order,
        status: "PUBLISHED",
        isPublished: true,
        studentInstructions: t.studentInstructions,
        privateEvaluationInstructions: t.privateEvaluationInstructions,
        questionPaperUrl: t.questionPaperUrl,
      },
    })
    console.log(`[Test] Upserted: ${upserted.title} (ID: ${upserted.id}) -> Series: ${upserted.testSeriesId || "Standalone"}`)
  }

  console.log("==> Marathi and Urdu curriculum successfully seeded!")
}

main()
  .catch((err) => {
    console.error("Failed to seed Marathi & Urdu:", err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
