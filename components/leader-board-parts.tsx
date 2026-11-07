import { Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

export function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((word) => word[0] ?? "")
      .join("")
      .toUpperCase() || "?"
  )
}

export function scoreTone(percentage: number) {
  if (percentage >= 75) return "var(--chart-1)"
  if (percentage >= 60) return "var(--chart-3)"
  if (percentage >= 50) return "var(--chart-4)"
  return "var(--destructive)"
}

export function ScoreBar({
  value,
  onDark = false,
  className,
}: {
  value: number
  onDark?: boolean
  className?: string
}) {
  const width = Math.min(100, Math.max(0, value))
  return (
    <div
      role="img"
      aria-label={`${value.toFixed(1)} percent`}
      className={cn("h-1.5 w-full overflow-hidden rounded-full", onDark ? "bg-white/15" : "bg-[var(--surface-sunken)]", className)}
    >
      <div
        className="h-full rounded-full"
        style={{ width: `${width}%`, background: onDark ? "#93c5fd" : scoreTone(value) }}
      />
    </div>
  )
}

export function RankChip({ rank, className }: { rank: number; className?: string }) {
  const base = "inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-sm font-extrabold tabular-nums"
  if (rank === 1) {
    return (
      <span className={cn(base, "bg-[var(--score-accent)] text-[var(--score-accent-foreground)]", className)} aria-label="Rank 1">
        <Trophy className="h-4 w-4" aria-hidden />
      </span>
    )
  }
  if (rank === 2) {
    return <span className={cn(base, "bg-[var(--line-strong)] text-foreground", className)} aria-label="Rank 2">2</span>
  }
  if (rank === 3) {
    return <span className={cn(base, "bg-[var(--chart-4)]/25 text-foreground", className)} aria-label="Rank 3">3</span>
  }
  return <span className={cn(base, "bg-[var(--surface-sunken)] text-muted-foreground", className)}>{rank}</span>
}