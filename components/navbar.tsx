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
import { BookOpen, User, LogOut, LayoutDashboard, Shield, Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = session?.user?.role === "ADMIN"

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#D5E5F2] bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0784B5] text-white shadow-sm font-bold text-xl">
              V
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl font-bold tracking-tight text-[#0784B5]">
                Verityra
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#4B6375] -mt-1 font-medium">
                Test Series Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#4B6375]">
            <Link href="/tests" className="transition-colors hover:text-[#0784B5]">
              Explore Tests
            </Link>
            <Link href="/#how-it-works" className="transition-colors hover:text-[#0784B5]">
              How It Works
            </Link>
            <Link href="/leaderboard" className="transition-colors hover:text-[#0784B5]">
              Leaderboard
            </Link>
            <Link href="/#faqs" className="transition-colors hover:text-[#0784B5]">
              FAQs
            </Link>
          </nav>
        </div>

        {/* Action Buttons / User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              {isAdmin ? (
                <Link href="/admin">
                  <Button variant="outline" size="sm" className="border-[#0784B5] text-[#0784B5] hover:bg-[#CADEEF]/30">
                    <Shield className="h-4 w-4 mr-1.5" />
                    Admin Panel
                  </Button>
                </Link>
              ) : (
                <Link href="/student/dashboard">
                  <Button variant="outline" size="sm" className="border-[#0784B5] text-[#0784B5] hover:bg-[#CADEEF]/30">
                    <LayoutDashboard className="h-4 w-4 mr-1.5" />
                    Student Dashboard
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger render={<button type="button" className="outline-none" />}>
                  <Avatar className="h-9 w-9 border border-[#9BD4E4] cursor-pointer">
                    <AvatarFallback className="bg-[#CADEEF] text-[#0784B5] font-semibold text-xs">
                      {session.user.name?.slice(0, 2).toUpperCase() || "US"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white border-[#D5E5F2]">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-semibold leading-none text-[#0B192C]">{session.user.name}</p>
                    <p className="text-xs leading-none text-[#4B6375] truncate">{session.user.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-[#D5E5F2]" />
                  <DropdownMenuItem render={<Link href="/student/profile" className="flex items-center cursor-pointer" />}>
                    <User className="mr-2 h-4 w-4 text-[#0784B5]" />
                    Profile Settings
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem render={<Link href="/admin" className="flex items-center cursor-pointer" />}>
                      <Shield className="mr-2 h-4 w-4 text-[#0784B5]" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[#D5E5F2]" />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/signin">
                <Button variant="ghost" className="text-[#0784B5] hover:bg-[#CADEEF]/30">
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-[#0784B5] hover:bg-[#0784B5]/90 text-white shadow-sm font-medium">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#D5E5F2] bg-white px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-[#4B6375]">
            <Link
              href="/tests"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-[#CADEEF]/20 text-[#0784B5]"
            >
              Explore Tests
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-[#CADEEF]/20"
            >
              How It Works
            </Link>
            <Link
              href="/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-[#CADEEF]/20"
            >
              Leaderboard
            </Link>
            <Link
              href="/#faqs"
              onClick={() => setMobileMenuOpen(false)}
              className="px-2 py-1.5 rounded-md hover:bg-[#CADEEF]/20"
            >
              FAQs
            </Link>
          </nav>
          <div className="pt-3 border-t border-[#D5E5F2] flex flex-col gap-2">
            {session ? (
              <>
                <Link
                  href={isAdmin ? "/admin" : "/student/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-[#0784B5] text-white">
                    {isAdmin ? "Admin Panel" : "Student Dashboard"}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full text-red-600"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-[#0784B5] border-[#0784B5]">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full bg-[#0784B5] text-white">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
