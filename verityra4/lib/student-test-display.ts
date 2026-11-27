export interface DisplaySubjectTestRef {
  id: string
  title: string
  subject?: string | null
  maxMarks?: number | null
  durationMinutes?: number | null
}

export interface DisplayTestSeriesRef {
  id?: string | null
  title?: string | null
  maxMarks?: number | null
  durationMinutes?: number | null
  tests?: DisplaySubjectTestRef[]
}

export interface ResolvedStudentTestDisplay {
  subjectTestTitle: string
  seriesTitle: string | null
  subject: string | null
  targetWorkspaceId: string
  effectiveMaxMarks: number | null
  effectiveDurationMinutes: number | null
  isMultiSubjectBundle: boolean
}

function normalizeText(value: string | null | undefined): string {
  return (value || "").trim()
}

export function resolveSubjectAndSeriesDisplay(params: {
  test?: DisplaySubjectTestRef | null
  testSeries?: DisplayTestSeriesRef | null
  fallbackWorkspaceId?: string | null
  fallbackTitle?: string
}): ResolvedStudentTestDisplay {
  const {
    test,
    testSeries,
    fallbackWorkspaceId,
    fallbackTitle = "Subject Test",
  } = params

  const childTests = testSeries?.tests || []
  const effectiveTest =
    test || (childTests.length === 1 ? childTests[0] : null)

  const rawSeriesTitle = normalizeText(testSeries?.title)

  if (effectiveTest) {
    const rawTestTitle = normalizeText(effectiveTest.title)
    const rawSubject = normalizeText(effectiveTest.subject)
    const subjectTestTitle = rawTestTitle || rawSubject || rawSeriesTitle || fallbackTitle
    const seriesTitle =
      rawSeriesTitle &&
      rawSeriesTitle.toLowerCase() !== subjectTestTitle.toLowerCase()
        ? rawSeriesTitle
        : null

    return {
      subjectTestTitle,
      seriesTitle,
      subject: rawSubject || null,
      targetWorkspaceId:
        effectiveTest.id ||
        normalizeText(testSeries?.id) ||
        normalizeText(fallbackWorkspaceId),
      effectiveMaxMarks:
        effectiveTest.maxMarks ?? testSeries?.maxMarks ?? null,
      effectiveDurationMinutes:
        effectiveTest.durationMinutes ?? testSeries?.durationMinutes ?? null,
      isMultiSubjectBundle: false,
    }
  }

  const isMultiSubjectBundle = childTests.length > 1
  const subjectTestTitle = rawSeriesTitle || fallbackTitle

  return {
    subjectTestTitle,
    seriesTitle: isMultiSubjectBundle
      ? "Multi-subject test series — choose a subject test below to submit its answer sheet"
      : null,
    subject: null,
    targetWorkspaceId:
      normalizeText(testSeries?.id) || normalizeText(fallbackWorkspaceId),
    effectiveMaxMarks: testSeries?.maxMarks ?? null,
    effectiveDurationMinutes: testSeries?.durationMinutes ?? null,
    isMultiSubjectBundle,
  }
}

export interface FlattenableSubmissionItem {
  id?: string
  testId?: string | null
  attemptNumber: number
  status: string
  submittedAt?: Date | string
  evaluation?: {
    totalMarksAwarded: number
    maxMarks: number
    percentage: number
  } | null
}

export interface FlattenableSubjectTest {
  id: string
  title: string
  subject: string
  price?: number | null
  maxMarks: number
  durationMinutes: number
  maxAttempts?: number | null
  standard?: string | null
}

export interface FlattenableRegistration {
  id: string
  testId?: string | null
  testSeriesId?: string | null
  attemptsUsed: number
  maxAttempts: number
  registeredAt: Date | string
  hasCompletedPayment?: boolean
  test?: (FlattenableSubjectTest & {
    testSeries?: {
      id: string
      title?: string | null
      standard?: string | null
    } | null
  }) | null
  testSeries?: {
    id: string
    title: string
    price?: number | null
    bundlePrice?: number | null
    standard?: string | null
    maxMarks: number
    durationMinutes: number
    tests?: FlattenableSubjectTest[]
  } | null
  submissions: FlattenableSubmissionItem[]
}

