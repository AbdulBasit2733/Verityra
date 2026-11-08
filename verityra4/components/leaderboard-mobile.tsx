"use client"

import { RotateCcw, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GlobalPagination } from "@/components/ui/pagination"
import type { LeaderboardEntry } from "./leaderboard-client"
import { LeaderboardRankCard } from "./leaderboard-rank-card"
import { useLeaderboardState } from "./leaderboard-state"

export function LeaderboardMobile({ rankings }: { rankings: LeaderboardEntry[] }) {
  const state = useLeaderboardState(rankings)
  return <div className="space-y-5 lg:hidden">
    <div className="relative"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={state.query} onChange={(e) => state.setQuery(e.target.value)} placeholder="Search candidate or paper" className="h-11 bg-card pl-10 pr-10" />{state.query && <button type="button" onClick={() => state.setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-4 w-4" /></button>}</div>
    <div className="flex items-center justify-between gap-2 border-y border-border py-3"><Badge variant="outline">{state.filtered.length} ranked submissions</Badge><div className="flex items-center gap-2"><Select value={state.bracket} onValueChange={(value) => state.setBracket(value || "ALL")}><SelectTrigger size="sm" className="w-[145px]"><SelectValue placeholder="All scores" /></SelectTrigger><SelectContent><SelectItem value="ALL">All score bands</SelectItem><SelectItem value="TOP">Top tier (75%+)</SelectItem><SelectItem value="HIGH">High score</SelectItem><SelectItem value="PASS">Passing</SelectItem><SelectItem value="BELOW">Below passing</SelectItem></SelectContent></Select>{state.hasFilters && <Button type="button" variant="ghost" size="icon-sm" onClick={state.reset} aria-label="Reset leaderboard filters"><RotateCcw className="h-4 w-4" /></Button>}</div></div>
    {state.pageItems.length ? <div className="space-y-3">{state.pageItems.map((entry) => <LeaderboardRankCard key={`${entry.rank}-${entry.studentName}-${entry.testTitle}`} entry={entry} compact />)}</div> : <div className="border border-dashed border-border px-5 py-12 text-center"><Search className="mx-auto mb-3 h-7 w-7 text-muted-foreground" /><p className="text-sm font-bold">No rankings found</p><Button size="sm" variant="outline" className="mt-4" onClick={state.reset}>Reset filters</Button></div>}
    <GlobalPagination totalItems={state.filtered.length} totalPages={Math.max(1, Math.ceil(state.filtered.length / state.pageSize))} pageSize={state.pageSize} currentPage={state.page} onPageChange={state.setPage} onPageSizeChange={(size) => { state.setPageSize(size); state.setPage(1) }} pageSizeOptions={[5, 10, 15]} />
  </div>
}
