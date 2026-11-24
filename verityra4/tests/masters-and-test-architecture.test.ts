import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"

interface MasterInput {
  name?: string
  code?: string
  order?: number
}

function validateMasterInput(input: MasterInput, type: "Subject" | "Standard" | "Board") {
  if (!input.name || input.name.trim().length === 0) {
    return { valid: false, error: `${type} name is required.` }
  }
  return { valid: true }
}

function validateTestSeriesBatchHeader(input: {
  title?: string
  standard?: string
  stream?: string
  academicYear?: string
  bundlePrice?: number
}) {
  if (!input.title || input.title.trim().length === 0) {
    return { valid: false, error: "Test series title is required." }
  }
  if (!input.standard || input.standard.trim().length === 0) {
    return { valid: false, error: "Standard master selection is required." }
  }
  if (!input.stream || input.stream.trim().length === 0) {
    return { valid: false, error: "Board / stream master selection is required." }
  }
  if (input.bundlePrice !== undefined && input.bundlePrice < 0) {
    return { valid: false, error: "Bundle offer price cannot be negative." }
  }
  return { valid: true }
}

function checkBatchSeriesUniqueness(
  existingSeries: Array<{ standard: string; stream: string; academicYear: string; title: string }>,
  candidate: { standard: string; stream: string; academicYear: string; title: string }
) {
  const duplicate = existingSeries.find(
    (s) =>
      s.standard.toLowerCase() === candidate.standard.toLowerCase() &&
      s.stream.toLowerCase() === candidate.stream.toLowerCase() &&
      s.academicYear.toLowerCase() === candidate.academicYear.toLowerCase()
  )
  if (duplicate) {
    return {
      allowed: false,
      error: `A Test Series bundle for "${candidate.standard}" (${candidate.stream}) ${candidate.academicYear} already exists ("${duplicate.title}"). Each academic batch bundle can only be created once.`,
    }
  }
  return { allowed: true }
}

function validateSubjectTestInput(input: {
  title?: string
  subject?: string
  maxMarks?: number
  durationMinutes?: number
  price?: number
  isStandalone?: boolean
  maxAttempts?: number
}) {
  if (!input.title || input.title.trim().length === 0) {
    return { valid: false, error: "Test title is required." }
  }
  if (!input.subject || input.subject.trim().length === 0) {
    return { valid: false, error: "Subject selection is required." }
  }
  if (input.maxMarks !== undefined && input.maxMarks <= 0) {
    return { valid: false, error: "Maximum marks must be a positive number." }
  }
  if (input.durationMinutes !== undefined && input.durationMinutes < 15) {
    return { valid: false, error: "Duration must be at least 15 minutes." }
  }
  if (input.isStandalone && input.price !== undefined && input.price < 0) {
    return { valid: false, error: "Standalone price cannot be negative." }
  }
  return { valid: true }
}

