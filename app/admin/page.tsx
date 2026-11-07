import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { EvaluationStatus, PaymentStatus, Role, TestSeriesStatus } from "@prisma/client"
import {
  AdminAnalytics,
  AdminOverviewClient,
  DailyPoint,
} from "@/components/admin-overview-client"

export const dynamic = "force-dynamic"

const DAYS = 60 // 2 × 30-day windows so the UI can show period-over-period deltas
const GRADED = [
  EvaluationStatus.COMPLETED,
  EvaluationStatus.APPROVED,
  EvaluationStatus.ADJUSTED,
]

const dayKey = (d: Date) => d.toISOString().slice(0, 10)

function emptyDaily(): DailyPoint[] {
  const start = new Date()
  start.setUTCHours(0, 0, 0, 0)
  start.setUTCDate(start.getUTCDate() - (DAYS - 1))
  return Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start)
    d.setUTCDate(start.getUTCDate() + i)
    return { date: dayKey(d), revenue: 0, submissions: 0, registrations: 0, students: 0 }
  })
}

function demoAnalytics(): AdminAnalytics {
  let seed = 7
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const daily = emptyDaily().map((p, i) => {
    const wave = 1 + Math.sin(i / 4) * 0.3 + i / 120
    return {
      ...p,
      revenue: Math.round(rnd() * 900 * wave) * 10,
      submissions: Math.round(rnd() * 9 * wave),
      registrations: Math.round(rnd() * 6 * wave),
      students: Math.round(rnd() * 4 * wave),
    }
  })
  return {
    totals: {
      students: 148, registrations: 286, submissions: 412, publishedTests: 6,
      draftTests: 2, pendingReviews: 5, flaggedEvaluations: 9, revenue: 124700,
      refunded: 3980, avgScore: 61.4, failedJobs: 2,
    },
    daily,
    submissionStatus: [
      { label: "COMPLETED", value: 318 }, { label: "PROCESSING", value: 21 },
      { label: "REVIEW_REQUIRED", value: 5 }, { label: "FAILED", value: 4 },
      { label: "PENDING", value: 64 },
    ],
    evaluationStatus: [
      { label: "APPROVED", value: 210 }, { label: "COMPLETED", value: 96 },
      { label: "ADJUSTED", value: 12 }, { label: "REVIEW_REQUIRED", value: 5 },
      { label: "PROCESSING", value: 8 }, { label: "FAILED", value: 3 },
    ],
    paymentStatus: [
      { label: "COMPLETED", value: 262 }, { label: "PENDING", value: 14 },
      { label: "FAILED", value: 9 }, { label: "REFUNDED", value: 6 },
    ],
    attempts: [
      { label: "Attempt 1", value: 238 }, { label: "Attempt 2", value: 122 },
      { label: "Attempt 3", value: 52 },
    ],
    jobs: [
      { label: "COMPLETED", value: 391 }, { label: "QUEUED", value: 12 },
      { label: "RETRYING", value: 4 }, { label: "FAILED", value: 2 },
    ],
    scoreBuckets: [1, 3, 6, 14, 29, 52, 71, 58, 31, 9].map((v, i) => ({
      label: `${i * 10}–${i === 9 ? 100 : i * 10 + 10}`, value: v,
    })),
    topTests: [
      { title: "UPSC GS Paper I Mock", registrations: 96, submissions: 148 },
      { title: "State PCS Essay Series", registrations: 71, submissions: 102 },
      { title: "Judicial Services Law I", registrations: 58, submissions: 84 },
      { title: "UPSC Ethics Paper IV", registrations: 41, submissions: 53 },
      { title: "CSAT Writing Drill", registrations: 20, submissions: 25 },
    ],
  }
}

