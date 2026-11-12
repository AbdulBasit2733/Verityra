"use client"

import { useMemo } from "react"
import {
  DataTable,
  type DataTableColumn,
  type DataTableFilter,
} from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import type { LeaderboardEntry } from "./leaderboard-client"
import { LeaderboardRankCard } from "./leaderboard-rank-card"
import { RankChip, ScoreBar, initials } from "./leader-board-parts"

const rowKey = (r: LeaderboardEntry) =>
  `${r.rank}-${r.studentName}-${r.testTitle}-${r.attemptNumber}-${r.submittedAt}`

export function LeaderboardTable({
  rankings,
}: {
  rankings: LeaderboardEntry[]
}) {
  const columns = useMemo<DataTableColumn<LeaderboardEntry>[]>(
    () => [
      {
        id: "rank",
        header: "Rank",
        sortable: true,
        sortAccessor: (r) => r.rank,
        className: "w-20",
        cell: (r) => <RankChip rank={r.rank} />,
      },
      {
        id: "student",
        header: "Candidate",
        sortable: true,
        sortAccessor: (r) => r.studentName,
        searchAccessor: (r) => `${r.studentName} ${r.testTitle}`,
        cell: (r) => (
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--surface-sunken)] text-xs font-bold text-foreground"
            >
              {initials(r.studentName)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {r.studentName}
              </p>
              <p className="text-xs text-muted-foreground">
                Attempt {r.attemptNumber}
              </p>
            </div>
          </div>
        ),
      },
      {
        id: "test",
        header: "Paper",
        sortable: true,
        sortAccessor: (r) => r.testTitle,
        cell: (r) => (
          <span className="block max-w-xs truncate text-muted-foreground">
            {r.testTitle}
          </span>
        ),
      },
      {
        id: "score",
        header: "Score",
        sortable: true,
        sortAccessor: (r) => r.percentage,
        className: "w-56",
        cell: (r) => (
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between gap-3 tabular-nums">
              <span className="font-bold text-foreground">
                {r.score}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  / {r.maxMarks}
                </span>
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                {r.percentage.toFixed(1)}%
              </span>
            </div>
            <ScoreBar value={r.percentage} />
          </div>
        ),
      },
      {
        id: "date",
        header: "Submitted",
        sortable: true,
        sortAccessor: (r) => new Date(r.submittedAt),
        className: "whitespace-nowrap text-muted-foreground",
        cell: (r) => <FormattedDate date={r.submittedAt} />,
      },
    ],
    []
  )

  const filters = useMemo<DataTableFilter<LeaderboardEntry>[]>(
    () => [
      {
        id: "attempt",
        label: "Attempt",
        accessor: (r) => String(r.attemptNumber),
        options: [1, 2, 3].map((n) => ({
          label: `Attempt ${n}`,
          value: String(n),
        })),
      },
      {
        id: "bracket",
        label: "Score band",
        accessor: (r) =>
          r.percentage >= 75
            ? "TOP"
            : r.percentage >= 60
              ? "HIGH"
              : r.percentage >= 50
                ? "PASS"
                : "BELOW",
        options: [
          { label: "75% and above", value: "TOP" },
          { label: "60–74%", value: "HIGH" },
          { label: "50–59%", value: "PASS" },
          { label: "Below 50%", value: "BELOW" },
        ],
      },
    ],
    []
  )

  return (
    <section aria-label="All rankings" className="space-y-5">
      <div className="flex items-end justify-between gap-3">
        <p className="text-xs font-bold tracking-[0.16em] text-primary uppercase">
          All published results
        </p>
        <span className="text-sm text-muted-foreground tabular-nums">
          {rankings.length} ranked submissions
        </span>
      </div>

      {/* DataTable renders cards below md and the table from md up, so there is one search/filter/page state */}
      <DataTable
        data={rankings}
        columns={columns}
        keyExtractor={rowKey}
        searchPlaceholder="Search by candidate or paper"
        filters={filters}
        dateAccessor={(r) => r.submittedAt}
        dateFilterLabel="Submission date"
        defaultSortColumn="rank"
        defaultSortDirection="asc"
        defaultPageSize={10}
        showSerialNumber={false}
        defaultViewMode="auto"
        gridClassName="sm:grid-cols-2 xl:grid-cols-3"
        renderCard={(r) => (
          <LeaderboardRankCard key={rowKey(r)} entry={r} compact />
        )}
        emptyTitle="No rankings match"
        emptyDescription="Clear the search or filters to see everyone."
      />
    </section>
  )
}
