"use server"

import { requireAdmin, resolvePersistedAdminActor } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { PaymentStatus, RegistrationStatus, RefundReason } from "@prisma/client"
import { revalidatePath } from "next/cache"
import Razorpay from "razorpay"
import { ActionResult } from "./auth-actions"

export interface AdminPaymentRow {
  id: string
  userId: string
  candidateName: string
  candidateEmail: string
  testSeriesId: string
  testSeriesTitle: string
  razorpayOrderId: string
  razorpayPaymentId: string | null
  amount: number // in paise
  amountInRupees: number
  amountRefunded: number // in paise
  amountRefundedInRupees: number
  currency: string
  status: PaymentStatus
  paymentMethod: string | null
  bankReference: string | null
  createdAt: string
  within7Days: boolean
  daysElapsed: number
  attemptsUsed: number
  maxAttempts: number
  hasSubmissions: boolean
  refundDetails?: {
    refundId: string
    reason: string
    adminName: string
    refundedAt: string
    adminNotes: string
  } | null
}

export interface PaymentLedgerItem {
  id: string
  eventType: string
  actorType: string
  actorName: string
  details: string
  rawPayload: string | null
  createdAt: string
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Server Action: Retrieve all student payments for Admin Panel
 */
export async function getAdminPaymentsAction(): Promise<ActionResult<{ payments: AdminPaymentRow[] }>> {
  try {
    await requireAdmin("/admin/payments")
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected) {
      // Dev mode mock payments
      const now = Date.now()
      const mockPayments: AdminPaymentRow[] = [
        {
          id: "pay_mock_1",
          userId: "usr_mock_1",
          candidateName: "Aarav Sharma",
          candidateEmail: "aarav@example.com",
          testSeriesId: "ts_1",
          testSeriesTitle: "UPSC GS Paper I Full Mock (Mains 2026)",
          razorpayOrderId: "order_mock_001",
          razorpayPaymentId: "pay_mock_123456",
          amount: 49900,
          amountInRupees: 499,
          amountRefunded: 0,
          amountRefundedInRupees: 0,
          currency: "INR",
          status: PaymentStatus.COMPLETED,
          paymentMethod: "upi",
          bankReference: "UPI-42890129384",
          createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
          within7Days: true,
          daysElapsed: 2,
          attemptsUsed: 1,
          maxAttempts: 3,
          hasSubmissions: true,
        },
        {
          id: "pay_mock_2",
          userId: "usr_mock_2",
          candidateName: "Priya Patel",
          candidateEmail: "priya@example.com",
          testSeriesId: "ts_2",
          testSeriesTitle: "UPSC GS Paper II Ethics & Governance Mock",
          razorpayOrderId: "order_mock_002",
          razorpayPaymentId: "pay_mock_654321",
          amount: 99900,
          amountInRupees: 999,
          amountRefunded: 0,
          amountRefundedInRupees: 0,
          currency: "INR",
          status: PaymentStatus.COMPLETED,
          paymentMethod: "card",
          bankReference: "HDFC-TXN-90218",
          createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
          within7Days: true,
          daysElapsed: 5,
          attemptsUsed: 0,
          maxAttempts: 3,
          hasSubmissions: false,
        },
        {
          id: "pay_mock_3",
          userId: "usr_mock_3",
          candidateName: "Rohan Verma",
          candidateEmail: "rohan@example.com",
          testSeriesId: "ts_1",
          testSeriesTitle: "UPSC GS Paper I Full Mock (Mains 2026)",
          razorpayOrderId: "order_mock_003",
          razorpayPaymentId: "pay_mock_778899",
          amount: 49900,
          amountInRupees: 499,
          amountRefunded: 49900,
          amountRefundedInRupees: 499,
          currency: "INR",
          status: PaymentStatus.REFUNDED,
          paymentMethod: "netbanking",
          bankReference: "SBIN-REF-1123",
          createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000).toISOString(),
          within7Days: false,
          daysElapsed: 12,
          attemptsUsed: 0,
          maxAttempts: 0,
          hasSubmissions: false,
          refundDetails: {
            refundId: "rfnd_mock_001",
            reason: "STUDENT_REQUEST_7DAY_WINDOW",
            adminName: "Administrator",
            refundedAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
            adminNotes: "Student requested cancellation within return policy.",
          },
        },
        {
          id: "pay_mock_4",
          userId: "usr_mock_4",
          candidateName: "Neha Gupta",
          candidateEmail: "neha@example.com",
          testSeriesId: "ts_3",
          testSeriesTitle: "UPSC Essay Masterclass & Evaluation Series",
          razorpayOrderId: "order_mock_004",
          razorpayPaymentId: null,
          amount: 49900,
          amountInRupees: 499,
          amountRefunded: 0,
          amountRefundedInRupees: 0,
          currency: "INR",
          status: PaymentStatus.PENDING,
          paymentMethod: null,
          bankReference: null,
          createdAt: new Date(now - 25 * 60 * 1000).toISOString(),
          within7Days: true,
          daysElapsed: 0,
          attemptsUsed: 0,
          maxAttempts: 3,
          hasSubmissions: false,
        },
      ]
      return { success: true, data: { payments: mockPayments } }
    }

    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        userId: true,
        testSeriesId: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        amount: true,
        amountRefunded: true,
        currency: true,
        status: true,
        paymentMethod: true,
        bankReference: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        registration: {
          select: {
            attemptsUsed: true,
            maxAttempts: true,
            testSeries: {
              select: {
                title: true,
              },
            },
            _count: {
              select: { submissions: true },
            },
          },
        },
        refunds: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            razorpayRefundId: true,
            reason: true,
            adminNotes: true,
            createdAt: true,
            admin: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    const now = Date.now()

