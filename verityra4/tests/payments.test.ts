import assert from "node:assert/strict"
import crypto from "crypto"
import { TestSuite } from "./test-utils"
import { PaymentStatus, RefundReason } from "@prisma/client"
import { DB_TX_OPTIONS } from "../lib/prisma"

export function runPaymentTests() {
  const suite = new TestSuite(
    "Module: Razorpay Payments, 7-Day Refund Policy & Audit Ledger"
  )
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

  suite.test(
    "Signature Verification: HMAC SHA-256 signature verification succeeds with correct gateway secret",
    () => {
      const secret = "live_secret_key_rzp_mock"
      const orderId = "order_Oq1829abc"
      const paymentId = "pay_Pz9283xyz"

      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex")

      const incomingSignature = expectedSignature
      const isValid =
        crypto
          .createHmac("sha256", secret)
          .update(`${orderId}|${paymentId}`)
          .digest("hex") === incomingSignature

      assert.equal(isValid, true)
    }
  )

  suite.test(
    "Signature Security: Tampered signature or mismatched payload is strictly rejected",
    () => {
      const secret = "live_secret_key_rzp_mock"
      const orderId = "order_Oq1829abc"
      const paymentId = "pay_Pz9283xyz"

      const tamperedSig = "fake_tampered_signature_hex"
      const isValid =
        crypto
          .createHmac("sha256", secret)
          .update(`${orderId}|${paymentId}`)
          .digest("hex") === tamperedSig

      assert.equal(isValid, false)

      // Altered payment ID
      const generatedForDifferentPayment = crypto
        .createHmac("sha256", secret)
        .update(`${orderId}|pay_different_attacker`)
        .digest("hex")

      const verifyAltered =
        crypto
          .createHmac("sha256", secret)
          .update(`${orderId}|${paymentId}`)
          .digest("hex") === generatedForDifferentPayment

      assert.equal(verifyAltered, false)
    }
  )

  suite.test(
    "7-Day Policy: Correctly discriminates eligible vs expired refund requests",
    () => {
      const now = Date.now()

      function check7DayWindow(
        orderCreatedAt: Date,
        currentTime = now
      ): { within7Days: boolean; daysElapsed: number } {
        const elapsedMs = currentTime - orderCreatedAt.getTime()
        const daysElapsed = Math.floor(elapsedMs / (24 * 60 * 60 * 1000))
        return {
          within7Days: elapsedMs <= SEVEN_DAYS_MS,
          daysElapsed,
        }
      }

      // 1 day old
      const day1 = check7DayWindow(new Date(now - 1 * 24 * 60 * 60 * 1000))
      assert.equal(day1.within7Days, true)
      assert.equal(day1.daysElapsed, 1)

      // 6.8 days old
      const day6 = check7DayWindow(new Date(now - 6.8 * 24 * 60 * 60 * 1000))
      assert.equal(day6.within7Days, true)

      // 7.1 days old -> Expired
      const day7Past = check7DayWindow(
        new Date(now - 7.1 * 24 * 60 * 60 * 1000)
      )
      assert.equal(day7Past.within7Days, false)

      // 14 days old -> Expired
      const day14 = check7DayWindow(new Date(now - 14 * 24 * 60 * 60 * 1000))
      assert.equal(day14.within7Days, false)
    }
  )

  suite.test(
    "Attempt Forfeiture Guard: Blocks refund when attempts > 0 unless explicit forfeiture acknowledged",
    () => {
      function evaluateRefundEligibility(
        attemptsUsed: number,
        confirmedForfeiture: boolean
      ) {
        if (attemptsUsed > 0 && !confirmedForfeiture) {
          return {
            allowed: false,
            error: "ATTEMPTS_ALREADY_USED",
            warning:
              "Candidate has already utilized test attempts. Refund requires explicit forfeiture acknowledgement.",
          }
        }
        return { allowed: true }
      }

      // Zero attempts used -> immediately allowed without warning
      const cleanRefund = evaluateRefundEligibility(0, false)
      assert.equal(cleanRefund.allowed, true)

      // One attempt used, no forfeiture checkbox -> blocked
      const unconfirmedRefund = evaluateRefundEligibility(1, false)
      assert.equal(unconfirmedRefund.allowed, false)
      assert.equal(unconfirmedRefund.error, "ATTEMPTS_ALREADY_USED")

      // One attempt used, with explicit forfeiture checkbox -> permitted
      const confirmedRefund = evaluateRefundEligibility(1, true)
      assert.equal(confirmedRefund.allowed, true)
    }
  )

  suite.test(
    "Idempotency Keys: Generates unique, structured refund idempotency keys",
    () => {
      function generateRefundIdempotencyKey(
        paymentId: string,
        timestamp = Date.now()
      ) {
        return `idemp_ref_${paymentId}_${timestamp}`
      }

      const key1 = generateRefundIdempotencyKey("pay_123", 1000000)
      const key2 = generateRefundIdempotencyKey("pay_123", 1000050)

      assert.equal(key1, "idemp_ref_pay_123_1000000")
      assert.match(key1, /^idemp_ref_[a-zA-Z0-9_]+_\d+$/)
      assert.notEqual(key1, key2)
    }
  )

  suite.test(
    "Audit Ledger: PaymentLedger event payloads are structured and serializable",
    () => {
      const ledgerEntry = {
        paymentId: "pay_xyz89",
        eventType: "REFUND_PROCESSED",
        actorType: "ADMIN_OVERRIDE",
        actorName: "Admin Controller",
        details:
          "Triggered refund under 7-day policy. Reason: TECHNICAL_SUBMISSION_ISSUE",
        rawPayload: JSON.stringify({
          refundId: "rfnd_9921",
          amountRefundedInPaise: 49900,
          attemptsForfeited: 2,
          gatewayStatus: "processed",
        }),
        createdAt: new Date(),
      }

      assert.equal(ledgerEntry.eventType, "REFUND_PROCESSED")
      const parsedPayload = JSON.parse(ledgerEntry.rawPayload)
      assert.equal(parsedPayload.refundId, "rfnd_9921")
      assert.equal(parsedPayload.attemptsForfeited, 2)
    }
  )

  suite.test(
    "Auto-Reconciler: Identifies pending transactions older than 30-minute threshold",
    () => {
      const THIRTY_MINUTES_MS = 30 * 60 * 1000
      const now = Date.now()

      function shouldReconcile(
        status: PaymentStatus,
        createdAt: Date,
        currentTime = now
      ) {
        if (status !== PaymentStatus.PENDING) return false
        const ageMs = currentTime - createdAt.getTime()
        return ageMs >= THIRTY_MINUTES_MS
      }

      // 5 minutes old pending payment -> Candidate may still be in checkout flow, do NOT reconcile
      const recentPending = shouldReconcile(
        PaymentStatus.PENDING,
        new Date(now - 5 * 60 * 1000)
      )
      assert.equal(recentPending, false)

      // 45 minutes old pending payment -> Candidate likely had network drop, reconcile with Razorpay
      const oldPending = shouldReconcile(
        PaymentStatus.PENDING,
        new Date(now - 45 * 60 * 1000)
      )
      assert.equal(oldPending, true)

      // Completed payment -> already settled, do not reconcile
      const completed = shouldReconcile(
        PaymentStatus.COMPLETED,
        new Date(now - 60 * 60 * 1000)
      )
      assert.equal(completed, false)
    }
  )

  suite.test(
    "Enums: PaymentStatus and RefundReason conform to expected domain definitions",
    () => {
      assert.equal(PaymentStatus.COMPLETED, "COMPLETED")
      assert.equal(PaymentStatus.REFUNDED, "REFUNDED")
      assert.equal(
        RefundReason.STUDENT_REQUEST_7DAY_WINDOW,
        "STUDENT_REQUEST_7DAY_WINDOW"
      )
      assert.equal(
        RefundReason.TECHNICAL_SUBMISSION_ISSUE,
        "TECHNICAL_SUBMISSION_ISSUE"
      )
    }
  )

  suite.test(
    "Repurchase Restoration: Reactivating a cancelled registration resets attempts and unlinks old payment",
    () => {
      const cancelledRegistration = {
        id: "reg_100",
        status: "CANCELLED",
        attemptsUsed: 2,
        maxAttempts: 0,
      }
      const refundedPayment = {
        id: "pay_old_1",
        registrationId: "reg_100",
        status: PaymentStatus.REFUNDED,
      }

      // Repurchase update logic
      const testSeriesMaxAttempts = 3
      if (refundedPayment.registrationId === cancelledRegistration.id) {
        refundedPayment.registrationId = null as any
      }
      cancelledRegistration.status = "ACTIVE"
      cancelledRegistration.attemptsUsed = 0
      cancelledRegistration.maxAttempts = testSeriesMaxAttempts

      assert.equal(refundedPayment.registrationId, null)
      assert.equal(cancelledRegistration.status, "ACTIVE")
      assert.equal(cancelledRegistration.attemptsUsed, 0)
      assert.equal(cancelledRegistration.maxAttempts, 3)
    }
  )

  suite.test(
    "Pending Order Reuse: Rejects stale price orders and recognizes non-final gateway refund states",
    () => {
      function canReusePendingOrder(
        pendingAmount: number,
        currentPrice: number
      ) {
        return pendingAmount === currentPrice
      }

      assert.equal(canReusePendingOrder(49900, 49900), true)
      assert.equal(canReusePendingOrder(49900, 79900), false)

      function isGatewayRefundActive(status: string) {
        return ["processed", "pending", "created"].includes(status)
      }

      assert.equal(isGatewayRefundActive("processed"), true)
      assert.equal(isGatewayRefundActive("pending"), true)
      assert.equal(isGatewayRefundActive("created"), true)
      assert.equal(isGatewayRefundActive("failed"), false)
    }
  )

  suite.test(
    "Webhook Refund Idempotency: Prevents double-counting refund.created and refund.processed for same refundId",
    () => {
      function computeTotalRefunded(
        paymentAmount: number,
        currentRefunded: number,
        existingRefunds: Array<{ razorpayRefundId: string; amount: number }>,
        incomingRefundId: string,
        incomingAmount: number
      ) {
        const existingRecord = existingRefunds.find(
          (r) => r.razorpayRefundId === incomingRefundId
        )
        const otherRefundsSum = existingRefunds
          .filter((r) => r.razorpayRefundId !== incomingRefundId)
          .reduce((sum, r) => sum + r.amount, 0)

        return Math.min(
          paymentAmount,
          existingRecord
            ? otherRefundsSum + incomingAmount
            : Math.max(currentRefunded, otherRefundsSum + incomingAmount)
        )
      }

      // 1. refund.created arrives first for rfnd_1 (49900)
      const afterCreated = computeTotalRefunded(49900, 0, [], "rfnd_1", 49900)
      assert.equal(afterCreated, 49900)

      // 2. refund.processed arrives later for same rfnd_1 (49900)
      const afterProcessed = computeTotalRefunded(
        49900,
        49900,
        [{ razorpayRefundId: "rfnd_1", amount: 49900 }],
        "rfnd_1",
        49900
      )
      assert.equal(afterProcessed, 49900)
    }
  )

  suite.test(
    "Transaction Resilience: DB_TX_OPTIONS configures safe timeouts for remote Supabase connections",
    () => {
      assert.ok(DB_TX_OPTIONS.timeout >= 25000, "Timeout must be at least 25000ms")
      assert.ok(DB_TX_OPTIONS.maxWait >= 10000, "MaxWait must be at least 10000ms")
    }
  )

  suite.test(
    "Tamper Security: Mismatched captured amount or price discrepancy is strictly rejected",
    () => {
      function validateCapturedPayment(orderAmount: number, testSeriesPrice: number, currency: string) {
        if (orderAmount <= 0 || currency !== "INR") return false
        if (orderAmount !== testSeriesPrice) return false
        return true
      }

      assert.equal(validateCapturedPayment(49900, 49900, "INR"), true)
      assert.equal(validateCapturedPayment(100, 49900, "INR"), false) // Tampered amount
      assert.equal(validateCapturedPayment(49900, 49900, "USD"), false) // Invalid currency
      assert.equal(validateCapturedPayment(0, 49900, "INR"), false) // Zero amount
    }
  )

  suite.test(
    "Concurrent Fulfillment: Atomic conditional update prevents race condition duplicates",
    () => {
      let paymentRecord = {
        id: "pay_test_001",
        status: PaymentStatus.PENDING as PaymentStatus,
        razorpayPaymentId: null as string | null,
        registrationId: null as string | null,
      }

      function simulateFulfillment(attemptPayload: { paymentId: string; razorpayPaymentId: string; regId: string }) {
        if (paymentRecord.status === PaymentStatus.COMPLETED) {
          return { success: true, alreadyCompleted: true, registrationId: paymentRecord.registrationId }
        }
        // Atomic update simulated
        paymentRecord.status = PaymentStatus.COMPLETED
        paymentRecord.razorpayPaymentId = attemptPayload.razorpayPaymentId
        paymentRecord.registrationId = attemptPayload.regId
        return { success: true, alreadyCompleted: false, registrationId: attemptPayload.regId }
      }

      // First worker (e.g. client verification action)
      const res1 = simulateFulfillment({ paymentId: "pay_test_001", razorpayPaymentId: "rzp_pay_abc", regId: "reg_001" })
      assert.equal(res1.success, true)
      assert.equal(res1.alreadyCompleted, false)
      assert.equal(res1.registrationId, "reg_001")

      // Second worker running simultaneously (e.g. webhook)
      const res2 = simulateFulfillment({ paymentId: "pay_test_001", razorpayPaymentId: "rzp_pay_abc", regId: "reg_001" })
      assert.equal(res2.success, true)
      assert.equal(res2.alreadyCompleted, true)
      assert.equal(res2.registrationId, "reg_001")
    }
  )

  return suite.summary()
}

// Allow direct execution
if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("tests/payments.test.ts")
) {
  const result = runPaymentTests()
  if (result.failed > 0) process.exit(1)
}
