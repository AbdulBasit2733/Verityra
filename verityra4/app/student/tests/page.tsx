import { PaymentStatus, RegistrationStatus } from "@prisma/client"
import { requireStudent } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { flattenRegistrationsToSubjectTests } from "@/lib/student-test-display"
import {
  StudentRegisteredTestsClient,
  RegisteredTestRow,
} from "@/components/student/tests/student-registered-tests-client"

export const dynamic = "force-dynamic"

export default async function StudentRegisteredTestsPage() {
  const user = await requireStudent("/student/tests")
  let tests: RegisteredTestRow[] = []

  try {
    const registrations = await prisma.testRegistration.findMany({
      where: {
        userId: user.id,
        status: { not: RegistrationStatus.CANCELLED },
        OR: [
          { payment: null },
          { payment: { status: PaymentStatus.COMPLETED } },
        ],
      },
      include: {
        payment: {
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
        testSeries: {
          select: {
            id: true,
            title: true,
            price: true,
            bundlePrice: true,
            standard: true,
            maxMarks: true,
            durationMinutes: true,
            tests: {
              where: { isPublished: true },
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                subject: true,
                price: true,
                maxMarks: true,
                durationMinutes: true,
                maxAttempts: true,
              },
            },
          },
        },
        test: {
          select: {
            id: true,
            title: true,
            subject: true,
            price: true,
            maxMarks: true,
            durationMinutes: true,
            maxAttempts: true,
            testSeries: {
              select: {
                id: true,
                title: true,
                standard: true,
              },
            },
          },
        },
        submissions: {
          orderBy: { attemptNumber: "desc" },
          select: {
            id: true,
            testId: true,
            attemptNumber: true,
            status: true,
            submittedAt: true,
            evaluation: {
              select: {
                totalMarksAwarded: true,
                maxMarks: true,
                percentage: true,
              },
            },
          },
        },
      },
      orderBy: { registeredAt: "desc" },
    })

    tests = flattenRegistrationsToSubjectTests(
      registrations.map((reg) => ({
        ...reg,
        hasCompletedPayment: Boolean(reg.payment),
      }))
    )
  } catch (error) {
    console.error("[StudentRegisteredTestsPage] Database query error:", error)
  }

  return (
    <StudentRegisteredTestsClient
      tests={tests}
      title="My Subject Tests"
      subtitle="Download your question paper, submit your answer sheet (max 10 MB), and view your latest evaluated marks."
      emptyTitle="No subject tests enrolled yet"
      emptyDescription="Explore the catalog to enroll in a subject test and start submitting your answer sheets."
    />
  )
}
