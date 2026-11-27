import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import {
  getCurrentUser,
  getPersistedCurrentUser,
  PersistedUserLookupError,
} from "@/lib/auth-guard"
import {
  TestSeriesDetailClient,
  type DetailTemplate,
  type DetailTest,
} from "@/components/test-series-detail-client"
import { normalizePrivateFileUrl } from "@/lib/supabase"
import { PaymentStatus, RegistrationStatus } from "@prisma/client"
import { getStudentAccessibleTestIds } from "@/lib/test-access"
import { resolveEffectiveBundlePrice } from "@/lib/test-catalog-projection"
import { DEMO_SERIES, DEMO_STANDALONE_TESTS } from "@/lib/test-catalog-demo"

export const dynamic = "force-dynamic"

const DEFAULT_INSTRUCTIONS =
  "1. Number all responses clearly inside the left margin.\n2. Write on the official answer sheet template and keep clear margins.\n3. Scan all pages upright into a single clear PDF before uploading."

const testSelect = {
  id: true,
  title: true,
  slug: true,
  subject: true,
  description: true,
  price: true,
  isStandalone: true,
  maxMarks: true,
  durationMinutes: true,
  maxAttempts: true,
  studentInstructions: true,
} as const

const seriesInclude = {
  templates: true,
  tests: {
    where: { isPublished: true },
    select: testSelect,
    orderBy: { order: "asc" },
  },
} as const

export default async function TestDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let user: any = null
  let series: any = null
  let test: any = null

  try {
    const [resolvedUser, resolvedSeries, resolvedTest] = await Promise.all([
      getPersistedCurrentUser().catch(async (err) => {
        if (err instanceof PersistedUserLookupError) return getCurrentUser()
        return null
      }),
      prisma.testSeries.findFirst({
        where: { OR: [{ id }, { slug: id }], isPublished: true },
        include: seriesInclude,
      }),
      prisma.test.findFirst({
        where: { OR: [{ id }, { slug: id }], isPublished: true },
        select: { ...testSelect, testSeriesId: true, answerSheetUrl: true },
      }),
    ])
    user = resolvedUser
    series = resolvedSeries
    test = resolvedTest

    if (!series && test?.testSeriesId) {
      series = await prisma.testSeries.findFirst({
        where: { id: test.testSeriesId, isPublished: true },
        include: seriesInclude,
      })
    }
  } catch (lookupErr) {
    console.warn("[TestDetailsPage] Lookup error:", lookupErr)
  }

  if (!series && !test && id.startsWith("demo-")) {
    const demoSeries = DEMO_SERIES.find(
      (s) =>
        s.id === id || s.slug === id || s.tests?.some((t) => t.id === id)
    )
    if (demoSeries) {
      series = { ...demoSeries, templates: [] }
      test = demoSeries.tests?.find((t) => t.id === id) ?? null
    } else {
      test = DEMO_STANDALONE_TESTS.find((t) => t.id === id) ?? null
    }
  }

  if (!series && !test) notFound()

  // A subject test URL pre-selects that subject inside its parent series page.
  const selectedTestId: string | null =
    test && (series?.tests || []).some((t: any) => t.id === test.id)
      ? test.id
      : null
  const childTests: any[] = series ? series.tests || [] : test ? [test] : []

  let seriesOwned = false
  let ownedTestIds = new Set<string>()
  if (user) {
    try {
      ownedTestIds = await getStudentAccessibleTestIds(user.id)
      if (series) {
        const registration = await prisma.testRegistration.findUnique({
          where: {
            userId_testSeriesId: { userId: user.id, testSeriesId: series.id },
          },
          include: { payment: { select: { status: true } } },
        })
        seriesOwned = Boolean(
          registration &&
            registration.status !== RegistrationStatus.CANCELLED &&
            (resolveEffectiveBundlePrice(series) === 0 ||
              registration.payment?.status === PaymentStatus.COMPLETED)
        )
      }
    } catch (accessErr) {
      console.warn("[TestDetailsPage] Access lookup error:", accessErr)
    }
  }

  const tests: DetailTest[] = childTests.map((t: any) => ({
    id: t.id,
    title: t.title,
    subject: t.subject,
    description: t.description ?? null,
    price: t.price ?? 0,
    isStandalone: t.isStandalone !== false,
    maxMarks: t.maxMarks ?? 80,
    durationMinutes: t.durationMinutes ?? 180,
    maxAttempts: t.maxAttempts ?? 3,
    owned: seriesOwned || ownedTestIds.has(t.id),
  }))

  const templates: DetailTemplate[] = series
    ? (series.templates || []).map((tpl: any) => {
        const fileUrl = normalizePrivateFileUrl(tpl.fileUrl) || "#"
        return {
          id: tpl.id,
          title: tpl.title,
          required: Boolean(tpl.templateRequired),
          previewUrl: fileUrl,
          downloadUrl: `${fileUrl}${fileUrl.includes("?") ? "&" : "?"}download=1`,
        }
      })
    : test?.answerSheetUrl
      ? [
          {
            id: `tpl-${test.id}`,
            title: `${test.subject} answer sheet template`,
            required: true,
            previewUrl: normalizePrivateFileUrl(test.answerSheetUrl) || "#",
            downloadUrl: `${normalizePrivateFileUrl(test.answerSheetUrl) || "#"}?download=1`,
          },
        ]
      : []

  const instructions: string =
    (series?.studentInstructions || test?.studentInstructions || "").trim() ||
    DEFAULT_INSTRUCTIONS

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <TestSeriesDetailClient
          header={{
            title: series?.title ?? test.title,
            description: series?.description || test?.description || "",
            standard: series?.standard ?? null,
            stream: series?.stream ?? null,
          }}
          series={
            series
              ? {
                  id: series.id,
                  price: resolveEffectiveBundlePrice(series),
                  owned: seriesOwned,
                }
              : null
          }
          tests={tests}
          selectedTestId={selectedTestId ?? (!series && test ? test.id : null)}
          templates={templates}
          instructions={instructions}
          isSignedIn={Boolean(user)}
        />
      </main>
    </div>
  )
}
