"use server"

import {
  getCurrentUser,
  getPersistedCurrentUser,
  PersistedUserLookupError,
} from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { sendEnrollmentReceiptEmail } from "@/lib/email"
import { PaymentStatus, RegistrationStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import Razorpay from "razorpay"
import { ActionResult } from "./auth-actions"

/**
 * Server Action: Register for Free Test Series
 */
export async function registerFreeTestAction(
  testSeriesId: string
): Promise<ActionResult<{ registrationId: string }>> {
  let user
  try {
    user = await getPersistedCurrentUser()
  } catch (err) {
    if (err instanceof PersistedUserLookupError) {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    throw err
  }

  if (!user) {
    return {
      success: false,
      error:
        "Please sign in to register for this test series. If you were already signed in, your session may have expired.",
    }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    return {
      success: true,
      message: "Successfully registered for test series (Dev Mode).",
      data: { registrationId: "dev-reg-" + Date.now() },
    }
  }

  const testSeries = await prisma.testSeries.findUnique({
    where: { id: testSeriesId },
    select: {
      id: true,
      title: true,
      price: true,
      isPublished: true,
      maxAttempts: true,
    },
  })

  if (!testSeries || !testSeries.isPublished) {
    return {
      success: false,
      error: "This test series is not currently available for registration.",
    }
  }

  if (testSeries.price > 0) {
    return {
      success: false,
      error: "This is a paid test series. Payment is required to register.",
    }
  }

  // Check if already registered
  const existing = await prisma.testRegistration.findUnique({
    where: {
      userId_testSeriesId: {
        userId: user.id,
        testSeriesId,
      },
    },
  })

  if (existing && existing.status !== RegistrationStatus.CANCELLED) {
    return {
      success: false,
      error: "You are already registered for this test series.",
    }
  }

  let registration
  try {
    registration = await prisma.testRegistration.upsert({
      where: {
        userId_testSeriesId: {
          userId: user.id,
          testSeriesId,
        },
      },
      create: {
        userId: user.id,
        testSeriesId,
        status: RegistrationStatus.ACTIVE,
        attemptsUsed: 0,
        maxAttempts: testSeries.maxAttempts,
      },
      update: {
        status: RegistrationStatus.ACTIVE,
        attemptsUsed: 0,
        maxAttempts: testSeries.maxAttempts,
      },
    })
  } catch (createErr: any) {
    if (createErr?.code === "P2002") {
      return {
        success: false,
        error: "You are already registered for this test series.",
      }
    }
    if (createErr?.code === "P2003") {
      return {
        success: false,
        error:
          "User account session could not be verified in the database. Please sign out and sign in again.",
      }
    }
    throw createErr
  }

  if (user.email) {
    await sendEnrollmentReceiptEmail({
      to: user.email,
      name: user.name,
      testSeriesId,
      testTitle: testSeries.title,
      amountPaise: 0,
      maxAttempts: testSeries.maxAttempts,
    }).catch((err) =>
      console.error(
        "[Registration] Failed to send free enrollment receipt:",
        err
      )
    )
  }

  revalidatePath(`/tests/${testSeriesId}`)
  revalidatePath("/student/dashboard")

  return {
    success: true,
    message:
      "Registration successful! You may now access the instructions and answer sheet template.",
    data: { registrationId: registration.id },
  }
}

/**
 * Server Action: Create Razorpay Order for Paid Test Series
 */
export async function createRazorpayOrderAction(testSeriesId: string): Promise<
  ActionResult<{
    orderId: string
    amount: number
    currency: string
    keyId: string
    testTitle: string
    userName?: string
    userEmail?: string
    alreadyCompleted?: boolean
  }>
> {
  let user
  try {
    user = await getPersistedCurrentUser()
  } catch (err) {
    if (err instanceof PersistedUserLookupError) {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    throw err
  }

  if (!user) {
    return {
      success: false,
      error:
        "Please sign in to purchase this test series. If you were already signed in, your session may have expired.",
    }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    return {
      success: true,
      data: {
        orderId: "order_dev_mock_" + Date.now(),
        amount: 49900,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
        testTitle: "Test Series (Dev Mock)",
        userName: user.name || "",
        userEmail: user.email || "",
      },
    }
  }

  const testSeries = await prisma.testSeries.findUnique({
    where: { id: testSeriesId },
    select: {
      id: true,
      title: true,
      price: true,
      isPublished: true,
      maxAttempts: true,
    },
  })

  if (!testSeries || !testSeries.isPublished) {
    return { success: false, error: "This test series is not available." }
  }

  if (testSeries.price <= 0) {
    return {
      success: false,
      error: "This test is free. Please use the free registration option.",
    }
  }

  // Verify not already registered
  const existingReg = await prisma.testRegistration.findUnique({
    where: {
      userId_testSeriesId: {
        userId: user.id,
        testSeriesId,
      },
    },
  })

  if (existingReg && existingReg.status !== RegistrationStatus.CANCELLED) {
    return {
      success: false,
      error: "You already own access to this test series.",
    }
  }

  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  const razorpayConfigured = Boolean(
    key_id &&
    key_secret &&
    key_id !== "rzp_test_placeholder" &&
    key_secret !== "placeholder_secret"
  )
  if (process.env.NODE_ENV === "production" && !razorpayConfigured) {
    return {
      success: false,
      error:
        "Razorpay is not configured. Payment checkout is temporarily unavailable.",
    }
  }

  // Reuse a recent pending order matching the current price when a student
  // double-clicks or refreshes checkout.
  const recentPending = await prisma.payment.findFirst({
    where: {
      userId: user.id,
      testSeriesId: testSeries.id,
      amount: testSeries.price,
      status: PaymentStatus.PENDING,
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
  })

  if (recentPending) {
    // Check if the pending order was already captured on Razorpay (e.g. mobile UPI payment)
    if (razorpayConfigured) {
      try {
        const razorpay = new Razorpay({ key_id, key_secret })
        const rzpPayments: any = await razorpay.orders.fetchPayments(
          recentPending.razorpayOrderId
        )
        const capturedPayment = rzpPayments.items?.find(
          (item: any) => item.status === "captured"
        )

        if (capturedPayment) {
          const paymentMethod = capturedPayment.method || null
          const bankReference =
            capturedPayment.acquirer_data?.rrn ||
            capturedPayment.acquirer_data?.bank_transaction_id ||
            null

          await prisma.$transaction(async (tx) => {
            const registration = await tx.testRegistration.upsert({
              where: {
                userId_testSeriesId: {
                  userId: user.id,
                  testSeriesId: testSeries.id,
                },
              },
              create: {
                userId: user.id,
                testSeriesId: testSeries.id,
                status: RegistrationStatus.ACTIVE,
                attemptsUsed: 0,
                maxAttempts: testSeries.maxAttempts,
              },
              update: {
                status: RegistrationStatus.ACTIVE,
                attemptsUsed: 0,
                maxAttempts: testSeries.maxAttempts,
              },
            })

            await tx.payment.updateMany({
              where: {
                registrationId: registration.id,
                id: { not: recentPending.id },
              },
              data: { registrationId: null },
            })

            await tx.payment.update({
              where: { id: recentPending.id },
              data: {
                status: PaymentStatus.COMPLETED,
                razorpayPaymentId: capturedPayment.id,
                paymentMethod,
                bankReference,
                registrationId: registration.id,
              },
            })

            await tx.paymentLedger.create({
              data: {
                paymentId: recentPending.id,
                eventType: "PAYMENT_CAPTURED",
                actorType: "STUDENT_CLIENT",
                actorId: user.id,
                details: `Recovered captured payment ${capturedPayment.id} of ₹${recentPending.amount / 100} during order checkout refresh.`,
                rawPayload: JSON.stringify(capturedPayment),
              },
            })
          })

          if (user.email) {
            await sendEnrollmentReceiptEmail({
              to: user.email,
              name: user.name,
              testSeriesId: testSeries.id,
              testTitle: testSeries.title,
              amountPaise: recentPending.amount,
              maxAttempts: testSeries.maxAttempts,
              orderId: recentPending.razorpayOrderId,
            }).catch((err) =>
              console.error(
                "[Registration] Failed to send recovered enrollment receipt:",
                err
              )
            )
          }

          revalidatePath(`/tests/${testSeries.id}`)
          revalidatePath("/student/dashboard")

          return {
            success: true,
            message: "Your payment was verified! Access is now unlocked.",
            data: {
              orderId: recentPending.razorpayOrderId,
              amount: recentPending.amount,
              currency: recentPending.currency,
              keyId: key_id || "rzp_test_placeholder",
              testTitle: testSeries.title,
              userName: user.name || "",
              userEmail: user.email || "",
              alreadyCompleted: true,
            },
          }
        }
      } catch (checkErr) {
        console.warn(
          "[createRazorpayOrderAction] Could not verify pending order status on Razorpay:",
          checkErr
        )
      }
    }

    return {
      success: true,
      message: "An existing payment attempt is still active.",
      data: {
        orderId: recentPending.razorpayOrderId,
        amount: recentPending.amount,
        currency: recentPending.currency,
        keyId: key_id || "rzp_test_placeholder",
        testTitle: testSeries.title,
        userName: user.name || "",
        userEmail: user.email || "",
      },
    }
  }

  let razorpayOrderId = `order_dev_mock_${Date.now()}`

  if (razorpayConfigured) {
    try {
      const razorpay = new Razorpay({ key_id, key_secret })
      const order = await razorpay.orders.create({
        amount: testSeries.price,
        currency: "INR",
        receipt: `rcpt_${user.id.slice(-6)}_${Date.now().toString().slice(-6)}`,
        notes: {
          userId: user.id,
          testSeriesId: testSeries.id,
        },
      })
      razorpayOrderId = order.id
    } catch (orderErr: any) {
      console.error(
        "[createRazorpayOrderAction] Razorpay order creation failed:",
        orderErr
      )
      return {
        success: false,
        error:
          orderErr?.error?.description ||
          orderErr?.message ||
          "Failed to initiate payment order with gateway.",
      }
    }
  }

  // Record payment order and initial ledger entry in DB
  try {
    await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          userId: user.id,
          testSeriesId: testSeries.id,
          razorpayOrderId,
          amount: testSeries.price,
          currency: "INR",
          status: PaymentStatus.PENDING,
        },
      })

      await tx.paymentLedger.create({
        data: {
          paymentId: createdPayment.id,
          eventType: "ORDER_CREATED",
          actorType: "STUDENT_CLIENT",
          actorId: user.id,
          details: `Generated checkout order ${razorpayOrderId} for ₹${testSeries.price / 100}.`,
          rawPayload: JSON.stringify({
            orderId: razorpayOrderId,
            amount: testSeries.price,
            currency: "INR",
          }),
        },
      })
    })
  } catch (paymentCreateErr: any) {
    console.error(
      "[createRazorpayOrderAction] Failed to record payment order:",
      paymentCreateErr
    )
    if (paymentCreateErr?.code === "P2003") {
      return {
        success: false,
        error:
          "Your user account session could not be verified in the database. Please sign out and sign in again.",
      }
    }
    return {
      success: false,
      error: "Failed to initialize payment checkout. Please try again shortly.",
    }
  }

  return {
    success: true,
    data: {
      orderId: razorpayOrderId,
      amount: testSeries.price,
      currency: "INR",
      keyId: key_id || "rzp_test_placeholder",
      testTitle: testSeries.title,
      userName: user.name || "",
      userEmail: user.email || "",
    },
  }
}

