"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PageHeaderRefreshButton() {
  const router = useRouter()
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    router.refresh()
    setTimeout(() => {
      setIsRefreshing(false)
    }, 600)
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="h-10 rounded-md border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <RotateCcw
        className={cn(
          "mr-1.5 h-3.5 w-3.5 transition-transform",
          isRefreshing && "animate-spin"
        )}
      />
      Refresh
    </Button>
  )
}
