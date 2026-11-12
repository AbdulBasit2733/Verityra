import { Skeleton } from "@/components/ui/skeleton"

export default function LeaderboardLoading() {
  return (
    <div className="ui-page space-y-10 py-8 sm:space-y-12 sm:py-12 lg:py-16">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end lg:gap-16">
        <div className="space-y-5">
          <Skeleton className="h-8 w-40 rounded-full" />
          <Skeleton className="h-14 w-full max-w-2xl sm:h-20" />
          <Skeleton className="h-5 w-full max-w-2xl" />
          <div className="flex gap-3">
            <Skeleton className="h-11 w-44 rounded-xl" />
            <Skeleton className="h-11 w-48 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-56 rounded-2xl" />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-2xl" />
      </div>
      <div className="space-y-5">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-[28rem] rounded-2xl" />
      </div>
    </div>
  )
}
