import { Skeleton } from "@/components/ui/skeleton"

export default function TestsCatalogLoading() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-48 rounded-full" />
        <Skeleton className="h-10 w-96" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-28 rounded-xl" />
        ))}
      </div>

      {/* Catalog grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between space-y-6 rounded-3xl border border-border/80 bg-card p-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>

            <div className="space-y-4 border-t border-border/60 pt-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
