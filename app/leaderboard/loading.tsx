import { Skeleton } from "@/components/ui/skeleton"

export default function LeaderboardLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <Skeleton className="h-6 w-36 mx-auto rounded-full" />
        <Skeleton className="h-10 w-72 mx-auto" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Podium preview skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border/80 bg-card p-8 text-center space-y-4">
            <Skeleton className="h-14 w-14 rounded-2xl mx-auto" />
            <Skeleton className="h-6 w-36 mx-auto" />
            <Skeleton className="h-4 w-28 mx-auto" />
            <Skeleton className="h-8 w-24 mx-auto" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden">
        <div className="h-12 border-b border-border bg-slate-50/80 px-6 flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
        </div>
        <div className="divide-y divide-border/60">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <Skeleton className="h-5 w-8" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-44" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
