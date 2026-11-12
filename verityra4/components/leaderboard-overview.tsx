"use client"

import { cn } from "@/lib/utils"
import type { LeaderboardEntry } from "./leaderboard-client"
import { initials, RankChip, ScoreBar } from "./leader-board-parts"

export function LeaderboardOverview({
  rankings,
}: {
  rankings: LeaderboardEntry[]
}) {
  const top = rankings.slice(0, 3)
  return (
    <section aria-label="Top three rankings" className="relative space-y-5">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-1/2 hidden h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/15 md:block"
      />
      <ol className="relative grid grid-cols-1 gap-4 md:grid-cols-3 md:items-end">
        {top.map((entry) => (
          <PodiumCard
            key={`${entry.rank}-${entry.studentName}-${entry.submittedAt}`}
            entry={entry}
          />
        ))}
      </ol>
    </section>
  )
}

function PodiumCard({ entry }: { entry: LeaderboardEntry }) {
  const first = entry.rank === 1
  const order =
    entry.rank === 1
      ? "md:order-2 md:-translate-y-3"
      : entry.rank === 2
        ? "md:order-1"
        : "md:order-3"
  return (
    <li
      className={cn(
        "relative flex min-h-56 flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-transform duration-200 hover:-translate-y-1 sm:p-6",
        first
          ? "ui-ink-surface shadow-panel border-white/10"
          : "border-border bg-card shadow-card",
        order
      )}
    >
      {first && (
        <div className="absolute top-4 right-4 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-blue-200 uppercase">
          Top rank
        </div>
      )}
      <div className="flex items-center gap-3">
        <RankChip rank={entry.rank} />
        <span
          aria-hidden
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            first ? "bg-white/10 text-white" : "bg-muted text-foreground"
          )}
        >
          {initials(entry.studentName)}
        </span>
        <div className="min-w-0">
          <p
            className={cn(
              "truncate font-bold",
              first ? "text-white" : "text-foreground"
            )}
          >
            {entry.studentName}
          </p>
          <p
            className={cn(
              "mt-1 truncate text-xs",
              first ? "text-slate-300" : "text-muted-foreground"
            )}
          >
            {entry.testTitle}
          </p>
        </div>
      </div>
      <div className="mt-7 space-y-2.5">
        <p
          className={cn(
            "font-heading font-extrabold tabular-nums",
            first ? "text-4xl text-white" : "text-3xl text-foreground"
          )}
        >
          {entry.score}
          <span
            className={cn(
              "ml-1 text-sm font-medium",
              first ? "text-slate-300" : "text-muted-foreground"
            )}
          >
            / {entry.maxMarks}
          </span>
        </p>
        <ScoreBar value={entry.percentage} onDark={first} />
        <p
          className={cn(
            "text-xs font-semibold tabular-nums",
            first ? "text-slate-200" : "text-muted-foreground"
          )}
        >
          {entry.percentage.toFixed(1)}% · Attempt {entry.attemptNumber}
        </p>
      </div>
    </li>
  )
}
