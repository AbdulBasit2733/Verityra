"use server"

import {
  getCurrentUser,
  getPersistedCurrentUser,
  PersistedUserLookupError,
} from "@/lib/auth-guard"
import { prisma, isDatabaseConnected, DB_TX_OPTIONS } from "@/lib/prisma"
import { sendEnrollmentReceiptEmail } from "@/lib/email"
import { fulfillCapturedPayment } from "@/lib/payment-fulfillment"
import { checkStudentTestAccess } from "@/lib/test-access"
import { resolveEffectiveBundlePrice } from "@/lib/test-catalog-projection"
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

  let testSeries: any = await prisma.testSeries.findUnique({
    where: { id: testSeriesId },
    select: {
      id: true,
      title: true,
      price: true,
      bundlePrice: true,
      isPublished: true,
      maxAttempts: true,
    },
  })

  let isSingleTest = false
  if (!testSeries) {
    const singleTest = await prisma.test.findUnique({
      where: { id: testSeriesId },
      select: {
        id: true,
        title: true,
        price: true,
        isPublished: true,
        isStandalone: true,
        maxAttempts: true,
        testSeriesId: true,
      },
    })
    if (singleTest) {
      testSeries = singleTest
      isSingleTest = true
    }
  }

  if (!testSeries || !testSeries.isPublished) {
    return {
      success: false,
      error: "This test or test series is not currently available for registration.",
    }
  }

  if (isSingleTest && testSeries.isStandalone === false) {
    return {
      success: false,
      error: "This subject test is only available through its test series.",
    }
  }

  if (isSingleTest && (await checkStudentTestAccess(user.id, testSeries.id))) {
    return { success: false, error: "You already have access to this test." }
  }

  const freeFee = isSingleTest
    ? testSeries.price
    : resolveEffectiveBundlePrice(testSeries)
  if (freeFee > 0) {
    return {
      success: false,
      error: "This is a paid test. Payment is required to register.",
    }
  }

  // Check if already registered
  const existing = isSingleTest
    ? await prisma.testRegistration.findUnique({
        where: {
          userId_testId: {
            userId: user.id,
            testId: testSeries.id,
          },
        },
      })
    : await prisma.testRegistration.findUnique({
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
      error: "You are already registered for this test.",
    }
  }

  let registration
  try {
    registration = isSingleTest
      ? await prisma.testRegistration.upsert({
          where: {
            userId_testId: {
              userId: user.id,
              testId: testSeries.id,
            },
          },
          create: {
            userId: user.id,
            testId: testSeries.id,
            testSeriesId: testSeries.testSeriesId,
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
      : await prisma.testRegistration.upsert({
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

  // Fetch test series, existing registration, and recent pending order in parallel
  let testSeries: any = null
  let existingReg: any = null
  let recentPending: any = null

  try {
    const results = await Promise.all([
      prisma.testSeries.findUnique({
        where: { id: testSeriesId },
        select: {
          id: true,
          title: true,
          price: true,
          bundlePrice: true,
          isPublished: true,
          maxAttempts: true,
        },
      }),
      prisma.testRegistration.findUnique({
        where: {
          userId_testSeriesId: {
            userId: user.id,
            testSeriesId,
          },
        },
      }),
      prisma.payment.findFirst({
        where: {
          userId: user.id,
          testSeriesId,
          status: PaymentStatus.PENDING,
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
      }),
    ])
    testSeries = results[0]
    existingReg = results[1]
    recentPending = results[2]

    if (!testSeries) {
      const singleTest = await prisma.test.findUnique({
        where: { id: testSeriesId },
        select: {
          id: true,
          title: true,
          price: true,
          isPublished: true,
          maxAttempts: true,
          isStandalone: true,
          testSeriesId: true,
        },
      })
      if (singleTest) {
        testSeries = {
          id: singleTest.id,
          title: singleTest.title,
          price: singleTest.price,
          isPublished: singleTest.isPublished,
          maxAttempts: singleTest.maxAttempts,
          isSingleTest: true,
          parentSeriesId: singleTest.testSeriesId,
          isStandaloneTest: singleTest.isStandalone,
        }
      }
    }
  } catch (dbErr: any) {
    console.error("[createRazorpayOrderAction] Database fetch error:", dbErr)
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

  if (!testSeries || !testSeries.isPublished) {
    return { success: false, error: "This test series is not available." }
  }

  const chargeAmount = testSeries.isSingleTest
    ? testSeries.price
    : resolveEffectiveBundlePrice(testSeries)
  if (testSeries.isSingleTest && testSeries.isStandaloneTest === false) {
    return {
      success: false,
      error: "This subject test is only available through its test series.",
    }
  }
  if (chargeAmount <= 0) {
    return {
      success: false,
      error: "This test is free. Please use the free registration option.",
    }
  }
  if (
    testSeries.isSingleTest &&
    (await checkStudentTestAccess(user.id, testSeries.id))
  ) {
    return { success: false, error: "You already have access to this test." }
  }
  testSeries.price = chargeAmount

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

  // Fast-path: Reuse recent pending order matching current price without blocking external HTTP roundtrips
  const reusablePending = testSeries.isSingleTest
    ? await prisma.payment.findFirst({
        where: {
          userId: user.id,
          testId: testSeries.id,
          status: PaymentStatus.PENDING,
          createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
      })
    : recentPending && !recentPending.testId
      ? recentPending
      : null
  if (reusablePending && reusablePending.amount === testSeries.price) {
    return {
      success: true,
      data: {
        orderId: reusablePending.razorpayOrderId,
        amount: reusablePending.amount,
        currency: reusablePending.currency,
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

  // Record payment order and initial ledger entry in DB with DB_TX_OPTIONS
  try {
    await prisma.$transaction(async (tx) => {
      const createdPayment = await tx.payment.create({
        data: {
          userId: user.id,
          testSeriesId: testSeries.parentSeriesId || testSeries.id,
          testId: testSeries.isSingleTest ? testSeries.id : undefined,
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
    }, DB_TX_OPTIONS)
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

  let testSeries: any = await prisma.testSeries.findUnique({
    where: { id: input.testSeriesId },
    select: {
      id: true,
      title: true,
      price: true,
      bundlePrice: true,
      maxAttempts: true,
    },
  })

  let isSingleTest = false
  if (!testSeries) {
    const singleTest = await prisma.test.findUnique({
      where: { id: input.testSeriesId },
      select: {
        id: true,
        title: true,
        price: true,
        maxAttempts: true,
        testSeriesId: true,
      },
    })
    if (singleTest) {
      testSeries = singleTest
      isSingleTest = true
    }
  }

  if (!testSeries) {
    return { success: false, error: "Test or test series not found." }
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: input.razorpayOrderId },
  })
  if (!payment) return { success: false, error: "Payment order not found." }
  if (
    payment.userId !== user.id ||
    (payment.testSeriesId !== input.testSeriesId && payment.testId !== input.testSeriesId)
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
  const expectedAmount = isSingleTest
    ? testSeries.price
    : resolveEffectiveBundlePrice(testSeries)
  if (payment.amount !== expectedAmount) {
    return {
      success: false,
      error: "Payment order amount does not match current test series fee.",
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

  // Fetch gateway metadata (method, UTR/RRN) with 2.5s timeout so network hiccups don't block fulfillment
  if (razorpayConfigured) {
    try {
      const razorpay = new Razorpay({ key_id, key_secret })
      const fetchPromise = razorpay.payments.fetch(input.razorpayPaymentId)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("GATEWAY_METADATA_TIMEOUT")), 2500)
      )
      const rzpPayment: any = await Promise.race([
        fetchPromise,
        timeoutPromise,
      ]).catch(() => null)

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

  // Atomically and idempotently fulfill payment and grant candidate access
  const fulfillment = await fulfillCapturedPayment({
    paymentId: payment.id,
    userId: user.id,
    testSeriesId: payment.testSeriesId,
    testId: payment.testId || (isSingleTest ? testSeries.id : undefined),
    razorpayPaymentId: input.razorpayPaymentId,
    razorpaySignature: input.razorpaySignature,
    paymentMethod,
    bankReference,
    actorType: "STUDENT_CLIENT",
    actorId: user.id,
    rawPayload: {
      orderId: input.razorpayOrderId,
      paymentId: input.razorpayPaymentId,
      paymentMethod,
      bankReference,
    },
  })

  if (!fulfillment.success) {
    return {
      success: false,
      error:
        fulfillment.error ||
        "Payment verification failed. Please check your payment status or contact support.",
    }
  }

  return {
    success: true,
    message: fulfillment.alreadyCompleted
      ? "Payment was already verified and access is active."
      : "Payment verified! Your registration is now active.",
    data: { registrationId: fulfillment.registrationId },
  }
}