    const rows: AdminPaymentRow[] = payments.map((p) => {
      const createdTime = p.createdAt.getTime()
      const diffMs = now - createdTime
      const within7Days = diffMs <= SEVEN_DAYS_MS
      const daysElapsed = Math.floor(diffMs / (24 * 60 * 60 * 1000))
      const latestRefund = p.refunds[0]

      return {
        id: p.id,
        userId: p.userId,
        candidateName: p.user?.name || "Candidate",
        candidateEmail: p.user?.email || "candidate@example.com",
        testSeriesId: p.testSeriesId,
        testSeriesTitle: p.registration?.testSeries?.title || "Test Series",
        razorpayOrderId: p.razorpayOrderId,
        razorpayPaymentId: p.razorpayPaymentId,
        amount: p.amount,
        amountInRupees: p.amount / 100,
        amountRefunded: p.amountRefunded,
        amountRefundedInRupees: p.amountRefunded / 100,
        currency: p.currency,
        status: p.status,
        paymentMethod: p.paymentMethod,
        bankReference: p.bankReference,
        createdAt: p.createdAt.toISOString(),
        within7Days,
        daysElapsed,
        attemptsUsed: p.registration?.attemptsUsed ?? 0,
        maxAttempts: p.registration?.maxAttempts ?? 3,
        hasSubmissions: (p.registration?._count?.submissions ?? 0) > 0,
        refundDetails: latestRefund
          ? {
              refundId: latestRefund.razorpayRefundId,
              reason: latestRefund.reason,
              adminName: latestRefund.admin?.name || "Administrator",
              refundedAt: latestRefund.createdAt.toISOString(),
              adminNotes: latestRefund.adminNotes,
            }
          : null,
      }
    })

    return { success: true, data: { payments: rows } }
  } catch (error: any) {
    console.error("[getAdminPaymentsAction] Error:", error)
    return {
      success: false,
      error: error.message || "Failed to retrieve student payments.",
    }
  }
}

/**
 * Server Action: Admin-Triggered 7-Day Refund Engine
 */
