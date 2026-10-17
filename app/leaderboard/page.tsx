import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getLeaderboardAction } from "@/actions/leaderboard-actions"
import { Badge } from "@/components/ui/badge"
import { LeaderboardClient } from "@/components/leaderboard-client"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const rankings = await getLeaderboardAction()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60 dark:bg-[#0B1120]">
      <Navbar />

      <main className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <Badge className="bg-blue-50 dark:bg-blue-950/60 text-[#2A6AED] dark:text-blue-400 border border-blue-200 dark:border-blue-900 text-xs px-3.5 py-1 font-bold">
              Live Official Rankings
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Platform Leaderboard
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              Rankings computed exclusively from finalized, published handwritten answer sheet evaluations. Ties resolved by earliest submission timestamp.
            </p>
          </div>

          <LeaderboardClient rankings={rankings} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
