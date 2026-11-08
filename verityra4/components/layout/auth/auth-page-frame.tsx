import type { ReactNode } from "react"

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
      {children}
    </div>
  )
}
