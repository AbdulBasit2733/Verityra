import { getCachedLeaderboard } from "@/lib/cache"
import { LeaderboardClient } from "@/components/leaderboard-client"
import { Trophy } from "lucide-react"
import { BRAND_CONFIG } from "@/lib/brand"

// Enable ISR with 5-minute revalidation (matches cache TTL)
export const revalidate = 300

export default async function LeaderboardPage() {
  const rankings = await getCachedLeaderboard()

  return (
    <main className="min-h-screen bg-background">
      <div className="relative overflow-x-clip bg-[radial-gradient(circle_at_88%_0%,rgb(42_106_237/0.14),transparent_34%)]">
        <div
          aria-hidden
          className="pointer-events-none absolute top-12 -right-24 h-72 w-72 rounded-full border border-primary/10 bg-primary/[0.04]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-28 right-16 h-40 w-40 rounded-full border border-dashed border-primary/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-[23rem] left-[-8rem] h-64 w-64 rounded-full border border-primary/10"
        />
        <div className="ui-page relative space-y-10 py-8 sm:space-y-12 sm:py-12 lg:py-16">
          <header className="flex flex-col items-center justify-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-sm border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-xs font-semibold text-primary">
              <Trophy className="h-4 w-4" aria-hidden />
              {BRAND_CONFIG.name} rankings
            </div>
            <h1 className="text-center font-heading text-4xl font-extrabold tracking-[-0.04em] text-foreground sm:text-6xl">
              Progress worth putting on record.
            </h1>
          </header>
          <LeaderboardClient rankings={rankings} />
        </div>
      </div>
    </main>
  )
}
