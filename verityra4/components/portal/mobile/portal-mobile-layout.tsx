"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
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
import { BRAND_CONFIG } from "@/lib/brand"
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

  const displayName =
    userName || (role === "ADMIN" ? "Administrator" : "Candidate")
  const displayEmail =
    userEmail ||
    (role === "ADMIN"
      ? BRAND_CONFIG.defaultAdminEmail
      : BRAND_CONFIG.defaultCandidateEmail)
  const initials =
    displayName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || BRAND_CONFIG.monogram

  // Primary bottom dock navigation destinations
  const dockNavItems =
    role === "ADMIN"
      ? [
          { label: "Overview", href: "/admin", icon: LayoutDashboard },
          { label: "Tests", href: "/admin/test-series", icon: BookOpen },
          {
            label: "Submissions",
            href: "/admin/submissions",
            icon: FileCheck2,
          },
          { label: "Students", href: "/admin/students", icon: Users },
          { label: "Profile", href: "/admin/profile", icon: User },
        ]
      : [
          {
            label: "Dashboard",
            href: "/student/dashboard",
            icon: LayoutDashboard,
          },
          { label: "Catalog", href: "/tests", icon: Compass },
          { label: "Rankings", href: "/leaderboard", icon: Trophy },
          { label: "Profile", href: "/student/profile", icon: User },
        ]

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-background text-foreground lg:hidden">
      {/* =========================================================
          1. MOBILE & TABLET STICKY TOPBAR (Screens S & M: < 1024px)
      ========================================================= */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 backdrop-blur-md sm:px-6">
        {/* Left: Drawer Toggle Button & Brand Icon */}
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border bg-card text-foreground shadow-2xs transition-colors hover:bg-muted"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link
            href={role === "ADMIN" ? "/admin" : "/student/dashboard"}
            className="flex min-w-0 items-center gap-2"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-extrabold text-primary-foreground shadow-xs">
              {BRAND_CONFIG.initials}
            </div>
            <div className="min-w-0 truncate">
              <span className="block truncate font-heading text-sm leading-tight font-bold tracking-tight text-slate-900 dark:text-white">
                {BRAND_CONFIG.name}
              </span>
              <span className="block text-[10px] leading-none font-semibold tracking-wider text-[#2A6AED] uppercase dark:text-blue-400">
                {role === "ADMIN" ? "Admin" : "Candidate"}
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions: Quick Search, Bell, Theme, Avatar */}
        <div className="hidden" aria-hidden="true">
          {/* Quick Search Trigger */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open search command palette"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notifications */}
          <button
            type="button"
            onClick={() => {
              toast.info("Notifications", {
                description:
                  "All evaluation queues and security audits are up to date.",
              })
            }}
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-2xs transition-colors hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
              3
            </span>
          </button>

          {/* User Profile Avatar */}
          <Link
            href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
            className="ml-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-[#EFF6FF] text-xs font-extrabold text-[#2A6AED] shadow-2xs dark:border-blue-800 dark:bg-blue-950/80 dark:text-blue-400"
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
            className="animate-fade-in fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="animate-slide-in-left relative z-10 flex h-full w-[300px] max-w-[85vw] flex-col justify-between border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div>
              {/* Drawer Top Header */}
              <div className="flex h-16 items-center justify-between border-b border-slate-200/80 px-4 dark:border-slate-800">
                <Link
                  href={role === "ADMIN" ? "/admin" : "/student/dashboard"}
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A6AED] text-base font-extrabold text-white shadow-xs">
                    {BRAND_CONFIG.initials}
                  </div>
                  <div>
                    <span className="block font-heading text-sm leading-tight font-bold text-slate-900 dark:text-white">
                      {BRAND_CONFIG.name}
                    </span>
                    <span className="text-[10px] font-bold tracking-wider text-[#2A6AED] uppercase dark:text-blue-400">
                      {role === "ADMIN" ? "Admin Suite" : "Candidate Suite"}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <div className="space-y-1 p-3.5">
                <p className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-slate-400 uppercase dark:text-slate-500">
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
                        "flex min-h-[44px] items-center justify-between rounded-lg px-3.5 py-2.5 text-xs font-bold transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/80"
                      )}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0",
                            active ? "text-white" : "text-slate-400"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {active && (
                        <ChevronRight className="h-4 w-4 shrink-0 text-white" />
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Security Pill */}
              <div className="mx-3 flex items-center gap-2 rounded-xl border border-slate-200/70 bg-slate-50 px-4 py-2 text-[11px] text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <ShieldCheck className="h-4 w-4 shrink-0 text-[#2A6AED] dark:text-blue-400" />
                <span>
                  {role === "ADMIN"
                    ? "Audited Governance"
                    : "256-Bit Submission Vault"}
                </span>
              </div>
            </div>

            {/* Drawer Bottom User Profile & Sign Out */}
            <div className="space-y-2.5 border-t border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-950/60">
              <Link
                href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
                onClick={() => setDrawerOpen(false)}
                className="hidden"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2A6AED] text-xs font-bold text-white shadow-2xs">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-900 transition-colors group-hover:text-[#2A6AED] dark:text-slate-100">
                    {displayName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {displayEmail}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-[#2A6AED]" />
              </Link>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/"
                  onClick={() => setDrawerOpen(false)}
                  className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-[11px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Public Site
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-2 text-[11px] font-semibold text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
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
      <main className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-4 py-5 pb-24 sm:px-6">
        {children}
      </main>

      {/* =========================================================
          4. FLOATING BOTTOM NAVIGATION DOCK (Thumb Reach for Mobile S)
      ========================================================= */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/80 bg-white/95 px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg shadow-slate-900/5 backdrop-blur-lg sm:px-6 dark:border-slate-800 dark:bg-slate-900/95"
      >
        <div className="mx-auto flex max-w-md items-center justify-around">
          {dockNavItems.map((item) => {
            const Icon = item.icon
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-[48px] min-w-[56px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-lg px-3 py-1 text-center transition-colors",
                  active
                    ? "bg-[#2A6AED] font-bold text-white shadow-sm"
                    : "font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                )}
              >
                <div
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                    active ? "bg-white/15 text-white" : ""
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                </div>
                <span className="block text-[10px] leading-tight">
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
