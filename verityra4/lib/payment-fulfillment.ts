import { prisma, DB_TX_OPTIONS } from "@/lib/prisma"
import { PaymentStatus, RegistrationStatus } from "@prisma/client"
import { sendEnrollmentReceiptEmail } from "@/lib/email"
import { revalidatePath } from "next/cache"
import { invalidateAdminAnalyticsCache } from "@/lib/cache"

export interface FulfillCapturedPaymentParams {
  paymentId: string
  userId: string
  testSeriesId?: string
  testId?: string | null
  razorpayPaymentId: string
  razorpaySignature?: string | null
  paymentMethod?: string | null
  bankReference?: string | null
  actorType: "STUDENT_CLIENT" | "GATEWAY_WEBHOOK" | "ADMIN_USER" | "SYSTEM"
  actorId?: string | null
  rawPayload?: any
  customDetails?: string
  details?: string
}

export interface FulfillPaymentResult {
  success: boolean
  alreadyCompleted?: boolean
  registrationId?: string
  error?: string
}

/**
 * Atomically and idempotently fulfills a captured payment:
 * 1. Executes inside an interactive Prisma transaction with DB_TX_OPTIONS (25s timeout).
 * 2. Upserts TestRegistration with active access and fresh attempts.
 * 3. Unlinks any prior refunded/cancelled payments linked to this registrationId to prevent @unique collision.
 * 4. Conditionally updates the Payment to COMPLETED only if not already COMPLETED (race condition proof).
 * 5. Writes an immutable audit record to PaymentLedger.
 * 6. Dispatches enrollment receipt email and path revalidation post-commit.
 */
