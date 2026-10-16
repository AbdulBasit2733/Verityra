import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getLeaderboardAction } from "@/actions/leaderboard-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Award, Trophy, Medal, Search, Filter } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const rankings = await getLeaderboardAction()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge className="bg-blue-50 text-[#2A6AED] border border-blue-200 text-xs px-3.5 py-1 font-bold">
              Live Official Rankings
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Platform Leaderboard
            </h1>
            <p className="text-sm sm:text-base text-slate-500">
              Rankings computed exclusively from finalized, published handwritten answer sheet evaluations.
            </p>
          </div>

          {/* Top 3 Podium Cards if available */}
          {rankings.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-4 items-end">
              {/* Rank 2 */}
              <div className="rounded-3xl border border-slate-200/80 bg-white order-2 md:order-1 text-center shadow-card p-8 space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xl mx-auto mb-2 border border-slate-300 shadow-xs">
                  2
                </div>
                <h3 className="text-lg font-bold text-slate-900">{rankings[1].studentName}</h3>
                <p className="text-xs text-slate-500 truncate">{rankings[1].testTitle}</p>
                <div className="pt-2">
                  <p className="text-2xl font-black text-[#2A6AED]">
                    {rankings[1].score} / {rankings[1].maxMarks}
                  </p>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mt-2">
                    {rankings[1].percentage}%
                  </span>
                </div>
              </div>

              {/* Rank 1 */}
              <div className="rounded-3xl border-2 border-[#2A6AED] bg-white order-1 md:order-2 text-center shadow-2xl shadow-blue-500/15 -translate-y-3 p-8 sm:p-10 space-y-3 relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#2A6AED] to-[#1D4ED8] text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Trophy className="h-3.5 w-3.5" /> Top Rank
                </div>
                <div className="h-16 w-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-2xl mx-auto mb-2 border-2 border-amber-300 shadow-xs mt-2">
                  1
                </div>
                <h3 className="text-xl font-black text-slate-900">{rankings[0].studentName}</h3>
                <p className="text-xs text-slate-500 truncate">{rankings[0].testTitle}</p>
                <div className="pt-2">
                  <p className="text-3xl font-black text-[#2A6AED]">
                    {rankings[0].score} / {rankings[0].maxMarks}
                  </p>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 border border-emerald-300 px-3.5 py-1 rounded-full inline-block mt-2">
                    {rankings[0].percentage}%
                  </span>
                </div>
              </div>

              {/* Rank 3 */}
              <div className="rounded-3xl border border-slate-200/80 bg-white order-3 text-center shadow-card p-8 space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-900 flex items-center justify-center font-black text-xl mx-auto mb-2 border border-amber-200 shadow-xs">
                  3
                </div>
                <h3 className="text-lg font-bold text-slate-900">{rankings[2].studentName}</h3>
                <p className="text-xs text-slate-500 truncate">{rankings[2].testTitle}</p>
                <div className="pt-2">
                  <p className="text-2xl font-black text-[#2A6AED]">
                    {rankings[2].score} / {rankings[2].maxMarks}
                  </p>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mt-2">
                    {rankings[2].percentage}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Full Table */}
          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-card overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-5">
              <h3 className="text-base font-bold text-slate-900">All Eligible Final Rankings</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ties are resolved deterministically by earliest submission timestamp.
              </p>
            </div>
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] text-center">Rank</TableHead>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Test Module</TableHead>
                    <TableHead className="text-right">Awarded Score</TableHead>
                    <TableHead className="text-right">Percentage</TableHead>
                    <TableHead className="text-center">Attempt</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rankings.map((item) => (
                    <TableRow key={item.rank} className="hover:bg-blue-50/30 transition-colors">
                      <TableCell className="text-center font-bold">
                        <span
                          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl text-xs ${
                            item.rank === 1
                              ? "bg-amber-100 text-amber-800 font-black border border-amber-300"
                              : item.rank === 2
                              ? "bg-slate-200 text-slate-800 font-bold"
                              : item.rank === 3
                              ? "bg-amber-100 text-amber-900 font-bold"
                              : "text-slate-500 font-semibold"
                          }`}
                        >
                          {item.rank}
                        </span>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {item.studentName}
                      </TableCell>
                      <TableCell className="text-slate-600 text-sm">
                        {item.testTitle}
                      </TableCell>
                      <TableCell className="text-right font-black text-[#2A6AED]">
                        {item.score} / {item.maxMarks}
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">
                        {item.percentage}%
                      </TableCell>
                      <TableCell className="text-center text-slate-500 font-semibold text-xs">
                        #{item.attemptNumber}
                      </TableCell>
                      <TableCell className="text-right text-slate-500 text-xs">
                        {item.submittedAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
