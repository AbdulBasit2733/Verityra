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
        "flex flex-col gap-4 pb-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      {/* Left: Icon Tile + Title + Subtitle Stack */}
      <div className="flex min-w-0 items-center gap-3.5">
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs sm:h-12 sm:w-12">
            {IconComponent ? (
              <IconComponent className="h-6 w-6 sm:h-7 sm:w-7" />
            ) : React.isValidElement(icon) ? (
              icon
            ) : null}
          </div>
        )}
        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-xl font-extrabold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
              {title}
            </h1>
            {badgeText && (
              <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-secondary-foreground">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="truncate text-xs font-medium text-muted-foreground sm:text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Right: Refresh button + Action CTA buttons */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 sm:gap-2.5">
        {showRefresh && <PageHeaderRefreshButton />}
        {children}
      </div>
    </div>
  )
}