export async function adminTriggerRefundAction(params: {
  paymentId: string
  reason: RefundReason
  adminNotes: string
  confirmEvaluationForfeiture?: boolean
  override7DayPolicy?: boolean
}): Promise<ActionResult<{ refundId: string; amountRefunded: number }>> {
  try {
    const sessionAdmin = await requireAdmin("/admin/payments")
    const dbConnected = await isDatabaseConnected()

    if (!params.paymentId) {
      return { success: false, error: "Payment ID is required." }
    }
    if (!params.adminNotes?.trim()) {
      return { success: false, error: "Please provide detailed administrative notes for the refund audit trail." }
    }

    if (!dbConnected) {
      // Dev mode mock success
      return {
        success: true,
        message: "Refund processed successfully (Development Mock). Access revoked.",
        data: {
          refundId: "rfnd_dev_" + Date.now(),
          amountRefunded: 49900,
        },
      }
    }

    const actor = await resolvePersistedAdminActor(sessionAdmin)
    if (!actor.success) return { success: false, error: actor.error }
    const admin = actor.user

    // 1. Fetch Payment with existing relations
    const payment = await prisma.payment.findUnique({
      where: { id: params.paymentId },
      include: {
        user: true,
        registration: {
          include: {
            submissions: true,
            testSeries: true,
          },
        },
        refunds: true,
      },
    })

    if (!payment) {
      return { success: false, error: "Payment record not found." }
    }

    // Idempotency: Check if already refunded
    if (payment.status === PaymentStatus.REFUNDED) {
      return { success: false, error: "This payment has already been 100% refunded." }
    }

    const razorpayConfigured = Boolean(
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_ID !== "rzp_test_placeholder" &&
      process.env.RAZORPAY_KEY_SECRET !== "placeholder_secret"
    )
    let recoveredRefundId: string | null = null

    // A process can die after Razorpay accepts the refund but before the DB
    // transaction commits. Reconcile that state before allowing another refund.
    if (payment.status === PaymentStatus.REFUND_PENDING) {
      if (!razorpayConfigured || !payment.razorpayPaymentId) {
        return { success: false, error: "Refund is still being reconciled. Please retry after Razorpay credentials are available." }
      }
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID!,
          key_secret: process.env.RAZORPAY_KEY_SECRET!,
        })
        const refundsResponse = await razorpay.payments.fetchMultipleRefund(payment.razorpayPaymentId)
        const matchingRefund = refundsResponse.items?.find(
          (refund: any) => refund.amount === payment.amount && refund.status === "processed"
        )
        if (matchingRefund?.id) {
          recoveredRefundId = matchingRefund.id
          await prisma.payment.updateMany({
            where: { id: payment.id, status: PaymentStatus.REFUND_PENDING },
            data: { status: PaymentStatus.COMPLETED },
          })
          payment.status = PaymentStatus.COMPLETED
        } else {
          await prisma.payment.updateMany({
            where: { id: payment.id, status: PaymentStatus.REFUND_PENDING },
            data: { status: PaymentStatus.COMPLETED },
          })
          payment.status = PaymentStatus.COMPLETED
        }
      } catch (reconcileError) {
        console.error("[adminTriggerRefundAction] Failed to reconcile pending refund:", reconcileError)
        return { success: false, error: "Could not verify the pending refund with Razorpay. Please retry shortly." }
      }
    }

    if (payment.status !== PaymentStatus.COMPLETED && !recoveredRefundId) {
      return {
        success: false,
        error: `Cannot refund payment in '${payment.status}' status. Only COMPLETED payments can be refunded.`,
      }
    }

    const existingRefund = payment.refunds.find((refund) => refund.status === "PROCESSED")
    if (existingRefund) {
      return { success: false, error: "A refund has already been recorded for this payment." }
    }

    // 2. 7-Day Return Policy Check
    const diffMs = Date.now() - payment.createdAt.getTime()
    const isWithin7Days = diffMs <= SEVEN_DAYS_MS

    if (!isWithin7Days && !params.override7DayPolicy) {
      const daysElapsed = Math.floor(diffMs / (24 * 60 * 60 * 1000))
      return {
        success: false,
        error: `7-Day Return Policy Expired: Payment was captured ${daysElapsed} days ago (allowed maximum: 7 days). Check 'Superadmin 7-Day Override' to bypass.`,
      }
    }

    // 3. Evaluation Attempt Consumption Check
    const attemptsUsed = payment.registration?.attemptsUsed ?? 0
    if (attemptsUsed > 0 && !params.confirmEvaluationForfeiture) {
      return {
        success: false,
        error: `Candidate has already used ${attemptsUsed} evaluation attempt(s). Please check 'Acknowledge evaluation costs forfeited' to confirm access revocation.`,
      }
    }

    // 4. Trigger Razorpay Refund API
    const idempotencyKey = `idemp_ref_${payment.id}`
    const claim = await prisma.payment.updateMany({
      where: { id: payment.id, status: PaymentStatus.COMPLETED },
      data: { status: PaymentStatus.REFUND_PENDING },
    })
    if (claim.count !== 1) {
      return { success: false, error: "This payment is already being refunded or has changed state. Refresh and try again." }
    }

    let razorpayRefundId = recoveredRefundId || `rfnd_${Date.now()}`

    if (!recoveredRefundId && razorpayConfigured && payment.razorpayPaymentId) {
      try {
        const razorpay = new Razorpay({
          key_id: process.env.RAZORPAY_KEY_ID,
          key_secret: process.env.RAZORPAY_KEY_SECRET,
        })

        const rzpRefund: any = await razorpay.payments.refund(payment.razorpayPaymentId, {
          amount: payment.amount,
          speed: "normal",
          notes: {
            adminId: admin.id,
            reason: params.reason,
            policy: isWithin7Days ? "7_DAY_RETURN_WINDOW" : "SUPERADMIN_OVERRIDE",
          },
          receipt: `refund_${payment.id}`,
        })
        razorpayRefundId = rzpRefund.id
      } catch (rzpErr: any) {
        console.error("[adminTriggerRefundAction] Razorpay API Error:", rzpErr)
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: PaymentStatus.COMPLETED },
        }).catch((resetError) => console.error("[adminTriggerRefundAction] Failed to reset refund claim:", resetError))
        return {
          success: false,
          error: `Razorpay Gateway Error: ${rzpErr.error?.description || rzpErr.message || "Failed to process refund with bank."}`,
        }
      }
    } else if (!recoveredRefundId && process.env.NODE_ENV === "production") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.COMPLETED } })
      return { success: false, error: "Razorpay refund configuration is missing. No refund was submitted." }
    }

    // 5. Atomic Transaction: Update payment, revoke registration, log audit & ledger
    await prisma.$transaction(async (tx) => {
      // A. Update Payment status to REFUNDED
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.REFUNDED,
          amountRefunded: payment.amount,
        },
      })

      // B. Revoke Registration & Attempts
      if (payment.registrationId) {
        await tx.testRegistration.update({
          where: { id: payment.registrationId },
          data: {
            status: RegistrationStatus.CANCELLED,
            maxAttempts: 0, // Immediately locks upload portal
          },
        })
      }

      // C. Insert PaymentRefund Record
      await tx.paymentRefund.create({
        data: {
          paymentId: payment.id,
          razorpayRefundId,
          adminId: admin.id,
          amount: payment.amount,
          currency: payment.currency,
          reason: params.reason,
          adminNotes: params.adminNotes,
          status: "PROCESSED",
          revokedRegistration: true,
          idempotencyKey,
        },
      })

      // D. Insert PaymentLedger Record
      await tx.paymentLedger.create({
        data: {
          paymentId: payment.id,
          eventType: "REFUND_EXECUTED",
          actorType: "ADMIN_USER",
          actorId: admin.id,
          details: `Admin ${admin.name || "Administrator"} approved 100% refund (₹${payment.amount / 100}) via Razorpay. Reason: ${params.reason}. Notes: ${params.adminNotes}`,
          rawPayload: JSON.stringify({
            refundId: razorpayRefundId,
            amountPaise: payment.amount,
            isWithin7Days,
            attemptsUsed,
          }),
        },
      })

      // E. Add to global AuditLog
      await tx.auditLog.create({
        data: {
          adminId: admin.id,
          action: "PAYMENT_REFUND_PROCESSED",
          targetType: "Payment",
          targetId: payment.id,
          details: `Refunded ₹${payment.amount / 100} for candidate ${payment.user?.email || payment.userId}. Razorpay Refund ID: ${razorpayRefundId}`,
        },
      })
    })

    // 6. Invalidate caches
    revalidatePath("/admin/payments")
    revalidatePath("/admin")
    revalidatePath("/student/dashboard")
    if (payment.testSeriesId) {
      revalidatePath(`/student/tests/${payment.testSeriesId}`)
      revalidatePath(`/tests/${payment.testSeriesId}`)
    }

    return {
      success: true,
      message: `Refund of ₹${payment.amount / 100} successfully processed via Razorpay. Student test enrollment has been cancelled.`,
      data: {
        refundId: razorpayRefundId,
        amountRefunded: payment.amount,
      },
    }
  } catch (error: any) {
    console.error("[adminTriggerRefundAction] Error:", error)
    return {
      success: false,
      error: error.message || "Failed to process refund.",
    }
  }
}

