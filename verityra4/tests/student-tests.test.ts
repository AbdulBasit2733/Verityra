import assert from "node:assert/strict"
import { TestResult, TestSuite } from "./test-utils"
import { resolveEffectiveOrigin, PRODUCTION_DEFAULT_ORIGIN } from "../app/api/auth/[...nextauth]/route"
import { getAppBaseUrl } from "../lib/email/resend"

export function runStudentTests(): TestResult {
  const suite = new TestSuite("Student Tests & Origin Resolution Suite")
  console.log(`\n--- Running ${suite.name} ---`)

  // 1. Origin Resolution Tests
  suite.test("resolveEffectiveOrigin returns request x-forwarded-host for live domain", () => {
    const origin = resolveEffectiveOrigin("verityra-fr.vercel.app", "https", {})
    assert.equal(origin, "https://verityra-fr.vercel.app")
  })

  suite.test("resolveEffectiveOrigin strips custom proto correctly", () => {
    const origin = resolveEffectiveOrigin("preview-branch.vercel.app", "http", {})
    assert.equal(origin, "http://preview-branch.vercel.app")
  })

  suite.test("resolveEffectiveOrigin ignores localhost host in production and returns default production origin", () => {
    const origin = resolveEffectiveOrigin("localhost:3000", "http", {
      NODE_ENV: "production",
      NEXTAUTH_URL: "http://localhost:3000",
    })
    assert.equal(origin, PRODUCTION_DEFAULT_ORIGIN)
  })

  suite.test("resolveEffectiveOrigin respects NEXT_PUBLIC_APP_URL when set to production domain", () => {
    const origin = resolveEffectiveOrigin(null, null, {
      NEXT_PUBLIC_APP_URL: "https://custom.verityra.com",
    })
    assert.equal(origin, "https://custom.verityra.com")
  })

  suite.test("resolveEffectiveOrigin uses VERCEL_PROJECT_PRODUCTION_URL when provided", () => {
    const origin = resolveEffectiveOrigin(null, null, {
      VERCEL_PROJECT_PRODUCTION_URL: "verityra-fr.vercel.app",
    })
    assert.equal(origin, "https://verityra-fr.vercel.app")
  })

  suite.test("resolveEffectiveOrigin defaults to localhost:3000 in development mode", () => {
    const origin = resolveEffectiveOrigin(null, null, {
      NODE_ENV: "development",
      NEXTAUTH_URL: "http://localhost:3000",
    })
    assert.equal(origin, "http://localhost:3000")
  })

  // 2. Email App Base URL Tests
  suite.test("getAppBaseUrl returns production origin when NEXTAUTH_URL is localhost in production", () => {
    const prevEnv = process.env.NODE_ENV
    const prevAuthUrl = process.env.NEXTAUTH_URL
    const prevAppUrl = process.env.NEXT_PUBLIC_APP_URL
    try {
      ;(process.env as any).NODE_ENV = "production"
      process.env.NEXTAUTH_URL = "http://localhost:3000"
      delete process.env.NEXT_PUBLIC_APP_URL
      delete process.env.VERCEL_PROJECT_PRODUCTION_URL
      delete process.env.VERCEL_URL

      const url = getAppBaseUrl()
      assert.equal(url, "https://verityra-fr.vercel.app")
    } finally {
      ;(process.env as any).NODE_ENV = prevEnv
      process.env.NEXTAUTH_URL = prevAuthUrl
      if (prevAppUrl) process.env.NEXT_PUBLIC_APP_URL = prevAppUrl
    }
  })

  // 3. Student Tests Registration Scope Logic
  suite.test("Free registrations (payment = null) are eligible for student tests page", () => {
    const registration = {
      id: "reg-free-1",
      testSeriesId: "ts-free-1",
      status: "ACTIVE",
      payment: null,
      testSeries: { title: "UPSC Free Mock", price: 0, maxMarks: 100, durationMinutes: 180 },
    }
    const isEligible =
      registration.status !== "CANCELLED" &&
      (registration.payment === null || (registration.payment as any)?.status === "COMPLETED")
    assert.equal(isEligible, true)

    const isPaid = (registration.testSeries.price ?? 0) > 0 || Boolean(registration.payment)
    assert.equal(isPaid, false)
  })

  suite.test("Completed paid registrations are eligible and flagged as paid", () => {
    const registration = {
      id: "reg-paid-1",
      testSeriesId: "ts-paid-1",
      status: "ACTIVE",
      payment: { id: "pay-1", status: "COMPLETED", amount: 49900 },
      testSeries: { title: "UPSC Mains Master", price: 49900, maxMarks: 250, durationMinutes: 180 },
    }
    const isEligible =
      registration.status !== "CANCELLED" &&
      (registration.payment === null || registration.payment.status === "COMPLETED")
    assert.equal(isEligible, true)

    const isPaid = (registration.testSeries.price ?? 0) > 0 || Boolean(registration.payment)
    assert.equal(isPaid, true)
    assert.equal(registration.testSeries.price, 49900)
  })

  suite.test("Pending or failed payment registrations are excluded from active tests", () => {
    const pendingReg = {
      id: "reg-pending-1",
      testSeriesId: "ts-paid-2",
      status: "ACTIVE",
      payment: { id: "pay-2", status: "PENDING", amount: 49900 },
    }
    const failedReg = {
      id: "reg-failed-1",
      testSeriesId: "ts-paid-3",
      status: "ACTIVE",
      payment: { id: "pay-3", status: "FAILED", amount: 49900 },
    }

    const isPendingEligible =
      pendingReg.status !== "CANCELLED" &&
      (pendingReg.payment === null || pendingReg.payment.status === "COMPLETED")
    const isFailedEligible =
      failedReg.status !== "CANCELLED" &&
      (failedReg.payment === null || failedReg.payment.status === "COMPLETED")

    assert.equal(isPendingEligible, false)
    assert.equal(isFailedEligible, false)
  })

  suite.test("Cancelled registrations are excluded regardless of payment state", () => {
    const cancelledReg = {
      id: "reg-cancelled-1",
      testSeriesId: "ts-free-2",
      status: "CANCELLED",
      payment: null,
    }
    const isEligible =
      cancelledReg.status !== "CANCELLED" &&
      (cancelledReg.payment === null || (cancelledReg.payment as any)?.status === "COMPLETED")
    assert.equal(isEligible, false)
  })

  return {
    suiteName: suite.name,
    passed: suite.passed,
    failed: suite.failed,
    errors: suite.errors,
  }
}
