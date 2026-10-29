import { requireStudent } from "@/lib/auth-guard"
import { isDatabaseConnected, prisma } from "@/lib/prisma"
import { StudentRegisteredTestsClient, RegisteredTestRow } from "@/components/student-registered-tests-client"

export const dynamic = "force-dynamic"

export default async function StudentRegisteredTestsPage() {
  const user = await requireStudent("/student/tests")
  const dbConnected = await isDatabaseConnected()
  let tests: RegisteredTestRow[] = []

  if (dbConnected) {
    const registrations = await prisma.testRegistration.findMany({
      where: { userId: user.id, payment: null },
      include: { testSeries: true, submissions: { select: { status: true } } },
      orderBy: { registeredAt: "desc" },
    })
    tests = registrations.map((registration) => ({
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
    }))
  }

  return <StudentRegisteredTestsClient tests={tests} title="My Tests" subtitle="Free test series registered to your account." emptyTitle="No free tests yet" emptyDescription="Explore the catalog and register for a free test series." />
}
