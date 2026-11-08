"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Users,
  User,
  Trophy,
  Compass,
  CreditCard,
  Settings,
  Search,
  ArrowRight,
} from "lucide-react"

/**
 * Desktop Command Palette (Ctrl+K / Cmd+K)
 *
 * Fast jump navigation across the Verityra platform:
 * - Student: Dashboard, Tests, Leaderboard, Profile
 * - Admin: Overview, Test Series, Submissions, Students, Payments, Profile
 *
 * Usage:
 * ```tsx
 * <DesktopCommandPalette
 *   open={commandPaletteOpen}
 *   onOpenChange={setCommandPaletteOpen}
 *   role="ADMIN" | "STUDENT"
 * />
 * ```
 */

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: "ADMIN" | "STUDENT"
}

interface NavCommand {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  keywords?: string[]
  category: string
}

const adminCommands: NavCommand[] = [
  {
    label: "Overview Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
    keywords: ["home", "stats", "metrics", "kpi"],
    category: "Navigation",
  },
  {
    label: "Test Series Management",
    href: "/admin/test-series",
    icon: BookOpen,
    keywords: ["tests", "papers", "exams", "create", "manage"],
    category: "Navigation",
  },
  {
    label: "Submissions & Reviews",
    href: "/admin/submissions",
    icon: FileCheck2,
    keywords: ["evaluations", "answers", "score", "grade", "review"],
    category: "Navigation",
  },
  {
    label: "Candidates & Overrides",
    href: "/admin/students",
    icon: Users,
    keywords: ["users", "students", "candidates", "attempts"],
    category: "Navigation",
  },
  {
    label: "Payments & Financials",
    href: "/admin/payments",
    icon: CreditCard,
    keywords: ["revenue", "razorpay", "refunds", "transactions"],
    category: "Navigation",
  },
  {
    label: "Profile & Settings",
    href: "/admin/profile",
    icon: User,
    keywords: ["account", "preferences", "password"],
    category: "Settings",
  },
  {
    label: "Create New Test Series",
    href: "/admin/test-series/new",
    icon: BookOpen,
    keywords: ["new", "add", "create", "test", "exam"],
    category: "Quick Actions",
  },
]

const studentCommands: NavCommand[] = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
    keywords: ["home", "overview", "enrolled", "progress"],
    category: "Navigation",
  },
  {
    label: "My Tests",
    href: "/student/tests",
    icon: BookOpen,
    keywords: ["registered", "free", "attempts", "take test"],
    category: "Navigation",
  },
  {
    label: "Purchases",
    href: "/student/purchases",
    icon: CreditCard,
    keywords: ["paid", "orders", "payments", "bought", "access"],
    category: "Navigation",
  },
  {
    label: "Profile & Settings",
    href: "/student/profile",
    icon: User,
    keywords: ["account", "preferences", "password", "info"],
    category: "Navigation",
  },
  {
    label: "Explore Test Catalog",
    href: "/tests",
    icon: Compass,
    keywords: ["browse", "available", "tests", "enroll", "buy"],
    category: "Navigation",
  },
  {
    label: "Live Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
    keywords: ["rankings", "scores", "top", "performance"],
    category: "Navigation",
  },
]

export function DesktopCommandPalette({ open, onOpenChange, role }: CommandPaletteProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = React.useState("")

  const commands = role === "ADMIN" ? adminCommands : studentCommands

  // Filter commands based on search query
  const filteredCommands = React.useMemo(() => {
    if (!searchQuery) return commands

    const query = searchQuery.toLowerCase()
    return commands.filter((cmd) => {
      const labelMatch = cmd.label.toLowerCase().includes(query)
      const keywordMatch = cmd.keywords?.some((kw) => kw.toLowerCase().includes(query))
      return labelMatch || keywordMatch
    })
  }, [commands, searchQuery])

  // Group commands by category
  const groupedCommands = React.useMemo(() => {
    const groups: Record<string, NavCommand[]> = {}
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

  const handleSelect = React.useCallback(
    (href: string) => {
      onOpenChange(false)
      setSearchQuery("")
      router.push(href)
    },
    [onOpenChange, router]
  )

  // Reset search when dialog closes
  React.useEffect(() => {
    if (!open) {
      setSearchQuery("")
    }
  }, [open])

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <Command className="rounded-xl border border-border shadow-lg">
        <div className="flex items-center border-b border-border px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <CommandInput
            placeholder={
              role === "ADMIN"
                ? "Search tests, submissions, students, payments..."
                : "Search dashboard, tests, leaderboard..."
            }
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="flex h-12 w-full rounded-lg bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          <kbd className="pointer-events-none ml-auto hidden h-6 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            ESC
          </kbd>
        </div>
        <CommandList className="max-h-[400px] overflow-y-auto p-2">
          <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
            No results found for &quot;{searchQuery}&quot;
          </CommandEmpty>

          {Object.entries(groupedCommands).map(([category, items], idx) => (
            <React.Fragment key={category}>
              {idx > 0 && <CommandSeparator className="my-2" />}
              <CommandGroup heading={category} className="px-2 py-1.5">
                {items.map((command) => {
                  const Icon = command.icon
                  return (
                    <CommandItem
                      key={command.href}
                      value={command.label}
                      onSelect={() => handleSelect(command.href)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{command.label}</p>
                        {command.keywords && (
                          <p className="text-xs text-muted-foreground">
                            {command.keywords.slice(0, 3).join(" · ")}
                          </p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </CommandItem>
                  )
                })}
              </CommandGroup>
            </React.Fragment>
          ))}
        </CommandList>

        {/* Footer hint */}
        <div className="border-t border-border px-4 py-3 text-xs text-muted-foreground flex items-center justify-between">
          <span>Navigate with arrow keys</span>
          <span className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono">↵</kbd>
            to select
          </span>
        </div>
      </Command>
    </CommandDialog>
  )
}
