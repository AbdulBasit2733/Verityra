"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Laptop, Moon, Sun, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeToggle({
  variant = "icon",
  className,
}: {
  variant?: "icon" | "inline"
  className?: string
}) {
  const { theme, resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (variant === "inline") {
    const activeTheme = mounted ? theme || "system" : "light"
    return (
      <div
        className={cn(
          "inline-flex items-center rounded-xl border border-border bg-muted/50 p-1 gap-1",
          className
        )}
        role="group"
        aria-label="Theme selector"
      >
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
            activeTheme === "light"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Sun className="h-3.5 w-3.5 text-amber-500" />
          Light
        </button>
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
            activeTheme === "dark"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Moon className="h-3.5 w-3.5 text-[#3B82F6]" />
          Dark
        </button>
        <button
          type="button"
          onClick={() => setTheme("system")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
            activeTheme === "system"
              ? "bg-card text-foreground shadow-2xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Laptop className="h-3.5 w-3.5" />
          Auto
        </button>
      </div>
    )
  }

  const isDark = mounted && resolvedTheme === "dark"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Toggle color theme"
            className={cn(
              "h-9 w-9 rounded-lg border-border bg-card text-foreground hover:bg-secondary hover:text-brand transition-colors shrink-0",
              className
            )}
          />
        }
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-[#60A5FA] transition-transform duration-200" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 transition-transform duration-200" />
        )}
        <span className="sr-only">Toggle theme</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40 p-1.5 rounded-xl">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center justify-between text-xs font-semibold rounded-lg py-2 px-2.5 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Sun className="h-3.5 w-3.5 text-amber-500" />
            Light Mode
          </span>
          {mounted && theme === "light" && <Check className="h-3.5 w-3.5 text-brand" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center justify-between text-xs font-semibold rounded-lg py-2 px-2.5 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Moon className="h-3.5 w-3.5 text-[#60A5FA]" />
            Dark Mode
          </span>
          {mounted && theme === "dark" && <Check className="h-3.5 w-3.5 text-brand" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center justify-between text-xs font-semibold rounded-lg py-2 px-2.5 cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Laptop className="h-3.5 w-3.5 text-muted-foreground" />
            System
          </span>
          {mounted && theme === "system" && <Check className="h-3.5 w-3.5 text-brand" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
