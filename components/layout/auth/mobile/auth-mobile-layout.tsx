"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowLeft, ShieldCheck, RotateCcw } from "lucide-react"

export interface AuthMobileLayoutProps {
  title: string
  subtitle: string
  mode: "signin" | "signup"
  children: React.ReactNode
}

export function AuthMobileLayout({
  title,
  subtitle,
  mode,
  children,
}: AuthMobileLayoutProps) {
  return (
    <div className="flex lg:hidden flex-col justify-between min-h-screen bg-slate-50/70 dark:bg-[#030712] text-slate-900 dark:text-slate-100 py-6 px-4 sm:px-6">
      {/* Top Mobile Bar: Brand Icon & Back Link */}
      <div className="flex items-center justify-between max-w-md mx-auto w-full pb-4">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A6AED] text-white font-extrabold text-base shadow-xs">
            V
          </div>
          <span className="font-heading text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            Verityra
          </span>
        </Link>

        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Home
        </Link>
      </div>

      {/* Main Focused Mobile Form Card */}
      <div className="my-auto max-w-md mx-auto w-full space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
            {title}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {subtitle}
          </p>
        </div>

        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-blue-900/5 glass-card">
          {children}
        </div>
      </div>

      {/* Bottom Mobile Trust & Security Footer */}
      <div className="max-w-md mx-auto w-full pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          256-Bit Vault
        </span>
        <span className="inline-flex items-center gap-1 font-mono">
          <RotateCcw className="h-3 w-3 text-[#2A6AED]" />
          3x Attempts
        </span>
        <span>&copy; {new Date().getFullYear()} Verityra</span>
      </div>
    </div>
  )
}
