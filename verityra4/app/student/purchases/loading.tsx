import { Skeleton } from "@/components/ui/skeleton"

export default function StudentPurchasesLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-11 w-11 rounded-md sm:h-12 sm:w-12" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-36" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
      </div>

      {/* 3 KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-md border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-9 w-9 rounded-sm" />
            </div>
            <Skeleton className="h-7 w-24" />
            <Skeleton className="h-3.5 w-36" />
          </div>
        ))}
      </div>

      {/* Table Skeleton */}
      <div className="space-y-4 rounded-md border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-3 sm:flex-row">
          <Skeleton className="h-10 w-72 rounded-md" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32 rounded-md" />
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>
        <div className="space-y-3 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-border/60 py-3.5"
            >
              <div className="flex-1 space-y-1.5 pr-4">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="mr-4 h-4 w-24" />
              <Skeleton className="mr-4 h-6 w-20 rounded-sm" />
              <Skeleton className="mr-4 hidden h-4 w-28 md:block" />
              <Skeleton className="h-9 w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
