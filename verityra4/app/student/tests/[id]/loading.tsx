import { Skeleton } from "@/components/ui/skeleton"

export default function StudentWorkspaceLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <Skeleton className="h-11 w-11 rounded-md sm:h-12 sm:w-12" />
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-64 sm:w-96" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="space-y-3 rounded-md border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-9 rounded-sm" />
            </div>
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3.5 w-32" />
          </div>
        ))}
      </div>

      {/* Attempt Progress Tracker Card */}
      <div className="space-y-4 rounded-md border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-60" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center justify-around py-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Writing Timer Planner Box */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-md border border-primary/20 bg-primary/5 p-5 sm:flex-row">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-3.5 w-80" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      {/* Tabs & Table */}
      <div className="space-y-4">
        <div className="flex gap-4 border-b border-border pb-2">
          <Skeleton className="h-8 w-44 rounded-sm" />
          <Skeleton className="h-8 w-44 rounded-sm" />
          <Skeleton className="h-8 w-32 rounded-sm" />
        </div>
        <div className="space-y-3 rounded-md border border-border bg-card p-6 shadow-xs">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-2 pt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-border/60 py-3"
              >
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-72" />
                <Skeleton className="h-6 w-16 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
