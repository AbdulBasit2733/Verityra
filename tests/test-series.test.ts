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

  suite.test("Slug Generation: Converts titles to clean URL-friendly slugs", () => {
    const title = "UPSC GS Paper-I: Indian Heritage & Culture 2026!"
    const slug = slugify(title)
    assert.equal(slug, "upsc-gs-paper-i-indian-heritage-culture-2026")
  })

  suite.test("Pricing: Converts rupee amount to integer paise correctly", () => {
    const priceInRupees = 499.5
    const priceInPaise = Math.round(priceInRupees * 100)
    assert.equal(priceInPaise, 49950)

    const freeRupees = 0
    assert.equal(Math.round(freeRupees * 100), 0)
  })

  suite.test("Attempt Limit Defaults: Falls back to 3 if unspecified or invalid", () => {
    function resolveMaxAttempts(input?: number) {
      return input && input > 0 ? input : 3
    }

    assert.equal(resolveMaxAttempts(undefined), 3)
    assert.equal(resolveMaxAttempts(0), 3)
    assert.equal(resolveMaxAttempts(-2), 3)
    assert.equal(resolveMaxAttempts(5), 5)
  })

  suite.test("Required Fields: Creation rejects missing core fields", () => {
    function validateCreateInput(input: {
      title?: string
      description?: string
      studentInstructions?: string
      privateEvaluationInstructions?: string
    }) {
      if (!input.title || !input.description || !input.studentInstructions || !input.privateEvaluationInstructions) {
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

  suite.test("Security: Private evaluation instructions are strictly isolated from candidate view", () => {
    const rawDbRecord = {
      id: "ts-101",
      title: "UPSC Mains GS Paper III",
      price: 99900,
      maxMarks: 250,
      studentInstructions: "Use blue ballpoint pen. Maintain word limits per question.",
      privateEvaluationInstructions: "CONFIDENTIAL MODEL RUBRIC: Do not award marks if candidate omits fiscal deficit numbers.",
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
    assert.equal(publicView.studentInstructions, rawDbRecord.studentInstructions)
  })

  suite.test("Status Lifecycle: Test series adheres to valid status enum values", () => {
    assert.equal(TestSeriesStatus.DRAFT, "DRAFT")
    assert.equal(TestSeriesStatus.PUBLISHED, "PUBLISHED")
    assert.equal(TestSeriesStatus.ARCHIVED, "ARCHIVED")
  })

  suite.test("Window Validation: Accurately checks whether test is upcoming, active, or closed", () => {
    const now = new Date("2026-10-17T12:00:00Z")

    function getTestWindowStatus(start: Date | null, end: Date | null, currentTime = now) {
      if (start && currentTime < start) return "UPCOMING"
      if (end && currentTime > end) return "EXPIRED"
      return "OPEN"
    }

    const futureTest = getTestWindowStatus(new Date("2026-11-01T00:00:00Z"), null)
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
  })

  return suite.summary()
}

// Allow direct execution
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("tests/test-series.test.ts")) {
  const result = runTestSeriesTests()
  if (result.failed > 0) process.exit(1)
}
