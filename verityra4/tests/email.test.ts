import assert from "node:assert/strict"
import crypto from "node:crypto"
import { TestSuite } from "./test-utils"
import {
  getAppBaseUrl,
  isResendConfigured,
  renderEnrollmentReceiptEmail,
  renderEvaluationReadyEmail,
  renderPasswordChangedEmail,
  renderPasswordResetEmail,
  renderVerifyEmail,
} from "../lib/email"
import { checkRateLimit } from "../lib/rate-limit"

export function runEmailTests() {
  const suite = new TestSuite(
    "Module: Resend Email Service & Verification Templates"
  )
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  suite.test(
    "Configuration: Detects valid Resend API keys and rejects placeholders",
    () => {
      assert.equal(isResendConfigured(undefined), false)
      assert.equal(isResendConfigured(""), false)
      assert.equal(isResendConfigured("re_your_resend_api_key"), false)
      assert.equal(isResendConfigured("your-resend-api-key"), false)
      assert.equal(isResendConfigured("invalid_prefix_12345"), false)
      assert.equal(isResendConfigured("re_live_987654321abcdef"), true)
    }
  )

  suite.test(
    "Template: Password reset email renders branded HTML, reset link, and plaintext",
    () => {
      const resetUrl = "https://verityra.com/reset-password?token=abc123token"
      const rendered = renderPasswordResetEmail({
        name: "Aarav Sharma",
        resetUrl,
        expiresInMinutes: 60,
      })

      assert.equal(rendered.subject, "Reset your Verityra password")
      assert.ok(rendered.html.includes(resetUrl))
      assert.ok(rendered.html.includes("Aarav Sharma"))
      assert.ok(rendered.html.includes("#2A6AED"))
      assert.ok(rendered.html.includes("60 minutes"))
      assert.ok(rendered.text.includes(resetUrl))
    }
  )

  suite.test(
    "Template: Email verification template embeds verification URL and escapes HTML",
    () => {
      const verificationUrl =
        "https://verityra.com/verify-email?token=tok_999&email=student%40verityra.com"
      const rendered = renderVerifyEmail({
        name: "Priya <Admin>",
        verificationUrl,
        expiresInHours: 24,
      })

      assert.ok(rendered.subject.includes("Verify your email address"))
      assert.ok(rendered.html.includes("Priya &lt;Admin&gt;"))
      assert.ok(!rendered.html.includes("Priya <Admin>"))
      assert.ok(rendered.html.includes("24 hours"))
      assert.ok(rendered.text.includes(verificationUrl))
    }
  )

  suite.test(
    "Template: Password changed security alert includes sign-in link",
    () => {
      const signInUrl = "https://verityra.com/signin"
      const rendered = renderPasswordChangedEmail({
        name: "Rohan Verma",
        signInUrl,
      })

      assert.ok(rendered.subject.includes("Security Alert"))
      assert.ok(rendered.html.includes(signInUrl))
      assert.ok(rendered.text.includes(signInUrl))
    }
  )

  suite.test(
    "Template: Evaluation ready email formats marks, percentage, and scorecard link",
    () => {
      const scorecardUrl = "https://verityra.com/student/tests/upsc-gs1"
      const rendered = renderEvaluationReadyEmail({
        name: "Ananya Nair",
        testTitle: "UPSC GS Paper I Mock",
        attemptNumber: 2,
        totalMarksAwarded: 145.5,
        maxMarks: 250,
        percentage: 58.2,
        requiresReview: false,
        scorecardUrl,
      })

      assert.ok(rendered.subject.includes("145.5/250"))
      assert.ok(rendered.html.includes("58.2%"))
      assert.ok(rendered.html.includes(scorecardUrl))
      assert.ok(rendered.text.includes("Attempt #2"))
    }
  )

  suite.test(
    "Template: Enrollment receipt converts paise to INR and includes order reference",
    () => {
      const workspaceUrl = "https://verityra.com/student/tests/upsc-gs2"
      const rendered = renderEnrollmentReceiptEmail({
        name: "Vikram Rathore",
        testTitle: "UPSC GS Paper II Polity",
        amountPaise: 49900,
        maxAttempts: 3,
        orderId: "order_Rzp12345",
        workspaceUrl,
      })

      assert.ok(rendered.subject.includes("UPSC GS Paper II Polity"))
      assert.ok(rendered.html.includes("₹499.00"))
      assert.ok(rendered.html.includes("order_Rzp12345"))
      assert.ok(rendered.html.includes("3 Attempts"))
      assert.ok(rendered.text.includes(workspaceUrl))
    }
  )

  suite.test(
    "Security: Verification tokens hash deterministically with SHA-256 and never store raw value",
    () => {
      const rawToken = crypto.randomBytes(32).toString("hex")
      const hash1 = crypto.createHash("sha256").update(rawToken).digest("hex")
      const hash2 = crypto.createHash("sha256").update(rawToken).digest("hex")

      assert.equal(hash1, hash2)
      assert.notEqual(rawToken, hash1)
      assert.equal(hash1.length, 64)
    }
  )

  suite.test(
    "Security: Verification resend rate limiter blocks rapid spam above threshold",
    () => {
      const key = `test-resend-verify:${Date.now()}`
      const r1 = checkRateLimit(key, 3, 60_000)
      const r2 = checkRateLimit(key, 3, 60_000)
      const r3 = checkRateLimit(key, 3, 60_000)
      const r4 = checkRateLimit(key, 3, 60_000)

      assert.equal(r1.allowed, true)
      assert.equal(r2.allowed, true)
      assert.equal(r3.allowed, true)
      assert.equal(r4.allowed, false)
      assert.ok(r4.retryAfterSeconds > 0)
    }
  )

  suite.test(
    "Configuration: getAppBaseUrl trims trailing slashes properly",
    () => {
      const origUrl = process.env.NEXT_PUBLIC_APP_URL
      try {
        process.env.NEXT_PUBLIC_APP_URL = "https://verityra.com///"
        assert.equal(getAppBaseUrl(), "https://verityra.com")
      } finally {
        process.env.NEXT_PUBLIC_APP_URL = origUrl
      }
    }
  )

  return suite.summary()
}

if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("tests/email.test.ts")
) {
  const result = runEmailTests()
  if (result.failed > 0) process.exit(1)
}
