"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { User, LogOut, LayoutDashboard, Shield, Menu, X, ArrowRight } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md supports-[backdrop-filter]:bg-white/85 header-shadow transition-all">
      <div className="mx-auto flex h-16 sm:h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#1E55C7] to-[#2A6AED] text-white shadow-sm shadow-blue-500/20 font-bold text-base sm:text-lg transition-transform group-hover:scale-105">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#2A6AED] transition-colors leading-none">
                Verityra
              </span>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 mt-0.5 font-semibold">
                Test Series Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 text-[13px] lg:text-sm font-medium text-slate-600">
            <Link href="/tests" className="nav-item px-3 py-1.5 rounded-lg">
              Explore Tests
            </Link>
            <Link href="/#how-it-works" className="nav-item px-3 py-1.5 rounded-lg">
              How It Works
            </Link>
            <Link href="/#iterative-mastery" className="nav-item px-3 py-1.5 rounded-lg">
              3-Attempt Model
            </Link>
            <Link href="/leaderboard" className="nav-item px-3 py-1.5 rounded-lg">
              Leaderboard
            </Link>
            <Link href="/#faqs" className="nav-item px-3 py-1.5 rounded-lg">
              FAQs
            </Link>
          </nav>
        </div>

        {/* Action Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-2.5">
          <ThemeToggle />
          {session ? (
            <div className="flex items-center gap-2.5">
              {isAdmin ? (
                <Link href="/admin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3.5 rounded-lg text-xs font-semibold border-slate-200 text-slate-700 hover:border-[#2A6AED] hover:bg-blue-50/50 hover:text-[#2A6AED]"
                  >
                    <Shield className="h-3.5 w-3.5 mr-1.5 text-[#2A6AED]" />
                    Admin Panel
                  </Button>
                </Link>
              ) : (
                <Link href="/student/dashboard">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3.5 rounded-lg text-xs font-semibold border-slate-200 text-slate-700 hover:border-[#2A6AED] hover:bg-blue-50/50 hover:text-[#2A6AED]"
                  >
                    <LayoutDashboard className="h-3.5 w-3.5 mr-1.5 text-[#2A6AED]" />
                    Dashboard
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger render={<button type="button" className="outline-none" />}>
                  <Avatar className="h-9 w-9 border border-blue-200 hover:border-[#2A6AED] transition-colors cursor-pointer shadow-2xs">
                    <AvatarFallback className="bg-blue-50 text-[#2A6AED] font-bold text-xs">
                      {session.user.name?.slice(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-popover border-border p-1.5 dropdown-shadow rounded-xl"
                >
                  <div className="flex flex-col space-y-0.5 p-2">
                    <p className="text-xs font-bold leading-none text-slate-900">{session.user.name}</p>
                    <p className="text-[11px] leading-none text-slate-500 truncate mt-1">
                      {session.user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem
                    render={
                      <Link
                        href="/student/profile"
                        className="flex items-center cursor-pointer py-1.5 px-2 text-xs rounded-lg text-slate-700 hover:text-[#2A6AED] hover:bg-blue-50/50"
                      />
                    }
                  >
                    <User className="mr-2 h-3.5 w-3.5 text-[#2A6AED]" />
                    Profile Settings
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem
                      render={
                        <Link
                          href="/admin"
                          className="flex items-center cursor-pointer py-1.5 px-2 text-xs rounded-lg text-slate-700 hover:text-[#2A6AED] hover:bg-blue-50/50"
                        />
                      }
                    >
                      <Shield className="mr-2 h-3.5 w-3.5 text-[#2A6AED]" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 focus:text-red-600 cursor-pointer py-1.5 px-2 text-xs rounded-lg hover:bg-red-50"
                  >
                    <LogOut className="mr-2 h-3.5 w-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link href="/signin">
                <Button
                  variant="ghost"
                  className="h-9 px-3.5 rounded-lg text-xs sm:text-[13px] text-slate-700 hover:text-[#2A6AED] hover:bg-blue-50/50 font-semibold"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="h-9 px-4 rounded-lg bg-[#2A6AED] hover:bg-[#1E55C7] text-white shadow-sm shadow-blue-500/20 text-xs sm:text-[13px] font-semibold">
                  Get Started
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle + ThemeToggle */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="h-9 w-9 rounded-lg text-slate-700 hover:bg-blue-50/60"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-slate-900" />
            ) : (
              <Menu className="h-5 w-5 text-slate-900" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white/98 backdrop-blur-lg px-4 py-4 space-y-3 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in duration-200">
          <nav className="flex flex-col space-y-0.5 text-[13px] font-semibold text-slate-700">
            <Link
              href="/tests"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center h-10 px-3 rounded-lg hover:bg-blue-50/60 text-[#2A6AED]"
            >
              Explore Tests
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center h-10 px-3 rounded-lg hover:bg-blue-50/60 hover:text-[#2A6AED]"
            >
              How It Works
            </Link>
            <Link
              href="/#iterative-mastery"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center h-10 px-3 rounded-lg hover:bg-blue-50/60 hover:text-[#2A6AED]"
            >
              3-Attempt Model
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center h-10 px-3 rounded-lg hover:bg-blue-50/60 hover:text-[#2A6AED]"
            >
              Leaderboard
            </Link>
            <Link
              href="/#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center h-10 px-3 rounded-lg hover:bg-blue-50/60 hover:text-[#2A6AED]"
            >
              FAQs
            </Link>
          </nav>
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500">Appearance</span>
              <ThemeToggle variant="inline" />
            </div>
            {session ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/student/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full h-10 rounded-lg bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-semibold">
                    {isAdmin ? "Admin Panel" : "Student Dashboard"}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full h-10 rounded-lg text-xs text-red-600 border-red-200 hover:bg-red-50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant="outline"
                    className="w-full h-10 rounded-lg border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-10 rounded-lg bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-semibold shadow-xs">
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
