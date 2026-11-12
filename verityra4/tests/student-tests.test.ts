import assert from "node:assert/strict"
import { TestResult, TestSuite } from "./test-utils"
import {
  resolveEffectiveOrigin,
  isTrustedHost,
  ensureProductionNextAuthUrl,
  PRODUCTION_DEFAULT_ORIGIN,
} from "../app/api/auth/[...nextauth]/route"
import { getAppBaseUrl } from "../lib/email/resend"
import { formatDate, formatTime, DISPLAY_TIME_ZONE } from "../lib/format"
import { NextRequest } from "next/server"

export function runStudentTests(): TestResult {
  const suite = new TestSuite("Student Tests & Origin Resolution Suite")
  console.log(`\n--- Running ${suite.name} ---`)

  // 1. Origin Resolution & Host Validation Tests (CWE-346 Guard)
  suite.test(
    "resolveEffectiveOrigin returns request x-forwarded-host for live domain",
    () => {
      const origin = resolveEffectiveOrigin(
        "verityra-fr.vercel.app",
        "https",
        {}
      )
      assert.equal(origin, "https://verityra-fr.vercel.app")
    }
  )

  suite.test(
    "resolveEffectiveOrigin rejects attacker-controlled host header",
    () => {
      const origin = resolveEffectiveOrigin(
        "evil-phishing-domain.com",
        "https",
        {
          NODE_ENV: "production",
          NEXTAUTH_URL: "http://localhost:3000",
        }
      )
      assert.equal(origin, PRODUCTION_DEFAULT_ORIGIN)
      assert.equal(isTrustedHost("evil-phishing-domain.com", {}), false)
    }
  )

  suite.test(
    "resolveEffectiveOrigin rejects authority delimiter injection (user info in host)",
    () => {
      assert.equal(isTrustedHost("verityra.com:443@evil.example", {}), false)
      assert.equal(isTrustedHost("verityra-fr.vercel.app/test", {}), false)
      assert.equal(isTrustedHost("verityra.com\\evil", {}), false)
      assert.equal(isTrustedHost("verityra.com?evil", {}), false)
      assert.equal(isTrustedHost("verityra.com#evil", {}), false)
      const origin = resolveEffectiveOrigin(
        "verityra.com:443@evil.example",
        "https",
        {
          NODE_ENV: "production",
          NEXTAUTH_URL: "http://localhost:3000",
        }
      )
      assert.equal(origin, PRODUCTION_DEFAULT_ORIGIN)
    }
  )

  suite.test(
    "isTrustedHost rejects localhost in production even if set in NEXT_PUBLIC_APP_URL",
    () => {
      const trusted = isTrustedHost("localhost:3000", {
        NODE_ENV: "production",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      })
      assert.equal(trusted, false)
    }
  )

  suite.test(
    "resolveEffectiveOrigin strips custom proto correctly for trusted preview domain",
    () => {
      const origin = resolveEffectiveOrigin(
        "verityra-preview-123.vercel.app",
        "http",
        {}
      )
      assert.equal(origin, "http://verityra-preview-123.vercel.app")
    }
  )

  suite.test(
    "resolveEffectiveOrigin ignores localhost host in production and returns default production origin",
    () => {
      const origin = resolveEffectiveOrigin("localhost:3000", "http", {
        NODE_ENV: "production",
        NEXTAUTH_URL: "http://localhost:3000",
      })
      assert.equal(origin, PRODUCTION_DEFAULT_ORIGIN)
    }
  )

  suite.test(
    "resolveEffectiveOrigin respects NEXT_PUBLIC_APP_URL when set to production domain",
    () => {
      const origin = resolveEffectiveOrigin(null, null, {
        NEXT_PUBLIC_APP_URL: "https://custom.verityra.com",
      })
      assert.equal(origin, "https://custom.verityra.com")
    }
  )

  suite.test(
    "resolveEffectiveOrigin uses VERCEL_PROJECT_PRODUCTION_URL when provided",
    () => {
      const origin = resolveEffectiveOrigin(null, null, {
        VERCEL_PROJECT_PRODUCTION_URL: "verityra-fr.vercel.app",
      })
      assert.equal(origin, "https://verityra-fr.vercel.app")
    }
  )

  suite.test(
    "resolveEffectiveOrigin defaults to localhost:3000 in development mode",
    () => {
      const origin = resolveEffectiveOrigin(null, null, {
        NODE_ENV: "development",
        NEXTAUTH_URL: "http://localhost:3000",
      })
      assert.equal(origin, "http://localhost:3000")
    }
  )

  suite.test(
    "ensureProductionNextAuthUrl preserves http for direct 127.0.0.1 development requests",
    () => {
      const prevEnv = process.env.NODE_ENV
      const prevAuthUrl = process.env.NEXTAUTH_URL
      try {
        ;(process.env as any).NODE_ENV = "development"
        delete process.env.NEXTAUTH_URL
        const mockReq = {
          headers: new Headers({ host: "127.0.0.1:3000" }),
        } as unknown as NextRequest

        ensureProductionNextAuthUrl(mockReq)
        assert.equal(process.env.NEXTAUTH_URL, "http://127.0.0.1:3000")
      } finally {
        ;(process.env as any).NODE_ENV = prevEnv
        if (prevAuthUrl !== undefined) process.env.NEXTAUTH_URL = prevAuthUrl
        else delete process.env.NEXTAUTH_URL
      }
    }
  )

  // 2. Email App Base URL Tests
  suite.test(
    "getAppBaseUrl preserves custom localhost port in development mode",
    () => {
      const prevEnv = process.env.NODE_ENV
      const prevAppUrl = process.env.NEXT_PUBLIC_APP_URL
      const prevVercel = process.env.VERCEL
      const prevProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      const prevVercelUrl = process.env.VERCEL_URL
      try {
        ;(process.env as any).NODE_ENV = "development"
        process.env.NEXT_PUBLIC_APP_URL = "http://localhost:4000"
        delete process.env.VERCEL
        delete process.env.VERCEL_PROJECT_PRODUCTION_URL
        delete process.env.VERCEL_URL

        const url = getAppBaseUrl()
        assert.equal(url, "http://localhost:4000")
      } finally {
        ;(process.env as any).NODE_ENV = prevEnv
        if (prevAppUrl !== undefined)
          process.env.NEXT_PUBLIC_APP_URL = prevAppUrl
        else delete process.env.NEXT_PUBLIC_APP_URL
        if (prevVercel !== undefined) process.env.VERCEL = prevVercel
        else delete process.env.VERCEL
        if (prevProdUrl !== undefined)
          process.env.VERCEL_PROJECT_PRODUCTION_URL = prevProdUrl
        else delete process.env.VERCEL_PROJECT_PRODUCTION_URL
        if (prevVercelUrl !== undefined) process.env.VERCEL_URL = prevVercelUrl
        else delete process.env.VERCEL_URL
      }
    }
  )

  suite.test(
    "getAppBaseUrl returns production origin when NEXTAUTH_URL is localhost in production",
    () => {
      const prevEnv = process.env.NODE_ENV
      const prevAuthUrl = process.env.NEXTAUTH_URL
      const prevAppUrl = process.env.NEXT_PUBLIC_APP_URL
      const prevVercel = process.env.VERCEL
      const prevProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
      const prevVercelUrl = process.env.VERCEL_URL
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
        if (prevAuthUrl !== undefined) process.env.NEXTAUTH_URL = prevAuthUrl
        else delete process.env.NEXTAUTH_URL
        if (prevAppUrl !== undefined)
          process.env.NEXT_PUBLIC_APP_URL = prevAppUrl
        else delete process.env.NEXT_PUBLIC_APP_URL
        if (prevVercel !== undefined) process.env.VERCEL = prevVercel
        else delete process.env.VERCEL
        if (prevProdUrl !== undefined)
          process.env.VERCEL_PROJECT_PRODUCTION_URL = prevProdUrl
        else delete process.env.VERCEL_PROJECT_PRODUCTION_URL
        if (prevVercelUrl !== undefined) process.env.VERCEL_URL = prevVercelUrl
        else delete process.env.VERCEL_URL
      }
    }
  )

  // 3. Timezone Consistency Formatting Tests
  suite.test(
    "formatDate and formatTime consistently use explicit DISPLAY_TIME_ZONE",
    () => {
      assert.equal(DISPLAY_TIME_ZONE, "Asia/Kolkata")
      // 2026-11-10 19:00:00 UTC is 2026-11-11 00:30:00 in Asia/Kolkata (GMT+5:30)
      const testDate = new Date("2026-11-10T19:00:00.000Z")
      const formatted = formatDate(testDate)
      const timeFormatted = formatTime(testDate)

      assert.equal(formatted, "11 Nov 2026")
      assert.equal(timeFormatted, "00:30")
    }
  )

  // 4. Student Tests Registration Scope Logic
  suite.test(
    "Free registrations (payment = null) are eligible for student tests page",
    () => {
      const registration = {
        id: "reg-free-1",
        testSeriesId: "ts-free-1",
        status: "ACTIVE",
        payment: null,
        testSeries: {
          title: "UPSC Free Mock",
          price: 0,
          maxMarks: 100,
          durationMinutes: 180,
        },
      }
      const isEligible =
        registration.status !== "CANCELLED" &&
        (registration.payment === null ||
          (registration.payment as any)?.status === "COMPLETED")
      assert.equal(isEligible, true)

      const isPaid =
        (registration.testSeries.price ?? 0) > 0 ||
        Boolean(registration.payment)
      assert.equal(isPaid, false)
    }
  )

  suite.test(
    "Completed paid registrations are eligible and flagged as paid",
    () => {
      const registration = {
        id: "reg-paid-1",
        testSeriesId: "ts-paid-1",
        status: "ACTIVE",
        payment: { id: "pay-1", status: "COMPLETED", amount: 49900 },
        testSeries: {
          title: "UPSC Mains Master",
          price: 49900,
          maxMarks: 250,
          durationMinutes: 180,
        },
      }
      const isEligible =
        registration.status !== "CANCELLED" &&
        (registration.payment === null ||
          registration.payment.status === "COMPLETED")
      assert.equal(isEligible, true)

      const isPaid =
        (registration.testSeries.price ?? 0) > 0 ||
        Boolean(registration.payment)
      assert.equal(isPaid, true)
      assert.equal(registration.testSeries.price, 49900)
    }
  )

  suite.test(
    "Pending or failed payment registrations are excluded from active tests",
    () => {
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
        (pendingReg.payment === null ||
          pendingReg.payment.status === "COMPLETED")
      const isFailedEligible =
        failedReg.status !== "CANCELLED" &&
        (failedReg.payment === null || failedReg.payment.status === "COMPLETED")

      assert.equal(isPendingEligible, false)
      assert.equal(isFailedEligible, false)
    }
  )

  suite.test(
    "Cancelled registrations are excluded regardless of payment state",
    () => {
      const cancelledReg = {
        id: "reg-cancelled-1",
        testSeriesId: "ts-free-2",
        status: "CANCELLED",
        payment: null,
      }
      const isEligible =
        cancelledReg.status !== "CANCELLED" &&
        (cancelledReg.payment === null ||
          (cancelledReg.payment as any)?.status === "COMPLETED")
      assert.equal(isEligible, false)
    }
  )

  return {
    suiteName: suite.name,
    passed: suite.passed,
    failed: suite.failed,
    errors: suite.errors,
  }
}
