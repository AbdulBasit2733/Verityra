import * as React from "react"
import { cn } from "@/lib/utils"

function Progress({
  value = 0,
  max = 100,
  className,
  indicatorClassName,
  ...props
}: React.ComponentProps<"div"> & {
  value?: number
  max?: number
  indicatorClassName?: string
}) {
  const percentage = Math.min(
    100,
    Math.max(0, (value / Math.max(1, max)) * 100)
  )

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      data-slot="progress"
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-slate-100",
        className
      )}
      {...props}
    >
      <div
        data-slot="progress-indicator"
        className={cn(
          "h-full rounded-full bg-[#2A6AED] transition-[width] duration-300",
          indicatorClassName
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

export { Progress }