/**
 * Server Action: Verify Razorpay Payment and Grant Access Atomically
 */
export async function verifyPaymentAndRegisterAction(input: {
  razorpayOrderId: string
  razorpayPaymentId: string
  razorpaySignature: string
  testSeriesId: string
}): Promise<ActionResult> {
  let user
  try {
    user = await getPersistedCurrentUser()
  } catch (err) {
    if (err instanceof PersistedUserLookupError) {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    throw err
  }

  if (!user) {
    return {
      success: false,
      error:
        "Please sign in to verify your payment. If you were signed in, your session may have expired.",
    }
  }

  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  const razorpayConfigured = Boolean(
    key_id &&
    key_secret &&
    key_id !== "rzp_test_placeholder" &&
    key_secret !== "placeholder_secret"
  )

  if (process.env.NODE_ENV === "production" && !razorpayConfigured) {
    return {
      success: false,
      error: "Razorpay payment verification is not configured.",
    }
  }

  if (
    !input.razorpayOrderId ||
    !input.razorpayPaymentId ||
    !input.razorpaySignature
  ) {
    return {
      success: false,
      error: "Incomplete Razorpay payment verification details.",
    }
  }

  // Verify HMAC signature server-side
  if (key_secret && key_secret !== "placeholder_secret") {
    const generatedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(`${input.razorpayOrderId}|${input.razorpayPaymentId}`)
      .digest("hex")

    const expected = Buffer.from(generatedSignature, "hex")
    const supplied = /^[a-f0-9]{64}$/i.test(input.razorpaySignature)
      ? Buffer.from(input.razorpaySignature, "hex")
      : Buffer.alloc(0)
    if (
      supplied.length !== expected.length ||
      !crypto.timingSafeEqual(supplied, expected)
    ) {
      return {
        success: false,
        error: "Payment verification failed. Invalid digital signature.",
      }
    }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    return {
      success: true,
      message: "Payment verified successfully (Dev Mode). Access unlocked!",
    }
  }

  const testSeries = await prisma.testSeries.findUnique({
    where: { id: input.testSeriesId },
    select: { id: true, title: true, price: true, maxAttempts: true },
  })

  if (!testSeries) {
    return { success: false, error: "Test series not found." }
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: input.razorpayOrderId },
  })
  if (!payment) return { success: false, error: "Payment order not found." }
  if (
    payment.userId !== user.id ||
    payment.testSeriesId !== input.testSeriesId
  ) {
    return {
      success: false,
      error:
        "This payment does not belong to the current account or test series.",
    }
  }
  if (payment.amount <= 0 || payment.currency !== "INR") {
    return {
      success: false,
      error: "Invalid payment order amount or currency.",
    }
  }
  if (
    payment.status === PaymentStatus.REFUNDED ||
    payment.status === PaymentStatus.REFUND_PENDING
  ) {
    return {
      success: false,
      error: "This payment is no longer eligible for registration.",
    }
  }
  if (
    payment.status === PaymentStatus.COMPLETED &&
    payment.razorpayPaymentId === input.razorpayPaymentId
  ) {
    return {
      success: true,
      message: "Payment was already verified and access is active.",
    }
  }
  if (
    payment.status === PaymentStatus.COMPLETED &&
    payment.razorpayPaymentId !== input.razorpayPaymentId
  ) {
    return {
      success: false,
      error:
        "This order was already completed with a different payment. Please contact support.",
    }
  }

  let paymentMethod: string | null = payment.paymentMethod
  let bankReference: string | null = payment.bankReference

  // Fetch gateway metadata (method, UTR/RRN) if Razorpay is configured
  if (razorpayConfigured) {
    try {
      const razorpay = new Razorpay({ key_id, key_secret })
      const rzpPayment: any = await razorpay.payments.fetch(
        input.razorpayPaymentId
      )
      if (rzpPayment) {
        if (rzpPayment.amount && rzpPayment.amount !== payment.amount) {
          return {
            success: false,
            error: "Captured gateway amount does not match the payment order.",
          }
        }
        paymentMethod = rzpPayment.method || paymentMethod
        bankReference =
          rzpPayment.acquirer_data?.rrn ||
          rzpPayment.acquirer_data?.bank_transaction_id ||
          bankReference
      }
    } catch (fetchErr) {
      console.warn(
        "[verifyPaymentAndRegisterAction] Could not fetch gateway metadata:",
        fetchErr
      )
    }
  }

  // Atomically fulfill payment and create registration in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Create or reactivate registration with full attempts quota
    const registration = await tx.testRegistration.upsert({
      where: {
        userId_testSeriesId: {
          userId: user.id,
          testSeriesId: input.testSeriesId,
        },
      },
      create: {
        userId: user.id,
        testSeriesId: input.testSeriesId,
        status: RegistrationStatus.ACTIVE,
        attemptsUsed: 0,
        maxAttempts: testSeries.maxAttempts,
      },
      update: {
        status: RegistrationStatus.ACTIVE,
        attemptsUsed: 0,
        maxAttempts: testSeries.maxAttempts,
      },
    })

    // 2. Unlink any historical refunded/failed payment from this registrationId to avoid @unique collision
    await tx.payment.updateMany({
      where: {
        registrationId: registration.id,
        id: { not: payment.id },
      },
      data: { registrationId: null },
    })

    // 3. Mark payment as completed and link to registration
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
        status: PaymentStatus.COMPLETED,
        registrationId: registration.id,
        paymentMethod,
        bankReference,
        verificationMetadata: JSON.stringify({
          verifiedAt: new Date().toISOString(),
          userId: user.id,
        }),
      },
    })

    // 4. Record audit ledger entry
    await tx.paymentLedger.create({
      data: {
        paymentId: payment.id,
        eventType: "PAYMENT_CAPTURED",
        actorType: "STUDENT_CLIENT",
        actorId: user.id,
        details: `Verified payment ${input.razorpayPaymentId} of ₹${payment.amount / 100} via ${paymentMethod || "Razorpay Checkout"}. Candidate access unlocked.`,
        rawPayload: JSON.stringify({
          orderId: input.razorpayOrderId,
          paymentId: input.razorpayPaymentId,
          paymentMethod,
          bankReference,
        }),
      },
    })
  })

  if (user.email) {
    await sendEnrollmentReceiptEmail({
      to: user.email,
      name: user.name,
      testSeriesId: input.testSeriesId,
      testTitle: testSeries.title,
      amountPaise: payment.amount,
      maxAttempts: testSeries.maxAttempts,
      orderId: input.razorpayOrderId,
    }).catch((err) =>
      console.error(
        "[Registration] Failed to send paid enrollment receipt:",
        err
      )
    )
  }

  revalidatePath(`/tests/${input.testSeriesId}`)
  revalidatePath("/student/dashboard")
  revalidatePath("/student/purchases")

  return {
    success: true,
    message: "Payment verified! Your registration is now active.",
  }
}