async function loadAnalytics(): Promise<AdminAnalytics> {
  const since = new Date()
  since.setUTCHours(0, 0, 0, 0)
  since.setUTCDate(since.getUTCDate() - (DAYS - 1))

  const [
    students, published, drafts, registrations, submissions, pendingReviews,
    flagged, paid, refunds, avgScore,
    payRecent, regRecent, subRecent, stuRecent,
    subStatus, evalStatus, payStatus, attemptGroup, jobGroup,
    scoreRows, topTests,
  ] = await Promise.all([
    prisma.user.count({ where: { role: Role.STUDENT } }),
    prisma.testSeries.count({ where: { status: TestSeriesStatus.PUBLISHED } }),
    prisma.testSeries.count({ where: { status: TestSeriesStatus.DRAFT } }),
    prisma.testRegistration.count(),
    prisma.submission.count(),
    prisma.evaluation.count({ where: { status: EvaluationStatus.REVIEW_REQUIRED } }),
    prisma.evaluation.count({ where: { uncertaintyFlag: true } }),
    prisma.payment.aggregate({ where: { status: PaymentStatus.COMPLETED }, _sum: { amount: true } }),
    prisma.paymentRefund.aggregate({ _sum: { amount: true } }),
    prisma.evaluation.aggregate({ where: { status: { in: GRADED } }, _avg: { percentage: true } }),

    prisma.payment.findMany({
      where: { status: PaymentStatus.COMPLETED, createdAt: { gte: since } },
      select: { createdAt: true, amount: true },
    }),
    prisma.testRegistration.findMany({
      where: { registeredAt: { gte: since } },
      select: { registeredAt: true },
    }),
    prisma.submission.findMany({
      where: { submittedAt: { gte: since } },
      select: { submittedAt: true },
    }),
    prisma.user.findMany({
      where: { role: Role.STUDENT, createdAt: { gte: since } },
      select: { createdAt: true },
    }),

    prisma.submission.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.evaluation.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.payment.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.submission.groupBy({ by: ["attemptNumber"], _count: { _all: true } }),
    prisma.evaluationJob.groupBy({ by: ["status"], _count: { _all: true } }),

    prisma.evaluation.findMany({
      where: { status: { in: GRADED } },
      select: { percentage: true },
      orderBy: { createdAt: "desc" },
      take: 5000,
    }),
    prisma.testSeries.findMany({
      orderBy: { registrations: { _count: "desc" } },
      take: 5,
      select: { title: true, _count: { select: { registrations: true, submissions: true } } },
    }),
  ])

  // Daily buckets
  const daily = emptyDaily()
  const index = new Map(daily.map((p, i) => [p.date, i]))
  const bump = (d: Date, key: "revenue" | "submissions" | "registrations" | "students", n = 1) => {
    const i = index.get(dayKey(d))
    if (i !== undefined) daily[i][key] += n
  }
  payRecent.forEach((p) => bump(p.createdAt, "revenue", p.amount / 100))
  regRecent.forEach((r) => bump(r.registeredAt, "registrations"))
  subRecent.forEach((s) => bump(s.submittedAt, "submissions"))
  stuRecent.forEach((u) => bump(u.createdAt, "students"))

  // Score histogram (10 buckets)
  const buckets = Array.from({ length: 10 }, (_, i) => ({
    label: `${i * 10}–${i === 9 ? 100 : i * 10 + 10}`,
    value: 0,
  }))
  scoreRows.forEach((r) => {
    const b = Math.min(9, Math.max(0, Math.floor(r.percentage / 10)))
    buckets[b].value += 1
  })

  const slices = (rows: { status: string; _count: { _all: number } }[]) =>
    rows.map((r) => ({ label: String(r.status), value: r._count._all }))

  const jobs = slices(jobGroup)

  return {
    totals: {
      students,
      registrations,
      submissions,
      publishedTests: published,
      draftTests: drafts,
      pendingReviews,
      flaggedEvaluations: flagged,
      revenue: (paid._sum.amount || 0) / 100,
      refunded: (refunds._sum.amount || 0) / 100,
      avgScore: Math.round((avgScore._avg.percentage || 0) * 10) / 10,
      failedJobs: jobs.find((j) => j.label === "FAILED")?.value ?? 0,
    },
    daily,
    submissionStatus: slices(subStatus),
    evaluationStatus: slices(evalStatus),
    paymentStatus: slices(payStatus),
    attempts: attemptGroup
      .sort((a, b) => a.attemptNumber - b.attemptNumber)
      .map((r) => ({ label: `Attempt ${r.attemptNumber}`, value: r._count._all })),
    jobs,
    scoreBuckets: buckets,
    topTests: topTests.map((t) => ({
      title: t.title,
      registrations: t._count.registrations,
      submissions: t._count.submissions,
    })),
  }
}

export default async function AdminDashboardPage() {
  const dbConnected = await isDatabaseConnected()
  const analytics = dbConnected ? await loadAnalytics() : demoAnalytics()

  return <AdminOverviewClient analytics={analytics} isDemo={!dbConnected} />
}