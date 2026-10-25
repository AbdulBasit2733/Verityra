import * as React from "react"
import { cn } from "@/lib/utils"
import { PageHeaderRefreshButton } from "./page-header-refresh"

export interface PageHeaderProps {
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  title: string
  subtitle?: string
  badgeText?: string
  showRefresh?: boolean
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  icon,
  title,
  subtitle,
  badgeText,
  showRefresh = true,
  children,
  className,
}: PageHeaderProps) {
  const IconComponent = typeof icon === "function" ? icon : null

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2",
        className
      )}
    >
      {/* Left: Icon Tile + Title + Subtitle Stack */}
      <div className="flex items-center gap-3.5 min-w-0">
        {icon && (
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[#2A6AED] text-white shadow-xs shadow-blue-500/20 shrink-0">
            {IconComponent ? (
              <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
            ) : React.isValidElement(icon) ? (
              icon
            ) : null}
          </div>
        )}
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight truncate">
              {title}
            </h1>
            {badgeText && (
              <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 text-[11px] font-bold text-[#2A6AED] dark:text-blue-400 border border-blue-200/60 dark:border-blue-900/60">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Refresh button + Action CTA buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
        {showRefresh && <PageHeaderRefreshButton />}
        {children}
      </div>
    </div>
  )
}
