"use client"

import { Award, BadgeCheck, Clock, Medal, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { LeaderboardEntry } from "./leaderboard-client"
import { LeaderboardRankCard } from "./leaderboard-rank-card"

export function LeaderboardDesktop({ rankings }: { rankings: LeaderboardEntry[] }) {
  const top = rankings.slice(0, 3)
  const columns: DataTableColumn<LeaderboardEntry>[] = [
    { id: "rank", header: "Rank", sortable: true, sortAccessor: (r) => r.rank, className: "w-20 text-center", cell: (r) => <span className="font-black text-primary">#{r.rank}</span> },
    { id: "student", header: "Candidate", sortable: true, sortAccessor: (r) => r.studentName, searchAccessor: (r) => `${r.studentName} ${r.testTitle}`, cell: (r) => <span className="font-bold text-foreground">{r.studentName}</span> },
    { id: "test", header: "Examination module", sortable: true, sortAccessor: (r) => r.testTitle, cell: (r) => <span className="block max-w-sm truncate font-medium text-muted-foreground">{r.testTitle}</span> },
    { id: "score", header: "Score", sortable: true, sortAccessor: (r) => r.score, className: "text-right", cell: (r) => <span className="font-extrabold text-primary">{r.score} <span className="text-xs font-normal text-muted-foreground">/ {r.maxMarks}</span></span> },
    { id: "percentage", header: "Percentage", sortable: true, sortAccessor: (r) => r.percentage, className: "text-right", cell: (r) => <Badge variant={r.percentage >= 75 ? "default" : "secondary"} className="text-xs">{r.percentage.toFixed(1)}%</Badge> },
    { id: "attempt", header: "Attempt", sortable: true, sortAccessor: (r) => r.attemptNumber, cell: (r) => <Badge variant="outline" className="text-[10px]">Attempt {r.attemptNumber}</Badge> },
    { id: "date", header: "Submitted", sortable: true, sortAccessor: (r) => new Date(r.submittedAt), cell: (r) => <FormattedDate date={r.submittedAt} /> },
  ]
  const filters: DataTableFilter<LeaderboardEntry>[] = [
    { id: "attempt", label: "Attempt", accessor: (r) => String(r.attemptNumber), options: [1, 2, 3].map((n) => ({ label: `Attempt ${n}`, value: String(n) })) },
    { id: "bracket", label: "Score bracket", accessor: (r) => r.percentage >= 75 ? "TOP" : r.percentage >= 60 ? "HIGH" : r.percentage >= 50 ? "PASS" : "BELOW", options: [{ label: "Top tier (75%+)", value: "TOP" }, { label: "High score (60–74%)", value: "HIGH" }, { label: "Passing (50–59%)", value: "PASS" }, { label: "Below passing", value: "BELOW" }] },
  ]
  return <div className="hidden lg:block">
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList variant="line" className="w-full justify-start border-b border-border">
        <TabsTrigger value="overview" className="px-4 py-2 text-xs font-semibold sm:text-sm">Overview</TabsTrigger>
        <TabsTrigger value="rankings" className="px-4 py-2 text-xs font-semibold sm:text-sm">Rankings table <span className="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">{rankings.length}</span></TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-8 pt-1">
      {top.length >= 3 && <div className="grid items-end gap-6 pt-4 md:grid-cols-3">
        <PodiumEntry entry={top[1]} rank="second" />
        <PodiumEntry entry={top[0]} rank="first" />
        <PodiumEntry entry={top[2]} rank="third" />
      </div>}
    <div className="grid grid-cols-3 gap-4"><Card><CardContent className="flex items-center gap-3 p-4"><Award className="h-5 w-5 text-primary" /><div><p className="text-xs text-muted-foreground">Ranked submissions</p><p className="text-lg font-bold">{rankings.length}</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><BadgeCheck className="h-5 w-5 text-emerald-600" /><div><p className="text-xs text-muted-foreground">Top score</p><p className="text-lg font-bold">{rankings[0]?.percentage?.toFixed(1) || "0.0"}%</p></div></CardContent></Card><Card><CardContent className="flex items-center gap-3 p-4"><Clock className="h-5 w-5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Latest submission</p><p className="text-sm font-bold">{rankings[0] ? <FormattedDate date={rankings[0].submittedAt} /> : "—"}</p></div></CardContent></Card></div>
      </TabsContent>
      <TabsContent value="rankings" className="pt-1">
        <DataTable data={rankings} columns={columns} keyExtractor={(r) => `${r.rank}-${r.studentName}-${r.testTitle}`} searchPlaceholder="Search candidates or examination modules" filters={filters} dateAccessor={(r) => r.submittedAt} dateFilterLabel="Submission date" defaultSortColumn="rank" defaultSortDirection="asc" defaultPageSize={10} showSerialNumber={false} defaultViewMode="table" renderCard={(r) => <LeaderboardRankCard key={`${r.rank}-${r.studentName}`} entry={r} compact />} emptyTitle="No eligible rankings found" emptyDescription="Finalized published evaluations will appear here." />
      </TabsContent>
    </Tabs>
  </div>
}

function PodiumEntry({ entry, rank }: { entry: LeaderboardEntry; rank: "first" | "second" | "third" }) {
  const first = rank === "first"
  const number = first ? 1 : rank === "second" ? 2 : 3
  const medalClass = first ? "border-amber-300 bg-amber-100 text-amber-800" : rank === "second" ? "border-slate-300 bg-slate-100 text-slate-700" : "border-amber-200 bg-amber-50 text-amber-900"
  return <Card className={`${first ? "border-2 border-primary shadow-xl shadow-blue-500/10 md:-translate-y-2.5" : "shadow-sm"} relative text-center`}>
    {first && <div className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground shadow-md"><Trophy className="h-3.5 w-3.5" /> Top rank</div>}
    <CardContent className="space-y-3 p-7 sm:p-8"><div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border text-xl font-black ${medalClass} ${first ? "mt-2 h-16 w-16 text-2xl" : ""}`}>{number <= 3 ? <Medal className="h-6 w-6" /> : number}</div><h3 className="truncate text-lg font-bold text-foreground">{entry.studentName}</h3><p className="truncate text-xs text-muted-foreground">{entry.testTitle}</p><p className={`${first ? "text-3xl" : "text-2xl"} pt-2 font-black text-primary`}>{entry.score} <span className="text-xs font-normal text-muted-foreground">/ {entry.maxMarks}</span></p><Badge className="bg-emerald-100 text-emerald-800">{entry.percentage.toFixed(1)}% score</Badge></CardContent>
  </Card>
}
