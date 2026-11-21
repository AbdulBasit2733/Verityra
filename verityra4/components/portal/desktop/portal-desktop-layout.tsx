"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "@/components/ui/sonner"
import {
  ShieldCheck,
  Lock,
  LogOut,
  ExternalLink,
  ChevronRight,
  Search,
  Bell,
  Plus,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BRAND_CONFIG } from "@/lib/brand"

export interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

export interface PortalDesktopLayoutProps {
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

export function PortalDesktopLayout({
  role,
  userName,
  userEmail,
  navItems,
  pathname,
  isItemActive,
  handleSignOut,
  setCommandPaletteOpen,
  children,
}: PortalDesktopLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  // Load sidebar preference from localStorage (checking legacy key for seamless migration)
  React.useEffect(() => {
    const saved =
      localStorage.getItem(BRAND_CONFIG.sidebarStorageKey) ??
      localStorage.getItem(BRAND_CONFIG.legacySidebarStorageKey)
    if (saved !== null) {
      setSidebarCollapsed(saved === "true")
    }
  }, [])

  // Save sidebar preference to localStorage
  const toggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((prev) => {
      const newValue = !prev
      localStorage.setItem(BRAND_CONFIG.sidebarStorageKey, String(newValue))
      return newValue
    })
  }, [])

  // Keyboard shortcut: Ctrl+B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

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

  return (
    <div className="hidden min-h-screen w-full overflow-x-clip bg-background text-foreground lg:flex">
      {/* =========================================================
          DESKTOP LEFT SIDEBAR (Screen L: >= 1024px)
          Collapsible: w-64 expanded | w-16 collapsed (Ctrl+B)
      ========================================================= */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col justify-between border-r border-border bg-card shadow-sm select-none",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-16 items-center border-b border-border",
            sidebarCollapsed ? "justify-center px-1.5" : "justify-between px-5"
          )}
        >
          <Link
            href={role === "ADMIN" ? "/admin" : "/student/dashboard"}
            className="group flex items-center"
            aria-label={`${BRAND_CONFIG.name} dashboard`}
            title={sidebarCollapsed ? BRAND_CONFIG.name : undefined}
          >
            <Image
              src={BRAND_CONFIG.logo}
              alt={BRAND_CONFIG.name}
              width={2172}
              height={724}
              sizes="(max-width: 768px) 120px, 160px"
              priority
              className={cn(
                "w-auto object-contain transition-all",
                sidebarCollapsed ? "h-4" : "h-8"
              )}
            />
          </Link>
          {!sidebarCollapsed && (
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-slate-100 text-slate-400 dark:bg-slate-800">
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Navigation Links with Shadcn Tooltips */}
        <div
          className={cn(
            "flex-1 space-y-5 overflow-y-auto py-5",
            sidebarCollapsed ? "px-2" : "px-3.5"
          )}
        >
          <div className="space-y-1.5">
            {!sidebarCollapsed && (
              <p className="mb-2 px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                {role === "ADMIN"
                  ? "Management & Governance"
                  : "Workspace & Practice"}
              </p>
            )}
            <TooltipProvider>
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isItemActive(item)

                if (sidebarCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger>
                        <Link
                          href={item.href}
                          className={cn(
                            "group flex w-full cursor-pointer items-center justify-center rounded-md p-2.5 text-xs font-bold transition-colors duration-150",
                            active
                              ? "bg-primary text-primary-foreground shadow-xs"
                              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0 transition-colors",
                              active
                                ? "text-white"
                                : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
                            )}
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        className="text-xs font-semibold"
                      >
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex cursor-pointer items-center justify-between rounded-md px-3.5 py-2.5 text-xs font-bold transition-colors duration-150",
                      active
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-slate-100"
                    )}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active
                            ? "text-white"
                            : "text-slate-400 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {active && (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/80" />
                    )}
                  </Link>
                )
              })}
            </TooltipProvider>
          </div>

          {!sidebarCollapsed && (
            <>
              <Separator className="bg-slate-200/80 dark:bg-slate-800" />

              {/* Security & Invariant Note */}
              <div className="space-y-1.5 px-3">
                <div className="flex items-center gap-2 text-[#2A6AED] dark:text-blue-400">
                  {role === "ADMIN" ? (
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {role === "ADMIN"
                      ? "Audited Governance"
                      : "3-Attempt Guarantee"}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {role === "ADMIN"
                    ? "All score edits & extra attempt overrides are logged to the immutable audit trail."
                    : "Each enrolled test includes 3 evaluated handwritten attempts in our encrypted vault."}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bottom Profile, Quick Links & Collapse Button */}
        <div className="space-y-2.5 border-t border-border p-3.5">
          {sidebarCollapsed ? (
            <TooltipProvider>
              {/* Collapsed: Show only avatar */}
              <Tooltip>
                <TooltipTrigger>
                  <Link
                    href={
                      role === "ADMIN" ? "/admin/profile" : "/student/profile"
                    }
                    className="flex w-full cursor-pointer items-center justify-center rounded-md p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A6AED] text-xs font-bold text-white shadow-2xs">
                      {initials}
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-semibold">
                  <p className="font-bold">{displayName}</p>
                  <p className="text-slate-400">{displayEmail}</p>
                </TooltipContent>
              </Tooltip>

              {/* Toggle Sidebar Button */}
              <Tooltip>
                <TooltipTrigger>
                  <button
                    type="button"
                    onClick={toggleSidebar}
                    className="flex h-9 w-full cursor-pointer items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    aria-label="Expand sidebar"
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" className="text-xs font-semibold">
                  Expand Sidebar (Ctrl+B)
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <Link
                href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
                className="group flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Open Profile & Settings"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2A6AED] text-xs font-bold text-white shadow-2xs">
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
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-400 transition-colors group-hover:text-[#2A6AED]" />
              </Link>

              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/"
                  className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                >
                  <ExternalLink className="h-3 w-3" />
                  Public Site
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-red-200/80 bg-red-50/50 px-2.5 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-100/70 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-900/40"
                >
                  <LogOut className="h-3 w-3" />
                  Sign Out
                </button>
              </div>

              {/* Toggle Sidebar Button - Expanded */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
                Collapse Sidebar
                <kbd className="ml-auto hidden rounded-sm border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] xl:inline-flex dark:border-slate-700 dark:bg-slate-900">
                  Ctrl+B
                </kbd>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* =========================================================
          DESKTOP MAIN WORKSPACE STAGE (Screen L: >= 1024px)
          Padding adjusts dynamically based on sidebar state
      ========================================================= */}
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          sidebarCollapsed ? "pl-16" : "pl-64"
        )}
      >
        {/* Sticky Command Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-card px-6 lg:px-8">
          {/* Global Search Input - Opens Command Palette (Ctrl+K) */}
          <div className="relative max-w-xl min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={
                role === "ADMIN"
                  ? "Search tests, submissions, students, payments..."
                  : "Search dashboard, tests, leaderboard..."
              }
              readOnly
              onClick={() => setCommandPaletteOpen(true)}
              className="h-11 w-full cursor-pointer rounded-md border border-border bg-muted/70 pr-16 pl-10 text-xs text-foreground transition-colors placeholder:text-muted-foreground hover:border-[#2A6AED]/50 hover:bg-card focus-visible:ring-2 focus-visible:ring-[#2A6AED]/30 focus-visible:outline-none sm:text-sm"
            />
            <div className="absolute top-1/2 right-2.5 flex -translate-y-1/2 items-center gap-0.5 rounded-sm border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold text-slate-400 shadow-2xs dark:border-slate-800 dark:bg-slate-900 dark:text-slate-500">
              <kbd className="font-mono">Ctrl</kbd>
              <span className="text-slate-300 dark:text-slate-700">+</span>
              <kbd className="font-mono">K</kbd>
            </div>
          </div>

          {/* Right Utility Actions */}
          <div className="flex shrink-0 items-center gap-3">
            {/* Quick Action Button */}
            {role === "ADMIN" ? (
              <Link href="/admin/test-series/new">
                <Button
                  size="sm"
                  className="h-9 cursor-pointer rounded-md bg-[#2A6AED] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1E55C7]"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add New
                </Button>
              </Link>
            ) : (
              <Link href="/tests">
                <Button
                  size="sm"
                  className="h-9 cursor-pointer rounded-md bg-[#2A6AED] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[#1E55C7]"
                >
                  <Compass className="mr-1.5 h-3.5 w-3.5" />
                  Explore Tests
                </Button>
              </Link>
            )}

            {/* Role / Vault Status Badge */}
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 rounded-sm border-blue-200 bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-bold text-[#2A6AED] dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-400"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {role === "ADMIN" ? "Admin Suite" : "256-Bit Vault"}
            </Badge>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => {
                toast.info("Notifications", {
                  description:
                    "All evaluation queues and security audits are up to date.",
                })
              }}
              className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-muted-foreground shadow-none transition-colors hover:bg-muted"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
                3
              </span>
            </button>

            {/* User Profile Avatar Pill */}
            <Link
              href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
              className="group flex cursor-pointer items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-800"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-[#EFF6FF] text-xs font-extrabold text-[#2A6AED] shadow-2xs dark:border-blue-800 dark:bg-blue-950/80 dark:text-blue-400">
                {initials}
              </div>
              <span className="hidden max-w-[130px] truncate text-xs font-bold text-slate-800 transition-colors group-hover:text-[#2A6AED] xl:inline-block dark:text-slate-200">
                {displayName}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-6 py-8 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