export interface FlattenedSubjectTestRow {
  id: string
  testSeriesId: string
  testId: string | null
  testTitle: string
  subject: string | null
  standard: string | null
  maxMarks: number
  durationMinutes: number
  attemptsUsed: number
  maxAttempts: number
  registeredAt: string
  submissionCount: number
  latestStatus: string | null
  latestMarksAwarded: number | null
  latestPercentage: number | null
  price: number
  isPaid: boolean
}

function toIsoString(val: Date | string): string {
  return val instanceof Date ? val.toISOString() : new Date(val).toISOString()
}

export function stripLeadingSeriesPrefix(
  testTitle: string,
  seriesTitle?: string | null
): string {
  const cleanTest = normalizeText(testTitle)
  const cleanSeries = normalizeText(seriesTitle)
  if (!cleanTest || !cleanSeries) return cleanTest

  for (const sep of [" — ", " - ", ": "]) {
    const prefix = `${cleanSeries}${sep}`
    if (
      cleanTest.toLowerCase().startsWith(prefix.toLowerCase()) &&
      cleanTest.length > prefix.length + 2
    ) {
      return cleanTest.slice(prefix.length).trim()
    }
  }
  return cleanTest
}

/**
 * Expands direct Subject Test registrations and multi-subject Bundle registrations
 * into one deduplicated, flat list of Subject Tests with latest evaluated marks.
 */
