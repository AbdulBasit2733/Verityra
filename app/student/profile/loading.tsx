import { Skeleton } from "@/components/ui/skeleton"

export default function StudentProfileLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
      </div>

      {/* Identity Card Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col sm:flex-row items-center gap-5">
        <Skeleton className="h-20 w-20 rounded-2xl shrink-0" />
        <div className="space-y-2 flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-60 mx-auto sm:mx-0" />
          <Skeleton className="h-3.5 w-40 mx-auto sm:mx-0" />
        </div>
      </div>

      {/* Profile Form Card Skeleton */}
      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex gap-4 border-b border-border pb-3">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <div className="flex justify-end pt-4 border-t border-border">
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
