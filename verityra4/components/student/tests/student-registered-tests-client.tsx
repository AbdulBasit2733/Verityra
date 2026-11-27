"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, BookOpen, Layers, Play, Target } from "lucide-react"
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
import type { FlattenedSubjectTestRow } from "@/lib/student-test-display"

export type RegisteredTestRow = FlattenedSubjectTestRow

function formatStudentTestStatus(status: string | null | undefined): string {
  if (!status || status === "NOT_STARTED") return "Not submitted yet"
  if (status === "PENDING") return "Queued"
  if (status === "PROCESSING") return "Evaluating"
  if (status === "COMPLETED") return "Evaluated"
  if (status === "REVIEW_REQUIRED") return "Under review"
  if (status === "FAILED") return "Needs retry"
  return status
}

export function StudentRegisteredTestsClient({
  tests,
  title = "My Subject Tests",
  subtitle = "Download your question paper, submit your answer sheet (max 10 MB), and view your latest evaluated marks.",
  emptyTitle = "No subject tests yet",
  emptyDescription = "Explore the catalog to enroll in a subject test.",
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
        header: "Subject test",
        sortable: true,
        sortAccessor: (row) => row.testTitle,
        searchAccessor: (row) =>
          `${row.testTitle} ${row.subject || ""} ${row.standard || ""}`,
        cell: (row) => {
          const targetHref = `/student/tests/${row.testId || row.testSeriesId}`
          return (
            <div className="space-y-1.5 whitespace-normal">
              <div className="flex flex-wrap items-center gap-1.5">
                {row.subject && (
                  <Badge variant="secondary" className="text-xs font-medium">
                    {row.subject}
                  </Badge>
                )}
                {row.standard && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {row.standard.startsWith("Class")
                      ? row.standard
                      : `Class ${row.standard}`}
                  </Badge>
                )}
              </div>

              <Link
                href={targetHref}
                className="block text-sm font-bold leading-snug text-foreground transition-colors hover:text-primary"
              >
                {row.testTitle}
              </Link>

              <p className="text-xs text-muted-foreground">
                Upload answer sheet (PDF or image, max 10 MB)
              </p>
            </div>
          )
        },
      },
      {
        id: "marks",
        header: "Marks",
        sortable: true,
        sortAccessor: (row) => row.latestPercentage ?? -1,
        cell: (row) =>
          row.latestMarksAwarded !== null ? (
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-primary tabular-nums">
                {row.latestMarksAwarded} / {row.maxMarks}
              </p>
              {row.latestPercentage !== null && (
                <p className="text-xs text-muted-foreground tabular-nums">
                  {row.latestPercentage.toFixed(1)}%
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-muted-foreground tabular-nums">
                — / {row.maxMarks}
              </p>
              <p className="text-xs text-muted-foreground">Not evaluated yet</p>
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
              <div className="flex justify-between text-xs tabular-nums">
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
        header: "Status",
        sortable: true,
        sortAccessor: (row) => row.latestStatus || "NOT_STARTED",
        cell: (row) => (
          <Badge variant="outline" className="text-xs font-normal">
            {formatStudentTestStatus(row.latestStatus)}
          </Badge>
        ),
      },
      {
        id: "registeredAt",
        header: "Enrolled",
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
          const targetUrl = `/student/tests/${row.testId || row.testSeriesId}`

          return (
            <IconActionButton
              label={
                row.submissionCount
                  ? "Submit next answer sheet attempt"
                  : "Submit answer sheet"
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
        id: "marksState",
        label: "Marks",
        accessor: (row) =>
          row.latestMarksAwarded !== null ? "EVALUATED" : "PENDING",
        options: [
          { label: "Evaluated marks available", value: "EVALUATED" },
          { label: "Not evaluated yet", value: "PENDING" },
        ],
      },
      {
        id: "quota",
        label: "Attempts",
        accessor: (row) =>
          row.attemptsUsed >= row.maxAttempts ? "EXHAUSTED" : "AVAILABLE",
        options: [
          { label: "Attempts available", value: "AVAILABLE" },
          { label: "All attempts used", value: "EXHAUSTED" },
        ],
      },
    ],
    []
  )

  const { attemptsRemaining, activeTests, evaluatedTests } =
    React.useMemo(() => {
      return {
        attemptsRemaining: tests.reduce(
          (total, row) =>
            total + Math.max(0, row.maxAttempts - row.attemptsUsed),
          0
        ),
        activeTests: tests.filter((row) => row.attemptsUsed < row.maxAttempts)
          .length,
        evaluatedTests: tests.filter((row) => row.latestMarksAwarded !== null)
          .length,
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
          label="Subject tests"
          value={tests.length}
          subtext="Available in your workspace"
          icon={BookOpen}
          variant="blue"
        />
        <KpiStatCard
          label="Attempts remaining"
          value={attemptsRemaining}
          subtext={`${activeTests} subject tests open for submission`}
          icon={Layers}
          variant="amber"
        />
        <KpiStatCard
          label="Evaluated tests"
          value={evaluatedTests}
          subtext="Latest marks ready to view"
          icon={Target}
          variant="emerald"
        />
      </div>
      <DataTable
        data={tests}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchPlaceholder="Search subject tests..."
        filters={filters}
        defaultSortColumn="registeredAt"
        defaultSortDirection="desc"
        defaultPageSize={10}
        showSerialNumber
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={
          <Link href="/tests">
            <Button size="sm">Browse catalog</Button>
          </Link>
        }
        renderCard={(row) => (
          <div className="space-y-4 border-b border-border px-1 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1">
                {row.subject && (
                  <Badge variant="secondary" className="text-xs font-medium">
                    {row.subject}
                  </Badge>
                )}
                <p className="text-sm font-bold leading-snug text-foreground">
                  {row.testTitle}
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs font-normal">
                {formatStudentTestStatus(row.latestStatus)}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between rounded-md border border-border bg-card px-3 py-2.5">
              <span className="text-xs text-muted-foreground">
                Latest marks
              </span>
              {row.latestMarksAwarded !== null ? (
                <span className="text-sm font-bold text-primary tabular-nums">
                  {row.latestMarksAwarded} / {row.maxMarks}
                  {row.latestPercentage !== null
                    ? ` (${row.latestPercentage.toFixed(1)}%)`
                    : ""}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground tabular-nums">
                  — / {row.maxMarks} (Not evaluated yet)
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs tabular-nums">
                <span>
                  {row.attemptsUsed} / {row.maxAttempts} attempts used
                </span>
                <span>
                  {Math.max(0, row.maxAttempts - row.attemptsUsed)} left
                </span>
              </div>
              <Progress value={row.attemptsUsed} max={row.maxAttempts} />
            </div>

            <Link
              href={`/student/tests/${row.testId || row.testSeriesId}`}
              className="block"
            >
              <Button
                disabled={row.attemptsUsed >= row.maxAttempts}
                className="w-full gap-2"
              >
                {row.submissionCount
                  ? "Submit next attempt"
                  : "Submit answer sheet"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      />
    </div>
  )
}
