import { PaymentStatus, RegistrationStatus } from "@prisma/client"
import { requireStudent } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
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
            type: true,
            standard: true,
            badge: true,
            maxMarks: true,
            durationMinutes: true,
            tests: {
              where: { isPublished: true },
              orderBy: { order: "asc" },
              select: {
                id: true,
                title: true,
                subject: true,
                maxMarks: true,
                durationMinutes: true,
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
          select: { status: true, testId: true },
        },
      },
      orderBy: { registeredAt: "desc" },
    })

    tests = registrations.map((registration) => {
      const isSingleTest = Boolean(registration.testId && registration.test)
      const testSeries = registration.testSeries
      const test = registration.test

      const price = isSingleTest
        ? (test?.price ?? 0)
        : (testSeries?.bundlePrice ?? testSeries?.price ?? 0)
      const isPaid = price > 0 || Boolean(registration.payment)

      const submissionTestIds = new Set(
        registration.submissions
          .map((s) => s.testId)
          .filter(Boolean)
      )

      const childTests = (testSeries?.tests || []).map((t) => ({
        id: t.id,
        title: t.title,
        subject: t.subject,
        maxMarks: t.maxMarks,
        durationMinutes: t.durationMinutes,
        hasSubmitted: submissionTestIds.has(t.id),
      }))

      const title = isSingleTest
        ? `${test?.subject || "Subject"}: ${test?.title || "Test"}`
        : testSeries?.title || "Test Series"

      return {
        id: registration.id,
        testSeriesId: registration.testSeriesId || test?.testSeries?.id || "",
        testId: registration.testId || null,
        testTitle: title,
        subject: isSingleTest ? test?.subject : null,
        standard: isSingleTest ? test?.testSeries?.standard : testSeries?.standard,
        isBundle: !isSingleTest,
        bundleBadge: !isSingleTest ? testSeries?.badge : null,
        childTests: !isSingleTest ? childTests : [],
        maxMarks: isSingleTest ? (test?.maxMarks ?? 100) : (testSeries?.maxMarks ?? 100),
        durationMinutes: isSingleTest ? (test?.durationMinutes ?? 180) : (testSeries?.durationMinutes ?? 180),
        attemptsUsed: registration.attemptsUsed,
        maxAttempts: registration.maxAttempts,
        registeredAt: registration.registeredAt.toISOString(),
        submissionCount: registration.submissions.length,
        latestStatus: registration.submissions[0]?.status || null,
        price,
        isPaid,
      }
    })
  } catch (error) {
    console.error("[StudentRegisteredTestsPage] Database query error:", error)
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
