"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Users,
  User,
  Trophy,
  Compass,
  ShieldCheck,
  Lock,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Search,
  Bell,
  Plus,
  CreditCard,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DesktopCommandPalette } from "@/components/desktop/desktop-command-palette"
import { MobileBottomNav } from "@/components/mobile/mobile-bottom-nav"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  exact?: boolean
}

const adminNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: "Test Series",
    href: "/admin/test-series",
    icon: BookOpen,
  },
  {
    label: "Submissions & Reviews",
    href: "/admin/submissions",
    icon: FileCheck2,
  },
  {
    label: "Candidates & Overrides",
    href: "/admin/students",
    icon: Users,
  },
  {
    label: "Payments & Financials",
    href: "/admin/payments",
    icon: CreditCard,
  },
  {
    label: "Profile & Settings",
    href: "/admin/profile",
    icon: User,
  },
]

const studentNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Profile & Settings",
    href: "/student/profile",
    icon: User,
  },
  {
    label: "Explore Test Catalog",
    href: "/tests",
    icon: Compass,
  },
  {
    label: "Live Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
  },
]

export function PortalShell({
  role,
  userName,
  userEmail,
  children,
}: {
  role: "ADMIN" | "STUDENT"
  userName?: string | null
  userEmail?: string | null
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const confirm = useConfirm()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)

  // Load sidebar preference from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("verityra-sidebar-collapsed")
    if (saved !== null) {
      setSidebarCollapsed(saved === "true")
    }
  }, [])

  // Save sidebar preference to localStorage
  const toggleSidebar = React.useCallback(() => {
    setSidebarCollapsed((prev) => {
      const newValue = !prev
      localStorage.setItem("verityra-sidebar-collapsed", String(newValue))
      return newValue
    })
  }, [])

  // Keyboard shortcuts: Ctrl+B (sidebar), Ctrl+K (command palette)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+B: Toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === "b") {
        e.preventDefault()
        toggleSidebar()
      }
      // Ctrl+K: Open command palette
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // Close mobile drawer on route change
  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    const confirmed = await confirm({
      title: "Sign out of your session?",
      description:
        "You will be signed out of your current workspace and returned to the public home page.",
      confirmText: "Sign Out",
      cancelText: "Stay Signed In",
      variant: "destructive",
      badgeText: "Session Security",
    })
    if (!confirmed) return
    toast.info("Signing out...", {
      description: "Ending your encrypted workspace session.",
    })
    await signOut({ callbackUrl: "/" })
  }

  const navItems = role === "ADMIN" ? adminNavItems : studentNavItems
  const displayName =
    userName || session?.user?.name || (role === "ADMIN" ? "Administrator" : "Candidate")
  const displayEmail =
    userEmail || session?.user?.email || (role === "ADMIN" ? "admin@verityra.com" : "candidate@verityra.com")
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "VT"

  function isItemActive(item: NavItem) {
    if (item.exact) {
      return pathname === item.href
    }
    if (item.href === "/student/dashboard" && pathname.startsWith("/student/tests")) {
      return true
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  const currentNavTitle =
    navItems.find((item) => isItemActive(item))?.label ||
    (role === "ADMIN" ? "Admin Console" : "Candidate Workspace")

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 flex flex-col lg:flex-row text-slate-900 dark:text-slate-100">
      {/* =========================================================
          1. DESKTOP LEFT SIDEBAR - Collapsible (Ctrl+B)
          w-64 expanded | w-16 collapsed
      ========================================================= */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 z-40 select-none shadow-2xs transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        {/* Brand Header */}
        <div className={cn("h-16 flex items-center border-b border-slate-200/80 dark:border-slate-800", sidebarCollapsed ? "justify-center px-2" : "justify-between px-5")}>
          <Link
            href={role === "ADMIN" ? "/admin" : "/student/dashboard"}
            className={cn("flex items-center group", sidebarCollapsed ? "gap-0" : "gap-2.5")}
            title={sidebarCollapsed ? "Verityra" : undefined}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A6AED] text-white font-extrabold text-base shadow-xs shadow-blue-500/20 group-hover:scale-105 transition-transform">
              V
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-heading text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                  Verityra
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A6AED] mt-1">
                  {role === "ADMIN" ? "Admin Suite" : "Candidate Suite"}
                </span>
              </div>
            )}
          </Link>
          {!sidebarCollapsed && (
            <div className="h-6 w-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <div className={cn("flex-1 overflow-y-auto py-5 space-y-5", sidebarCollapsed ? "px-2" : "px-3.5")}>
          <div className="space-y-1.5">
            {!sidebarCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                {role === "ADMIN" ? "Management & Governance" : "Workspace & Practice"}
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
                            "flex items-center rounded-xl text-xs font-bold transition-all duration-150 group justify-center p-2.5 w-full",
                            active
                              ? "bg-[#2A6AED] text-white shadow-sm shadow-blue-500/20"
                              : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100"
                          )}
                        >
                          <Icon
                            className={cn(
                              "h-5 w-5 shrink-0 transition-colors",
                              active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                            )}
                          />
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="text-xs font-semibold">
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
                      "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 group",
                      active
                        ? "bg-[#2A6AED] text-white shadow-sm shadow-blue-500/20"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100"
                    )}
                  >
                    <span className="flex items-center gap-2.5 truncate">
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0 transition-colors",
                          active ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                    </span>
                    {active && <ChevronRight className="h-3.5 w-3.5 text-white/80 shrink-0" />}
                  </Link>
                )
              })}
            </TooltipProvider>
          </div>

          {!sidebarCollapsed && (
            <>
              <Separator className="bg-slate-200/80 dark:border-slate-800" />

              {/* Security & Invariant Note */}
              <div className="px-3 space-y-1.5">
                <div className="flex items-center gap-2 text-[#2A6AED] dark:text-blue-400">
                  {role === "ADMIN" ? (
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 shrink-0" />
                  )}
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {role === "ADMIN" ? "Audited Governance" : "3-Attempt Guarantee"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {role === "ADMIN"
                    ? "All score edits & extra attempt overrides are logged to the immutable audit trail."
                    : "Each enrolled test includes 3 evaluated handwritten attempts in our encrypted vault."}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Bottom Account & Sign Out Footer */}
        <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
          {sidebarCollapsed ? (
            <TooltipProvider>
              {/* Collapsed: Show only avatar */}
              <Tooltip>
                <TooltipTrigger>
                  <Link
                    href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
                    className="flex items-center justify-center p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer w-full"
                  >
                    <div className="h-9 w-9 rounded-full bg-[#2A6AED] text-white font-bold text-xs flex items-center justify-center shadow-2xs">
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
                    className="w-full flex items-center justify-center h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
                title="Open Profile & Settings"
              >
                <div className="h-8 w-8 rounded-full bg-[#2A6AED] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#2A6AED] transition-colors truncate">
                    {displayName}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayEmail}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2A6AED] transition-colors shrink-0" />
              </Link>

              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  Public Site
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg border border-red-200/80 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 text-[11px] font-semibold text-red-600 dark:text-red-400 hover:bg-red-100/70 dark:hover:bg-red-900/40 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3 w-3" />
                  Sign Out
                </button>
              </div>

              {/* Toggle Sidebar Button - Expanded */}
              <button
                type="button"
                onClick={toggleSidebar}
                className="w-full flex items-center justify-center gap-2 h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-[11px] font-semibold"
                aria-label="Collapse sidebar"
              >
                <PanelLeftClose className="h-3.5 w-3.5" />
                Collapse Sidebar
                <kbd className="hidden xl:inline-flex ml-auto px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  Ctrl+B
                </kbd>
              </button>
            </>
          )}
        </div>
      </aside>

      {/* =========================================================
          2. MOBILE SLIDE-OVER DRAWER (320px / 375px / 425px)
      ========================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[280px] max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col justify-between z-10 shadow-2xl border-r border-slate-200 dark:border-slate-800">
            <div>
              {/* Mobile Drawer Header */}
              <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800">
                <Link
                  href={role === "ADMIN" ? "/admin" : "/student/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#2A6AED] text-white font-bold text-sm shadow-xs">
                    V
                  </div>
                  <div>
                    <span className="font-heading text-sm font-bold text-slate-900 dark:text-slate-100 block leading-none">
                      Verityra
                    </span>
                    <span className="text-[10px] font-semibold text-[#2A6AED] uppercase tracking-wider">
                      {role === "ADMIN" ? "Admin Suite" : "Candidate Suite"}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile Nav Items */}
              <div className="p-3 space-y-1.5">
                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Navigation
                </p>
                {navItems.map((item) => {
                  const Icon = item.icon
                  const active = isItemActive(item)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors",
                        active
                          ? "bg-[#2A6AED] text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-slate-400")} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {active && <ChevronRight className="h-3.5 w-3.5 text-white shrink-0" />}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 space-y-2.5">
              <Link
                href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-[#2A6AED] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-[#2A6AED] transition-colors truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{displayEmail}</p>
                </div>
                <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2A6AED] transition-colors shrink-0" />
              </Link>
              <div className="pt-1">
                <ThemeToggle variant="inline" className="w-full justify-between" />
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                >
                  <ExternalLink className="h-3 w-3" />
                  Home
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-[11px] font-semibold text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-3 w-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          3. MAIN WORKSPACE COLUMN (Sticky Topbar + Page Content)
          Adaptive padding based on sidebar state
      ========================================================= */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        {/* Sticky Workspace Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu + Search Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-xl min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden h-10 w-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shrink-0"
              aria-label="Open navigation drawer"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Global Search Input - Opens Command Palette (Ctrl+K) */}
            <div className="relative flex-1 min-w-0">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={
                  role === "ADMIN"
                    ? "Search tests, submissions, students, payments..."
                    : "Search dashboard, tests, leaderboard..."
                }
                readOnly
                onClick={() => setCommandPaletteOpen(true)}
                className="w-full h-10 pl-10 pr-16 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 cursor-pointer hover:border-[#2A6AED]/30 hover:bg-white dark:hover:bg-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-[#2A6AED]/20"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-[10px] font-bold text-slate-400 dark:text-slate-500 shadow-2xs">
                <kbd className="font-mono">Ctrl</kbd>
                <span className="text-slate-300 dark:text-slate-700">+</span>
                <kbd className="font-mono">K</kbd>
              </div>
            </div>
          </div>

          {/* Right Utility Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Action Button */}
            {role === "ADMIN" ? (
              <Link href="/admin/test-series/new" className="hidden sm:block">
                <Button
                  size="sm"
                  className="h-9 px-3.5 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-semibold shadow-xs"
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Add New
                </Button>
              </Link>
            ) : (
              <Link href="/tests" className="hidden sm:block">
                <Button
                  size="sm"
                  className="h-9 px-3.5 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-semibold shadow-xs"
                >
                  <Compass className="mr-1.5 h-3.5 w-3.5" />
                  Explore Tests
                </Button>
              </Link>
            )}

            {/* Role / Vault Status Badge */}
            <Badge
              variant="outline"
              className="hidden md:inline-flex items-center gap-1.5 bg-[#EFF6FF] dark:bg-blue-950/50 text-[#2A6AED] dark:text-blue-400 border-blue-200 dark:border-blue-900/60 text-[11px] font-bold px-2.5 py-1 rounded-full"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {role === "ADMIN" ? "Admin Suite" : "256-Bit Vault"}
            </Badge>

            {/* Notification Bell matching Screenshot 1 */}
            <button
              type="button"
              onClick={() => {
                toast.info("Notifications", {
                  description: "All evaluation queues and security audits are up to date.",
                })
              }}
              className="relative h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-2xs"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900">
                3
              </span>
            </button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Profile Avatar Pill */}
            <Link
              href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
              className="flex items-center gap-2 pl-1 sm:border-l sm:border-slate-200 sm:dark:border-slate-800 sm:pl-3 group cursor-pointer"
            >
              <div className="h-9 w-9 rounded-full bg-[#EFF6FF] dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-[#2A6AED] dark:text-blue-400 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                {initials}
              </div>
              <span className="hidden xl:inline-block text-xs font-bold text-slate-800 dark:text-slate-200 max-w-[130px] truncate group-hover:text-[#2A6AED] transition-colors">
                {displayName}
              </span>
            </Link>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="flex-1 py-6 sm:py-8 lg:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      {/* Command Palette (Ctrl+K) */}
      <DesktopCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        role={role}
      />

      {/* Mobile Bottom Navigation (Student Only) */}
      {role === "STUDENT" && <MobileBottomNav />}
    </div>
  )
}
