import { PaymentStatus, RegistrationStatus } from "@prisma/client"
import { requireStudent } from "@/lib/auth-guard"
import { isDatabaseConnected, prisma } from "@/lib/prisma"
import { StudentRegisteredTestsClient, RegisteredTestRow } from "@/components/student/tests/student-registered-tests-client"

export const dynamic = "force-dynamic"

export default async function StudentRegisteredTestsPage() {
  const user = await requireStudent("/student/tests")
  const dbConnected = await isDatabaseConnected()
  let tests: RegisteredTestRow[] = []

  if (dbConnected) {
    const registrations = await prisma.testRegistration.findMany({
      where: {
        userId: user.id,
        status: { not: RegistrationStatus.CANCELLED },
        OR: [
          { payment: null },
          { payment: { status: PaymentStatus.COMPLETED } },
        ],
      },
      select: {
        id: true,
        testSeriesId: true,
        attemptsUsed: true,
        maxAttempts: true,
        registeredAt: true,
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
        testSeries: {
          select: {
            title: true,
            price: true,
            maxMarks: true,
            durationMinutes: true,
          },
        },
        submissions: {
          orderBy: { attemptNumber: "desc" },
          select: { status: true },
        },
      },
      orderBy: { registeredAt: "desc" },
    })

    tests = registrations.map((registration) => {
      const price = registration.testSeries.price ?? 0
      const isPaid = price > 0 || Boolean(registration.payment)
      return {
        id: registration.id,
        testSeriesId: registration.testSeriesId,
        testTitle: registration.testSeries.title,
        maxMarks: registration.testSeries.maxMarks,
        durationMinutes: registration.testSeries.durationMinutes,
        attemptsUsed: registration.attemptsUsed,
        maxAttempts: registration.maxAttempts,
        registeredAt: registration.registeredAt.toISOString(),
        submissionCount: registration.submissions.length,
        latestStatus: registration.submissions[0]?.status || null,
        price,
        isPaid,
      }
    })
  }

  return (
    <StudentRegisteredTestsClient
      tests={tests}
      title="My Tests"
      subtitle="Access all your registered and purchased test series."
      emptyTitle="No test series registered yet"
      emptyDescription="Explore the test catalog to enroll in free and paid test series."
    />
  )
}
