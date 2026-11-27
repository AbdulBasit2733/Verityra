"use client"

import * as React from "react"
import Link from "next/link"
import { Award, Clock3, FileCheck2, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, type DataTableColumn } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { EvaluationFilterBar } from "./evaluation-filter-bar"
import { EvaluationStatusBadge } from "./evaluation-status-badge"
import { EvaluationSummaryCard } from "./evaluation-summary-card"
import type { StudentEvaluationRow } from "./types"

export function StudentEvaluationsClient({
  evaluations,
}: {
  evaluations: StudentEvaluationRow[]
}) {
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState("ALL")
  const [series, setSeries] = React.useState("ALL")
  const seriesOptions = React.useMemo(
    () =>
      Array.from(
        new Map(
          evaluations.map((item) => [
            item.testSeriesId,
            { id: item.testSeriesId, title: item.testTitle },
          ])
        ).values()
      ),
    [evaluations]
  )
  const filtered = React.useMemo(
    () =>
      evaluations.filter((item) => {
        const q = query.trim().toLowerCase()
        const matchesQuery =
          !q ||
          item.testTitle.toLowerCase().includes(q) ||
          (item.seriesTitle || "").toLowerCase().includes(q)
        const matchesStatus = status === "ALL" || item.status === status
        const matchesSeries = series === "ALL" || item.testSeriesId === series
        return matchesQuery && matchesStatus && matchesSeries
      }),
    [evaluations, query, series, status]
  )
  const completed = evaluations.filter((item) => item.score !== null)
  const average = completed.length
    ? completed.reduce((sum, item) => sum + (item.percentage || 0), 0) /
      completed.length
    : 0
  const best = completed.reduce(
    (max, item) => Math.max(max, item.percentage || 0),
    0
  )

  const columns = React.useMemo<DataTableColumn<StudentEvaluationRow>[]>(
    () => [
      {
        id: "test",
        header: "Subject test",
        sortable: true,
        sortAccessor: (row) => row.testTitle,
        cell: (row) => (
          <div className="min-w-0 space-y-1 whitespace-normal">
            {row.subject && (
              <Badge variant="secondary" className="text-xs font-medium">
                {row.subject}
              </Badge>
            )}
            <Link
              href={`/student/evaluations/${row.submissionId}`}
              className="block max-w-sm truncate text-sm font-bold leading-snug text-foreground transition-colors hover:text-primary"
            >
              {row.testTitle}
            </Link>
            <p className="text-xs text-muted-foreground tabular-nums">
              Attempt #{row.attemptNumber}
            </p>
          </div>
        ),
      },
      {
        id: "score",
        header: "Marks",
        sortable: true,
        sortAccessor: (row) => row.percentage ?? -1,
        cell: (row) =>
          row.score !== null ? (
            <div className="space-y-0.5">
              <p className="text-sm font-bold text-primary tabular-nums">
                {row.score} / {row.maxMarks}
              </p>
              <p className="text-xs text-muted-foreground tabular-nums">
                {row.percentage?.toFixed(1)}%
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-muted-foreground tabular-nums">
                —{row.maxMarks ? ` / ${row.maxMarks}` : ""}
              </p>
              <p className="text-xs text-muted-foreground">
                Pending evaluation
              </p>
            </div>
          ),
      },
      {
        id: "status",
        header: "Status",
        sortable: true,
        sortAccessor: (row) => row.status,
        cell: (row) => <EvaluationStatusBadge status={row.status} />,
      },
      {
        id: "submitted",
        header: "Submitted",
        sortable: true,
        sortAccessor: (row) => new Date(row.submittedAt),
        cell: (row) => <FormattedDate date={row.submittedAt} />,
      },
      {
        id: "action",
        header: "Action",
        className: "text-right",
        headerClassName: "text-right",
        cell: (row) => (
          <Button
            render={<Link href={`/student/evaluations/${row.submissionId}`} />}
            variant="outline"
            className="h-10 gap-2"
          >
            Open
            <TrendingUp className="h-4 w-4" aria-hidden="true" />
          </Button>
        ),
      },
    ],
    []
  )

  return (
    <div className="space-y-6">
      <PageHeader
        icon={FileCheck2}
        title="My Evaluations"
        subtitle="Review your finalized feedback and track how each attempt is progressing."
        showRefresh
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <KpiStatCard
          label="Total submissions"
          value={evaluations.length}
          subtext="Across your subject tests"
          icon={FileCheck2}
        />
        <KpiStatCard
          label="Average score"
          value={completed.length ? `${average.toFixed(1)}%` : "—"}
          subtext="Finalized evaluations"
          icon={Award}
          variant="indigo"
        />
        <KpiStatCard
          label="Best performance"
          value={completed.length ? `${best.toFixed(1)}%` : "—"}
          subtext="Personal high score"
          icon={TrendingUp}
          variant="emerald"
        />
      </div>
      <EvaluationFilterBar
        query={query}
        status={status}
        series={series}
        seriesOptions={seriesOptions}
        onQueryChange={setQuery}
        onStatusChange={setStatus}
        onSeriesChange={setSeries}
        onReset={() => {
          setQuery("")
          setStatus("ALL")
          setSeries("ALL")
        }}
      />
      {filtered.length > 0 ? (
        <>
          <div className="grid gap-4 md:hidden">
            {filtered.map((item) => (
              <EvaluationSummaryCard
                key={item.submissionId}
                evaluation={item}
              />
            ))}
          </div>
          <div className="hidden md:block">
            <DataTable
              data={filtered}
              columns={columns}
              keyExtractor={(row) => row.submissionId}
              defaultSortColumn="submitted"
              defaultSortDirection="desc"
              defaultPageSize={10}
              showSerialNumber={false}
              defaultViewMode="table"
            />
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-primary">
              <Clock3 className="h-6 w-6" aria-hidden="true" />
            </span>
            <p className="text-lg font-bold text-foreground">
              No evaluations match
            </p>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              Try another filter, or submit a registered test to see its
              evaluation here.
            </p>
            <Button
              render={<Link href="/student/tests" />}
              className="mt-2 h-11"
            >
              View my tests
            </Button>
          </CardContent>
        </Card>
      )}
      <div className="rounded-md border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
        <span className="font-semibold text-foreground">
          Evaluation lifecycle:
        </span>{" "}
        submitted work is processed first, then published here when feedback is
        ready. Pending or failed submissions never display an invented score.
      </div>
    </div>
  )
}
