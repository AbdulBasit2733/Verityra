import { NextRequest, NextResponse } from "next/server"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { PaymentStatus, RegistrationStatus, WebhookStatus } from "@prisma/client"
import crypto from "crypto"

export async function POST(req: NextRequest) {
  let receivedEventId: string | null = null
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature")
    const headerEventId = req.headers.get("x-razorpay-event-id")
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    // Signature verification with HMAC SHA-256
    if (!webhookSecret || webhookSecret === "placeholder_webhook_secret") {
      console.error("[RAZORPAY WEBHOOK] RAZORPAY_WEBHOOK_SECRET is not configured")
      return NextResponse.json({ error: "Webhook is not configured" }, { status: 503 })
    }
    if (!signature) {
      return NextResponse.json({ error: "Missing x-razorpay-signature header" }, { status: 400 })
    }
    const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(rawBody).digest("hex")
    const expected = Buffer.from(expectedSignature, "hex")
    const supplied = /^[a-f0-9]{64}$/i.test(signature) ? Buffer.from(signature, "hex") : Buffer.alloc(0)
    if (supplied.length !== expected.length || !crypto.timingSafeEqual(supplied, expected)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
    }

    const payload = JSON.parse(rawBody)
    const eventType = payload?.event || "unknown"
    const eventId = headerEventId || payload?.event_id || payload?.id
    if (!eventId || eventType === "unknown") {
      return NextResponse.json({ error: "Missing Razorpay event identity" }, { status: 400 })
    }
    receivedEventId = eventId

    const dbConnected = await isDatabaseConnected()
    if (!dbConnected) {
      return NextResponse.json({ received: true, note: "DB offline dev mode" })
    }

    // 1. Idempotency Check: check if event was already processed
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId },
    })

    if (existingEvent && existingEvent.status === WebhookStatus.PROCESSED) {
      return NextResponse.json({ received: true, note: "Idempotent skip: Event already processed" })
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

    // 2. Handle payment.captured or order.paid
    if (eventType === "order.paid" || eventType === "payment.captured") {
      const paymentEntity = payload.payload?.payment?.entity
      const orderEntity = payload.payload?.order?.entity
      const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id
      const razorpayPaymentId = paymentEntity?.id
      const paymentMethod = paymentEntity?.method || null
      const bankReference =
        paymentEntity?.acquirer_data?.rrn ||
        paymentEntity?.acquirer_data?.bank_transaction_id ||
        null

      if (razorpayOrderId) {
        const paymentRecord = await prisma.payment.findUnique({
          where: { razorpayOrderId },
        })

        if (
          paymentRecord &&
          paymentRecord.status !== PaymentStatus.COMPLETED &&
          paymentRecord.status !== PaymentStatus.REFUNDED &&
          paymentRecord.status !== PaymentStatus.REFUND_PENDING
        ) {
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
                paymentMethod,
                bankReference,
              },
            })

            await tx.paymentLedger.create({
              data: {
                paymentId: paymentRecord.id,
                eventType: "WEBHOOK_PAYMENT_CAPTURED",
                actorType: "GATEWAY_WEBHOOK",
                actorId: "razorpay",
                details: `Gateway event '${eventType}' verified payment capture of ₹${paymentRecord.amount / 100} via ${paymentMethod || "standard gateway"}.`,
                rawPayload: JSON.stringify({ eventId, razorpayPaymentId, bankReference }),
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

    // 3. Handle payment.failed
    if (eventType === "payment.failed") {
      const paymentEntity = payload.payload?.payment?.entity
      const razorpayOrderId = paymentEntity?.order_id
      const failureReason =
        paymentEntity?.error_description ||
        paymentEntity?.error_reason ||
        "Payment rejected by issuing bank or network drop."

      if (razorpayOrderId) {
        const paymentRecord = await prisma.payment.findUnique({
          where: { razorpayOrderId },
        })

        if (paymentRecord && (paymentRecord.status === PaymentStatus.PENDING || paymentRecord.status === PaymentStatus.AUTHORIZED)) {
          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: paymentRecord.id },
              data: {
                status: PaymentStatus.FAILED,
                failureReason,
              },
            })

            await tx.paymentLedger.create({
              data: {
                paymentId: paymentRecord.id,
                eventType: "PAYMENT_FAILED",
                actorType: "GATEWAY_WEBHOOK",
                actorId: "razorpay",
                details: `Gateway reported payment failure: ${failureReason}`,
                rawPayload: JSON.stringify(paymentEntity),
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

    // 4. Handle refund.processed or refund.created
    if (eventType === "refund.processed" || eventType === "refund.created") {
      const refundEntity = payload.payload?.refund?.entity
      const razorpayPaymentId = refundEntity?.payment_id

      if (razorpayPaymentId) {
        const paymentRecord = await prisma.payment.findUnique({
          where: { razorpayPaymentId },
        })

        if (paymentRecord) {
          const refundAmount = Number(refundEntity?.amount || 0)
          const totalRefunded = Math.min(
            paymentRecord.amount,
            paymentRecord.amountRefunded + refundAmount
          )
          const refundCompleted = eventType === "refund.processed"
          const nextStatus = refundCompleted
            ? totalRefunded >= paymentRecord.amount
              ? PaymentStatus.REFUNDED
              : PaymentStatus.PARTIALLY_REFUNDED
            : PaymentStatus.REFUND_PENDING

          await prisma.$transaction(async (tx) => {
            await tx.payment.update({
              where: { id: paymentRecord.id },
              data: {
                status: nextStatus,
                amountRefunded: totalRefunded,
              },
            })

            if (nextStatus === PaymentStatus.REFUNDED && paymentRecord.registrationId) {
              await tx.testRegistration.update({
                where: { id: paymentRecord.registrationId },
                data: {
                  status: RegistrationStatus.CANCELLED,
                  maxAttempts: 0,
                },
              })
            }

            await tx.paymentLedger.create({
              data: {
                paymentId: paymentRecord.id,
                eventType: refundCompleted ? "WEBHOOK_REFUND_PROCESSED" : "WEBHOOK_REFUND_PENDING",
                actorType: "GATEWAY_WEBHOOK",
                actorId: "razorpay",
                details: `Razorpay webhook confirmed refund of ₹${(refundEntity?.amount || paymentRecord.amount) / 100}. Access cancelled.`,
                rawPayload: JSON.stringify(refundEntity),
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

    // Events that are valid but unrelated to a local order are still marked
    // processed so Razorpay does not retry them forever.
    await prisma.webhookEvent.update({
      where: { eventId },
      data: { status: WebhookStatus.PROCESSED, processedAt: new Date() },
    })
    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("[RAZORPAY WEBHOOK ERROR]", err)
    if (receivedEventId) {
      await prisma.webhookEvent.updateMany({
        where: { eventId: receivedEventId, status: WebhookStatus.RECEIVED },
        data: { status: WebhookStatus.FAILED },
      }).catch((markError) => console.error("[RAZORPAY WEBHOOK] Failed to mark event:", markError))
    }
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
