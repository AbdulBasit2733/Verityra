import { NextRequest, NextResponse } from "next/server"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { PaymentStatus, RegistrationStatus, WebhookStatus } from "@prisma/client"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature")
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    // Signature verification
    if (webhookSecret && webhookSecret !== "placeholder_webhook_secret") {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 400 })
      }

      const expectedSignature = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex")

      if (expectedSignature !== signature) {
        return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
      }
    }

    const payload = JSON.parse(rawBody)
    const eventId = payload?.event_id || `evt_${Date.now()}`
    const eventType = payload?.event || "unknown"

    const dbConnected = await isDatabaseConnected()
    if (!dbConnected) {
      return NextResponse.json({ received: true, note: "DB offline dev mode" })
    }

    // 1. Idempotency Check: check if event was already processed
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    })

    if (existingEvent && existingEvent.status === WebhookStatus.PROCESSED) {
      return NextResponse.json({ received: true, note: "Event already processed" })
    }

    // Record webhook event as RECEIVED
    await prisma.webhookEvent.upsert({
      where: { eventId },
      create: {
        provider: "razorpay",
        eventId,
        eventType,
        payload: rawBody,
        status: WebhookStatus.RECEIVED,
      },
      update: {},
    })

    // Handle payment.captured or order.paid
    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity
      const orderEntity = payload.payload?.order?.entity
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id
      const razorpayPaymentId = paymentEntity?.id

      if (razorpayOrderId) {
        const paymentRecord = await prisma.payment.findUnique({
          where: { razorpayOrderId },
        })

        if (paymentRecord && paymentRecord.status !== PaymentStatus.COMPLETED) {
          const testSeries = await prisma.testSeries.findUnique({
            where: { id: paymentRecord.testSeriesId },
          })

          await prisma.$transaction(async (tx) => {
            const registration = await tx.testRegistration.upsert({
              where: {
                userId_testSeriesId: {
                  userId: paymentRecord.userId,
                  testSeriesId: paymentRecord.testSeriesId,
                },
              },
              create: {
                userId: paymentRecord.userId,
                testSeriesId: paymentRecord.testSeriesId,
                status: RegistrationStatus.ACTIVE,
                attemptsUsed: 0,
                maxAttempts: testSeries?.maxAttempts || 3,
              },
              update: {
                status: RegistrationStatus.ACTIVE,
              },
            })

            await tx.payment.update({
              where: { id: paymentRecord.id },
              data: {
                status: PaymentStatus.COMPLETED,
                razorpayPaymentId: razorpayPaymentId || paymentRecord.razorpayPaymentId,
                registrationId: registration.id,
              },
            })

            await tx.webhookEvent.update({
              where: { eventId },
              data: {
                status: WebhookStatus.PROCESSED,
                processedAt: new Date(),
              },
            })
          })
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[RAZORPAY WEBHOOK ERROR]", err)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
