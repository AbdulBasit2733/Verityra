import { Medal, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import type { LeaderboardEntry } from "./leaderboard-client"

export function LeaderboardRankCard({ entry, compact = false }: { entry: LeaderboardEntry; compact?: boolean }) {
  const winner = entry.rank === 1
  return <Card className={`${winner ? "border-primary/50 bg-primary/[0.03]" : ""} ${compact ? "gap-3 py-4 shadow-none" : "h-full"}`}>
    <CardHeader className="gap-3"><div className="flex items-center justify-between gap-2"><div className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black ${winner ? "bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300" : entry.rank === 2 ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200" : entry.rank === 3 ? "bg-amber-50 text-amber-950 dark:bg-amber-950/40 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}>{winner ? <Trophy className="h-4 w-4" /> : entry.rank <= 3 ? <Medal className="h-4 w-4" /> : `#${entry.rank}`}</div><Badge variant="outline" className="text-[10px]">{entry.percentage.toFixed(1)}%</Badge></div><div><h3 className="truncate text-base font-bold text-foreground">{entry.studentName}</h3><p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{entry.testTitle}</p></div></CardHeader>
    <CardContent className="flex items-end justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Score</p><p className="text-xl font-extrabold text-primary">{entry.score}<span className="text-xs font-semibold text-muted-foreground"> / {entry.maxMarks}</span></p></div><Badge variant="secondary" className="text-[10px]">Attempt {entry.attemptNumber}</Badge></CardContent>
  </Card>
}
