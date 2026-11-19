import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * KpiMetricStrip - Flat, divided KPI metric container (replaces card-based KpiStatCard)
 *
 * Modern SaaS design pattern:
 * - Horizontal strip with vertical hairline dividers
 * - No rounded corners (edge-to-edge)
 * - Top and bottom borders only
 * - 2-column grid on mobile, 4-column on desktop
 * - Zero card padding waste
 *
 * @example
 * <KpiMetricStrip>
 *   <KpiMetric label="Total Students" value="47" icon={Users} variant="blue" />
 *   <KpiMetric label="Active Tests" value="12" icon={BookOpen} variant="emerald" />
 * </KpiMetricStrip>
 */

interface KpiMetricStripProps {
  children: React.ReactNode
  className?: string
  columns?: 2 | 3 | 4 | 6
}

export function KpiMetricStrip({
  children,
  className,
  columns = 4,
}: KpiMetricStripProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
  }

  return (
    <div
      className={cn(
        "border-y border-border bg-card",
        "divide-x divide-border",
        "grid",
        gridCols[columns],
        className
      )}
    >
      {children}
    </div>
  )
}

export type KpiColorVariant =
  "blue" | "indigo" | "emerald" | "amber" | "rose" | "slate"

interface KpiMetricProps {
  label: string
  value: string | number
  subtext?: string
  icon: LucideIcon
  variant?: KpiColorVariant
  className?: string
  trend?: {
    value: string
    direction: "up" | "down"
  }
}

const variantStyles: Record<
  KpiColorVariant,
  {
    iconBg: string
    iconColor: string
    valueColor?: string
  }
> = {
  blue: {
    iconBg: "bg-secondary",
    iconColor: "text-primary",
  },
  indigo: {
    iconBg: "bg-secondary",
    iconColor: "text-primary",
  },
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    iconColor: "text-emerald-700 dark:text-emerald-300",
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    iconColor: "text-amber-800 dark:text-amber-300",
  },
  rose: {
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    iconColor: "text-rose-700 dark:text-rose-300",
  },
  slate: {
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
  },
}

export function KpiMetric({
  label,
  value,
  subtext,
  icon: Icon,
  variant = "blue",
  className,
  trend,
}: KpiMetricProps) {
  const styles = variantStyles[variant] || variantStyles.blue

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5",
        "transition-colors hover:bg-muted/50",
        className
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-sm sm:h-12 sm:w-12",
          styles.iconBg
        )}
      >
        <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", styles.iconColor)} />
      </div>

      {/* Content Stack */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <p
            className={cn(
              "truncate text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl",
              styles.valueColor
            )}
          >
            {value}
          </p>
          {trend && (
            <span
              className={cn(
                "text-xs font-bold",
                trend.direction === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              )}
            >
              {trend.direction === "up" ? "↑" : "↓"} {trend.value}
            </span>
          )}
        </div>
        <span className="mt-0.5 block truncate text-[11px] font-bold text-muted-foreground sm:text-xs">
          {label}
        </span>
        {subtext && (
          <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
            {subtext}
          </span>
        )}
      </div>
    </div>
  )
}
