import { NextRequest, NextResponse } from "next/server"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-guard"
import { fulfillCapturedPayment } from "@/lib/payment-fulfillment"
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
      return NextResponse.json(
        { error: "Payment order not found" },
        { status: 404 }
      )
    }

    // Security: Verify user owns this payment or is admin
    if (payment.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: You can only check your own payments" },
        { status: 403 }
      )
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return NextResponse.json({
        completed: true,
        status: "COMPLETED",
        registrationId: payment.registrationId,
      })
    }

    if (
      payment.status === PaymentStatus.REFUNDED ||
      payment.status === PaymentStatus.REFUND_PENDING
    ) {
      return NextResponse.json(
        {
          completed: false,
          status: payment.status,
          error: "This payment is not eligible for recovery.",
        },
        { status: 409 }
      )
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
      const capturedPayment = rzpPayments.items?.find(
        (item: any) => item.status === "captured"
      )

      if (capturedPayment) {
        const testSeries = payment.testId
          ? await prisma.test.findUnique({
              where: { id: payment.testId },
              select: { price: true },
            })
          : await prisma.testSeries.findUnique({
              where: { id: payment.testSeriesId },
              select: { price: true },
            })
        if (
          !testSeries ||
          capturedPayment.amount !== payment.amount ||
          capturedPayment.currency !== payment.currency
        ) {
          return NextResponse.json(
            { error: "Captured payment does not match the stored order" },
            { status: 409 }
          )
        }
        const fulfillment = await fulfillCapturedPayment({
          paymentId: payment.id,
          userId: payment.userId,
          testSeriesId: payment.testSeriesId,
          testId: payment.testId,
          razorpayPaymentId: capturedPayment.id,
          paymentMethod: capturedPayment.method,
          bankReference:
            capturedPayment.acquirer_data?.rrn ||
            capturedPayment.acquirer_data?.bank_transaction_id ||
            null,
          actorType: "STUDENT_CLIENT",
          actorId: user.id,
          rawPayload: capturedPayment,
          customDetails: `Client network recovery verification detected captured payment ${capturedPayment.id}. Access granted.`,
        })

        if (!fulfillment.success) {
          return NextResponse.json(
            { error: fulfillment.error || "Recovery fulfillment failed" },
            { status: 500 }
          )
        }

        return NextResponse.json({
          completed: true,
          status: "COMPLETED",
          registrationId: fulfillment.registrationId,
        })
      }
    }

    return NextResponse.json({
      completed: false,
      status: payment.status,
    })
  } catch (err: any) {
    console.error("[verify-status API Error]:", err)
    return NextResponse.json(
      { error: "Failed to verify payment status" },
      { status: 500 }
    )
  }
}