/**
 * Server Action: Fetch Chronological Transaction Ledger for a Payment
 */
export async function getPaymentLedgerAction(paymentId: string): Promise<
  ActionResult<{ logs: PaymentLedgerItem[] }>
> {
  try {
    await requireAdmin("/admin/payments")
    const dbConnected = await isDatabaseConnected()

    if (!dbConnected) {
      return {
        success: true,
        data: {
          logs: [
            {
              id: "log_1",
              eventType: "ORDER_CREATED",
              actorType: "SYSTEM",
              actorName: "Verityra Core",
              details: "Razorpay order created for candidate checkout.",
              rawPayload: JSON.stringify({ amount: 49900, currency: "INR" }),
              createdAt: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: "log_2",
              eventType: "PAYMENT_CAPTURED",
              actorType: "GATEWAY_WEBHOOK",
              actorName: "Razorpay Gateway",
              details: "Payment captured successfully via UPI intent.",
              rawPayload: JSON.stringify({ status: "captured", method: "upi" }),
              createdAt: new Date(Date.now() - 3500000).toISOString(),
            },
          ],
        },
      }
    }

    const logs = await prisma.paymentLedger.findMany({
      where: { paymentId },
      orderBy: { createdAt: "desc" },
    })

    const formatted: PaymentLedgerItem[] = logs.map((l) => ({
      id: l.id,
      eventType: l.eventType,
      actorType: l.actorType,
      actorName: l.actorType === "ADMIN_USER" ? "Platform Admin" : l.actorType,
      details: l.details,
      rawPayload: l.rawPayload,
      createdAt: l.createdAt.toISOString(),
    }))

    return { success: true, data: { logs: formatted } }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to load payment transaction ledger.",
    }
  }
}