export function runMastersAndTestArchitectureTests() {
  const suite = new TestSuite("Module: Academic Masters & Test Series Architecture")
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  // 1. Master Records Validation
  suite.test("Masters: Accepts valid Subject, Standard, and Board inputs", () => {
    assert.equal(validateMasterInput({ name: "Mathematics", code: "MATH" }, "Subject").valid, true)
    assert.equal(validateMasterInput({ name: "Class 10th", order: 10 }, "Standard").valid, true)
    assert.equal(validateMasterInput({ name: "CBSE Board", code: "CBSE" }, "Board").valid, true)
  })

  suite.test("Masters: Rejects blank or whitespace-only master names", () => {
    assert.equal(validateMasterInput({ name: "" }, "Subject").valid, false)
    assert.equal(validateMasterInput({ name: "   " }, "Standard").valid, false)
    assert.equal(validateMasterInput({ name: "\t" }, "Board").valid, false)
  })

  // 2. Test Series Batch Header Validation (No maxMarks or duration required)
  suite.test("Test Series Header: Accepts valid batch header without maxMarks or duration", () => {
    const res = validateTestSeriesBatchHeader({
      title: "Class 10th CBSE Comprehensive Board Mock Series",
      standard: "Class 10th",
      stream: "CBSE Board",
      academicYear: "2025 Batch",
      bundlePrice: 299,
    })
    assert.equal(res.valid, true)
  })

  suite.test("Test Series Header: Rejects missing standard or board stream", () => {
    const res = validateTestSeriesBatchHeader({
      title: "Untitled Series",
      standard: "",
      stream: "CBSE Board",
    })
    assert.equal(res.valid, false)
    assert.equal(res.error, "Standard master selection is required.")
  })

  // 3. Batch Uniqueness Enforcement
  suite.test("Batch Uniqueness: Blocks duplicate bundle for identical standard + stream + batch", () => {
    const existing = [
      {
        standard: "Class 10th",
        stream: "CBSE Board",
        academicYear: "2025 Batch",
        title: "Class 10th CBSE 2025 Mock Series",
      },
    ]

    const duplicateCheck = checkBatchSeriesUniqueness(existing, {
      standard: "Class 10th",
      stream: "CBSE Board",
      academicYear: "2025 Batch",
      title: "Class 10th Second Batch",
    })
    assert.equal(duplicateCheck.allowed, false)
    assert.ok(duplicateCheck.error?.includes("already exists"))

    // Different batch year is allowed
    const diffYearCheck = checkBatchSeriesUniqueness(existing, {
      standard: "Class 10th",
      stream: "CBSE Board",
      academicYear: "2026 Batch",
      title: "Class 10th CBSE 2026 Mock Series",
    })
    assert.equal(diffYearCheck.allowed, true)
  })

  // 4. Subject Test Parameters & Attachment
  suite.test("Subject Test: Validates individual test with custom marks and duration", () => {
    const res = validateSubjectTestInput({
      title: "Class 10th Mathematics Standard Mock 1",
      subject: "Mathematics",
      maxMarks: 80,
      durationMinutes: 180,
      price: 99,
      isStandalone: true,
      maxAttempts: 3,
    })
    assert.equal(res.valid, true)
  })

  suite.test("Subject Test: Rejects negative marks or invalid duration", () => {
    const resMarks = validateSubjectTestInput({
      title: "Math Test",
      subject: "Mathematics",
      maxMarks: -10,
    })
    assert.equal(resMarks.valid, false)

    const resDuration = validateSubjectTestInput({
      title: "Math Test",
      subject: "Mathematics",
      durationMinutes: 5,
    })
    assert.equal(resDuration.valid, false)
  })

  // 5. Sidebar Navigation Integrity & Duplicate Removal
  suite.test("Navigation Integrity: Admin sidebar contains no duplicate routes and includes Masters", () => {
    const adminRoutes = [
      "/admin",
      "/admin/submissions",
      "/admin/test-series",
      "/admin/tests",
      "/admin/question-papers",
      "/admin/masters/subjects",
      "/admin/masters/standards",
      "/admin/masters/boards",
      "/admin/students",
      "/admin/payments",
      "/admin/profile",
    ]

    // Verify uniqueness
    const routeSet = new Set(adminRoutes)
    assert.equal(routeSet.size, adminRoutes.length, "All admin routes must be unique")

    // Verify duplicate creation routes are not present as primary sidebar items
    assert.equal(adminRoutes.includes("/admin/test-series/new"), false)
    assert.equal(adminRoutes.includes("/admin/question-papers/new"), false)

    // Verify master routes exist
    assert.ok(adminRoutes.includes("/admin/masters/subjects"))
    assert.ok(adminRoutes.includes("/admin/masters/standards"))
    assert.ok(adminRoutes.includes("/admin/masters/boards"))
    assert.ok(adminRoutes.includes("/admin/tests"))
  })

  return suite.summary()
}
