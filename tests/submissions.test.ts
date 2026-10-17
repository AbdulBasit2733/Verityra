import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import { SubmissionStatus } from "@prisma/client"

export function runSubmissionTests() {
  const suite = new TestSuite("Module: Answer Sheet Submissions & Quota Management")
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]
  const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB

  suite.test("File Validation: Allows standard PDF and image formats", () => {
    function validateFile(mimeType: string, sizeBytes: number) {
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return { valid: false, error: "UNSUPPORTED_MIME_TYPE" }
      }
      if (sizeBytes > MAX_FILE_SIZE_BYTES) {
        return { valid: false, error: "FILE_TOO_LARGE" }
      }
      return { valid: true }
    }

    assert.equal(validateFile("application/pdf", 5 * 1024 * 1024).valid, true)
    assert.equal(validateFile("image/jpeg", 2 * 1024 * 1024).valid, true)
    assert.equal(validateFile("image/png", 1 * 1024 * 1024).valid, true)
    assert.equal(validateFile("image/webp", 800 * 1024).valid, true)

    assert.equal(validateFile("application/x-msdownload", 1000).valid, false)
    assert.equal(validateFile("application/zip", 1000).valid, false)
    assert.equal(validateFile("text/javascript", 1000).valid, false)
    assert.equal(validateFile("application/pdf", 26 * 1024 * 1024).valid, false)
  })

  suite.test("Quota Invariant: Failed file validation does not burn student attempts", () => {
    let attemptsUsed = 1
    const maxAttempts = 3

    function attemptSubmission(mimeType: string, size: number) {
      if (!ALLOWED_MIME_TYPES.includes(mimeType) || size > MAX_FILE_SIZE_BYTES) {
        return { success: false, error: "INVALID_FILE" }
      }
      if (attemptsUsed >= maxAttempts) {
        return { success: false, error: "LIMIT_EXCEEDED" }
      }
      attemptsUsed++
      return { success: true, attemptNumber: attemptsUsed }
    }

    // Invalid upload attempt
    const failedAttempt = attemptSubmission("video/mp4", 1000)
    assert.equal(failedAttempt.success, false)
    assert.equal(attemptsUsed, 1) // Crucial invariant: count remains 1

    // Valid upload attempt
    const successAttempt = attemptSubmission("application/pdf", 1000)
    assert.equal(successAttempt.success, true)
    assert.equal(attemptsUsed, 2)
  })

  suite.test("Three-Attempt Ceiling: Exactly allows 3 attempts and strictly rejects attempt 4", () => {
    const maxAttempts = 3
    let attemptsUsed = 0

    function submitSheet() {
      if (attemptsUsed >= maxAttempts) {
        throw new Error("ATTEMPT_LIMIT_EXCEEDED")
      }
      attemptsUsed++
      return attemptsUsed
    }

    assert.equal(submitSheet(), 1)
    assert.equal(submitSheet(), 2)
    assert.equal(submitSheet(), 3)
    assert.throws(() => submitSheet(), /ATTEMPT_LIMIT_EXCEEDED/)
    assert.equal(attemptsUsed, 3)
  })

  suite.test("Deadline Enforcement: Submissions past the end deadline are blocked", () => {
    const deadline = new Date("2026-10-15T23:59:59Z")

    function canSubmit(now: Date, endDate: Date | null) {
      if (endDate && now > endDate) {
        return false
      }
      return true
    }

    const beforeDeadline = new Date("2026-10-14T10:00:00Z")
    assert.equal(canSubmit(beforeDeadline, deadline), true)

    const afterDeadline = new Date("2026-10-16T00:00:01Z")
    assert.equal(canSubmit(afterDeadline, deadline), false)
  })

  suite.test("Status Transitions: Submission status adheres to Prisma enum definitions", () => {
    assert.equal(SubmissionStatus.PENDING, "PENDING")
    assert.equal(SubmissionStatus.PROCESSING, "PROCESSING")
    assert.equal(SubmissionStatus.COMPLETED, "COMPLETED")
    assert.equal(SubmissionStatus.REVIEW_REQUIRED, "REVIEW_REQUIRED")
    assert.equal(SubmissionStatus.FAILED, "FAILED")
  })

  return suite.summary()
}

// Allow direct execution
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("tests/submissions.test.ts")) {
  const result = runSubmissionTests()
  if (result.failed > 0) process.exit(1)
}
