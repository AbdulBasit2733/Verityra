"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"

import { Footer } from "@/components/common/footer"
import { Navbar } from "@/components/common/navbar"

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const standalonePrefixes = [
    "/signin",
    "/signup",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/unauthorized",
    "/suspended",
    "/admin",
    "/student",
    "/dashboard",
    "/api",
  ]
  const hasPublicChrome = !standalonePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
  const isLandingPage = pathname === "/"

  return (
    <>
      {hasPublicChrome && (
        <Navbar appearance={isLandingPage ? "light" : "default"} />
      )}
      {children}
      {hasPublicChrome && (
        <Footer variant={isLandingPage ? "light" : "default"} />
      )}
    </>
  )
}
