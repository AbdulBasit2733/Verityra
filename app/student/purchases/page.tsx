import { PaymentStatus } from "@prisma/client"
import { requireStudent } from "@/lib/auth-guard"
import { isDatabaseConnected, prisma } from "@/lib/prisma"
import { StudentPurchaseRow, StudentPurchasesClient } from "@/components/student-purchases-client"

export const dynamic = "force-dynamic"

export default async function StudentPurchasesPage() {
  const user = await requireStudent("/student/purchases")
  const dbConnected = await isDatabaseConnected()
  let purchases: StudentPurchaseRow[] = []

  if (dbConnected) {
    const payments = await prisma.payment.findMany({
      where: { userId: user.id, amount: { gt: 0 } },
      select: {
        id: true,
        testSeriesId: true,
        amount: true,
        amountRefunded: true,
        currency: true,
        status: true,
        paymentMethod: true,
        razorpayOrderId: true,
        razorpayPaymentId: true,
        createdAt: true,
        registrationId: true,
        registration: { select: { testSeries: { select: { title: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })

    purchases = payments.map((payment) => ({
      id: payment.id,
      testSeriesId: payment.testSeriesId,
      testTitle: payment.registration?.testSeries.title || "Paid test series",
      amount: payment.amount,
      amountRefunded: payment.amountRefunded,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      createdAt: payment.createdAt.toISOString(),
      hasAccess: payment.status === PaymentStatus.COMPLETED && Boolean(payment.registrationId),
    }))
  }

  return <StudentPurchasesClient purchases={purchases} />
}
