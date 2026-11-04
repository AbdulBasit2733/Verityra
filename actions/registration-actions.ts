"use server"

import { getCurrentUser } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { PaymentStatus, RegistrationStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import crypto from "crypto"
import Razorpay from "razorpay"
import { ActionResult } from "./auth-actions"

/**
 * Server Action: Register for Free Test Series
 */
export async function registerFreeTestAction(testSeriesId: string): Promise<ActionResult<{ registrationId: string }>> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Please sign in to register for this test series." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: true,
      message: "Successfully registered for test series (Dev Mode).",
      data: { registrationId: "dev-reg-" + Date.now() },
    }
  }

  const testSeries = await prisma.testSeries.findUnique({
    where: { id: testSeriesId },
    select: { id: true, title: true, price: true, isPublished: true, maxAttempts: true },
  })

  if (!testSeries || !testSeries.isPublished) {
    return { success: false, error: "This test series is not currently available for registration." }
  }

  if (testSeries.price > 0) {
    return { success: false, error: "This is a paid test series. Payment is required to register." }
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

  if (existing) {
    return { success: false, error: "You are already registered for this test series." }
  }

  const registration = await prisma.testRegistration.create({
    data: {
      userId: user.id,
      testSeriesId,
      status: RegistrationStatus.ACTIVE,
      attemptsUsed: 0,
      maxAttempts: testSeries.maxAttempts,
    },
  })

  revalidatePath(`/tests/${testSeriesId}`)
  revalidatePath("/student/dashboard")

  return {
    success: true,
    message: "Registration successful! You may now access the instructions and answer sheet template.",
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
  }>
> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Please sign in to purchase this test series." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: true,
      data: {
        orderId: "order_dev_mock_" + Date.now(),
        amount: 49900,
        currency: "INR",
        keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
        testTitle: "Test Series (Dev Mock)",
      },
    }
  }

  const testSeries = await prisma.testSeries.findUnique({
    where: { id: testSeriesId },
    select: { id: true, title: true, price: true, isPublished: true, maxAttempts: true },
  })

  if (!testSeries || !testSeries.isPublished) {
    return { success: false, error: "This test series is not available." }
  }

  if (testSeries.price <= 0) {
    return { success: false, error: "This test is free. Please use the free registration option." }
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
    return { success: false, error: "You already own access to this test series." }
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
    return { success: false, error: "Razorpay is not configured. Payment checkout is temporarily unavailable." }
  }

  // Reuse a recent pending order when a student double-clicks or refreshes
  // checkout. This prevents multiple live orders for one purchase attempt.
  const recentPending = await prisma.payment.findFirst({
    where: {
      userId: user.id,
      testSeriesId: testSeries.id,
      status: PaymentStatus.PENDING,
      createdAt: { gte: new Date(Date.now() - 30 * 60 * 1000) },
    },
    orderBy: { createdAt: "desc" },
  })
  if (recentPending) {
    return {
      success: true,
      message: "An existing payment attempt is still active.",
      data: {
        orderId: recentPending.razorpayOrderId,
        amount: recentPending.amount,
        currency: recentPending.currency,
        keyId: key_id || "rzp_test_placeholder",
        testTitle: testSeries.title,
      },
    }
  }

  let razorpayOrderId = `order_dev_mock_${Date.now()}`

  if (razorpayConfigured) {
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
  }

  // Record payment order in DB
  await prisma.payment.create({
    data: {
      userId: user.id,
      testSeriesId: testSeries.id,
      razorpayOrderId,
      amount: testSeries.price,
      currency: "INR",
      status: PaymentStatus.PENDING,
    },
  })

  return {
    success: true,
    data: {
      orderId: razorpayOrderId,
      amount: testSeries.price,
      currency: "INR",
      keyId: key_id || "rzp_test_placeholder",
      testTitle: testSeries.title,
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
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Authentication required." }
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (process.env.NODE_ENV === "production" && (!key_secret || key_secret === "placeholder_secret")) {
    return { success: false, error: "Razorpay payment verification is not configured." }
  }

  if (!input.razorpayOrderId || !input.razorpayPaymentId || !input.razorpaySignature) {
    return { success: false, error: "Incomplete Razorpay payment verification details." }
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
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      return { success: false, error: "Payment verification failed. Invalid digital signature." }
    }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: true,
      message: "Payment verified successfully (Dev Mode). Access unlocked!",
    }
  }

  const testSeries = await prisma.testSeries.findUnique({
    where: { id: input.testSeriesId },
    select: { id: true, price: true, maxAttempts: true },
  })

  if (!testSeries) {
    return { success: false, error: "Test series not found." }
  }

  const payment = await prisma.payment.findUnique({
    where: { razorpayOrderId: input.razorpayOrderId },
  })
  if (!payment) return { success: false, error: "Payment order not found." }
  if (payment.userId !== user.id || payment.testSeriesId !== input.testSeriesId) {
    return { success: false, error: "This payment does not belong to the current account or test series." }
  }
  if (payment.amount !== testSeries.price || payment.currency !== "INR") {
    return { success: false, error: "Payment amount or currency does not match the test series." }
  }
  if (payment.status === PaymentStatus.REFUNDED || payment.status === PaymentStatus.REFUND_PENDING) {
    return { success: false, error: "This payment is no longer eligible for registration." }
  }
  if (payment.status === PaymentStatus.COMPLETED && payment.razorpayPaymentId === input.razorpayPaymentId) {
    return { success: true, message: "Payment was already verified and access is active." }
  }
  if (payment.status === PaymentStatus.COMPLETED && payment.razorpayPaymentId !== input.razorpayPaymentId) {
    return { success: false, error: "This order was already completed with a different payment. Please contact support." }
  }

  // Atomically fulfill payment and create registration in a transaction
  await prisma.$transaction(async (tx) => {
    // 1. Create or get active registration
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
      },
    })

    // 2. Mark payment as completed and link to registration
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        razorpayPaymentId: input.razorpayPaymentId,
        razorpaySignature: input.razorpaySignature,
        status: PaymentStatus.COMPLETED,
        registrationId: registration.id,
        verificationMetadata: JSON.stringify({
          verifiedAt: new Date().toISOString(),
          userId: user.id,
        }),
      },
    })
  })

  revalidatePath(`/tests/${input.testSeriesId}`)
  revalidatePath("/student/dashboard")

  return {
    success: true,
    message: "Payment verified! Your registration is now active.",
  }
}
