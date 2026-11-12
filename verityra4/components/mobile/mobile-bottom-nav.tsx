"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-media-query"
import { LayoutDashboard, BookOpen, Trophy, User } from "lucide-react"

/**
 * Mobile Bottom Navigation Bar (Student Portal Only)
 *
 * Touch-optimized navigation with 44px minimum touch targets
 * Fixed to bottom with safe-area-inset-bottom padding
 * Only visible on mobile devices (< 1024px)
 *
 * Navigation:
 * - Dashboard: Student dashboard with enrolled tests
 * - Tests: Browse test catalog
 * - Leaderboard: Live rankings
 * - Profile: Settings and account
 *
 * Usage:
 * ```tsx
 * <MobileBottomNav />
 * ```
 */

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  matchPaths?: string[]
}

const studentNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
    matchPaths: ["/student/dashboard", "/student/tests"],
  },
  {
    label: "Tests",
    href: "/tests",
    icon: BookOpen,
    matchPaths: ["/tests"],
  },
  {
    label: "Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
    matchPaths: ["/leaderboard"],
  },
  {
    label: "Profile",
    href: "/student/profile",
    icon: User,
    matchPaths: ["/student/profile"],
  },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const isMobile = useIsMobile()

  // Only render on mobile devices
  if (!isMobile) {
    return null
  }

  // Only show on student pages
  const isStudentPage =
    pathname.startsWith("/student") ||
    pathname.startsWith("/tests") ||
    pathname.startsWith("/leaderboard")

  if (!isStudentPage) {
    return null
  }

  const isItemActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) => pathname.startsWith(path))
    }
    return pathname === item.href
  }

  return (
    <>
      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-20" aria-hidden="true" />

      {/* Fixed Bottom Navigation */}
      <nav
        className="fixed right-0 bottom-0 left-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {studentNavItems.map((item) => {
            const Icon = item.icon
            const active = isItemActive(item)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[56px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 transition-all duration-200",
                  active
                    ? "bg-[#2A6AED] text-white shadow-sm"
                    : "text-slate-600 active:bg-slate-100 dark:text-slate-400 dark:active:bg-slate-800"
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-white" : "text-slate-500 dark:text-slate-400"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-wider uppercase transition-colors",
                    active ? "text-white" : "text-slate-600 dark:text-slate-400"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
