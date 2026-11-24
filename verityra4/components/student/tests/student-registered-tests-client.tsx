"use client"

import * as React from "react"
import Link from "next/link"
import {
  Award,
  ArrowRight,
  BookOpen,
  Clock,
  Layers,
  Play,
  Target,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconActionButton } from "@/components/ui/icon-action-button"
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
} from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { Progress } from "@/components/ui/progress"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"

export interface ChildSubjectTest {
  id: string
  title: string
  subject: string
  maxMarks: number
  durationMinutes: number
  hasSubmitted?: boolean
}

export interface RegisteredTestRow {
  id: string
  testSeriesId: string
  testId?: string | null
  testTitle: string
  subject?: string | null
  standard?: string | null
  isBundle: boolean
  bundleBadge?: string | null
  childTests?: ChildSubjectTest[]
  maxMarks: number
  durationMinutes: number
  attemptsUsed: number
  maxAttempts: number
  registeredAt: string
  submissionCount: number
  latestStatus: string | null
  price?: number
  isPaid?: boolean
}

export function StudentRegisteredTestsClient({
  tests,
  title = "My Tests",
  subtitle = "Access your registered test series and take your next attempt.",
  emptyTitle = "No tests yet",
  emptyDescription = "Explore the catalog and register for a test series.",
}: {
  tests: RegisteredTestRow[]
  title?: string
  subtitle?: string
  emptyTitle?: string
  emptyDescription?: string
}) {
  const columns: DataTableColumn<RegisteredTestRow>[] = React.useMemo(
    () => [
      {
        id: "test",
        header: "Test series",
        sortable: true,
        sortAccessor: (row) => row.testTitle,
        cell: (row) => (
          <div className="space-y-1.5 whitespace-normal">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge
                variant="outline"
                className={
                  row.isBundle
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[10px] font-bold"
                    : "bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800 text-[10px] font-bold"
                }
              >
                {row.isBundle ? "ALL-SUBJECTS BUNDLE" : `${row.subject || "SINGLE TEST"}`}
              </Badge>
              {row.standard && (
                <Badge variant="secondary" className="text-[10px] font-semibold">
                  {row.standard.startsWith("Class") ? row.standard : `Class ${row.standard}`}
                </Badge>
              )}
              {row.bundleBadge && (
                <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px] font-bold">
                  {row.bundleBadge}
                </Badge>
              )}
              {row.isPaid ? (
                <Badge
                  variant="default"
                  className="h-4.5 px-1.5 text-[10px] font-medium"
                >
                  Paid{" "}
                  {typeof row.price === "number" && row.price > 0
                    ? `(₹${Math.round(row.price / 100)})`
                    : ""}
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className="h-4.5 px-1.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950"
                >
                  Free
                </Badge>
              )}
            </div>

            <div>
              <Link
                href={`/student/tests/${row.testId || row.testSeriesId}`}
                className="font-bold text-sm text-foreground hover:text-primary transition-colors"
              >
                {row.testTitle}
              </Link>
            </div>

            {row.isBundle && row.childTests && row.childTests.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-[11px] font-medium text-muted-foreground">Papers:</span>
                {row.childTests.map((ct) => (
                  <Link
                    key={ct.id}
                    href={`/student/tests/${ct.id}`}
                    className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors font-medium shadow-2xs"
                  >
                    <span>{ct.subject}</span>
                    {ct.hasSubmitted ? (
                      <span className="text-[10px] text-emerald-600 font-bold" title="Submitted">✓</span>
                    ) : (
                      <span className="text-[9px] text-blue-500">→</span>
                    )}
                  </Link>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-0.5">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {row.durationMinutes} minutes
              </span>
              <span className="inline-flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-primary" />
                {row.maxMarks} marks
              </span>
            </div>
          </div>
        ),
      },
      {
        id: "attempts",
        header: "Attempts",
        sortable: true,
        sortAccessor: (row) => row.attemptsUsed,
        cell: (row) => {
          const remaining = Math.max(0, row.maxAttempts - row.attemptsUsed)
          return (
            <div className="w-36 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold">
                  {row.attemptsUsed} / {row.maxAttempts}
                </span>
                <span
                  className={remaining ? "text-chart-3" : "text-score-accent"}
                >
                  {remaining} left
                </span>
              </div>
              <Progress
                value={row.attemptsUsed}
                max={row.maxAttempts}
                indicatorClassName={
                  remaining ? "bg-primary" : "bg-score-accent"
                }
              />
            </div>
          )
        },
      },
      {
        id: "status",
        header: "Latest status",
        sortable: true,
        sortAccessor: (row) => row.latestStatus || "NOT_STARTED",
        cell: (row) => (
          <Badge variant="outline" className="text-xs">
            {row.latestStatus || "NOT_STARTED"}
          </Badge>
        ),
      },
      {
        id: "registeredAt",
        header: "Registered",
        sortable: true,
        sortAccessor: (row) => new Date(row.registeredAt).getTime(),
        cell: (row) => <FormattedDate date={row.registeredAt} />,
      },
      {
        id: "action",
        header: "Action",
        className: "text-right",
        headerClassName: "text-right",
        cell: (row) => {
          const canAttempt = row.attemptsUsed < row.maxAttempts
          const targetUrl = row.testId
            ? `/student/tests/${row.testId}`
            : `/student/tests/${row.testSeriesId}`

          return (
            <IconActionButton
              label={
                row.submissionCount ? "Give next test attempt" : "Take test"
              }
              render={<Link href={targetUrl} />}
              nativeButton={false}
              disabled={!canAttempt}
              className="bg-primary text-primary-foreground hover:bg-hover-accent"
            >
              <Play className="h-3.5 w-3.5" />
            </IconActionButton>
          )
        },
      },
    ],
    []
  )

  const filters: DataTableFilter<RegisteredTestRow>[] = React.useMemo(
    () => [
      {
        id: "format",
        label: "Enrollment Type",
        accessor: (row) => (row.isBundle ? "BUNDLE" : "SINGLE"),
        options: [
          { label: "All Enrollments", value: "ALL" },
          { label: "All-Subject Bundles", value: "BUNDLE" },
          { label: "Single Subject Tests", value: "SINGLE" },
        ],
      },
      {
        id: "type",
        label: "Test Type",
        accessor: (row) => (row.isPaid ? "PAID" : "FREE"),
        options: [
          { label: "Free Tests", value: "FREE" },
          { label: "Paid Tests", value: "PAID" },
        ],
      },
      {
        id: "status",
        label: "Test Status",
        accessor: (row) => row.latestStatus || "NOT_STARTED",
        options: [
          { label: "Not Started", value: "NOT_STARTED" },
          { label: "Submitted", value: "SUBMITTED" },
          { label: "Completed", value: "COMPLETED" },
          { label: "Processing", value: "PROCESSING" },
        ],
      },
      {
        id: "quota",
        label: "Attempt Quota",
        accessor: (row) =>
          row.attemptsUsed >= row.maxAttempts ? "EXHAUSTED" : "AVAILABLE",
        options: [
          { label: "Attempts Available", value: "AVAILABLE" },
          { label: "Quota Exhausted", value: "EXHAUSTED" },
        ],
      },
    ],
    []
  )

  const { attemptsRemaining, activeTests, submittedTests } =
    React.useMemo(() => {
      return {
        attemptsRemaining: tests.reduce(
          (total, row) =>
            total + Math.max(0, row.maxAttempts - row.attemptsUsed),
          0
        ),
        activeTests: tests.filter((row) => row.attemptsUsed < row.maxAttempts)
          .length,
        submittedTests: tests.filter((row) => row.submissionCount > 0).length,
      }
    }, [tests])

  return (
    <div className="space-y-6">
      <PageHeader icon={BookOpen} title={title} subtitle={subtitle}>
        <Link href="/tests">
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Explore catalog
          </Button>
        </Link>
      </PageHeader>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiStatCard
          label="Registered Tests"
          value={tests.length}
          subtext="Available in your workspace"
          icon={BookOpen}
          variant="blue"
        />
        <KpiStatCard
          label="Attempts Remaining"
          value={attemptsRemaining}
          subtext="Across all registered tests"
          icon={Layers}
          variant="amber"
        />
        <KpiStatCard
          label="Tests In Progress"
          value={submittedTests}
          subtext={`${activeTests} tests still available`}
          icon={Target}
          variant="emerald"
        />
      </div>
      <DataTable
        data={tests}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchPlaceholder={`Search ${title.toLowerCase()}...`}
        filters={filters}
        defaultSortColumn="registeredAt"
        defaultSortDirection="desc"
        defaultPageSize={10}
        showSerialNumber
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={
          <Link href="/tests">
            <Button size="sm">Browse test catalog</Button>
          </Link>
        }
        renderCard={(row) => (
          <div className="space-y-4 border-b border-border px-1 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{row.testTitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.durationMinutes} minutes · {row.maxMarks} marks
                </p>
              </div>
              <Badge variant="outline">
                {row.latestStatus || "NOT_STARTED"}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>
                  {row.attemptsUsed} / {row.maxAttempts} attempts used
                </span>
                <span>
                  {Math.max(0, row.maxAttempts - row.attemptsUsed)} left
                </span>
              </div>
              <Progress value={row.attemptsUsed} max={row.maxAttempts} />
            </div>
            <Link href={`/student/tests/${row.testSeriesId}`} className="block">
              <Button
                disabled={row.attemptsUsed >= row.maxAttempts}
                className="w-full gap-2"
              >
                {row.submissionCount ? "Give Test" : "Take Test"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      />
    </div>
  )
}