/**
 * Server Action: Reconcile Stale or In-Flight Razorpay Orders
 */
export async function reconcilePendingPaymentsAction(): Promise<
  ActionResult<{ reconciledCount: number; message: string }>
> {
  try {
    await requireAdmin("/admin/payments")
    const dbConnected = await isDatabaseConnected()
    if (!dbConnected) {
      return {
        success: true,
        data: { reconciledCount: 0, message: "DB offline dev mode: No stale orders reconciled." },
      }
    }

    // Find payments stuck in PENDING older than 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000)
    const pendingPayments = await prisma.payment.findMany({
      where: {
        status: PaymentStatus.PENDING,
        createdAt: { lte: tenMinutesAgo },
      },
      include: {
        user: true,
      },
    })

    if (pendingPayments.length === 0) {
      return {
        success: true,
        data: { reconciledCount: 0, message: "All transactions are fully synchronized." },
      }
    }

    let reconciledCount = 0

    if (
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_ID !== "rzp_test_placeholder"
    ) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })

      for (const p of pendingPayments) {
        try {
          const paymentsForOrder: any = await razorpay.orders.fetchPayments(p.razorpayOrderId)
          const capturedPayment = paymentsForOrder.items?.find((item: any) => item.status === "captured")

          if (capturedPayment) {
            await prisma.$transaction(async (tx) => {
              await tx.payment.update({
                where: { id: p.id },
                data: {
                  status: PaymentStatus.COMPLETED,
                  razorpayPaymentId: capturedPayment.id,
                  paymentMethod: capturedPayment.method,
                  bankReference: capturedPayment.acquirer_data?.rrn || capturedPayment.acquirer_data?.bank_transaction_id,
                },
              })

              await tx.testRegistration.upsert({
                where: {
                  userId_testSeriesId: {
                    userId: p.userId,
                    testSeriesId: p.testSeriesId,
                  },
                },
                create: {
                  userId: p.userId,
                  testSeriesId: p.testSeriesId,
                  status: RegistrationStatus.ACTIVE,
                  attemptsUsed: 0,
                  maxAttempts: 3,
                },
                update: {
                  status: RegistrationStatus.ACTIVE,
                },
              })

              await tx.paymentLedger.create({
                data: {
                  paymentId: p.id,
                  eventType: "AUTO_RECONCILED",
                  actorType: "SYSTEM",
                  details: `Automated reconciler detected captured payment ${capturedPayment.id} on Razorpay. Fulfilled candidate enrollment.`,
                  rawPayload: JSON.stringify(capturedPayment),
                },
              })
            })
            reconciledCount++
          } else {
            // Check if order is expired or older than 1 hour without payment
            const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
            if (p.createdAt <= oneHourAgo) {
              await prisma.payment.update({
                where: { id: p.id },
                data: {
                  status: PaymentStatus.FAILED,
                  failureReason: "Checkout abandoned / expired after 60 minutes without gateway capture.",
                },
              })
            }
          }
        } catch (fetchErr) {
          console.warn(`[reconcilePendingPaymentsAction] Failed to check order ${p.razorpayOrderId}:`, fetchErr)
        }
      }
    }

    revalidatePath("/admin/payments")

    return {
      success: true,
      data: {
        reconciledCount,
        message: `Reconciliation complete: Synced ${reconciledCount} transactions.`,
      },
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to reconcile payments.",
    }
  }
}