export function flattenRegistrationsToSubjectTests(
  registrations: FlattenableRegistration[]
): FlattenedSubjectTestRow[] {
  // Collect all submissions across registrations keyed by submission id or composite key
  const allSubmissions: Array<
    FlattenableSubmissionItem & { parentSeriesId?: string | null }
  > = []
  const seenSubKeys = new Set<string>()

  for (const reg of registrations) {
    const parentSeriesId =
      reg.testSeriesId || reg.test?.testSeries?.id || null
    for (const sub of reg.submissions || []) {
      const subKey =
        sub.id ||
        `${reg.id}:${sub.testId || "none"}:${sub.attemptNumber}:${String(sub.submittedAt || "")}`
      if (!seenSubKeys.has(subKey)) {
        seenSubKeys.add(subKey)
        allSubmissions.push({ ...sub, parentSeriesId })
      }
    }
  }

  const rowsByKey = new Map<
    string,
    FlattenedSubjectTestRow & { hasDirectReg: boolean }
  >()
  const rowOrder: string[] = []

  const upsertSubjectRow = (
    key: string,
    candidate: FlattenedSubjectTestRow,
    isDirectReg: boolean
  ) => {
    const existing = rowsByKey.get(key)
    if (!existing) {
      rowsByKey.set(key, { ...candidate, hasDirectReg: isDirectReg })
      rowOrder.push(key)
      return
    }
    // Prefer direct per-subject registration quota/metadata over bundle expansion
    if (isDirectReg && !existing.hasDirectReg) {
      rowsByKey.set(key, {
        ...candidate,
        price: candidate.price || existing.price,
        isPaid: candidate.isPaid || existing.isPaid,
        hasDirectReg: true,
      })
    }
  }

  for (const reg of registrations) {
    const regIso = toIsoString(reg.registeredAt)

    if (reg.testId && reg.test) {
      const t = reg.test
      const parentSeriesId = reg.testSeriesId || t.testSeries?.id || t.id
      const matchingSubs = allSubmissions
        .filter((s) => s.testId === t.id)
        .sort((a, b) => b.attemptNumber - a.attemptNumber)
      const latestEvaluated = matchingSubs.find((s) => Boolean(s.evaluation))
      const price = t.price ?? 0

      upsertSubjectRow(
        `test:${t.id}`,
        {
          id: `subject-${t.id}`,
          testSeriesId: parentSeriesId,
          testId: t.id,
          testTitle: stripLeadingSeriesPrefix(t.title, t.testSeries?.title),
          subject: t.subject || null,
          standard: t.testSeries?.standard || t.standard || null,
          maxMarks: t.maxMarks ?? 100,
          durationMinutes: t.durationMinutes ?? 180,
          attemptsUsed: Math.max(reg.attemptsUsed, matchingSubs.length),
          maxAttempts: reg.maxAttempts || t.maxAttempts || 3,
          registeredAt: regIso,
          submissionCount: matchingSubs.length,
          latestStatus: matchingSubs[0]?.status || null,
          latestMarksAwarded:
            latestEvaluated?.evaluation?.totalMarksAwarded ?? null,
          latestPercentage: latestEvaluated?.evaluation?.percentage ?? null,
          price,
          isPaid: price > 0 || Boolean(reg.hasCompletedPayment),
        },
        true
      )
      continue
    }

    if (reg.testSeries) {
      const ts = reg.testSeries
      const childTests = ts.tests || []
      const seriesPrice = ts.bundlePrice ?? ts.price ?? 0
      const isSeriesPaid =
        seriesPrice > 0 || Boolean(reg.hasCompletedPayment)

      if (childTests.length > 0) {
        const isSingleTestSeries = childTests.length === 1
        for (const ct of childTests) {
          const matchingSubs = allSubmissions
            .filter(
              (s) =>
                s.testId === ct.id ||
                (isSingleTestSeries &&
                  !s.testId &&
                  s.parentSeriesId === ts.id)
            )
            .sort((a, b) => b.attemptNumber - a.attemptNumber)
          const latestEvaluated = matchingSubs.find((s) =>
            Boolean(s.evaluation)
          )

          upsertSubjectRow(
            `test:${ct.id}`,
            {
              id: `subject-${ct.id}`,
              testSeriesId: ts.id,
              testId: ct.id,
              testTitle: stripLeadingSeriesPrefix(ct.title, ts.title),
              subject: ct.subject || null,
              standard: ts.standard || null,
              maxMarks: ct.maxMarks ?? ts.maxMarks ?? 100,
              durationMinutes: ct.durationMinutes ?? ts.durationMinutes ?? 180,
              attemptsUsed: matchingSubs.length,
              maxAttempts: ct.maxAttempts || reg.maxAttempts || 3,
              registeredAt: regIso,
              submissionCount: matchingSubs.length,
              latestStatus: matchingSubs[0]?.status || null,
              latestMarksAwarded:
                latestEvaluated?.evaluation?.totalMarksAwarded ?? null,
              latestPercentage:
                latestEvaluated?.evaluation?.percentage ?? null,
              price: seriesPrice,
              isPaid: isSeriesPaid,
            },
            false
          )
        }
      } else {
        // Legacy fallback only when a TestSeries has zero attached Subject Tests
        const matchingSubs = [...(reg.submissions || [])].sort(
          (a, b) => b.attemptNumber - a.attemptNumber
        )
        const latestEvaluated = matchingSubs.find((s) =>
          Boolean(s.evaluation)
        )
        upsertSubjectRow(
          `series:${ts.id}`,
          {
            id: reg.id,
            testSeriesId: ts.id,
            testId: null,
            testTitle: ts.title,
            subject: null,
            standard: ts.standard || null,
            maxMarks: ts.maxMarks ?? 100,
            durationMinutes: ts.durationMinutes ?? 180,
            attemptsUsed: reg.attemptsUsed,
            maxAttempts: reg.maxAttempts,
            registeredAt: regIso,
            submissionCount: matchingSubs.length,
            latestStatus: matchingSubs[0]?.status || null,
            latestMarksAwarded:
              latestEvaluated?.evaluation?.totalMarksAwarded ?? null,
            latestPercentage: latestEvaluated?.evaluation?.percentage ?? null,
            price: seriesPrice,
            isPaid: isSeriesPaid,
          },
          true
        )
      }
    }
  }

  return rowOrder.map((key) => {
    const item = rowsByKey.get(key)!
    const { hasDirectReg: _unused, ...clean } = item
    void _unused
    return clean
  })
}
