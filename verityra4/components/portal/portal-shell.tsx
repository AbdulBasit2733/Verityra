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
  FileText,
  Download,
  ClipboardList,
  FileUp,
  BookOpenCheck,
  GraduationCap,
  Building2,
} from "lucide-react"
import dynamic from "next/dynamic"
import {
  PortalDesktopLayout,
  NavItem,
} from "@/components/portal/desktop/portal-desktop-layout"
import { PortalMobileLayout } from "@/components/portal/mobile/portal-mobile-layout"
import { BRAND_CONFIG } from "@/lib/brand"

const DesktopCommandPalette = dynamic(
  () =>
    import("@/components/portal/desktop/desktop-command-palette").then(
      (mod) => mod.DesktopCommandPalette
    ),
  { ssr: false }
)

const adminNavItems: NavItem[] = [
  {
    label: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
    exact: true,
    section: "Oversight & Grading",
  },
  {
    label: "Submissions Queue",
    href: "/admin/submissions",
    icon: FileCheck2,
    section: "Oversight & Grading",
  },
  {
    label: "Test Series & Bundles",
    href: "/admin/test-series",
    icon: BookOpen,
    section: "Academic Management",
  },
  {
    label: "Subject Tests",
    href: "/admin/tests",
    icon: FileText,
    section: "Academic Management",
  },
  {
    label: "Question Paper Bank",
    href: "/admin/question-papers",
    icon: FileUp,
    section: "Academic Management",
  },
  {
    label: "Subject Master",
    href: "/admin/masters/subjects",
    icon: BookOpenCheck,
    section: "Academic Masters",
  },
  {
    label: "Standard Master",
    href: "/admin/masters/standards",
    icon: GraduationCap,
    section: "Academic Masters",
  },
  {
    label: "Board Master",
    href: "/admin/masters/boards",
    icon: Building2,
    section: "Academic Masters",
  },
  {
    label: "Candidates & Overrides",
    href: "/admin/students",
    icon: Users,
    section: "Students & Revenue",
  },
  {
    label: "Payments & Financials",
    href: "/admin/payments",
    icon: CreditCard,
    section: "Students & Revenue",
  },
  {
    label: "Profile & Settings",
    href: "/admin/profile",
    icon: User,
    section: "System",
  },
]

const studentNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/student/dashboard",
    icon: LayoutDashboard,
    exact: true,
    section: "Learning & Tests",
  },
  {
    label: "My Tests",
    href: "/student/tests",
    icon: BookOpen,
    section: "Learning & Tests",
  },
  {
    label: "My Evaluations",
    href: "/student/evaluations",
    icon: ClipboardList,
    section: "Learning & Tests",
  },
  {
    label: "Explore Test Catalog",
    href: "/tests",
    icon: Compass,
    section: "Explore & Practice",
  },
  {
    label: "Question Paper Bank",
    href: "/question-papers",
    icon: FileText,
    section: "Explore & Practice",
  },
  {
    label: "Downloads & Offline",
    href: "/student/downloads",
    icon: Download,
    section: "Explore & Practice",
  },
  {
    label: "Live Leaderboard",
    href: "/leaderboard",
    icon: Trophy,
    section: "Explore & Practice",
  },
  {
    label: "Purchases & Invoices",
    href: "/student/purchases",
    icon: CreditCard,
    section: "Account & Billing",
  },
  {
    label: "Profile & Class",
    href: "/student/profile",
    icon: User,
    section: "Account & Billing",
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
    await signOut({ redirect: false })
    window.location.href = "/"
  }

  const navItems = role === "ADMIN" ? adminNavItems : studentNavItems
  const displayName =
    userName ||
    session?.user?.name ||
    (role === "ADMIN" ? "Administrator" : "Candidate")
  const displayEmail =
    userEmail ||
    session?.user?.email ||
    (role === "ADMIN"
      ? BRAND_CONFIG.defaultAdminEmail
      : BRAND_CONFIG.defaultCandidateEmail)

  function isItemActive(item: NavItem) {
    if (item.exact) {
      return pathname === item.href
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
