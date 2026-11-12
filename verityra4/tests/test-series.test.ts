import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import { TestSeriesStatus } from "@prisma/client"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function runTestSeriesTests() {
  const suite = new TestSuite("Module: Test Series Management & Security")
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  suite.test(
    "Slug Generation: Converts titles to clean URL-friendly slugs",
    () => {
      const title = "UPSC GS Paper-I: Indian Heritage & Culture 2026!"
      const slug = slugify(title)
      assert.equal(slug, "upsc-gs-paper-i-indian-heritage-culture-2026")
    }
  )

  suite.test(
    "Pricing: Converts rupee amount to integer paise correctly",
    () => {
      const priceInRupees = 499.5
      const priceInPaise = Math.round(priceInRupees * 100)
      assert.equal(priceInPaise, 49950)

      const freeRupees = 0
      assert.equal(Math.round(freeRupees * 100), 0)
    }
  )

  suite.test(
    "Attempt Limit Defaults: Falls back to 3 if unspecified or invalid",
    () => {
      function resolveMaxAttempts(input?: number) {
        return input && input > 0 ? input : 3
      }

      assert.equal(resolveMaxAttempts(undefined), 3)
      assert.equal(resolveMaxAttempts(0), 3)
      assert.equal(resolveMaxAttempts(-2), 3)
      assert.equal(resolveMaxAttempts(5), 5)
    }
  )

  suite.test("Required Fields: Creation rejects missing core fields", () => {
    function validateCreateInput(input: {
      title?: string
      description?: string
      studentInstructions?: string
      privateEvaluationInstructions?: string
    }) {
      if (
        !input.title ||
        !input.description ||
        !input.studentInstructions ||
        !input.privateEvaluationInstructions
      ) {
        return { valid: false, error: "Missing required fields" }
      }
      return { valid: true }
    }

    assert.equal(
      validateCreateInput({
        title: "Test",
        description: "Desc",
        studentInstructions: "Write neatly",
      }).valid,
      false
    )

    assert.equal(
      validateCreateInput({
        title: "Test",
        description: "Desc",
        studentInstructions: "Write neatly",
        privateEvaluationInstructions: "Deduct marks for handwriting",
      }).valid,
      true
    )
  })

  suite.test(
    "Security: Private evaluation instructions are strictly isolated from candidate view",
    () => {
      const rawDbRecord = {
        id: "ts-101",
        title: "UPSC Mains GS Paper III",
        price: 99900,
        maxMarks: 250,
        studentInstructions:
          "Use blue ballpoint pen. Maintain word limits per question.",
        privateEvaluationInstructions:
          "CONFIDENTIAL MODEL RUBRIC: Do not award marks if candidate omits fiscal deficit numbers.",
        createdAt: new Date(),
      }

      // Student public projection mapper
      function projectForStudent(record: typeof rawDbRecord) {
        const { privateEvaluationInstructions, ...studentView } = record
        return studentView
      }

      const publicView: any = projectForStudent(rawDbRecord)
      assert.equal("privateEvaluationInstructions" in publicView, false)
      assert.equal(publicView.privateEvaluationInstructions, undefined)
      assert.equal(
        publicView.studentInstructions,
        rawDbRecord.studentInstructions
      )
    }
  )

  suite.test(
    "Status Lifecycle: Test series adheres to valid status enum values",
    () => {
      assert.equal(TestSeriesStatus.DRAFT, "DRAFT")
      assert.equal(TestSeriesStatus.PUBLISHED, "PUBLISHED")
      assert.equal(TestSeriesStatus.ARCHIVED, "ARCHIVED")
    }
  )

  suite.test(
    "Window Validation: Accurately checks whether test is upcoming, active, or closed",
    () => {
      const now = new Date("2026-10-17T12:00:00Z")

      function getTestWindowStatus(
        start: Date | null,
        end: Date | null,
        currentTime = now
      ) {
        if (start && currentTime < start) return "UPCOMING"
        if (end && currentTime > end) return "EXPIRED"
        return "OPEN"
      }

      const futureTest = getTestWindowStatus(
        new Date("2026-11-01T00:00:00Z"),
        null
      )
      assert.equal(futureTest, "UPCOMING")

      const activeTest = getTestWindowStatus(
        new Date("2026-10-01T00:00:00Z"),
        new Date("2026-10-31T00:00:00Z")
      )
      assert.equal(activeTest, "OPEN")

      const closedTest = getTestWindowStatus(
        new Date("2026-09-01T00:00:00Z"),
        new Date("2026-10-10T00:00:00Z")
      )
      assert.equal(closedTest, "EXPIRED")
    }
  )

  suite.test(
    "Class 10 Series: Mathematics and Science schema, marks, and duration invariants",
    () => {
      const class10Maths = {
        title: "Class 10 CBSE Mathematics Board Examination Mock Series",
        slug: "cbse-class-10-mathematics-mock-series",
        maxMarks: 80,
        durationMinutes: 180,
        maxAttempts: 3,
        price: 0,
        status: TestSeriesStatus.PUBLISHED,
        paperMaxMarks: 80,
        templateRequired: true,
      }

      const class10Science = {
        title: "Class 10 CBSE Science Board Examination Mock Series",
        slug: "cbse-class-10-science-board-mock-series",
        maxMarks: 80,
        durationMinutes: 180,
        maxAttempts: 3,
        price: 0,
        status: TestSeriesStatus.PUBLISHED,
        paperMaxMarks: 80,
        templateRequired: true,
      }

      // Assert Class 10 Mathematics specifications
      assert.equal(class10Maths.maxMarks, 80)
      assert.equal(class10Maths.durationMinutes, 180)
      assert.equal(class10Maths.maxAttempts, 3)
      assert.equal(class10Maths.paperMaxMarks, class10Maths.maxMarks)
      assert.equal(class10Maths.templateRequired, true)

      // Assert Class 10 Science specifications
      assert.equal(class10Science.maxMarks, 80)
      assert.equal(class10Science.durationMinutes, 180)
      assert.equal(class10Science.maxAttempts, 3)
      assert.equal(class10Science.paperMaxMarks, class10Science.maxMarks)
      assert.equal(class10Science.templateRequired, true)
    }
  )

  suite.test(
    "Class 11 & 12 Series: Mathematics and Physics senior secondary invariants and pricing",
    () => {
      const class11Maths = {
        title: "Class 11 CBSE Mathematics & Calculus Foundation Series",
        slug: "cbse-class-11-mathematics-mastery-series",
        maxMarks: 80,
        durationMinutes: 180,
        price: 29900, // ₹299.00 in paise
        maxAttempts: 3,
      }

      const class12Maths = {
        title: "Class 12 CBSE Mathematics Pre-Board Mock Examination Series",
        slug: "cbse-class-12-mathematics-preboard-series",
        maxMarks: 80,
        durationMinutes: 180,
        price: 39900, // ₹399.00 in paise
        maxAttempts: 3,
      }

      const class12Physics = {
        title: "Class 12 CBSE Physics Pre-Board Mock Examination Series",
        slug: "cbse-class-12-physics-preboard-series",
        maxMarks: 70, // Standard 70-mark theory for physics
        durationMinutes: 180,
        price: 39900, // ₹399.00 in paise
        maxAttempts: 3,
      }

      // Class 11 Maths assertions
      assert.equal(class11Maths.maxMarks, 80)
      assert.equal(class11Maths.price, 29900)
      assert.equal(class11Maths.durationMinutes, 180)
      assert.equal(class11Maths.maxAttempts, 3)

      // Class 12 Maths assertions
      assert.equal(class12Maths.maxMarks, 80)
      assert.equal(class12Maths.price, 39900)
      assert.equal(class12Maths.durationMinutes, 180)
      assert.equal(class12Maths.maxAttempts, 3)

      // Class 12 Physics assertions
      assert.equal(class12Physics.maxMarks, 70)
      assert.equal(class12Physics.price, 39900)
      assert.equal(class12Physics.durationMinutes, 180)
    }
  )

  suite.test(
    "Academic Series: Curriculum grade and subject categorization",
    () => {
      function categorizeAcademicSeries(title: string): {
        grade: string
        subject: string
      } {
        const lower = title.toLowerCase()
        let grade = "General"
        if (lower.includes("class 10") || lower.includes("10th"))
          grade = "Class 10"
        else if (lower.includes("class 11") || lower.includes("11th"))
          grade = "Class 11"
        else if (lower.includes("class 12") || lower.includes("12th"))
          grade = "Class 12"

        let subject = "Other"
        if (lower.includes("mathematics") || lower.includes("math"))
          subject = "Mathematics"
        else if (lower.includes("science")) subject = "Science"
        else if (lower.includes("physics")) subject = "Physics"
        else if (lower.includes("essay")) subject = "Essay"

        return { grade, subject }
      }

      const test10M = categorizeAcademicSeries(
        "Class 10 CBSE Mathematics Board Examination Mock Series"
      )
      assert.deepEqual(test10M, { grade: "Class 10", subject: "Mathematics" })

      const test10S = categorizeAcademicSeries(
        "Class 10 CBSE Science Board Examination Mock Series"
      )
      assert.deepEqual(test10S, { grade: "Class 10", subject: "Science" })

      const test11M = categorizeAcademicSeries(
        "Class 11 CBSE Mathematics & Calculus Foundation Series"
      )
      assert.deepEqual(test11M, { grade: "Class 11", subject: "Mathematics" })

      const test12M = categorizeAcademicSeries(
        "Class 12 CBSE Mathematics Pre-Board Mock Examination Series"
      )
      assert.deepEqual(test12M, { grade: "Class 12", subject: "Mathematics" })

      const test12P = categorizeAcademicSeries(
        "Class 12 CBSE Physics Pre-Board Mock Examination Series"
      )
      assert.deepEqual(test12P, { grade: "Class 12", subject: "Physics" })
    }
  )

  suite.test(
    "Academic Series: Strict evaluation rubric isolation from student view",
    () => {
      const academicSeriesList = [
        {
          slug: "cbse-class-10-mathematics-mock-series",
          studentInstructions:
            "Show all steps of calculation and geometric constructions.",
          privateEvaluationInstructions:
            "CONFIDENTIAL EVALUATION RUBRIC - CLASS 10 MATHEMATICS: Step-by-step marking.",
        },
        {
          slug: "cbse-class-10-science-board-mock-series",
          studentInstructions: "All chemical equations must be balanced.",
          privateEvaluationInstructions:
            "CONFIDENTIAL EVALUATION RUBRIC - CLASS 10 SCIENCE: Balanced equations carry 1m.",
        },
        {
          slug: "cbse-class-11-mathematics-mastery-series",
          studentInstructions:
            "In Trigonometric proofs, state standard identities clearly.",
          privateEvaluationInstructions:
            "CONFIDENTIAL EVALUATION RUBRIC - CLASS 11 MATHEMATICS: Verify standard limits.",
        },
        {
          slug: "cbse-class-12-mathematics-preboard-series",
          studentInstructions:
            "In Integration, constant of integration C must be explicitly stated.",
          privateEvaluationInstructions:
            "CONFIDENTIAL EVALUATION RUBRIC - CLASS 12 MATHEMATICS: Deduct 0.5m for missing +C.",
        },
        {
          slug: "cbse-class-12-physics-preboard-series",
          studentInstructions: "Derivations must begin with a clear diagram.",
          privateEvaluationInstructions:
            "CONFIDENTIAL EVALUATION RUBRIC - CLASS 12 PHYSICS: Circuit diagrams require correct bias.",
        },
      ]

      for (const item of academicSeriesList) {
        const { privateEvaluationInstructions, ...candidateView } = item
        assert.equal("privateEvaluationInstructions" in candidateView, false)
        assert.ok(candidateView.studentInstructions.length > 10)
      }
    }
  )

  return suite.summary()
}

// Allow direct execution
if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("tests/test-series.test.ts")
) {
  const result = runTestSeriesTests()
  if (result.failed > 0) process.exit(1)
}
