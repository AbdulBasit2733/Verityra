"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CreditCard,
  FileCheck2,
  LayoutDashboard,
  Plus,
  Sparkles,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface DailyPoint {
  date: string // YYYY-MM-DD (UTC)
  revenue: number // rupees
  submissions: number
  registrations: number
  students: number
}
export interface Slice {
  label: string
  value: number
}
export interface AdminAnalytics {
  totals: {
    students: number
    registrations: number
    submissions: number
    publishedTests: number
    draftTests: number
    pendingReviews: number
    flaggedEvaluations: number
    revenue: number
    refunded: number
    avgScore: number
    failedJobs: number
  }
  daily: DailyPoint[] // 60 days, oldest → newest
  submissionStatus: Slice[]
  evaluationStatus: Slice[]
  paymentStatus: Slice[]
  attempts: Slice[]
  jobs: Slice[]
  scoreBuckets: Slice[]
  topTests: { title: string; registrations: number; submissions: number }[]
}

type MetricKey = "revenue" | "submissions" | "registrations" | "students"

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]
const fmtDay = (iso: string) =>
  `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]}`
const fmtNum = (n: number) =>
  new Intl.NumberFormat("en-IN").format(Math.round(n))
const fmtINR = (n: number) => `₹${fmtNum(n)}`
const fmtCompact = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n)
const sum = (a: number[]) => a.reduce((x, y) => x + y, 0)
const title = (s: string) =>
  s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())

function delta(cur: number, prev: number): number | null {
  if (prev === 0) return cur === 0 ? 0 : null
  return ((cur - prev) / prev) * 100
}

function niceMax(v: number) {
  const p = 10 ** Math.floor(Math.log10(v))
  for (const s of [1, 2, 2.5, 5, 10]) if (v <= s * p) return s * p
  return 10 * p
}

const STATUS_COLOR: Record<string, string> = {
  COMPLETED: "var(--chart-3)",
  APPROVED: "var(--chart-3)",
  ADJUSTED: "var(--chart-2)",
  PROCESSING: "var(--chart-1)",
  QUEUED: "var(--chart-2)",
  PENDING: "var(--chart-2)",
  AUTHORIZED: "var(--chart-2)",
  RETRYING: "var(--chart-4)",
  REVIEW_REQUIRED: "var(--chart-4)",
  PARTIALLY_REFUNDED: "var(--chart-4)",
  REFUND_PENDING: "var(--chart-4)",
  REFUNDED: "var(--chart-4)",
  FAILED: "var(--chart-5)",
}
const FALLBACK = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]
const colorFor = (label: string, i: number) =>
  STATUS_COLOR[label] ?? FALLBACK[i % FALLBACK.length]

/* ------------------------------------------------------------------ */
/* Primitives                                                         */
/* ------------------------------------------------------------------ */

function Panel({
  title: heading,
  subtitle,
  action,
  className,
  children,
}: {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      className={cn(
        "rounded-md border border-border bg-card p-5 shadow-none sm:p-6",
        className
      )}
    >
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-heading text-base font-bold text-foreground">
            {heading}
          </h2>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action}
      </header>
      {children}
    </section>
  )
}

