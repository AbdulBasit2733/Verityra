import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, Circle, Lock } from "lucide-react"

/**
 * Dynamic Attempt Progress Tracker
 *
 * Renders attempt progression nodes dynamically based on maxAttempts (not hardcoded to 3).
 * Supports admin-granted extra attempts beyond the standard 3-attempt guarantee.
 *
 * Visual States:
 * - Completed: Filled dot with checkmark (CheckCircle2)
 * - Current/Available: Empty dot (Circle)
 * - Locked: Greyed out with lock icon
 *
 * Usage:
 * ```tsx
 * <AttemptProgressTracker
 *   attemptsUsed={2}
 *   maxAttempts={4}
 *   submissions={[{attemptNumber: 1, status: "COMPLETED"}, {attemptNumber: 2, status: "PENDING"}]}
 * />
 * ```
 */

interface AttemptProgressTrackerProps {
  attemptsUsed: number
  maxAttempts: number
  submissions: Array<{ attemptNumber: number; status: string }>
  className?: string
}

export function AttemptProgressTracker({
  attemptsUsed,
  maxAttempts,
  submissions,
  className,
}: AttemptProgressTrackerProps) {
  const attempts = Array.from({ length: maxAttempts }, (_, i) => i + 1)

  const getAttemptState = (
    attemptNumber: number
  ): "completed" | "available" | "locked" => {
    const submission = submissions.find(
      (s) => s.attemptNumber === attemptNumber
    )

    if (submission) {
      return "completed"
    }

    if (attemptNumber <= attemptsUsed + 1) {
      return "available"
    }

    return "locked"
  }

  const getAttemptIcon = (state: "completed" | "available" | "locked") => {
    switch (state) {
      case "completed":
        return CheckCircle2
      case "available":
        return Circle
      case "locked":
        return Lock
    }
  }

  const getAttemptLabel = (attemptNumber: number): string => {
    // If this is attempt 4+ (beyond standard 3), mark as admin-granted
    if (attemptNumber > 3) {
      return `Attempt ${attemptNumber} (Extra)`
    }
    return `Attempt ${attemptNumber}`
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {attempts.map((attemptNumber, index) => {
        const state = getAttemptState(attemptNumber)
        const Icon = getAttemptIcon(state)
        const isLast = index === attempts.length - 1

        return (
          <React.Fragment key={attemptNumber}>
            {/* Attempt Node */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex items-center justify-center rounded-full transition-all",
                  state === "completed" &&
                    "h-8 w-8 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
                  state === "available" &&
                    "h-8 w-8 bg-blue-100 text-[#2A6AED] dark:bg-blue-950/60 dark:text-blue-300",
                  state === "locked" &&
                    "h-8 w-8 bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                )}
                title={getAttemptLabel(attemptNumber)}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Attempt Number Label */}
              <span
                className={cn(
                  "text-[10px] font-bold tracking-wide uppercase",
                  state === "completed" &&
                    "text-emerald-800 dark:text-emerald-300",
                  state === "available" && "text-[#2A6AED] dark:text-blue-300",
                  state === "locked" && "text-slate-600 dark:text-slate-400"
                )}
              >
                {attemptNumber}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={cn(
                  "mx-1 h-0.5 min-w-[16px] flex-1",
                  state === "completed"
                    ? "bg-emerald-400 dark:bg-emerald-800"
                    : "bg-slate-300 dark:bg-slate-700"
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

/**
 * Compact version for mobile or inline display
 */
export function AttemptProgressTrackerCompact({
  attemptsUsed,
  maxAttempts,
  submissions,
  className,
}: AttemptProgressTrackerProps) {
  const completedCount = submissions.length
  const availableCount = Math.max(0, maxAttempts - attemptsUsed)

  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <div className="flex items-center gap-1">
        <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
        <span className="font-semibold text-foreground">{completedCount}</span>
        <span className="text-muted-foreground">done</span>
      </div>

      <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

      <div className="flex items-center gap-1">
        <Circle className="h-4 w-4 text-[#2A6AED] dark:text-blue-300" />
        <span className="font-semibold text-foreground">{availableCount}</span>
        <span className="text-muted-foreground">left</span>
      </div>

      {maxAttempts > 3 && (
        <>
          <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
          <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
            +{maxAttempts - 3} extra
          </span>
        </>
      )}
    </div>
  )
}
