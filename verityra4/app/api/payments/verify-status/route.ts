import { NextRequest, NextResponse } from "next/server"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-guard"
import { PaymentStatus, RegistrationStatus } from "@prisma/client"
import Razorpay from "razorpay"

export async function POST(req: NextRequest) {
  try {
    // Security: Require authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { orderId } = await req.json()
    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
    }

    const dbConnected = await isDatabaseConnected()
    if (!dbConnected) {
      return NextResponse.json({
        completed: true,
        status: "COMPLETED",
        note: "Development mock verification",
      })
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: orderId },
      include: {
        registration: true,
      },
    })

    if (!payment) {
      return NextResponse.json({ error: "Payment order not found" }, { status: 404 })
    }

    // Security: Verify user owns this payment or is admin
    if (payment.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: You can only check your own payments" }, { status: 403 })
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return NextResponse.json({
        completed: true,
        status: "COMPLETED",
        registrationId: payment.registrationId,
      })
    }

    if (payment.status === PaymentStatus.REFUNDED || payment.status === PaymentStatus.REFUND_PENDING) {
      return NextResponse.json({
        completed: false,
        status: payment.status,
        error: "This payment is not eligible for recovery.",
      }, { status: 409 })
    }

    // If still pending, check directly with Razorpay gateway
    if (
      process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_ID !== "rzp_test_placeholder"
    ) {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })

      const rzpPayments: any = await razorpay.orders.fetchPayments(orderId)
      const capturedPayment = rzpPayments.items?.find((item: any) => item.status === "captured")

      if (capturedPayment) {
        const testSeries = await prisma.testSeries.findUnique({
          where: { id: payment.testSeriesId },
          select: { maxAttempts: true, price: true, isPublished: true },
        })
        if (!testSeries || capturedPayment.amount !== payment.amount || capturedPayment.currency !== payment.currency) {
          return NextResponse.json({ error: "Captured payment does not match the stored order" }, { status: 409 })
        }
        let registrationId: string | null = payment.registrationId
        await prisma.$transaction(async (tx) => {
          const registration = await tx.testRegistration.upsert({
            where: {
              userId_testSeriesId: {
                userId: payment.userId,
                testSeriesId: payment.testSeriesId,
              },
            },
            create: {
              userId: payment.userId,
              testSeriesId: payment.testSeriesId,
              status: RegistrationStatus.ACTIVE,
              attemptsUsed: 0,
              maxAttempts: testSeries.maxAttempts,
            },
            update: { status: RegistrationStatus.ACTIVE },
          })
          registrationId = registration.id
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: PaymentStatus.COMPLETED,
              razorpayPaymentId: capturedPayment.id,
              paymentMethod: capturedPayment.method,
              registrationId: registration.id,
            },
          })

          await tx.paymentLedger.create({
            data: {
              paymentId: payment.id,
              eventType: "NETWORK_RECOVERY_VERIFIED",
              actorType: "STUDENT_CLIENT",
              details: `Client network recovery verification detected captured payment ${capturedPayment.id}. Access granted.`,
              rawPayload: JSON.stringify(capturedPayment),
            },
          })
        })

        return NextResponse.json({
          completed: true,
          status: "COMPLETED",
          registrationId,
        })
      }
    }

    return NextResponse.json({
      completed: false,
      status: payment.status,
    })
  } catch (err: any) {
    console.error("[verify-status API Error]:", err)
    return NextResponse.json({ error: "Failed to verify payment status" }, { status: 500 })
  }
}
