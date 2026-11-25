import { prisma } from "@/lib/prisma"
import { RegistrationStatus } from "@prisma/client"

export interface TestAccessResult {
  hasAccess: boolean
  isDirectEnrollment: boolean
  isBundleEnrollment: boolean
  bundleId?: string
  bundleTitle?: string
}

/**
 * Checks whether a candidate has access to an individual subject test.
 * A candidate has access if:
 * 1. The candidate has an active registration specifically for this test (`testId`).
 * 2. OR the candidate has an active registration for the parent test series bundle (`testSeriesId`).
 */
export async function checkStudentTestAccess(
  userId: string,
  testId: string
): Promise<boolean> {
  if (!userId || !testId) return false

  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: { id: true, testSeriesId: true },
    })

    if (!test) return false

    const registration = await prisma.testRegistration.findFirst({
      where: {
        userId,
        status: RegistrationStatus.ACTIVE,
        OR: [
          { testId: test.id },
          ...(test.testSeriesId ? [{ testSeriesId: test.testSeriesId }] : []),
        ],
      },
      select: { id: true },
    })

    return Boolean(registration)
  } catch (error) {
    console.error("[checkStudentTestAccess] Error verifying access:", error)
    return false
  }
}

/**
 * Detailed test access inspection including origin of enrollment (direct vs bundle).
 */
export async function getTestAccessStatus(
  userId: string | null | undefined,
  testId: string
): Promise<TestAccessResult> {
  if (!userId || !testId) {
    return { hasAccess: false, isDirectEnrollment: false, isBundleEnrollment: false }
  }

  try {
    const test = await prisma.test.findUnique({
      where: { id: testId },
      select: {
        id: true,
        testSeriesId: true,
        testSeries: { select: { id: true, title: true } },
      },
    })

    if (!test) {
      return { hasAccess: false, isDirectEnrollment: false, isBundleEnrollment: false }
    }

    const registrations = await prisma.testRegistration.findMany({
      where: {
        userId,
        status: RegistrationStatus.ACTIVE,
        OR: [
          { testId: test.id },
          ...(test.testSeriesId ? [{ testSeriesId: test.testSeriesId }] : []),
        ],
      },
      select: {
        testId: true,
        testSeriesId: true,
      },
    })

    const isDirect = registrations.some((r) => r.testId === test.id)
    const isBundle = registrations.some(
      (r) => r.testSeriesId === test.testSeriesId
    )

    return {
      hasAccess: isDirect || isBundle,
      isDirectEnrollment: isDirect,
      isBundleEnrollment: isBundle,
      bundleId: (isBundle && test.testSeriesId) ? test.testSeriesId : undefined,
      bundleTitle: (isBundle && test.testSeries) ? test.testSeries.title : undefined,
    }
  } catch (error) {
    console.error("[getTestAccessStatus] Error checking access status:", error)
    return { hasAccess: false, isDirectEnrollment: false, isBundleEnrollment: false }
  }
}

/**
 * Returns a set of all individual test IDs accessible to a student (both direct and bundle-inherited).
 */
export async function getStudentAccessibleTestIds(
  userId: string
): Promise<Set<string>> {
  if (!userId) return new Set()

  try {
    const registrations = await prisma.testRegistration.findMany({
      where: {
        userId,
        status: RegistrationStatus.ACTIVE,
      },
      select: {
        testId: true,
        testSeriesId: true,
        testSeries: {
          select: {
            tests: { select: { id: true } },
          },
        },
      },
    })

    const accessibleIds = new Set<string>()

    for (const reg of registrations) {
      if (reg.testId) {
        accessibleIds.add(reg.testId)
      }
      if (reg.testSeries?.tests) {
        for (const childTest of reg.testSeries.tests) {
          accessibleIds.add(childTest.id)
        }
      }
    }

    return accessibleIds
  } catch (error) {
    console.error("[getStudentAccessibleTestIds] Error fetching accessible tests:", error)
    return new Set()
  }
}
