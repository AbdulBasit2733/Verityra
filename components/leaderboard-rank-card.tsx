import { Medal, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { LeaderboardEntry } from "./leaderboard-client"
import { ScoreBar, initials } from "./leader-board-parts"

export function LeaderboardRankCard({ entry, compact = false }: { entry: LeaderboardEntry; compact?: boolean }) {
  const winner = entry.rank === 1
  const podium = entry.rank <= 3

  return (
    <Card className={`${winner ? "border-primary/50 bg-primary/[0.03]" : ""} ${compact ? "gap-3 py-4 shadow-none" : "h-full"}`}>
      <CardHeader className="gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span aria-label={`Rank ${entry.rank}`} className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-black ${winner ? "bg-score-accent text-score-accent-foreground" : podium ? "bg-secondary text-primary" : "bg-muted text-muted-foreground"}`}>
              {winner ? <Trophy className="h-4 w-4" aria-hidden /> : podium ? <Medal className="h-4 w-4" aria-hidden /> : `#${entry.rank}`}
            </span>
            <span aria-hidden className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground">{initials(entry.studentName)}</span>
          </div>
          <Badge variant={winner ? "default" : "outline"} className="text-[10px] tabular-nums">{entry.percentage.toFixed(1)}%</Badge>
        </div>
        <div className="min-w-0"><p className="truncate text-base font-bold text-foreground">{entry.studentName}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{entry.testTitle}</p></div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Score</p><p className="mt-1 text-xl font-extrabold tabular-nums text-primary">{entry.score}<span className="text-xs font-semibold text-muted-foreground"> / {entry.maxMarks}</span></p></div><Badge variant="secondary" className="text-[10px]">Attempt {entry.attemptNumber}</Badge></div>
        <ScoreBar value={entry.percentage} />
      </CardContent>
    </Card>
  )
}
