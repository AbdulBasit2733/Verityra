"use client"

import * as React from "react"
import { AuthDesktopLayout } from "./desktop/auth-desktop-layout"
import { AuthMobileLayout } from "./mobile/auth-mobile-layout"

export interface AuthShellProps {
  title: string
  subtitle: string
  mode: "signin" | "signup"
  children: React.ReactNode
}

export function AuthShell({ title, subtitle, mode, children }: AuthShellProps) {
  return (
    <>
      {/* 1. DEDICATED DESKTOP AUTH LAYOUT (Screen L: >= 1024px) */}
      <AuthDesktopLayout title={title} subtitle={subtitle} mode={mode}>
        {children}
      </AuthDesktopLayout>

      {/* 2. DEDICATED MOBILE & TABLET AUTH LAYOUT (Screens S & M: < 1024px) */}
      <AuthMobileLayout title={title} subtitle={subtitle} mode={mode}>
        {children}
      </AuthMobileLayout>
    </>
  )
}
