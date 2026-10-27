"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  LayoutDashboard,
  BookOpen,
  FileCheck2,
  Users,
  User,
  CreditCard,
  Compass,
  Trophy,
} from "lucide-react"
import { DesktopCommandPalette } from "@/components/desktop/desktop-command-palette"
import { PortalDesktopLayout, NavItem } from "@/components/layout/portal/desktop/portal-desktop-layout"
import { PortalMobileLayout } from "@/components/layout/portal/mobile/portal-mobile-layout"

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
  const [commandPaletteOpen, setCommandPaletteOpen] = React.useState(false)

  // Keyboard shortcut: Ctrl+K opens command palette
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

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

  function isItemActive(item: NavItem) {
    if (item.exact) {
      return pathname === item.href
    }
    if (item.href === "/student/dashboard" && pathname.startsWith("/student/tests")) {
      return true
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`)
  }

  return (
    <>
      {/* 1. DEDICATED DESKTOP PANEL COMPONENT (Screen L: >= 1024px) */}
      <PortalDesktopLayout
        role={role}
        userName={displayName}
        userEmail={displayEmail}
        navItems={navItems}
        pathname={pathname}
        isItemActive={isItemActive}
        handleSignOut={handleSignOut}
        setCommandPaletteOpen={setCommandPaletteOpen}
      >
        {children}
      </PortalDesktopLayout>

      {/* 2. DEDICATED MOBILE & TABLET PANEL COMPONENT (Screens S & M: < 1024px) */}
      <PortalMobileLayout
        role={role}
        userName={displayName}
        userEmail={displayEmail}
        navItems={navItems}
        pathname={pathname}
        isItemActive={isItemActive}
        handleSignOut={handleSignOut}
        setCommandPaletteOpen={setCommandPaletteOpen}
      >
        {children}
      </PortalMobileLayout>

      {/* Global Command Palette (Ctrl+K) */}
      <DesktopCommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
        role={role}
      />
    </>
  )
}
