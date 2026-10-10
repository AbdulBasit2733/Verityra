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
    <div className="flex min-h-screen flex-col bg-[#F2F7FA]">
      <Navbar />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge className="bg-[#CADEEF] text-[#0784B5] hover:bg-[#CADEEF] border-0 text-xs px-3 py-1 font-semibold">
              Live Official Rankings
            </Badge>
            <h1 className="text-3xl font-extrabold text-[#0B192C] tracking-tight">
              Platform Leaderboard
            </h1>
            <p className="text-xs sm:text-sm text-[#4B6375]">
              Rankings computed exclusively from finalized, published handwritten answer sheet evaluations.
            </p>
          </div>

          {/* Top 3 Podium Cards if available */}
          {rankings.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {/* Rank 2 */}
              <Card className="border-[#D5E5F2] bg-white order-2 md:order-1 text-center shadow-sm">
                <CardHeader className="pb-2">
                  <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-extrabold text-lg mx-auto mb-2 border border-slate-300">
                    2
                  </div>
                  <CardTitle className="text-base text-[#0B192C]">{rankings[1].studentName}</CardTitle>
                  <CardDescription className="text-xs text-[#4B6375] truncate">
                    {rankings[1].testTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xl font-bold text-[#0784B5]">
                    {rankings[1].score} / {rankings[1].maxMarks}
                  </p>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    {rankings[1].percentage}%
                  </span>
                </CardContent>
              </Card>

              {/* Rank 1 */}
              <Card className="border-[#0784B5] bg-white order-1 md:order-2 text-center shadow-md -translate-y-2 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0784B5] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Trophy className="h-3 w-3" /> Top Rank
                </div>
                <CardHeader className="pb-2 pt-6">
                  <div className="h-14 w-14 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-extrabold text-xl mx-auto mb-2 border-2 border-amber-300">
                    1
                  </div>
                  <CardTitle className="text-lg text-[#0B192C]">{rankings[0].studentName}</CardTitle>
                  <CardDescription className="text-xs text-[#4B6375] truncate">
                    {rankings[0].testTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-2xl font-black text-[#0784B5]">
                    {rankings[0].score} / {rankings[0].maxMarks}
                  </p>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-0.5 rounded-full inline-block mt-1">
                    {rankings[0].percentage}%
                  </span>
                </CardContent>
              </Card>

              {/* Rank 3 */}
              <Card className="border-[#D5E5F2] bg-white order-3 text-center shadow-sm">
                <CardHeader className="pb-2">
                  <div className="h-12 w-12 rounded-full bg-amber-50 text-amber-900 flex items-center justify-center font-extrabold text-lg mx-auto mb-2 border border-amber-200">
                    3
                  </div>
                  <CardTitle className="text-base text-[#0B192C]">{rankings[2].studentName}</CardTitle>
                  <CardDescription className="text-xs text-[#4B6375] truncate">
                    {rankings[2].testTitle}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xl font-bold text-[#0784B5]">
                    {rankings[2].score} / {rankings[2].maxMarks}
                  </p>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                    {rankings[2].percentage}%
                  </span>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Full Table */}
          <Card className="border-[#D5E5F2] bg-white shadow-sm overflow-hidden">
            <CardHeader className="border-b border-[#D5E5F2] bg-white py-4">
              <CardTitle className="text-base text-[#0B192C]">All Eligible Final Rankings</CardTitle>
              <CardDescription className="text-xs text-[#4B6375]">
                Ties are resolved deterministically by earliest submission timestamp.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-[#CADEEF]/20 text-xs font-semibold text-[#0B192C]">
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
                <TableBody className="text-xs">
                  {rankings.map((item) => (
                    <TableRow key={item.rank} className="hover:bg-[#F2F7FA]/50">
                      <TableCell className="text-center font-bold">
                        <span
                          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                            item.rank === 1
                              ? "bg-amber-100 text-amber-800 font-black"
                              : item.rank === 2
                              ? "bg-slate-200 text-slate-800 font-bold"
                              : item.rank === 3
                              ? "bg-amber-100 text-amber-900 font-bold"
                              : "text-[#4B6375]"
                          }`}
                        >
                          {item.rank}
                        </span>
                      </TableCell>
                      <TableCell className="font-semibold text-[#0B192C]">
                        {item.studentName}
                      </TableCell>
                      <TableCell className="text-[#4B6375]">
                        {item.testTitle}
                      </TableCell>
                      <TableCell className="text-right font-bold text-[#0784B5]">
                        {item.score} / {item.maxMarks}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-600">
                        {item.percentage}%
                      </TableCell>
                      <TableCell className="text-center text-[#4B6375]">
                        #{item.attemptNumber}
                      </TableCell>
                      <TableCell className="text-right text-[#4B6375]">
                        {item.submittedAt}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
