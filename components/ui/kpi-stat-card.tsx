import * as React from "react"
import { cn } from "@/lib/utils"

export type KpiColorVariant = "blue" | "indigo" | "emerald" | "amber" | "rose" | "slate"

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
    iconBox: "bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/50",
    iconColor: "text-[#2A6AED] dark:text-blue-400",
  },
  indigo: {
    iconBox: "bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    iconBox: "bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  amber: {
    iconBox: "bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  rose: {
    iconBox: "bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900/50",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  slate: {
    iconBox: "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700",
    iconColor: "text-slate-600 dark:text-slate-300",
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
        "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs flex items-center gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700",
        className
      )}
    >
      {/* Left Icon Container */}
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
          styles.iconBox
        )}
      >
        <Icon className={cn("h-6 w-6", styles.iconColor)} />
      </div>

      {/* Right Content Stack */}
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block truncate">
          {label}
        </span>
        <p className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-0.5 truncate">
          {value}
        </p>
        {subtext && (
          <span className="text-xs text-slate-500 dark:text-slate-400 block truncate mt-0.5 font-medium">
            {subtext}
          </span>
        )}
      </div>
    </div>
  )
}
