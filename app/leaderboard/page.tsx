import { getCachedLeaderboard } from "@/lib/cache"
import { Badge } from "@/components/ui/badge"
import { LeaderboardClient } from "@/components/leaderboard-client"

// Enable ISR with 5-minute revalidation (matches cache TTL)
export const revalidate = 300

export default async function LeaderboardPage() {
  const rankings = await getCachedLeaderboard()

  return (
    <div className="flex min-h-screen flex-col bg-slate-50/60 dark:bg-[#0B1120]">
      <main className="flex-1 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl space-y-3 text-center">
            <Badge className="border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-bold text-[#2A6AED] dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-400">
              Live Official Rankings
            </Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
              Platform Leaderboard
            </h1>
            <p className="text-sm text-slate-500 sm:text-base dark:text-slate-400">
              Rankings computed exclusively from finalized, published
              handwritten answer sheet evaluations. Ties resolved by earliest
              submission timestamp.
            </p>
          </div>

          <LeaderboardClient rankings={rankings} />
        </div>
      </main>
    </div>
  )
}
