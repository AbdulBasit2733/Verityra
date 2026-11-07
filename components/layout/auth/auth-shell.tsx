"use client"

import { AuthPageLayout } from "./auth-page-layout"

export interface AuthShellProps {
  title: string
  subtitle: string
  mode: "signin" | "signup"
  children: React.ReactNode
}

export function AuthShell({ title, subtitle, mode, children }: AuthShellProps) {
  return (
    <AuthPageLayout title={title} subtitle={subtitle} mode={mode}>
      {children}
    </AuthPageLayout>
  )
}
