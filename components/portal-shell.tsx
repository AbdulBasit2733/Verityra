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
} from "lucide-react"
import { cn } from "@/lib/utils"

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
    .toUpperCase()

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
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col lg:flex-row">
      {/* =========================================================
          1. DESKTOP LEFT SIDEBAR (Fixed w-64 on lg+)
      ========================================================= */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-slate-50/60 border-r border-slate-200/80 z-40 select-none">
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200/70">
          <Link href={role === "ADMIN" ? "/admin" : "/student/dashboard"} className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#2A6AED] to-[#1D4ED8] text-white font-bold text-sm shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base font-bold tracking-tight text-slate-900 leading-none">
                Verityra
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#2A6AED] mt-0.5">
                {role === "ADMIN" ? "Admin Console" : "Candidate Portal"}
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-5">
          <div className="space-y-1">
            <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {role === "ADMIN" ? "Management & Governance" : "Workspace & Practice"}
            </p>
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isItemActive(item)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 group",
                    active
                      ? "bg-[#EFF6FF] text-[#2A6AED]"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  )}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        active ? "text-[#2A6AED]" : "text-slate-400 group-hover:text-slate-700"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-[#2A6AED] shrink-0" />}
                </Link>
              )
            })}
          </div>

          <Separator className="bg-slate-200/70" />

          {/* Flat Security & Invariant Note */}
          <div className="px-3 space-y-1.5">
            <div className="flex items-center gap-2 text-[#2A6AED]">
              {role === "ADMIN" ? (
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Lock className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="text-[11px] font-bold text-slate-800">
                {role === "ADMIN" ? "Audited Governance" : "3-Attempt Guarantee"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {role === "ADMIN"
                ? "All score edits & extra attempt overrides are logged to the immutable audit trail."
                : "Each enrolled test includes 3 evaluated handwritten attempts in our encrypted vault."}
            </p>
          </div>
        </div>

        {/* Bottom Account & Sign Out Footer */}
        <div className="p-3.5 border-t border-slate-200/80 bg-white space-y-2.5">
          <Link
            href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
            title="Open Profile & Settings"
          >
            <div className="h-8 w-8 rounded-full bg-[#2A6AED] text-white font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 group-hover:text-[#2A6AED] transition-colors truncate">{displayName}</p>
              <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#2A6AED] transition-colors shrink-0" />
          </Link>

          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
              Public Site
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center justify-center gap-1.5 h-8 px-2.5 rounded-lg border border-red-200/80 bg-red-50/50 text-[11px] font-semibold text-red-600 hover:bg-red-100/70 transition-colors cursor-pointer"
            >
              <LogOut className="h-3 w-3" />
              Sign Out
            </button>
          </div>
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
          <div className="relative w-[270px] max-w-[84vw] bg-white h-full flex flex-col justify-between z-10 shadow-2xl border-r border-slate-200">
            <div>
              {/* Mobile Drawer Header */}
              <div className="h-15 px-4 flex items-center justify-between border-b border-slate-200/80">
                <Link
                  href={role === "ADMIN" ? "/admin" : "/student/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#2A6AED] to-[#1D4ED8] text-white font-bold text-sm">
                    V
                  </div>
                  <div>
                    <span className="font-heading text-sm font-bold text-slate-900 block leading-none">
                      Verityra
                    </span>
                    <span className="text-[10px] font-semibold text-[#2A6AED] uppercase tracking-wider">
                      {role === "ADMIN" ? "Admin Console" : "Candidate Portal"}
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100"
                  aria-label="Close navigation menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Mobile Nav Items */}
              <div className="p-3 space-y-1">
                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
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
                        "flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors",
                        active
                          ? "bg-[#EFF6FF] text-[#2A6AED] border border-blue-200/80"
                          : "text-slate-600 hover:bg-slate-100"
                      )}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className={cn("h-4 w-4 shrink-0", active ? "text-[#2A6AED]" : "text-slate-400")} />
                        <span className="truncate">{item.label}</span>
                      </span>
                      {active && <ChevronRight className="h-3.5 w-3.5 text-[#2A6AED] shrink-0" />}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="p-3.5 border-t border-slate-200 bg-slate-50 space-y-2.5">
              <Link
                href={role === "ADMIN" ? "/admin/profile" : "/student/profile"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors group cursor-pointer"
              >
                <div className="h-8 w-8 rounded-full bg-[#2A6AED] text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#2A6AED] transition-colors truncate">{displayName}</p>
                  <p className="text-[11px] text-slate-500 truncate">{displayEmail}</p>
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
                  className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-700"
                >
                  <ExternalLink className="h-3 w-3" />
                  Home
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg border border-red-200 bg-red-50 text-[11px] font-semibold text-red-600"
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
          3. MAIN WORKSPACE COLUMN (Topbar + Page Content)
      ========================================================= */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Sticky Workspace Topbar */}
        <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 min-[375px]:px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden h-9 w-9 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-700 hover:bg-slate-50 shrink-0"
              aria-label="Open navigation drawer"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="hidden sm:inline-block text-xs font-medium text-slate-400">
                {role === "ADMIN" ? "Admin Console" : "Candidate Portal"}
              </span>
              <ChevronRight className="hidden sm:inline-block h-3.5 w-3.5 text-slate-300 shrink-0" />
              <span className="text-xs min-[375px]:text-sm font-bold text-slate-900 truncate">
                {currentNavTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Badge
              variant="outline"
              className="hidden md:inline-flex items-center gap-1.5 bg-[#EFF6FF] text-[#2A6AED] border-blue-200 text-[11px] font-semibold px-2.5 py-1 rounded-full"
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {role === "ADMIN" ? "Role: Administrator" : "256-Bit Submission Vault"}
            </Badge>

            {role === "STUDENT" && (
              <Link href="/tests" className="hidden sm:block">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-xs font-semibold border-slate-200 text-slate-700 hover:text-[#2A6AED] hover:border-blue-200 hover:bg-blue-50/40 rounded-lg"
                >
                  Browse Tests
                </Button>
              </Link>
            )}

            <ThemeToggle />

            <div className="flex items-center gap-2 pl-1 sm:border-l sm:border-slate-200 sm:pl-3">
              <div className="h-8 w-8 rounded-full bg-[#EFF6FF] border border-blue-200 text-[#2A6AED] font-bold text-xs flex items-center justify-center shrink-0">
                {initials}
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 max-w-[140px] truncate">
                {displayName}
              </span>
            </div>
          </div>
        </header>

        {/* Main Workspace Canvas */}
        <main className="flex-1 py-6 sm:py-8 lg:py-10 px-3.5 min-[375px]:px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
