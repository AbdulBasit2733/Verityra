import { PrismaClient, Role, UserStatus, TestSeriesStatus, RegistrationStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

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
          educationLevel: "Post-Graduate",
          institution: "Delhi University",
          targetExam: "UPSC CSE Mains",
        },
      },
    },
  })
  console.log(`Demo Student provisioned: ${student.email}`)

  // 3. Provision Sample Test Series
  const test1 = await prisma.testSeries.upsert({
    where: { slug: "upsc-gs-1-mains-mock-1" },
    update: {},
    create: {
      title: "UPSC Civil Services General Studies Paper I Mock",
      slug: "upsc-gs-1-mains-mock-1",
      description:
        "Full-length authentic exam paper testing Indian Heritage, Art, Culture, World History, Physical Geography, and Society under 3-hour strict handwritten conditions.",
      price: 0, // Free
      maxMarks: 250,
      durationMinutes: 180,
      maxAttempts: 3,
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      resultsPublished: true,
      studentInstructions: `1. The Question Paper contains 20 questions in official English/Hindi format.
2. All questions are compulsory. Questions 1 to 10 are 10-markers (150 words limit), and 11 to 20 are 15-markers (250 words limit).
3. Answers must be written exclusively by hand using the official margin-aligned printable answer sheet template.
4. Keep clear margins on both left and right sides. Do not write outside the prescribed answer boxes.
5. Once complete, convert your physical handwritten pages into a clean, single PDF scan and upload it before the cutoff deadline.`,
      privateEvaluationInstructions: `CONFIDENTIAL EVALUATOR INSTRUCTIONS:
- Q1 to Q10: 10 marks max each. Criteria: Intro & Definition (2.5m), Main Body & Arguments (5m), Conclusion/Way Forward (2.5m).
- Q11 to Q20: 15 marks max each. Criteria: Contextual framing (3m), Comprehensive thematic analysis with examples/case laws (9m), Balanced conclusion (3m).
- Award partial marks liberally for logical reasoning and structured presentation.
- If diagram is included and labeled neatly, award 1 bonus presentation mark within maximum bounds.
- If illegible, flag 'isLegible: false' and route for educator review.`,
      papers: {
        create: [
          {
            title: "UPSC GS Paper I Official Mock Paper (PDF)",
            fileUrl: "/api/files/download?file=papers/upsc-gs1-paper.pdf",
            maxMarks: 250,
            rubricContent: "Questions 1-20 rubric specifications covering Art, Architecture, Modern Indian History, and Geography.",
          },
        ],
      },
      templates: {
        create: [
          {
            title: "Standard Margin Answer Sheet Template (24 Pages)",
            fileUrl: "/api/files/download?file=templates/upsc-template.pdf",
            templateRequired: true,
            description: "24-page margin-ruled booklet designed for standard UPSC Mains format.",
          },
        ],
      },
    },
  })

  const test2 = await prisma.testSeries.upsert({
    where: { slug: "state-psc-advanced-essay" },
    update: {},
    create: {
      title: "State PSC Advanced Essay & Analytical Writing",
      slug: "state-psc-advanced-essay",
      description:
        "Thematic essay writing under timed conditions. Evaluated against rigorous articulation, coherence, and structure rubrics.",
      price: 49900, // ₹499
      maxMarks: 150,
      durationMinutes: 180,
      maxAttempts: 3,
      status: TestSeriesStatus.PUBLISHED,
      isPublished: true,
      resultsPublished: true,
      studentInstructions: `1. Select two essay topics from Section A and Section B.
2. Word limit: 1,000 to 1,200 words per essay.
3. Use the prescribed printable template.
4. Upload clean scanned PDF.`,
      privateEvaluationInstructions: `CONFIDENTIAL EVALUATOR INSTRUCTIONS:
- Section A: 75 marks max. Section B: 75 marks max.
- Evaluate depth of argument, balance of perspectives, coherence, and grammatical accuracy.`,
      templates: {
        create: [
          {
            title: "State PSC Essay Sheet Template (16 Pages)",
            fileUrl: "/api/files/download?file=templates/state-psc-template.pdf",
            templateRequired: true,
          },
        ],
      },
    },
  })

  // 4. Register demo student for test1
  const reg1 = await prisma.testRegistration.upsert({
    where: {
      userId_testSeriesId: {
        userId: student.id,
        testSeriesId: test1.id,
      },
    },
    update: {},
    create: {
      userId: student.id,
      testSeriesId: test1.id,
      status: RegistrationStatus.ACTIVE,
      attemptsUsed: 1,
      maxAttempts: 3,
    },
  })

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
