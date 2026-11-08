"use client"

import * as React from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Eye,
  FileCheck2,
  FileText,
  Clock,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

export function HeroCockpitPreview() {
  const [activeLayer, setActiveLayer] = useState<"rubric" | "margin" | "model">("rubric")

  return (
    <div className="relative mx-auto max-w-5xl w-full">
      {/* Ambient background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-2xl opacity-15 dark:opacity-25 pointer-events-none" />

      {/* Main Cockpit Frame */}
      <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-950/90 shadow-2xl overflow-hidden glass-card">
        {/* macOS / Web App Window Chrome */}
        <div className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200/80 dark:border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Window Traffic Lights */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-2 text-xs font-mono text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-800">
              <span className="text-[#2A6AED] dark:text-blue-400 font-semibold">verityra.app</span>
              <span>/</span>
              <span>workspace</span>
              <span>/</span>
              <span>upsc-mains-gs1</span>
            </div>
          </div>

          {/* Interactive Inspection Mode Pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-200/60 dark:bg-slate-800/80 border border-slate-300/40 dark:border-slate-700/60 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveLayer("rubric")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1",
                activeLayer === "rubric"
                  ? "bg-white dark:bg-slate-900 text-[#2A6AED] dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Sparkles className="h-3 w-3" />
              Rubric Scan
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("margin")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1",
                activeLayer === "margin"
                  ? "bg-white dark:bg-slate-900 text-[#2A6AED] dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <ShieldCheck className="h-3 w-3" />
              Margin Radar
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("model")}
              className={cn(
                "px-2.5 py-1 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1",
                activeLayer === "model"
                  ? "bg-white dark:bg-slate-900 text-[#2A6AED] dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <FileText className="h-3 w-3" />
              Model Answer
            </button>
          </div>

          {/* Live Session Counter */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-mono font-bold">
              <Clock className="h-3 w-3" />
              179:42 Left
            </span>
            <Badge className="bg-[#2A6AED] dark:bg-blue-600 text-white font-mono text-[10px] px-2 py-0.5 border-0">
              Attempt 2/3
            </Badge>
          </div>
        </div>

        {/* Cockpit Canvas Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-slate-800">
          
          {/* Left Canvas (7 cols): Scanned Handwritten Answer Sheet with Optical Guidelines */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-slate-50/50 dark:bg-slate-900/40 relative">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-sm relative overflow-hidden">
              
              {/* Margin Visualizer Overlay */}
              {activeLayer === "margin" && (
                <div className="absolute inset-0 pointer-events-none z-10">
                  {/* Left 25mm boundary guide */}
                  <div className="absolute left-6 top-0 bottom-0 w-px border-r-2 border-dashed border-rose-500/80 flex flex-col justify-between py-2 pl-1">
                    <span className="text-[9px] font-mono font-bold bg-rose-500 text-white px-1 rounded">
                      25mm Left Bound (Compliant)
                    </span>
                    <span className="text-[9px] font-mono text-rose-500 font-semibold bg-white/90 dark:bg-slate-900 px-1">
                      No spillover
                    </span>
                  </div>
                  {/* Right 20mm boundary guide */}
                  <div className="absolute right-6 top-0 bottom-0 w-px border-l-2 border-dashed border-rose-500/80 flex flex-col justify-between py-2 pr-1 items-end">
                    <span className="text-[9px] font-mono font-bold bg-rose-500 text-white px-1 rounded">
                      20mm Right Bound
                    </span>
                    <span className="text-[9px] font-mono text-rose-500 font-semibold bg-white/90 dark:bg-slate-900 px-1">
                      Pass
                    </span>
                  </div>
                </div>
              )}

              {/* Answer Sheet Top Meta */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    Q.4 (15 MARKS)
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-500 text-[11px]">Word Limit: 250</span>
                </div>
                <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="h-3 w-3" /> OCR Verified (300 DPI)
                </span>
              </div>

              {/* Question Box */}
              <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/50 p-2.5 mb-3 text-xs text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                Elucidate the impact of Indian monsoon spatial fluctuations on the agrarian economy and food price inflation.
              </div>

              {/* Simulated Authentic Handwritten Content */}
              <div className="space-y-3 font-serif italic text-xs sm:text-[13px] leading-relaxed text-slate-700 dark:text-slate-300 pl-4 sm:pl-6 pr-4 sm:pr-6 border-l border-rose-200/50 dark:border-rose-900/30">
                <p>
                  <span className="font-sans font-bold not-italic text-[10px] text-[#2A6AED] dark:text-blue-400 uppercase tracking-wider block">
                    1. Macro-Agrarian Impact:
                  </span>
                  With over 55% of India&apos;s net sown area remaining rain-fed, southwest monsoon deficits trigger immediate contraction in{" "}
                  <span className={cn(
                    "px-1 py-0.5 rounded not-italic font-sans transition-colors",
                    activeLayer === "rubric" ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-bold" : ""
                  )}>
                    Kharif pulse acreage (notably Tur & Urad)
                  </span>
                  , directly feeding headline consumer food inflation.
                </p>

                <p>
                  <span className="font-sans font-bold not-italic text-[10px] text-[#2A6AED] dark:text-blue-400 uppercase tracking-wider block">
                    2. Institutional Policy Citations:
                  </span>
                  As highlighted in the{" "}
                  <span className={cn(
                    "px-1 py-0.5 rounded not-italic font-sans transition-colors",
                    activeLayer === "rubric" ? "bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold" : ""
                  )}>
                    RBI Monetary Policy Report (2024)
                  </span>
                  , spatial unseasonal rainfall spikes food volatility by ~180 bps across rural consumption baskets.
                </p>
              </div>

              {/* Layer-Specific Footer Toast */}
              <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                {activeLayer === "rubric" && (
                  <span className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Highlighted: 2 high-credit key phrases verified by rubric engine
                  </span>
                )}
                {activeLayer === "margin" && (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3 w-3" />
                    Margins clean: Zero text leakage beyond official print limits
                  </span>
                )}
                {activeLayer === "model" && (
                  <span className="text-slate-600 dark:text-slate-300 font-medium inline-flex items-center gap-1.5">
                    <FileCheck2 className="h-3 w-3 text-[#2A6AED]" />
                    Model Answer: Aligned with standard UPSC GS Paper I scheme
                  </span>
                )}
                <span className="font-mono text-slate-400">Page 1 / 3</span>
              </div>
            </div>
          </div>

          {/* Right Canvas (5 cols): Real-Time Rubric Intelligence Breakdown */}
          <div className="lg:col-span-5 p-4 sm:p-6 bg-white dark:bg-slate-950 flex flex-col justify-between space-y-4">
            <div>
              {/* Score Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#2A6AED] dark:text-blue-400 font-mono">
                    Evaluation Result
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Itemized Rubric Card
                  </h4>
                </div>
                <div className="text-right">
                  <div className="text-xl font-extrabold text-[#2A6AED] dark:text-blue-400 font-mono">
                    12.5 <span className="text-xs font-normal text-slate-400">/ 15</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    83.3% (Top 5% Band)
                  </span>
                </div>
              </div>

              {/* Rubric Category Meters */}
              <div className="space-y-3 mt-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Introduction & Context
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      3.5 / 4.0
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2A6AED] rounded-full w-[88%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Empirical Data & RBI Citations
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      5.5 / 6.0
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[92%]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      Way Forward & Synthesis
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      3.5 / 5.0
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-500 rounded-full w-[70%]" />
                  </div>
                </div>
              </div>

              {/* Real-time Evaluator Note */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#2A6AED] dark:text-blue-400 font-semibold text-[11px]">
                  <Sparkles className="h-3 w-3" />
                  <span>Senior Evaluator Recommendation:</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  &ldquo;Candidate demonstrated strong empirical backing with the RBI reference. For Attempt 3, add a brief 2-column box diagram contrasting El Niño vs. Indian Ocean Dipole to capture full presentation credit.&rdquo;
                </p>
              </div>
            </div>

            {/* Bottom Cockpit Quick Action */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Attempt 2 of 3 • +2.5 Mark Surge
              </span>
              <button
                type="button"
                onClick={() => setActiveLayer(activeLayer === "rubric" ? "margin" : activeLayer === "margin" ? "model" : "rubric")}
                className="text-[#2A6AED] dark:text-blue-400 font-semibold inline-flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Cycle View</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
