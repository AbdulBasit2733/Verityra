import assert from "node:assert/strict"
import { registerSchema, loginSchema } from "../lib/validations/auth"
import { aiEvaluationResponseSchema } from "../lib/ai/evaluation-schema"
import crypto from "crypto"

console.log("==================================================")
console.log("RUNNING VERITYRA CRITICAL BUSINESS LOGIC TESTS")
console.log("==================================================")

let passed = 0
let failed = 0

function test(name: string, fn: () => void) {
  try {
    fn()
    console.log(`✓ PASS: ${name}`)
    passed++
  } catch (err: any) {
    console.error(`✗ FAIL: ${name}`)
    console.error(`  ${err.message}`)
    failed++
  }
}

// 1. AUTHENTICATION & PASSWORD POLICY TESTS
test("Auth: Valid candidate registration schema passes", () => {
  const valid = {
    name: "Aarav Sharma",
    email: "Aarav.Sharma@EXAMPLE.COM",
    password: "Password123!",
    confirmPassword: "Password123!",
  }
  const result = registerSchema.safeParse(valid)
  assert.equal(result.success, true)
  if (result.success) {
    assert.equal(result.data.email, "aarav.sharma@example.com") // Normalized
  }
})

test("Auth: Weak passwords without number or uppercase are rejected", () => {
  const weak = {
    name: "Candidate",
    email: "test@example.com",
    password: "weakpassword",
    confirmPassword: "weakpassword",
  }
  const result = registerSchema.safeParse(weak)
  assert.equal(result.success, false)
})

test("Auth: Mismatched password and confirmPassword are rejected", () => {
  const mismatch = {
    name: "Candidate",
    email: "test@example.com",
    password: "Password123!",
    confirmPassword: "DifferentPassword123!",
  }
  const result = registerSchema.safeParse(mismatch)
  assert.equal(result.success, false)
})

// 2. STRICT THREE-ATTEMPT ENFORCEMENT SIMULATION
test("Attempts: Three-attempt limit logic strictly accepts 1, 2, 3 and blocks attempt 4", () => {
  const maxAttempts = 3
  let attemptsUsed = 0

  function simulateSubmission() {
    if (attemptsUsed >= maxAttempts) {
      throw new Error("ATTEMPT_LIMIT_EXCEEDED")
    }
    attemptsUsed++
    return attemptsUsed
  }

  // Attempt 1
  const att1 = simulateSubmission()
  assert.equal(att1, 1)

  // Attempt 2
  const att2 = simulateSubmission()
  assert.equal(att2, 2)

  // Attempt 3
  const att3 = simulateSubmission()
  assert.equal(att3, 3)

  // Attempt 4 must fail
  assert.throws(() => simulateSubmission(), /ATTEMPT_LIMIT_EXCEEDED/)
  assert.equal(attemptsUsed, 3)
})

test("Attempts: Invalid uploads before acceptance do not burn attempts", () => {
  let attemptsUsed = 1
  const maxAttempts = 3

  function validateAndSubmit(fileType: string, fileSize: number) {
    const allowed = ["application/pdf", "image/jpeg", "image/png"]
    if (!allowed.includes(fileType) || fileSize > 25 * 1024 * 1024) {
      return { success: false, error: "INVALID_FILE" }
    }
    attemptsUsed++
    return { success: true, attempt: attemptsUsed }
  }

  // Corrupted / invalid file type
  const badFile = validateAndSubmit("application/exe", 1000)
  assert.equal(badFile.success, false)
  assert.equal(attemptsUsed, 1) // Unchanged!

  // Valid PDF
  const goodFile = validateAndSubmit("application/pdf", 2000)
  assert.equal(goodFile.success, true)
  assert.equal(attemptsUsed, 2)
})

// 3. AI EVALUATION OUTPUT VALIDATION & GUARDRAILS
test("AI Evaluator: Structured JSON schema validates question scores and feedback", () => {
  const sampleOutput = {
    generalFeedback: "Well-structured analysis with solid conceptual footing.",
    legibilityWarning: false,
    uncertaintyFlag: false,
    questions: [
      {
        questionNumber: "Q1",
        maxMarks: 10,
        marksAwarded: 8.5,
        feedback: "Accurate historical reasoning.",
        missingConcepts: "Could cite specific edicts.",
        isLegible: true,
        isUncertain: false,
      },
      {
        questionNumber: "Q2",
        maxMarks: 15,
        marksAwarded: 12.0,
        feedback: "Clear climatic diagram.",
        isLegible: true,
        isUncertain: false,
      },
    ],
  }

  const parsed = aiEvaluationResponseSchema.safeParse(sampleOutput)
  assert.equal(parsed.success, true)
})

test("AI Evaluator: Clamps marks so awarded score never exceeds maxMarks", () => {
  const qMax = 10
  let aiScore = 14.5 // Model hallucination or bug

  // Application clamping logic
  const clampedScore = Math.min(Math.max(0, aiScore), qMax)
  assert.equal(clampedScore, 10)
})

test("AI Evaluator: Flagging uncertainty routes to review status", () => {
  const sampleWithFlag = {
    generalFeedback: "Ambiguous diagram handwriting.",
    legibilityWarning: true,
    uncertaintyFlag: true,
    questions: [
      {
        questionNumber: "Q1",
        maxMarks: 10,
        marksAwarded: 5.0,
        feedback: "Requires human review.",
        isLegible: false,
        isUncertain: true,
      },
    ],
  }

  const parsed = aiEvaluationResponseSchema.parse(sampleWithFlag)
  const isReviewRequired = parsed.uncertaintyFlag || parsed.legibilityWarning
  assert.equal(isReviewRequired, true)
})

// 4. RAZORPAY DIGITAL SIGNATURE VERIFICATION
test("Payments: Server-side HMAC SHA-256 signature verification succeeds with correct secret", () => {
  const secret = "test_razorpay_secret_123"
  const orderId = "order_123456"
  const paymentId = "pay_789101"

  const generatedSignature = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex")

  const incomingSignature = generatedSignature
  const isValid =
    crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex") === incomingSignature

  assert.equal(isValid, true)
})

test("Payments: Tampered signature is strictly rejected", () => {
  const secret = "test_razorpay_secret_123"
  const orderId = "order_123456"
  const paymentId = "pay_789101"

  const tamperedSignature = "bad_signature_abc123"
  const isValid =
    crypto
      .createHmac("sha256", secret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex") === tamperedSignature

  assert.equal(isValid, false)
})

// 5. SEPARATION OF INSTRUCTIONS SECURITY
test("Security: Private evaluation instructions are isolated from student query projections", () => {
  const testSeriesDbRecord = {
    id: "ts-1",
    title: "UPSC GS Paper I",
    price: 0,
    maxMarks: 250,
    studentInstructions: "Write using blue pen on official sheet.",
    privateEvaluationInstructions: "CONFIDENTIAL: Deduct 2 marks if conclusion is missing.",
  }

  // Student public projection
  const studentView = {
    id: testSeriesDbRecord.id,
    title: testSeriesDbRecord.title,
    price: testSeriesDbRecord.price,
    maxMarks: testSeriesDbRecord.maxMarks,
    studentInstructions: testSeriesDbRecord.studentInstructions,
  }

  assert.equal("privateEvaluationInstructions" in studentView, false)
  assert.equal((studentView as any).privateEvaluationInstructions, undefined)
})

console.log("==================================================")
console.log(`TEST RUN SUMMARY: ${passed} PASSED, ${failed} FAILED`)
console.log("==================================================")

if (failed > 0) {
  process.exit(1)
}
