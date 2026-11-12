"use client"

import { useMemo } from "react"
import { Trophy } from "lucide-react"
import { LeaderboardOverview } from "./leaderboard-overview"
import { LeaderboardTable } from "./leaderboard-table"

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
  // Never assume the server sends rows in rank order
  const sorted = useMemo(
    () => [...rankings].sort((a, b) => a.rank - b.rank),
    [rankings]
  )

  if (sorted.length === 0) {
    return (
      <div className="ui-panel-flat mx-auto flex max-w-lg flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-sunken)] text-[var(--brand-sapphire)]">
          <Trophy className="h-6 w-6" aria-hidden />
        </span>
        <p className="text-lg font-bold text-foreground">No rankings yet</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Rankings appear here once evaluations are finalized and published.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <LeaderboardOverview rankings={sorted} />
      <LeaderboardTable rankings={sorted} />
    </div>
  )
}