export async function fulfillCapturedPayment(
  params: FulfillCapturedPaymentParams
): Promise<FulfillPaymentResult> {
  try {
    const txResult = await prisma.$transaction(async (tx) => {
      let itemTitle = "Test Series"
      let maxAttempts = 3
      let amountPaise = 0
      let registration: any = null

      if (params.testId) {
        // Individual subject test purchase
        const test = await tx.test.findUnique({
          where: { id: params.testId },
          select: {
            id: true,
            title: true,
            maxAttempts: true,
            price: true,
            testSeriesId: true,
          },
        })

        itemTitle = test?.title ?? "Subject Test"
        maxAttempts = test?.maxAttempts ?? 3
        amountPaise = test?.price ?? 0

        registration = await tx.testRegistration.upsert({
          where: {
            userId_testId: {
              userId: params.userId,
              testId: params.testId,
            },
          },
          create: {
            userId: params.userId,
            testId: params.testId,
            testSeriesId: test?.testSeriesId,
            status: RegistrationStatus.ACTIVE,
            attemptsUsed: 0,
            maxAttempts,
          },
          update: {
            status: RegistrationStatus.ACTIVE,
            attemptsUsed: 0,
            maxAttempts,
          },
        })
      } else {
        // Complete series bundle purchase
        const testSeries = await tx.testSeries.findUnique({
          where: { id: params.testSeriesId || "" },
          select: {
            id: true,
            title: true,
            maxAttempts: true,
            price: true,
            bundlePrice: true,
          },
        })

        itemTitle = testSeries?.title ?? "Test Series Bundle"
        maxAttempts = testSeries?.maxAttempts ?? 3
        amountPaise = testSeries?.bundlePrice || testSeries?.price || 0

        registration = await tx.testRegistration.upsert({
          where: {
            userId_testSeriesId: {
              userId: params.userId,
              testSeriesId: params.testSeriesId || "",
            },
          },
          create: {
            userId: params.userId,
            testSeriesId: params.testSeriesId,
            status: RegistrationStatus.ACTIVE,
            attemptsUsed: 0,
            maxAttempts,
          },
          update: {
            status: RegistrationStatus.ACTIVE,
            attemptsUsed: 0,
            maxAttempts,
          },
        })
      }

      // 3. Unlink any previous refunded/cancelled payments from this registrationId to prevent @unique constraint violation
      await tx.payment.updateMany({
        where: {
          registrationId: registration.id,
          id: { not: params.paymentId },
        },
        data: { registrationId: null },
      })

      // 4. Atomic conditional update: only update if status is not already COMPLETED
      // This eliminates race condition crashes between concurrent webhook and client verification
      const updateResult = await tx.payment.updateMany({
        where: {
          id: params.paymentId,
          status: { not: PaymentStatus.COMPLETED },
        },
        data: {
          status: PaymentStatus.COMPLETED,
          razorpayPaymentId: params.razorpayPaymentId,
          razorpaySignature: params.razorpaySignature ?? undefined,
          registrationId: registration.id,
          testId: params.testId ?? undefined,
          paymentMethod: params.paymentMethod ?? undefined,
          bankReference: params.bankReference ?? undefined,
          verificationMetadata: JSON.stringify({
            verifiedAt: new Date().toISOString(),
            actorType: params.actorType,
            actorId: params.actorId || params.userId,
          }),
        },
      })

      const currentPayment = await tx.payment.findUnique({
        where: { id: params.paymentId },
        select: {
          amount: true,
          currency: true,
          razorpayOrderId: true,
          status: true,
          registrationId: true,
        },
      })

      // If updateResult.count === 0, another concurrent process (e.g. Webhook or Client) already marked it COMPLETED
      if (updateResult.count === 0) {
        if (currentPayment?.status === PaymentStatus.COMPLETED) {
          return {
            alreadyCompleted: true,
            registrationId: currentPayment.registrationId || registration.id,
            testTitle: itemTitle,
            amountPaise: currentPayment.amount,
            maxAttempts,
            orderId: currentPayment.razorpayOrderId,
          }
        }
        throw new Error("Failed to transition payment status to COMPLETED.")
      }

      amountPaise = currentPayment?.amount ?? 0
      const orderId = currentPayment?.razorpayOrderId ?? ""

      // 5. Record immutable audit ledger entry
      await tx.paymentLedger.create({
        data: {
          paymentId: params.paymentId,
          eventType:
            params.actorType === "GATEWAY_WEBHOOK"
              ? "WEBHOOK_PAYMENT_CAPTURED"
              : "PAYMENT_CAPTURED",
          actorType: params.actorType,
          actorId: params.actorId || params.userId,
          details:
            params.customDetails ||
            params.details ||
            `Verified payment ${params.razorpayPaymentId} of ₹${amountPaise / 100} via ${params.paymentMethod || "Razorpay Checkout"}. Candidate access unlocked for ${itemTitle}.`,
          rawPayload: params.rawPayload
            ? typeof params.rawPayload === "string"
              ? params.rawPayload
              : JSON.stringify(params.rawPayload)
            : null,
        },
      })

      return {
        alreadyCompleted: false,
        registrationId: registration.id,
        testTitle: itemTitle,
        amountPaise,
        maxAttempts,
        orderId,
      }
    }, DB_TX_OPTIONS)

    // 6. Post-transaction side-effects (Email & Path revalidations)
    // Runs after transaction commits so database locks are released immediately
    try {
      const user = await prisma.user.findUnique({
        where: { id: params.userId },
        select: { email: true, name: true },
      })

      if (user?.email) {
        sendEnrollmentReceiptEmail({
          to: user.email,
          name: user.name,
          testSeriesId: params.testSeriesId || params.testId || "",
          testTitle: txResult.testTitle,
          amountPaise: txResult.amountPaise,
          maxAttempts: txResult.maxAttempts,
          orderId: txResult.orderId,
        }).catch((emailErr) =>
          console.error(
            "[fulfillCapturedPayment] Failed to send enrollment receipt email:",
            emailErr
          )
        )
      }
    } catch (postCommitErr) {
      console.warn(
        "[fulfillCapturedPayment] Post-commit email hook warning:",
        postCommitErr
      )
    }

    try {
      invalidateAdminAnalyticsCache()
      if (params.testSeriesId) {
        revalidatePath(`/tests/${params.testSeriesId}`)
      }
      if (params.testId) {
        revalidatePath(`/tests/${params.testId}`)
        revalidatePath(`/student/tests/${params.testId}`)
      }
      revalidatePath("/student/dashboard")
      revalidatePath("/student/tests")
      revalidatePath("/admin/payments")
    } catch (revalidateErr) {
      // Revalidation warning during non-request contexts
      console.warn(
        "[fulfillCapturedPayment] Path revalidation warning:",
        revalidateErr
      )
    }

    return {
      success: true,
      alreadyCompleted: txResult.alreadyCompleted,
      registrationId: txResult.registrationId,
    }
  } catch (error: any) {
    console.error("[fulfillCapturedPayment] Transaction error:", error)
    return {
      success: false,
      error:
        error?.message ||
        "Payment fulfillment transaction failed. Please retry verification.",
    }
  }
}
