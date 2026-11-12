import * as React from "react"
import { cn } from "@/lib/utils"

export type KpiColorVariant =
  "blue" | "indigo" | "emerald" | "amber" | "rose" | "slate"

export interface KpiStatCardProps {
  label: string
  value: string | number
  subtext?: string
  icon: React.ComponentType<{ className?: string }>
  variant?: KpiColorVariant
  className?: string
}

const variantStyles: Record<
  KpiColorVariant,
  {
    iconBox: string
    iconColor: string
    valueColor?: string
  }
> = {
  blue: {
    iconBox: "bg-secondary border border-border",
    iconColor: "text-primary",
  },
  indigo: {
    iconBox: "bg-secondary border border-border",
    iconColor: "text-primary",
  },
  emerald: {
    iconBox: "bg-emerald-50 dark:bg-emerald-950/60 border border-border",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    iconBox: "bg-amber-50 dark:bg-amber-950/60 border border-border",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    iconBox: "bg-rose-50 dark:bg-rose-950/60 border border-border",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  slate: {
    iconBox: "bg-muted border border-border",
    iconColor: "text-muted-foreground",
  },
}

export function KpiStatCard({
  label,
  value,
  subtext,
  icon: Icon,
  variant = "blue",
  className,
}: KpiStatCardProps) {
  const styles = variantStyles[variant] || variantStyles.blue

  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-card transition-colors hover:border-primary/40 sm:p-5",
        className
      )}
    >
      {/* Left Icon Container */}
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          styles.iconBox
        )}
      >
        <Icon className={cn("h-6 w-6", styles.iconColor)} />
      </div>

      {/* Right Content Stack */}
      <div className="min-w-0 flex-1">
        <span className="block truncate text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          {label}
        </span>
        <p className="mt-0.5 truncate text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
          {value}
        </p>
        {subtext && (
          <span className="mt-0.5 block truncate text-xs font-medium text-muted-foreground">
            {subtext}
          </span>
        )}
      </div>
    </div>
  )
}