function Segmented<T extends string | number>({
  value,
  onChange,
  options,
  label,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
  label: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex rounded-md border border-border bg-muted p-0.5"
    >
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-0 rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors",
            o.value === value
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Empty({ text = "No data yet" }: { text?: string }) {
  return (
    <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
      {text}
    </div>
  )
}

function Legend({
  items,
}: {
  items: { label: string; value: number; color: string }[]
}) {
  const total = sum(items.map((i) => i.value)) || 1
  return (
    <ul className="space-y-2">
      {items.map((i) => (
        <li
          key={i.label}
          className="flex items-center justify-between gap-3 text-xs"
        >
          <span className="flex min-w-0 items-center gap-2 text-muted-foreground">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: i.color }}
            />
            <span className="truncate">{title(i.label)}</span>
          </span>
          <span className="shrink-0 font-semibold text-foreground">
            {fmtNum(i.value)}
            <span className="ml-1.5 font-normal text-muted-foreground">
              {Math.round((i.value / total) * 100)}%
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------------ */
/* Charts (dependency-free SVG)                                       */
/* ------------------------------------------------------------------ */

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const id = React.useId().replace(/:/g, "")
  const W = 120
  const H = 36
  const max = Math.max(...data, 1)
  const pts = data.map((v, i) => [
    data.length <= 1 ? 0 : (i * W) / (data.length - 1),
    H - 3 - (v / max) * (H - 6),
  ])
  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ")
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-9 w-full"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${line} L${W} ${H} L0 ${H} Z`} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

function AreaChart({
  series,
  compare,
  labels,
  format,
  color = "var(--chart-1)",
  name,
}: {
  series: number[]
  compare?: number[]
  labels: string[]
  format: (n: number) => string
  color?: string
  name: string
}) {
  const id = React.useId().replace(/:/g, "")
  const [hover, setHover] = React.useState<number | null>(null)
  const W = 640
  const H = 260
  const P = { l: 46, r: 12, t: 14, b: 28 }
  const max = niceMax(Math.max(...series, ...(compare ?? []), 1))
  const x = (i: number) =>
    P.l + (series.length <= 1 ? 0 : (i * (W - P.l - P.r)) / (series.length - 1))
  const y = (v: number) => P.t + (H - P.t - P.b) * (1 - v / max)
  const path = (arr: number[]) =>
    arr
      .map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
      .join(" ")
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max)
  const step = Math.ceil(series.length / 6)

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((px - P.l) / (W - P.l - P.r)) * (series.length - 1))
    setHover(Math.min(series.length - 1, Math.max(0, i)))
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        role="img"
        aria-label={`${name} over time`}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={P.l}
              x2={W - P.r}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--border)"
              strokeDasharray={t === 0 ? undefined : "3 4"}
            />
            <text
              x={P.l - 8}
              y={y(t) + 4}
              textAnchor="end"
              fontSize="10.5"
              fill="var(--muted-foreground)"
            >
              {fmtCompact(t)}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % step === 0 || i === labels.length - 1 ? (
            <text
              key={l + i}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              fontSize="10.5"
              fill="var(--muted-foreground)"
            >
              {l}
            </text>
          ) : null
        )}
        {compare && (
          <path
            d={path(compare)}
            fill="none"
            stroke="var(--muted-foreground)"
            strokeOpacity="0.55"
            strokeWidth="1.75"
            strokeDasharray="4 4"
          />
        )}
        <path
          d={`${path(series)} L${x(series.length - 1)} ${y(0)} L${x(0)} ${y(0)} Z`}
          fill={`url(#${id})`}
        />
        <path
          d={path(series)}
          fill="none"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {hover !== null && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={P.t}
              y2={H - P.b}
              stroke={color}
              strokeOpacity="0.4"
            />
            <circle
              cx={x(hover)}
              cy={y(series[hover])}
              r="5"
              fill="var(--card)"
              stroke={color}
              strokeWidth="2.5"
            />
          </g>
        )}
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute top-1 z-10 -translate-x-1/2 rounded-sm border border-border bg-popover px-3 py-2 text-xs shadow-sm"
          style={{
            left: `${Math.min(88, Math.max(12, (x(hover) / W) * 100))}%`,
          }}
        >
          <p className="font-semibold text-foreground">{labels[hover]}</p>
          <p className="mt-0.5 text-muted-foreground">
            {name}:{" "}
            <span className="font-bold text-foreground">
              {format(series[hover])}
            </span>
          </p>
          {compare && (
            <p className="text-muted-foreground">
              Previous:{" "}
              <span className="font-semibold text-foreground">
                {format(compare[hover])}
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function Donut({
  items,
  centerLabel,
}: {
  items: { label: string; value: number; color: string }[]
  centerLabel: string
}) {
  const total = sum(items.map((i) => i.value))
  let acc = 0
  return (
    <div className="relative mx-auto h-44 w-44">
      <svg
        viewBox="0 0 36 36"
        className="h-full w-full -rotate-90"
        role="img"
        aria-label={centerLabel}
      >
        <circle
          cx="18"
          cy="18"
          r="15.9155"
          fill="none"
          stroke="var(--muted)"
          strokeWidth="4"
        />
        {total > 0 &&
          items.map((i) => {
            const pct = (i.value / total) * 100
            const el = (
              <circle
                key={i.label}
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke={i.color}
                strokeWidth="4"
                strokeDasharray={`${Math.max(pct - 0.8, 0)} ${100 - Math.max(pct - 0.8, 0)}`}
                strokeDashoffset={-acc}
              />
            )
            acc += pct
            return el
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-2xl font-extrabold text-foreground">
          {fmtNum(total)}
        </span>
        <span className="text-[11px] text-muted-foreground">{centerLabel}</span>
      </div>
    </div>
  )
}

function Ring({
  value,
  color = "var(--chart-1)",
}: {
  value: number
  color?: string
}) {
  const v = Math.min(100, Math.max(0, value))
  return (
    <svg
      viewBox="0 0 36 36"
      className="h-14 w-14 -rotate-90"
      aria-hidden="true"
    >
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        fill="none"
        stroke="var(--muted)"
        strokeWidth="4"
      />
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        fill="none"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${v} ${100 - v}`}
      />
    </svg>
  )
}

function StackedBar({
  items,
}: {
  items: { label: string; value: number; color: string }[]
}) {
  const total = sum(items.map((i) => i.value))
  if (!total) return <Empty />
  return (
    <div
      className="flex h-3 w-full overflow-hidden rounded-full bg-muted"
      role="img"
      aria-label="Distribution"
    >
      {items.map((i) => (
        <div
          key={i.label}
          title={`${title(i.label)}: ${i.value}`}
          style={{ width: `${(i.value / total) * 100}%`, background: i.color }}
        />
      ))}
    </div>
  )
}

function HBars({
  items,
}: {
  items: { label: string; value: number; sub?: string; color?: string }[]
}) {
  const max = Math.max(...items.map((i) => i.value), 1)
  return (
    <ul className="space-y-4">
      {items.map((i, idx) => (
        <li key={i.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-xs">
            <span className="truncate font-semibold text-foreground">
              {i.label}
            </span>
            <span className="shrink-0 text-muted-foreground">
              <strong className="text-foreground">{fmtNum(i.value)}</strong>
              {i.sub ? ` · ${i.sub}` : ""}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(i.value / max) * 100}%`,
                background: i.color ?? FALLBACK[idx % 5],
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

function Histogram({ buckets }: { buckets: Slice[] }) {
  const max = Math.max(...buckets.map((b) => b.value), 1)
  const total = sum(buckets.map((b) => b.value))
  if (!total) return <Empty text="No graded answers yet" />
  return (
    <div>
      <div className="flex h-44 items-end gap-1.5">
        {buckets.map((b, i) => {
          const low = i < 4
          const mid = i >= 4 && i < 7
          return (
            <div
              key={b.label}
              className="group relative flex h-full flex-1 flex-col justify-end"
            >
              <span className="pointer-events-none absolute -top-1 left-1/2 z-10 hidden -translate-x-1/2 -translate-y-full rounded-md border border-border bg-popover px-2 py-1 text-[11px] font-semibold whitespace-nowrap shadow group-hover:block">
                {b.label}%: {b.value}
              </span>
              <div
                className="w-full rounded-t-md transition-opacity group-hover:opacity-80"
                style={{
                  height: `${Math.max((b.value / max) * 100, b.value ? 4 : 1)}%`,
                  background: low
                    ? "var(--chart-5)"
                    : mid
                      ? "var(--chart-4)"
                      : "var(--chart-3)",
                }}
              />
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-1.5">
        {buckets.map((b) => (
          <span
            key={b.label}
            className="flex-1 text-center text-[10px] text-muted-foreground"
          >
            {b.label.split("–")[0]}
          </span>
        ))}
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Score % band · {fmtNum(total)} graded answers
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Stat card                                                          */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  sub,
  change,
  icon: Icon,
  color,
  spark,
}: {
  label: string
  value: string
  sub: string
  change: number | null
  icon: LucideIcon
  color: string
  spark: number[]
}) {
  const up = (change ?? 0) >= 0
  return (
    <div className="flex flex-col justify-between rounded-md border border-border bg-card p-5 shadow-none">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="mt-1.5 truncate font-heading text-3xl font-extrabold tracking-tight text-foreground">
            {value}
          </p>
        </div>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm"
          style={{
            background: `color-mix(in srgb, ${color} 14%, transparent)`,
            color,
          }}
        >
          <Icon aria-hidden="true" className="h-5 w-5" />
        </span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0 text-xs">
          {change === null ? (
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> New
              activity
            </span>
          ) : (
            <span
              className={cn(
                "inline-flex items-center gap-0.5 font-bold",
                up
                  ? "text-emerald-700 dark:text-emerald-300"
                  : "text-rose-700 dark:text-rose-300"
              )}
            >
              {up ? (
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownRight aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              {Math.abs(change).toFixed(1)}%
              <span className="ml-1 font-normal text-muted-foreground">
                vs prev.
              </span>
            </span>
          )}
          <p className="mt-1 truncate text-muted-foreground">{sub}</p>
        </div>
        <div className="w-24 shrink-0 sm:w-28">
          <Sparkline data={spark} color={color} />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                          */
/* ------------------------------------------------------------------ */

const METRICS: Record<
  MetricKey,
  { label: string; color: string; format: (n: number) => string }
> = {
  revenue: { label: "Revenue", color: "var(--chart-3)", format: fmtINR },
  submissions: {
    label: "Submissions",
    color: "var(--chart-1)",
    format: fmtNum,
  },
  registrations: {
    label: "Enrollments",
    color: "var(--chart-2)",
    format: fmtNum,
  },
  students: {
    label: "New candidates",
    color: "var(--chart-4)",
    format: fmtNum,
  },
}

export function AdminOverviewClient({
  analytics: a,
  isDemo = false,
}: {
  analytics: AdminAnalytics
  isDemo?: boolean
}) {
  const [range, setRange] = React.useState<7 | 30>(30)
  const [metric, setMetric] = React.useState<MetricKey>("revenue")

  const cur = a.daily.slice(-range)
  const prev = a.daily.slice(-range * 2, -range)
  const col = (rows: DailyPoint[], k: MetricKey) => rows.map((r) => r[k])
  const labels = cur.map((r) => fmtDay(r.date))
  const m = METRICS[metric]

  const stat = (k: MetricKey) => ({
    now: sum(col(cur, k)),
    change: delta(sum(col(cur, k)), sum(col(prev, k))),
    spark: col(cur, k),
  })
  const rev = stat("revenue")
  const reg = stat("registrations")
  const sub = stat("submissions")
  const stu = stat("students")

  const subItems = a.submissionStatus.map((s, i) => ({
    ...s,
    color: colorFor(s.label, i),
  }))
  const evalItems = a.evaluationStatus.map((s, i) => ({
    ...s,
    color: colorFor(s.label, i),
  }))
  const payItems = a.paymentStatus.map((s, i) => ({
    ...s,
    color: colorFor(s.label, i),
  }))
  const jobItems = a.jobs.map((s, i) => ({ ...s, color: colorFor(s.label, i) }))

  const graded = sum(
    a.evaluationStatus
      .filter((e) => ["COMPLETED", "APPROVED", "ADJUSTED"].includes(e.label))
      .map((e) => e.value)
  )
  const evalTotal = sum(a.evaluationStatus.map((e) => e.value))
  const gradedRate = evalTotal ? Math.round((graded / evalTotal) * 100) : 0
  const attention = [
    {
      label: "Pending reviews",
      value: a.totals.pendingReviews,
      href: "/admin/submissions",
      tone: "var(--chart-4)",
    },
    {
      label: "Low-confidence evaluations",
      value: a.totals.flaggedEvaluations,
      href: "/admin/submissions",
      tone: "var(--chart-4)",
    },
    {
      label: "Failed AI jobs",
      value: a.totals.failedJobs,
      href: "/admin/submissions",
      tone: "var(--chart-5)",
    },
  ].filter((x) => x.value > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={LayoutDashboard}
        title="Analytics overview"
        subtitle="Revenue, enrollments, evaluation health and score trends"
      >
        <Segmented<7 | 30>
          label="Time range"
          value={range}
          onChange={setRange}
          options={[
            { value: 7, label: "7 days" },
            { value: 30, label: "30 days" },
          ]}
        />
        <Link href="/admin/test-series/new">
          <Button className="h-10 rounded-md bg-[#2A6AED] px-4 text-xs font-semibold text-white hover:bg-[#1E55C7] sm:text-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Create test series
          </Button>
        </Link>
      </PageHeader>

      {isDemo && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
          Database not connected — showing sample data.
        </p>
      )}

      {attention.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {attention.map((x) => (
            <Link
              key={x.label}
              href={x.href}
              className="group inline-flex items-center gap-3 rounded-md border border-border bg-card px-4 py-2.5 text-xs shadow-none transition-colors hover:border-[#2A6AED]"
            >
              <AlertTriangle
                aria-hidden="true"
                className="h-4 w-4"
                style={{ color: x.tone }}
              />
              <span className="font-extrabold text-foreground">{x.value}</span>
              <span className="text-muted-foreground">{x.label}</span>
              <ArrowRight
                aria-hidden="true"
                className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Revenue · ${range}d`}
          value={fmtINR(rev.now)}
          sub={`${fmtINR(a.totals.revenue)} lifetime`}
          change={rev.change}
          icon={CreditCard}
          color="var(--chart-3)"
          spark={rev.spark}
        />
        <StatCard
          label={`Enrollments · ${range}d`}
          value={fmtNum(reg.now)}
          sub={`${fmtNum(a.totals.registrations)} total`}
          change={reg.change}
          icon={BookOpen}
          color="var(--chart-2)"
          spark={reg.spark}
        />
        <StatCard
          label={`Submissions · ${range}d`}
          value={fmtNum(sub.now)}
          sub={`${fmtNum(a.totals.submissions)} total`}
          change={sub.change}
          icon={FileCheck2}
          color="var(--chart-1)"
          spark={sub.spark}
        />
        <StatCard
          label={`New candidates · ${range}d`}
          value={fmtNum(stu.now)}
          sub={`${fmtNum(a.totals.students)} registered`}
          change={stu.change}
          icon={Users}
          color="var(--chart-4)"
          spark={stu.spark}
        />
      </div>

      {/* Trend + submission status */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Performance trend"
          subtitle={`Daily ${m.label.toLowerCase()} · dashed line is the previous ${range} days`}
          action={
            <Segmented<MetricKey>
              label="Metric"
              value={metric}
              onChange={setMetric}
              options={(Object.keys(METRICS) as MetricKey[]).map((k) => ({
                value: k,
                label: METRICS[k].label,
              }))}
            />
          }
        >
          <AreaChart
            series={col(cur, metric)}
            compare={col(prev, metric)}
            labels={labels}
            format={m.format}
            color={m.color}
            name={m.label}
          />
        </Panel>

        <Panel title="Submission status" subtitle="All attempts, lifetime">
          {subItems.length ? (
            <div className="space-y-6">
              <Donut items={subItems} centerLabel="submissions" />
              <Legend items={subItems} />
            </div>
          ) : (
            <Empty />
          )}
        </Panel>
      </div>

      {/* Quality row */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          title="Score distribution"
          subtitle="How candidates score across graded answers"
        >
          <Histogram buckets={a.scoreBuckets} />
        </Panel>

        <Panel title="Evaluation pipeline" subtitle="AI grading health">
          <div className="mb-5 flex items-center gap-4">
            <div className="relative">
              <Ring value={gradedRate} color="var(--chart-3)" />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-foreground">
                {gradedRate}%
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">
                {fmtNum(graded)} graded
              </p>
              <p className="text-xs text-muted-foreground">
                of {fmtNum(evalTotal)} evaluations
              </p>
            </div>
          </div>
          <StackedBar items={evalItems} />
          <div className="mt-5">
            <Legend items={evalItems} />
          </div>
          {jobItems.length > 0 && (
            <div className="mt-6 border-t border-border pt-5">
              <p className="mb-3 text-xs font-semibold text-muted-foreground">
                Background jobs
              </p>
              <StackedBar items={jobItems} />
              <div className="mt-4">
                <Legend items={jobItems} />
              </div>
            </div>
          )}
        </Panel>

        <Panel
          title="Quality at a glance"
          subtitle="Average score and attempt usage"
        >
          <div className="flex items-center gap-4 pt-1">
            <div className="relative">
              <Ring value={a.totals.avgScore} />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-extrabold text-foreground">
                {a.totals.avgScore}%
              </span>
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Average score</p>
              <p className="text-xs text-muted-foreground">
                {a.totals.publishedTests} published · {a.totals.draftTests}{" "}
                draft tests
              </p>
            </div>
          </div>
          <p className="mt-6 mb-3 text-xs font-semibold text-muted-foreground">
            Attempts used
          </p>
          {a.attempts.length ? (
            <HBars
              items={a.attempts.map((x, i) => ({
                label: x.label,
                value: x.value,
                color: FALLBACK[i],
              }))}
            />
          ) : (
            <Empty />
          )}
        </Panel>
      </div>

      {/* Tests + payments */}
      <div className="grid gap-4 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Top test series"
          subtitle="Ranked by enrollments"
          action={
            <Link
              href="/admin/test-series"
              className="inline-flex items-center text-xs font-semibold text-[#2A6AED] hover:underline dark:text-blue-400"
            >
              Manage{" "}
              <ArrowRight aria-hidden="true" className="ml-1 h-3.5 w-3.5" />
            </Link>
          }
        >
          {a.topTests.length ? (
            <HBars
              items={a.topTests.map((t, i) => ({
                label: t.title,
                value: t.registrations,
                sub: `${fmtNum(t.submissions)} submissions`,
                color: FALLBACK[i % 5],
              }))}
            />
          ) : (
            <Empty text="No test series yet" />
          )}
        </Panel>

        <Panel
          title="Payments"
          subtitle={`${fmtINR(a.totals.refunded)} refunded to date`}
        >
          {payItems.length ? (
            <div className="space-y-6">
              <Donut items={payItems} centerLabel="orders" />
              <Legend items={payItems} />
            </div>
          ) : (
            <Empty />
          )}
        </Panel>
      </div>
    </div>
  )
}
