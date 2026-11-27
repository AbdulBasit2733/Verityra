import type { TestCatalogItem } from "../components/test-catalog-client"

export type CatalogFormat = "ALL" | "BUNDLE" | "SINGLE"
export type CatalogPricing = "ALL" | "FREE" | "PAID"

type DateLike = Date | string | null | undefined

export interface SeriesRecord {
  id: string
  title: string
  slug?: string | null
  description?: string | null
  price?: number | null
  bundlePrice?: number | null
  type?: string | null
  standard?: string | null
  stream?: string | null
  badge?: string | null
  maxMarks?: number | null
  durationMinutes?: number | null
  maxAttempts?: number | null
  studentInstructions?: string | null
  createdAt?: DateLike
  isPublished?: boolean
  tests?: TestRecord[]
}

export interface TestRecord {
  id: string
  title: string
  slug?: string | null
  subject: string
  description?: string | null
  price?: number | null
  isStandalone?: boolean | null
  maxMarks?: number | null
  durationMinutes?: number | null
  maxAttempts?: number | null
  studentInstructions?: string | null
  isPublished?: boolean
  createdAt?: DateLike
}

/** Bundle fee in paise: bundlePrice wins when set, otherwise the series price. */
export function resolveEffectiveBundlePrice(series: {
  price?: number | null
  bundlePrice?: number | null
}): number {
  return (series.bundlePrice ?? 0) > 0
    ? (series.bundlePrice as number)
    : (series.price ?? 0)
}

export function computeSeriesPricingSummary(
  bundlePricePaise: number,
  tests: Array<{ price?: number | null; isStandalone?: boolean | null }>
) {
  const standalone = tests.filter((t) => t.isStandalone !== false)
  const individualTotalPaise = standalone.reduce(
    (sum, t) => sum + (t.price ?? 0),
    0
  )
  const savingsPaise = Math.max(0, individualTotalPaise - bundlePricePaise)
  const hasSavings = standalone.length >= 2 && savingsPaise > 0
  return {
    standaloneCount: standalone.length,
    individualTotalPaise,
    savingsPaise: hasSavings ? savingsPaise : 0,
    savingsPercent: hasSavings
      ? Math.round((savingsPaise / individualTotalPaise) * 100)
      : 0,
    hasSavings,
  }
}

export function formatInr(paise: number): string {
  return `₹${(paise / 100).toLocaleString("en-IN")}`
}

export function formatStandard(standard?: string | null): string {
  if (!standard) return ""
  return /^\d/.test(standard) ? `Class ${standard}` : standard
}

/** Price a student pays to get in: the bundle fee for bundle-only subject tests. */
export function entryPrice(item: TestCatalogItem): number {
  if (item.type === "SINGLE_TEST" && item.isStandalone === false) {
    return item.parentBundlePrice ?? 0
  }
  return item.price
}

export function matchesCatalogFormat(
  item: TestCatalogItem,
  format: CatalogFormat
): boolean {
  if (format === "ALL") return true
  return format === "BUNDLE"
    ? item.type === "BUNDLE"
    : item.type !== "BUNDLE"
}

export function matchesCatalogPricing(
  item: TestCatalogItem,
  pricing: CatalogPricing
): boolean {
  if (pricing === "ALL") return true
  return pricing === "FREE" ? entryPrice(item) === 0 : entryPrice(item) > 0
}

const iso = (d: DateLike) => (d ? new Date(d).toISOString() : new Date().toISOString())

export function buildCatalogItems(
  seriesList: SeriesRecord[],
  standaloneTests: TestRecord[]
): TestCatalogItem[] {
  const items = new Map<string, TestCatalogItem>()

  const testItem = (
    t: TestRecord,
    series?: SeriesRecord
  ): TestCatalogItem => ({
    id: t.id,
    title: t.title,
    slug: t.slug || t.id,
    description: t.description || series?.description || "",
    price: t.price ?? 0,
    maxMarks: t.maxMarks ?? 80,
    durationMinutes: t.durationMinutes ?? 180,
    maxAttempts: t.maxAttempts ?? 3,
    studentInstructions: t.studentInstructions || "",
    type: "SINGLE_TEST",
    standard: series?.standard || undefined,
    stream: series?.stream || null,
    subject: t.subject,
    isStandalone: t.isStandalone !== false,
    parentSeriesId: series?.id ?? null,
    parentSeriesTitle: series?.title ?? null,
    parentBundlePrice: series ? resolveEffectiveBundlePrice(series) : null,
    createdAt: iso(t.createdAt ?? series?.createdAt),
  })

  for (const s of seriesList) {
    const children = (s.tests || []).filter((t) => t.isPublished !== false)
    const isBundle = s.type === "BUNDLE" || children.length > 1
    const bundlePrice = resolveEffectiveBundlePrice(s)

    if (isBundle) {
      const summary = computeSeriesPricingSummary(bundlePrice, children)
      items.set(s.id, {
        id: s.id,
        title: s.title,
        slug: s.slug || s.id,
        description: s.description || "",
        price: bundlePrice,
        bundlePrice,
        maxMarks:
          children.reduce((sum, t) => sum + (t.maxMarks ?? 0), 0) ||
          s.maxMarks ||
          100,
        durationMinutes:
          children.reduce((sum, t) => sum + (t.durationMinutes ?? 0), 0) ||
          s.durationMinutes ||
          180,
        maxAttempts: s.maxAttempts ?? 3,
        studentInstructions: s.studentInstructions || "",
        type: "BUNDLE",
        standard: s.standard || undefined,
        stream: s.stream || null,
        subject: "All Subjects",
        testsCount: children.length,
        includedSubjects: Array.from(new Set(children.map((t) => t.subject))),
        badge: s.badge || undefined,
        individualTotalPrice: summary.individualTotalPaise,
        savingsAmount: summary.savingsPaise,
        createdAt: iso(s.createdAt),
      })
    }

    if (children.length > 0) {
      for (const t of children) items.set(t.id, testItem(t, s))
    } else if (!isBundle) {
      // Legacy single-subject series with no child Test rows.
      items.set(s.id, {
        id: s.id,
        title: s.title,
        slug: s.slug || s.id,
        description: s.description || "",
        price: bundlePrice,
        maxMarks: s.maxMarks ?? 100,
        durationMinutes: s.durationMinutes ?? 180,
        maxAttempts: s.maxAttempts ?? 3,
        studentInstructions: s.studentInstructions || "",
        type: "SINGLE_TEST",
        standard: s.standard || undefined,
        stream: s.stream || null,
        isStandalone: true,
        createdAt: iso(s.createdAt),
      })
    }
  }

  for (const t of standaloneTests) {
    if (t.isPublished === false || items.has(t.id)) continue
    items.set(t.id, testItem(t))
  }

  return Array.from(items.values())
}
