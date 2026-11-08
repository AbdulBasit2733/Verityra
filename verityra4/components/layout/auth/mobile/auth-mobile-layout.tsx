"use client"

import Link from "next/link"
import { ArrowLeft, BookOpen, ShieldCheck } from "lucide-react"

export interface AuthMobileLayoutProps {
  title: string
  subtitle: string
  mode: "signin" | "signup"
  children: React.ReactNode
}

export function AuthMobileLayout({ title, subtitle, mode, children }: AuthMobileLayoutProps) {
  return (
    <div className="auth-page-shell flex min-h-dvh flex-col px-4 py-5 text-foreground sm:px-6 sm:py-8">
      <div className="mx-auto flex w-full max-w-xl items-center justify-between">
        <Link href="/" className="group inline-flex min-h-11 items-center gap-2.5 rounded-lg pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A6AED]" aria-label="Verityra home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2A6AED] text-white shadow-md shadow-blue-600/20 transition-colors group-hover:bg-[#1E55C7]"><BookOpen aria-hidden="true" className="h-5 w-5" /></span>
          <span className="font-heading text-xl font-extrabold tracking-[-0.05em] text-slate-950 dark:text-white">Verityra</span>
        </Link>
        <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-white/70 hover:text-[#1E55C7] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2A6AED] dark:text-slate-300 dark:hover:bg-slate-900/50 dark:hover:text-blue-200">
          <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Home
        </Link>
      </div>

      <main className="mx-auto flex w-full max-w-xl flex-1 items-start justify-center py-8 sm:items-center sm:py-12">
        <div className="w-full">
          <div className="mb-6 text-center sm:mb-7">
            <p className="ui-eyebrow">{mode === "signup" ? "Create your account" : "Candidate account"}</p>
            <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">{title}</h1>
            <p className="mx-auto mt-2 max-w-md text-base leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p>
          </div>
          <div className="auth-form-surface p-5 sm:p-7">{children}</div>
        </div>
      </main>

      <footer className="mx-auto flex w-full max-w-xl items-center justify-center gap-2 border-t border-border/70 pt-5 text-xs font-medium text-slate-500 dark:text-slate-400">
        <ShieldCheck aria-hidden="true" className="h-4 w-4 text-emerald-600" /> Secure candidate session
      </footer>
    </div>
  )
}
