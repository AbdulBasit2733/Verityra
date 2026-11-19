import { Skeleton } from "@/components/ui/skeleton"

export default function StudentProfileLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-11 w-11 rounded-md sm:h-12 sm:w-12" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
      </div>

      {/* Identity Card Skeleton */}
      <div className="flex flex-col items-center gap-5 rounded-md border border-border bg-card p-6 shadow-xs sm:flex-row">
        <Skeleton className="h-20 w-20 shrink-0 rounded-md" />
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:justify-start">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-5 w-24 rounded-sm" />
          </div>
          <Skeleton className="mx-auto h-4 w-60 sm:mx-0" />
          <Skeleton className="mx-auto h-3.5 w-40 sm:mx-0" />
        </div>
      </div>

      {/* Profile Form Card Skeleton */}
      <div className="space-y-6 rounded-md border border-border bg-card p-6 shadow-xs sm:p-8">
        <div className="flex gap-4 border-b border-border pb-3">
          <Skeleton className="h-8 w-36 rounded-sm" />
          <Skeleton className="h-8 w-36 rounded-sm" />
        </div>
        <div className="grid grid-cols-1 gap-5 pt-2 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-full rounded-md" />
            </div>
          ))}
        </div>
        <div className="flex justify-end border-t border-border pt-4">
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>
      </div>
    </div>
  )
}
