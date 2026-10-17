"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { Award, Medal, Trophy, Users, Search, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export interface LeaderboardEntry {
  rank: number
  studentName: string
  testTitle: string
  score: number
  maxMarks: number
  percentage: number
  attemptNumber: number
  submittedAt: string
}

export function LeaderboardClient({
  rankings,
}: {
  rankings: LeaderboardEntry[]
}) {
  // Extract distinct test titles for dynamic filtering
  const distinctTestTitles = React.useMemo(() => {
    const set = new Set<string>()
    rankings.forEach((r) => {
      if (r.testTitle) set.add(r.testTitle)
    })
    return Array.from(set)
  }, [rankings])

  const top3 = rankings.slice(0, 3)

  const columns: DataTableColumn<LeaderboardEntry>[] = [
    {
      id: "rank",
      header: "Rank",
      sortable: true,
      sortAccessor: (r) => r.rank,
      className: "w-20 text-center",
      headerClassName: "text-center",
      cell: (r) => {
        let badgeStyle = "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold"
        if (r.rank === 1) {
          badgeStyle = "bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-black border border-amber-300 dark:border-amber-700 shadow-2xs"
        } else if (r.rank === 2) {
          badgeStyle = "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border border-slate-300 dark:border-slate-700"
        } else if (r.rank === 3) {
          badgeStyle = "bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-800"
        }

        return (
          <span className={cn("inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs", badgeStyle)}>
            {r.rank === 1 ? "🥇 1" : r.rank === 2 ? "🥈 2" : r.rank === 3 ? "🥉 3" : `#${r.rank}`}
          </span>
        )
      },
    },
    {
      id: "candidate",
      header: "Candidate Name",
      sortable: true,
      sortAccessor: (r) => r.studentName,
      searchAccessor: (r) => `${r.studentName} ${r.testTitle}`,
      cell: (r) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 block">
          {r.studentName}
        </span>
      ),
    },
    {
      id: "testTitle",
      header: "Examination Module",
      sortable: true,
      sortAccessor: (r) => r.testTitle,
      cell: (r) => (
        <span className="font-semibold text-slate-700 dark:text-slate-300 max-w-sm block truncate">
          {r.testTitle}
        </span>
      ),
    },
    {
      id: "score",
      header: "Score Awarded",
      sortable: true,
      sortAccessor: (r) => r.score,
      className: "text-right",
      headerClassName: "text-right",
      cell: (r) => (
        <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-sm">
          {r.score} <span className="text-xs font-normal text-slate-400">/ {r.maxMarks}</span>
        </span>
      ),
    },
    {
      id: "percentage",
      header: "Percentage",
      sortable: true,
      sortAccessor: (r) => r.percentage,
      className: "text-right",
      headerClassName: "text-right",
      cell: (r) => {
        const isTop = r.percentage >= 70
        return (
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-bold px-2.5 py-0.5 rounded-full",
              isTop
                ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50"
                : "border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
            )}
          >
            {r.percentage.toFixed(1)}%
          </Badge>
        )
      },
    },
    {
      id: "attemptNumber",
      header: "Attempt",
      sortable: true,
      sortAccessor: (r) => r.attemptNumber,
      className: "text-center",
      headerClassName: "text-center",
      cell: (r) => (
        <Badge
          variant="outline"
          className="text-[10px] font-semibold border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-full"
        >
          Attempt #{r.attemptNumber}
        </Badge>
      ),
    },
    {
      id: "submittedAt",
      header: "Submission Date",
      sortable: true,
      sortAccessor: (r) => new Date(r.submittedAt),
      className: "text-right",
      headerClassName: "text-right",
      cell: (r) => <FormattedDate date={r.submittedAt} />,
    },
  ]

  const filters: DataTableFilter<LeaderboardEntry>[] = [
    ...(distinctTestTitles.length > 1
      ? [
          {
            id: "testModule",
            label: "Test Module",
            accessor: (r: LeaderboardEntry) => r.testTitle,
            options: distinctTestTitles.map((title) => ({
              label: title,
              value: title,
            })),
          },
        ]
      : []),
    {
      id: "attemptNumber",
      label: "Attempt #",
      accessor: (r) => String(r.attemptNumber),
      options: [
        { label: "Attempt #1", value: "1" },
        { label: "Attempt #2", value: "2" },
        { label: "Attempt #3", value: "3" },
      ],
    },
    {
      id: "scoreBracket",
      label: "Score Bracket",
      accessor: (r) => {
        if (r.percentage >= 75) return "TOP"
        if (r.percentage >= 60) return "HIGH"
        if (r.percentage >= 50) return "PASS"
        return "BELOW_PASS"
      },
      options: [
        { label: "Top Tier (≥ 75%)", value: "TOP" },
        { label: "High Score (60–74%)", value: "HIGH" },
        { label: "Passing (50–59%)", value: "PASS" },
        { label: "Below Passing (< 50%)", value: "BELOW_PASS" },
      ],
    },
  ]

  return (
    <div className="space-y-10">
      {/* Top 3 Podium if at least 3 rankings exist */}
      {top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-4 items-end">
          {/* Rank 2 */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 order-2 md:order-1 text-center shadow-card p-7 space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-black text-xl mx-auto mb-2 border border-slate-300 dark:border-slate-700 shadow-xs">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {top3[1].studentName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{top3[1].testTitle}</p>
            <div className="pt-2">
              <p className="text-2xl font-black text-[#2A6AED] dark:text-blue-400">
                {top3[1].score} / {top3[1].maxMarks}
              </p>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full inline-block mt-2">
                {top3[1].percentage.toFixed(1)}% Score
              </span>
            </div>
          </div>

          {/* Rank 1 */}
          <div className="rounded-3xl border-2 border-[#2A6AED] dark:border-blue-500 bg-white dark:bg-slate-900 order-1 md:order-2 text-center shadow-xl shadow-blue-500/10 -translate-y-2.5 p-8 sm:p-9 space-y-3 relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2A6AED] text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <Trophy className="h-3.5 w-3.5" /> Top Rank
            </div>
            <div className="h-16 w-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center justify-center font-black text-2xl mx-auto mb-2 border-2 border-amber-300 dark:border-amber-700 shadow-xs mt-2">
              1
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 truncate">
              {top3[0].studentName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{top3[0].testTitle}</p>
            <div className="pt-2">
              <p className="text-3xl font-black text-[#2A6AED] dark:text-blue-400">
                {top3[0].score} / {top3[0].maxMarks}
              </p>
              <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 border border-emerald-300 dark:border-emerald-700 px-3.5 py-1 rounded-full inline-block mt-2">
                {top3[0].percentage.toFixed(1)}% Score
              </span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 order-3 text-center shadow-card p-7 space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-400 flex items-center justify-center font-black text-xl mx-auto mb-2 border border-amber-200 dark:border-amber-800 shadow-xs">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
              {top3[2].studentName}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{top3[2].testTitle}</p>
            <div className="pt-2">
              <p className="text-2xl font-black text-[#2A6AED] dark:text-blue-400">
                {top3[2].score} / {top3[2].maxMarks}
              </p>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full inline-block mt-2">
                {top3[2].percentage.toFixed(1)}% Score
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Full Leaderboard DataTable with Searching, Sorting, Filtering & Pagination */}
      <DataTable
        data={rankings}
        columns={columns}
        keyExtractor={(r) => `${r.rank}-${r.studentName}-${r.testTitle}`}
        searchPlaceholder="Search candidate name or examination module..."
        filters={filters}
        dateAccessor={(r) => r.submittedAt}
        dateFilterLabel="Submission Date"
        defaultSortColumn="rank"
        defaultSortDirection="asc"
        defaultPageSize={10}
        showSerialNumber={false}
        emptyTitle="No eligible leaderboard rankings found"
        emptyDescription="Finalized evaluations will automatically appear here once results are published."
      />
    </div>
  )
}
