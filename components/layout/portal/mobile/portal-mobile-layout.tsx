"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { toast } from "@/components/ui/sonner"
import {
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Lock,
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Users,
  User,
  Compass,
  Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { NavItem } from "../desktop/portal-desktop-layout"

export interface PortalMobileLayoutProps {
  role: "ADMIN" | "STUDENT"
  userName?: string | null
  userEmail?: string | null
  navItems: NavItem[]
  pathname: string
  isItemActive: (item: NavItem) => boolean
  handleSignOut: () => Promise<void>
  setCommandPaletteOpen: (open: boolean) => void
  children: React.ReactNode
}

export function PortalMobileLayout({
  role,
  userName,
  userEmail,
  navItems,
  pathname,
  isItemActive,
  handleSignOut,
  setCommandPaletteOpen,
  children,
}: PortalMobileLayoutProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)

  // Automatically close drawer on route change
  React.useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const displayName = userName || (role === "ADMIN" ? "Administrator" : "Candidate")
  const displayEmail = userEmail || (role === "ADMIN" ? "admin@verityra.com" : "candidate@verityra.com")
  const initials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "VT"

  // Primary bottom dock navigation destinations
  const dockNavItems =
    role === "ADMIN"
      ? [
          { label: "Overview", href: "/admin", icon: LayoutDashboard },
          { label: "Tests", href: "/admin/test-series", icon: BookOpen },
          { label: "Submissions", href: "/admin/submissions", icon: FileCheck2 },
          { label: "Students", href: "/admin/students", icon: Users },
          { label: "Profile", href: "/admin/profile", icon: User },
        ]
      : [
          { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
          { label: "Catalog", href: "/tests", icon: Compass },
          { label: "Rankings", href: "/leaderboard", icon: Trophy },
          { label: "Profile", href: "/student/profile", icon: User },
        ]

  return (
    <div className="flex lg:hidden min-h-screen flex-col bg-background text-foreground w-full overflow-x-hidden">
      {/* =========================================================
          1. MOBILE & TABLET STICKY TOPBAR (Screens S & M: < 1024px)
      ========================================================= */}
      <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left: Drawer Toggle Button & Brand Icon */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0 shadow-2xs active:scale-95 transition-all cursor-pointer"
            aria-label="Open navigation drawer"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href={role === "ADMIN" ? "/admin" : "/student/dashboard"}
            className="flex items-center gap-2 min-w-0"
          >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground font-extrabold text-sm shadow-xs shrink-0">
              V
            </div>
            <div className="min-w-0 truncate">
              <span className="font-heading text-sm font-bold tracking-tight text-slate-900 dark:text-white block leading-tight truncate">
                Verityra
              </span>
              <span className="text-[10px] font-semibold text-[#2A6AED] dark:text-blue-400 uppercase tracking-wider block leading-none">
                {role === "ADMIN" ? "Admin" : "Candidate"}
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions: Quick Search, Bell, Theme, Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Search Trigger */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs active:scale-95 cursor-pointer"
            aria-label="Open search command palette"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => {
              toast.info("Notifications", {
                description: "All evaluation queues and security audits are up to date.",
              })
            }}
            className="relative h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs active:scale-95 cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
              3
            </span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Profile Avatar */}
          <Link
            href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
            className="h-8 w-8 rounded-full bg-[#EFF6FF] dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-[#2A6AED] dark:text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs ml-0.5"
            aria-label="View profile"
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* =========================================================
          2. SLIDE-OVER NAVIGATION DRAWER (Screens S & M)
      ========================================================= */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-[300px] max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col justify-between z-10 shadow-2xl border-r border-slate-200 dark:border-slate-800 animate-slide-in-left">
            <div>
              {/* Drawer Top Header */}
              <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
                <Link
                  href={role === "ADMIN" ? "/admin" : "/student/dashboard"}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A6AED] text-white font-extrabold text-base shadow-xs">
                    V
                  </div>
                  <div>
                    <span className="font-heading text-sm font-bold text-slate-900 dark:text-white block leading-tight">
                      Verityra
                    </span>
                    <span className="text-[10px] font-bold text-[#2A6AED] dark:text-blue-400 uppercase tracking-wider">
                      {role === "ADMIN" ? "Admin Suite" : "Candidate Suite"}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="h-9 w-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="p-3.5 space-y-1">
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Navigation
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isItemActive(item)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setDrawerOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors min-h-[44px]",
                        active
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                      )}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-400")} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {active && <ChevronRight className="h-4 w-4 text-white shrink-0" />}
                    </Link>
                  )
                })}
              </div>

              {/* Security Pill */}
              <div className="px-4 py-2 mx-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#2A6AED] dark:text-blue-400 shrink-0" />
                <span>{role === "ADMIN" ? "Audited Governance" : "256-Bit Submission Vault"}</span>
              </div>
            </div>

            {/* Drawer Bottom User Profile & Sign Out */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 space-y-2.5">
              <Link
                href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
              >
                <div className="h-9 w-9 rounded-full bg-[#2A6AED] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#2A6AED] transition-colors truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayEmail}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-[#2A6AED] transition-colors shrink-0" />
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Public Site
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-1.5 h-9 px-2 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-[11px] font-semibold text-red-600 dark:text-red-400 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          3. MAIN MOBILE / TABLET WORKSPACE CONTENT (S & M)
          Bottom padding ensures no content hidden behind bottom dock
      ========================================================= */}
      <main className="flex-1 py-5 px-4 sm:px-6 max-w-5xl w-full mx-auto pb-24 space-y-5">
        {children}
      </main>

      {/* =========================================================
          4. FLOATING BOTTOM NAVIGATION DOCK (Thumb Reach for Mobile S)
      ========================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 px-3 sm:px-6 shadow-lg shadow-slate-900/5"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {dockNavItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all text-center min-w-[56px] min-h-[48px] active:scale-95 cursor-pointer",
                  active
                    ? "text-[#2A6AED] dark:text-blue-400 font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                    active ? "bg-[#EFF6FF] dark:bg-blue-950/70 text-[#2A6AED] dark:text-blue-400" : ""
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="text-[10px] leading-tight block">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
