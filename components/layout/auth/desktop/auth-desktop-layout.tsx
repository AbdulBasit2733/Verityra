"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Star,
  FileCheck2,
  RotateCcw,
} from "lucide-react"

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
  return (
    <div className="hidden lg:grid grid-cols-12 min-h-screen bg-slate-50/50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 w-full overflow-x-hidden selection:bg-[#DBEAFE] selection:text-[#1E55C7]">
      {/* =========================================================
          LEFT STAGE (7 cols): Brand Showcase, Booklets & Social Proof
      ========================================================= */}
      <div className="col-span-7 relative flex flex-col justify-between p-10 xl:p-14 border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
        {/* Ambient Aurora Glow Backdrop */}
        <div className="absolute inset-0 aurora-glow-blue pointer-events-none" />
        <div className="absolute inset-0 grid-dot-pattern [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        {/* Top Header: Brand & Back Link */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#2A6AED] text-white font-extrabold text-lg shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              V
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-tight">
                Verityra
              </span>
              <span className="text-[10px] font-bold text-[#2A6AED] dark:text-blue-400 uppercase tracking-wider block">
                Evaluation Cloud
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Link>
        </div>

        {/* Center Stage: Hero Narrative & Visual Specimen */}
        <div className="relative z-10 my-auto py-8 space-y-6 max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 dark:border-blue-500/30 bg-blue-50/80 dark:bg-blue-950/40 px-3 py-1 text-xs font-semibold text-[#1E55C7] dark:text-blue-300">
            <Sparkles className="h-3 w-3 text-[#2A6AED] dark:text-blue-400" />
            <span>Standardized Subjective Evaluation</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.18] font-heading">
            Authentic Examination Stamina.{" "}
            <span className="bg-gradient-to-r from-[#2A6AED] via-[#1E55C7] to-[#3B82F6] dark:from-[#60A5FA] dark:via-[#3B82F6] dark:to-[#93C5FD] bg-clip-text text-transparent">
              Instant Rubric Feedback.
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            Write on official A4 margin booklets under timed exam conditions. Receive itemized question-by-question scoring and diagnostic benchmark reports across three attempts.
          </p>

          {/* Micro Card: Booklet & Rubric Guarantee */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span className="flex items-center gap-1.5 text-[#2A6AED] dark:text-blue-400">
                <FileCheck2 className="h-4 w-4" />
                <span>Standardized 25mm Margin Template</span>
              </span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">
                100% Compliant
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Every mock simulates real commission conditions with left (25mm) and right (20mm) margin guidelines, preventing negative marking.
            </p>
          </div>

          {/* Social Proof Quote */}
          <div className="p-4 rounded-2xl border border-blue-200/70 dark:border-blue-900/40 bg-gradient-to-br from-[#EFF6FF]/60 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold border-0">
                +28 Marks Gain
              </Badge>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed">
              &ldquo;The 3-attempt model helped me fix my pacing and structural deficiencies between baseline and benchmark.&rdquo;
            </p>
            <p className="text-[11px] font-bold text-slate-900 dark:text-white pt-1">
              — Ananya Sharma, UPSC Civil Services Finalist
            </p>
          </div>
        </div>

        {/* Bottom Trust Strip */}
        <div className="relative z-10 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            256-Bit Encrypted Vault
          </span>
          <span className="flex items-center gap-1.5 font-mono">
            <RotateCcw className="h-3.5 w-3.5 text-[#2A6AED]" />
            3x Attempt Guarantee
          </span>
          <span>&copy; {new Date().getFullYear()} Verityra</span>
        </div>
      </div>

      {/* =========================================================
          RIGHT AUTH PANE (5 cols): High-Focus Glassmorphic Card
      ========================================================= */}
      <div className="col-span-5 flex flex-col justify-center items-center p-8 xl:p-14 bg-slate-50/70 dark:bg-[#030712] relative">
        <div className="w-full max-w-md space-y-6">
          <div className="text-left space-y-1.5">
            <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-heading">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {subtitle}
            </p>
          </div>

          {/* Form Core Card */}
          <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-blue-900/5 glass-card">
            {children}
          </div>

          {/* Security & SSL Footer */}
          <div className="text-center text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>End-to-end encrypted session with biometric & token vaulting</span>
          </div>
        </div>
      </div>
    </div>
  )
}
