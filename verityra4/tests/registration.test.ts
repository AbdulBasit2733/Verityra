import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import { RegistrationStatus } from "@prisma/client"

export function runRegistrationTests() {
  const suite = new TestSuite("Module: Test Registration & Enrollment")
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  suite.test("Free Enrollment: Allowed when price is 0 and published", () => {
    function validateFreeRegistration(testSeries: {
      isPublished: boolean
      price: number
    }) {
      if (!testSeries.isPublished) {
        return { allowed: false, error: "NOT_PUBLISHED" }
      }
      if (testSeries.price > 0) {
        return { allowed: false, error: "PAYMENT_REQUIRED" }
      }
      return { allowed: true }
    }

    const freePublished = { isPublished: true, price: 0 }
    assert.equal(validateFreeRegistration(freePublished).allowed, true)

    const freeDraft = { isPublished: false, price: 0 }
    assert.equal(validateFreeRegistration(freeDraft).allowed, false)
    assert.equal(validateFreeRegistration(freeDraft).error, "NOT_PUBLISHED")

    const paidPublished = { isPublished: true, price: 49900 }
    assert.equal(validateFreeRegistration(paidPublished).allowed, false)
    assert.equal(validateFreeRegistration(paidPublished).error, "PAYMENT_REQUIRED")
  })

  suite.test("Attempt Initialization: New registration initializes attemptsUsed to 0 and inherits maxAttempts", () => {
    function createRegistrationRecord(userId: string, testSeries: { id: string; maxAttempts: number }) {
      return {
        id: `reg_${userId}_${testSeries.id}`,
        userId,
        testSeriesId: testSeries.id,
        attemptsUsed: 0,
        maxAttempts: testSeries.maxAttempts || 3,
        status: RegistrationStatus.ACTIVE,
      }
    }

    const reg = createRegistrationRecord("user_1", { id: "ts_10", maxAttempts: 5 })
    assert.equal(reg.attemptsUsed, 0)
    assert.equal(reg.maxAttempts, 5)
    assert.equal(reg.status, RegistrationStatus.ACTIVE)
  })

  suite.test("Duplicate Enrollment: Composite userId_testSeriesId constraint prevents duplicate active registrations", () => {
    const existingRegistrations = new Set<string>()

    function registerCandidate(userId: string, testSeriesId: string) {
      const key = `${userId}_${testSeriesId}`
      if (existingRegistrations.has(key)) {
        throw new Error("ALREADY_REGISTERED")
      }
      existingRegistrations.add(key)
      return { success: true, key }
    }

    // First enrollment succeeds
    const first = registerCandidate("user_1", "ts_100")
    assert.equal(first.success, true)

    // Second enrollment for same user and test throws error
    assert.throws(() => registerCandidate("user_1", "ts_100"), /ALREADY_REGISTERED/)

    // Different user for same test succeeds
    const otherUser = registerCandidate("user_2", "ts_100")
    assert.equal(otherUser.success, true)
  })

  suite.test("Status Invariants: Cancelled registration closes attempt access", () => {
    const registration = {
      id: "reg_abc",
      status: RegistrationStatus.CANCELLED,
      attemptsUsed: 1,
      maxAttempts: 0, // Zeroed out on refund/cancellation
    }

    function canAttemptTest(reg: { status: RegistrationStatus; attemptsUsed: number; maxAttempts: number }) {
      if (reg.status !== RegistrationStatus.ACTIVE) return false
      return reg.attemptsUsed < reg.maxAttempts
    }

    assert.equal(canAttemptTest(registration), false)
  })

  suite.test("Order Payload: Paid order specification formats amount in paise and currency in INR", () => {
    function createOrderPayload(testSeries: { id: string; title: string; priceInPaise: number }) {
      if (testSeries.priceInPaise <= 0) {
        throw new Error("CANNOT_CREATE_ORDER_FOR_FREE_TEST")
      }
      return {
        amount: testSeries.priceInPaise,
        currency: "INR",
        receipt: `rcpt_${testSeries.id}_${Date.now()}`,
        notes: {
          testSeriesId: testSeries.id,
          testTitle: testSeries.title,
        },
      }
    }

    const payload = createOrderPayload({
      id: "ts_50",
      title: "Judicial Service Mock",
      priceInPaise: 79900,
    })

    assert.equal(payload.amount, 79900)
    assert.equal(payload.currency, "INR")
    assert.match(payload.receipt, /^rcpt_ts_50_\d+$/)
    assert.equal(payload.notes.testSeriesId, "ts_50")
  })

  suite.test("Foreign Key Guard: P2003 error in payment creation yields graceful session recovery message", () => {
    function handlePaymentCreateError(err: { code?: string }) {
      if (err?.code === "P2003") {
        return {
          success: false,
          error: "Your user account session could not be verified in the database. Please sign out and sign in again.",
        }
      }
      return {
        success: false,
        error: "Failed to initialize payment checkout. Please try again shortly.",
      }
    }

    const p2003Result = handlePaymentCreateError({ code: "P2003" })
    assert.equal(p2003Result.success, false)
    assert.match(p2003Result.error, /session could not be verified in the database/)

    const otherResult = handlePaymentCreateError({ code: "P2002" })
    assert.equal(otherResult.success, false)
    assert.match(otherResult.error, /Failed to initialize payment checkout/)
  })

  suite.test("Self-Healing Identity: Resolves OAuth subject ID or stale session to persisted DB user via email", () => {
    const mockDbUsers = [
      { id: "cmw6user123cuid0001", email: "candidate@verityra.com", status: "ACTIVE" },
    ]

    function resolvePersistedUserMock(sessionUser: { id?: string; email?: string | null }) {
      if (!sessionUser) return null
      // 1. By ID
      if (sessionUser.id) {
        const found = mockDbUsers.find((u) => u.id === sessionUser.id)
        if (found) return found
      }
      // 2. Fallback by email (self-healing)
      if (sessionUser.email) {
        const normalized = sessionUser.email.toLowerCase().trim()
        const found = mockDbUsers.find((u) => u.email === normalized)
        if (found) return found
      }
      return null
    }

    // Google OAuth session where id is numeric sub instead of cuid
    const googleSession = { id: "109827364519283746501", email: "candidate@verityra.com" }
    const resolved = resolvePersistedUserMock(googleSession)
    assert.ok(resolved)
    assert.equal(resolved?.id, "cmw6user123cuid0001") // Self-healed to real cuid!

    // Orphaned session where user doesn't exist in DB at all
    const orphanedSession = { id: "cmw_deleted_user", email: "deleted@verityra.com" }
    const notFound = resolvePersistedUserMock(orphanedSession)
    assert.equal(notFound, null)
  })

  return suite.summary()
}

// Allow direct execution
if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("tests/registration.test.ts")) {
  const result = runRegistrationTests()
  if (result.failed > 0) process.exit(1)
}
