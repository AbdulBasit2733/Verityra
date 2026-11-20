"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowLeft,
  Check,
  FileText,
  PenLine,
  ShieldCheck,
  UploadCloud,
} from "lucide-react"
import { BRAND_CONFIG } from "@/lib/brand"

export interface AuthDesktopLayoutProps {
  title: string
  subtitle: string
  mode: "signin" | "signup"
  children: React.ReactNode
}

export function AuthDesktopLayout({
  title,
  subtitle,
  mode,
  children,
}: AuthDesktopLayoutProps) {
  const isSignUp = mode === "signup"

  return (
    <div className="hidden min-h-dvh w-full overflow-x-clip bg-background text-foreground lg:grid lg:grid-cols-[1.02fr_0.98fr]">
      <section className="auth-stage relative flex min-h-dvh flex-col justify-between overflow-hidden border-r border-border px-10 py-8 xl:px-16">
        <div className="auth-wave" aria-hidden="true" />

        <div className="relative z-10 flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center"
            aria-label={`${BRAND_CONFIG.name} home`}
          >
            <Image
              src={BRAND_CONFIG.logo}
              alt={BRAND_CONFIG.name}
              width={2172}
              height={724}
              priority
              className="h-10 w-auto object-contain"
            />
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-white hover:text-[#1E55C7] focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none dark:text-slate-300 dark:hover:bg-slate-900/50 dark:hover:text-blue-200"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Back to home
          </Link>
        </div>

        <div className="relative z-10 my-auto max-w-xl py-12">
          <p className="inline-flex items-center gap-2 rounded-sm border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1E55C7] dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-200">
            <span
              className="h-2 w-2 rounded-full bg-[#2A6AED]"
              aria-hidden="true"
            />
            {isSignUp
              ? "Start with the right practice"
              : "Welcome back to your preparation"}
          </p>
          <h1 className="mt-7 max-w-lg font-heading text-5xl leading-[1.05] font-extrabold tracking-[-0.05em] text-slate-950 xl:text-6xl dark:text-white">
            {isSignUp
              ? "Build your answer-writing habit."
              : "Continue your preparation."}
            <span className="mt-2 block text-[#2A6AED] dark:text-blue-400">
              One deliberate attempt at a time.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-700 dark:text-slate-300">
            Practice on official-style margins, write under realistic
            conditions, and use clear feedback to make your next answer
            stronger.
          </p>

          <div className="mt-9 grid max-w-lg grid-cols-3 divide-x divide-blue-200/80 border-y border-blue-200/80 dark:divide-slate-700 dark:border-slate-700">
            {[
              { icon: FileText, label: "Margin booklets" },
              { icon: PenLine, label: "Handwritten practice" },
              { icon: UploadCloud, label: "Rubric feedback" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="px-4 py-4 first:pl-0 last:pr-0"
              >
                <Icon aria-hidden="true" className="h-5 w-5 text-[#2A6AED]" />
                <p className="mt-2.5 text-sm leading-5 font-bold text-slate-800 dark:text-slate-100">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" />{" "}
              Three attempts
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck
                aria-hidden="true"
                className="h-4 w-4 text-emerald-600"
              />{" "}
              Private workspace
            </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-blue-200/70 pt-5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-400">
          <span>{BRAND_CONFIG.platformLabel}</span>
          <span className="font-mono">3× attempt policy</span>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center bg-background px-8 py-10 xl:px-16">
        <div className="w-full max-w-[30rem]">
          <div className="mb-7">
            <p className="ui-eyebrow">Candidate account</p>
            <h2 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 text-base leading-6 text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          </div>
          <div className="auth-form-surface p-7 xl:p-8">{children}</div>
          <p className="mt-5 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <ShieldCheck
              aria-hidden="true"
              className="h-4 w-4 text-emerald-600"
            />{" "}
            {BRAND_CONFIG.securityLabel}
          </p>
        </div>
      </section>
    </div>
  )
}
