import type { ReactNode } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"

export function AuthPageFrame({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={cn("auth-page-shell relative", className)}>
      <div className="absolute top-4 right-4 z-20 sm:top-6 sm:right-6">
        <ThemeToggle className="h-11 w-11" />
      </div>
      {children}
    </div>
  )
}
