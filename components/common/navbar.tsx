"use client"

import Link from "next/link"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import {
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  User,
  X,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/theme-toggle"

const navigation = [
  { label: "Test Series", href: "/tests" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Resources", href: "/question-papers" },
]

export function Navbar({
  appearance = "default",
}: {
  appearance?: "default" | "light"
}) {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isAdmin = session?.user?.role === "ADMIN"
  const isLightAppearance = appearance === "light"

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-xl ${isLightAppearance ? "border-slate-200 bg-white/95" : "border-border/80 bg-background/90"}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:h-[72px] sm:gap-6 sm:px-8 lg:h-[76px] lg:px-10">
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-2.5"
          aria-label="Verityra home"
        >
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-[#2A6AED] text-xl font-black text-white shadow-md shadow-blue-600/20 transition-colors group-hover:bg-[#1E55C7]">
            <BookOpen aria-hidden="true" className="h-5 w-5" />
          </span>
          <span
            className={`font-heading text-[1.65rem] font-extrabold tracking-[-0.05em] transition-colors group-hover:text-[#2A6AED] ${isLightAppearance ? "text-slate-950" : "text-slate-950 dark:text-white"}`}
          >
            Verityra
          </span>
        </Link>

        <nav
          aria-label="Primary navigation"
          className="hidden items-center gap-1 lg:flex"
        >
          {navigation.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`inline-flex h-11 items-center gap-1 rounded-lg px-4 text-[15px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none ${isLightAppearance ? "text-slate-700 hover:bg-blue-50 hover:text-[#1E55C7]" : "text-slate-700 hover:bg-blue-50 hover:text-[#1E55C7] dark:text-slate-200 dark:hover:bg-blue-950/50 dark:hover:text-blue-200"}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {!isLightAppearance && <ThemeToggle />}
          {session ? (
            <div className="flex items-center gap-3">
              <Link href={isAdmin ? "/admin" : "/student/dashboard"}>
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-border px-4 font-bold text-slate-700 hover:border-[#2A6AED] hover:bg-blue-50 hover:text-[#1E55C7] dark:text-slate-100 dark:hover:bg-blue-950/50"
                >
                  {isAdmin ? (
                    <Shield
                      aria-hidden="true"
                      className="mr-2 h-4 w-4 text-[#2A6AED]"
                    />
                  ) : (
                    <LayoutDashboard
                      aria-hidden="true"
                      className="mr-2 h-4 w-4 text-[#2A6AED]"
                    />
                  )}
                  {isAdmin ? "Admin Panel" : "Dashboard"}
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#2A6AED]"
                      aria-label="Open account menu"
                    />
                  }
                >
                  <Avatar className="h-11 w-11 border-2 border-blue-100 transition-colors hover:border-[#2A6AED] dark:border-blue-950">
                    <AvatarFallback className="bg-blue-50 font-bold text-[#2A6AED] dark:bg-blue-950/70 dark:text-blue-200">
                      {session.user.name?.slice(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 rounded-xl border-border bg-popover p-1.5"
                >
                  <div className="p-2">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {session.user.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={
                      <Link
                        href={isAdmin ? "/admin/profile" : "/student/profile"}
                      />
                    }
                  >
                    <User className="mr-2 h-4 w-4 text-[#2A6AED]" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Link href="/signin">
                <Button
                  variant="outline"
                  className="h-11 rounded-xl border-[#2A6AED] px-5 font-bold text-slate-800 hover:bg-blue-50 hover:text-[#1E55C7] dark:text-slate-100 dark:hover:bg-blue-950/50"
                >
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="h-11 rounded-xl bg-[#2A6AED] px-5 font-bold text-white shadow-md shadow-blue-600/20 hover:bg-[#1E55C7]">
                  Get Started
                  <ArrowRight aria-hidden="true" className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {!isLightAppearance && <ThemeToggle />}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className={`h-11 w-11 rounded-xl ${isLightAppearance ? "text-slate-800" : "text-slate-800 dark:text-slate-100"}`}
          >
            {mobileMenuOpen ? (
              <X aria-hidden="true" className="h-5 w-5" />
            ) : (
              <Menu aria-hidden="true" className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className={`border-t px-5 py-4 shadow-lg lg:hidden ${isLightAppearance ? "border-slate-200 bg-white" : "border-border bg-background"}`}
        >
          <nav aria-label="Mobile navigation" className="grid gap-1">
            {navigation.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMobileMenu}
                className={`flex min-h-11 items-center justify-between rounded-lg px-3 text-base font-semibold ${isLightAppearance ? "text-slate-700 hover:bg-blue-50 hover:text-[#1E55C7]" : "text-slate-700 hover:bg-blue-50 hover:text-[#1E55C7] dark:text-slate-200 dark:hover:bg-blue-950/50"}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 grid gap-2 border-t border-border pt-4">
            {session ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/student/dashboard"}
                  onClick={closeMobileMenu}
                >
                  <Button className="h-11 w-full rounded-xl bg-[#2A6AED] font-bold text-white hover:bg-[#1E55C7]">
                    {isAdmin ? "Admin Panel" : "Student Dashboard"}
                  </Button>
                </Link>
                <Link
                  href={isAdmin ? "/admin/profile" : "/student/profile"}
                  onClick={closeMobileMenu}
                >
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-xl font-bold"
                  >
                    Profile Settings
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="h-11 rounded-xl border-red-200 font-bold text-red-600 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/signin" onClick={closeMobileMenu}>
                  <Button
                    variant="outline"
                    className="h-11 w-full rounded-xl font-bold"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup" onClick={closeMobileMenu}>
                  <Button className="h-11 w-full rounded-xl bg-[#2A6AED] font-bold text-white hover:bg-[#1E55C7]">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
