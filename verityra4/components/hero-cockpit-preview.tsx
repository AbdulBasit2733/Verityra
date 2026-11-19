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
import { BRAND_CONFIG } from "@/lib/brand"

export function HeroCockpitPreview() {
  const [activeLayer, setActiveLayer] = useState<"rubric" | "margin" | "model">(
    "rubric"
  )

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* Main Cockpit Frame */}
      <div className="relative overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        {/* macOS / Web App Window Chrome */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/90">
          {/* Window Traffic Lights */}
          <div className="flex items-center gap-2">
            <div className="flex shrink-0 items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="hidden items-center gap-2 border-l border-slate-200 pl-2 font-mono text-xs text-slate-500 sm:flex dark:border-slate-800 dark:text-slate-400">
              <span className="font-semibold text-[#2A6AED] dark:text-blue-400">
                {BRAND_CONFIG.appDomain}
              </span>
              <span>/</span>
              <span>workspace</span>
              <span>/</span>
              <span>cbse-class12-physics</span>
            </div>
          </div>

          {/* Interactive Inspection Mode Pills */}
          <div className="flex items-center gap-1 rounded-md border border-slate-300/40 bg-slate-200/60 p-0.5 text-xs font-medium dark:border-slate-700/60 dark:bg-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveLayer("rubric")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 rounded-sm px-2.5 py-1 transition-colors",
                activeLayer === "rubric"
                  ? "bg-white font-semibold text-[#2A6AED] shadow-xs dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <Sparkles className="h-3 w-3" />
              Rubric Scan
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("margin")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 rounded-sm px-2.5 py-1 transition-colors",
                activeLayer === "margin"
                  ? "bg-white font-semibold text-[#2A6AED] shadow-xs dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <ShieldCheck className="h-3 w-3" />
              Margin Radar
            </button>
            <button
              type="button"
              onClick={() => setActiveLayer("model")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1 rounded-sm px-2.5 py-1 transition-colors",
                activeLayer === "model"
                  ? "bg-white font-semibold text-[#2A6AED] shadow-xs dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <FileText className="h-3 w-3" />
              Model Answer
            </button>
          </div>

          {/* Live Session Counter */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              <Clock className="h-3 w-3" />
              179:42 Left
            </span>
            <Badge className="border-0 bg-[#2A6AED] px-2 py-0.5 font-mono text-[10px] text-white dark:bg-blue-600">
              Attempt 2/3
            </Badge>
          </div>
        </div>

        {/* Cockpit Canvas Body */}
        <div className="grid grid-cols-1 divide-y divide-slate-200/80 lg:grid-cols-12 lg:divide-x lg:divide-y-0 dark:divide-slate-800">
          {/* Left Canvas (7 cols): Scanned Handwritten Answer Sheet with Optical Guidelines */}
          <div className="relative bg-slate-50/50 p-4 sm:p-6 lg:col-span-7 dark:bg-slate-900/40">
            <div className="relative overflow-hidden rounded-md border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-950">
              {/* Margin Visualizer Overlay */}
              {activeLayer === "margin" && (
                <div className="pointer-events-none absolute inset-0 z-10">
                  {/* Left 25mm boundary guide */}
                  <div className="absolute top-0 bottom-0 left-6 flex w-px flex-col justify-between border-r-2 border-dashed border-rose-500/80 py-2 pl-1">
                    <span className="rounded-sm bg-rose-500 px-1 font-mono text-[9px] font-bold text-white">
                      25mm Left Bound (Compliant)
                    </span>
                    <span className="bg-white/90 px-1 font-mono text-[9px] font-semibold text-rose-500 dark:bg-slate-900">
                      No spillover
                    </span>
                  </div>
                  {/* Right 20mm boundary guide */}
                  <div className="absolute top-0 right-6 bottom-0 flex w-px flex-col items-end justify-between border-l-2 border-dashed border-rose-500/80 py-2 pr-1">
                    <span className="rounded-sm bg-rose-500 px-1 font-mono text-[9px] font-bold text-white">
                      20mm Right Bound
                    </span>
                    <span className="bg-white/90 px-1 font-mono text-[9px] font-semibold text-rose-500 dark:bg-slate-900">
                      Pass
                    </span>
                  </div>
                </div>
              )}

              {/* Answer Sheet Top Meta */}
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 text-xs dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                    Q.4 (15 MARKS)
                  </span>
                  <span className="text-slate-400">•</span>
                  <span className="text-[11px] text-slate-500">
                    Word Limit: 250
                  </span>
                </div>
                <span className="flex items-center gap-1 font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <Check className="h-3 w-3" /> OCR Verified (300 DPI)
                </span>
              </div>

              {/* Question Box */}
              <div className="mb-3 rounded-sm border border-blue-200/70 bg-blue-50/70 p-2.5 text-xs leading-relaxed font-semibold text-slate-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-slate-200">
                Elucidate the impact of Indian monsoon spatial fluctuations on
                the agrarian economy and food price inflation.
              </div>

              {/* Simulated Authentic Handwritten Content */}
              <div className="space-y-3 border-l border-rose-200/50 pr-4 pl-4 font-serif text-xs leading-relaxed text-slate-700 italic sm:pr-6 sm:pl-6 sm:text-[13px] dark:border-rose-900/30 dark:text-slate-300">
                <p>
                  <span className="block font-sans text-[11px] font-bold text-[#2A6AED] not-italic dark:text-blue-400">
                    1. Macro-Agrarian Impact:
                  </span>
                  With over 55% of India&apos;s net sown area remaining
                  rain-fed, southwest monsoon deficits trigger immediate
                  contraction in{" "}
                  <span
                    className={cn(
                      "rounded px-1 py-0.5 font-sans not-italic transition-colors",
                      activeLayer === "rubric"
                        ? "bg-amber-100 font-bold text-amber-900 dark:bg-amber-950/80 dark:text-amber-200"
                        : ""
                    )}
                  >
                    Kharif pulse acreage (notably Tur & Urad)
                  </span>
                  , directly feeding headline consumer food inflation.
                </p>

                <p>
                  <span className="block font-sans text-[10px] font-bold text-[#2A6AED] not-italic dark:text-blue-400">
                    2. Institutional Policy Citations:
                  </span>
                  As highlighted in the{" "}
                  <span
                    className={cn(
                      "rounded px-1 py-0.5 font-sans not-italic transition-colors",
                      activeLayer === "rubric"
                        ? "bg-emerald-100 font-bold text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200"
                        : ""
                    )}
                  >
                    RBI Monetary Policy Report (2024)
                  </span>
                  , spatial unseasonal rainfall spikes food volatility by ~180
                  bps across rural consumption baskets.
                </p>
              </div>

              {/* Layer-Specific Footer Toast */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] dark:border-slate-800">
                {activeLayer === "rubric" && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                    <Sparkles className="h-3 w-3" />
                    Highlighted: 2 high-credit key phrases verified by rubric
                    engine
                  </span>
                )}
                {activeLayer === "margin" && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="h-3 w-3" />
                    Margins clean: Zero text leakage beyond official print
                    limits
                  </span>
                )}
                {activeLayer === "model" && (
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                    <FileCheck2 className="h-3 w-3 text-[#2A6AED]" />
                    Model Answer: Aligned with Board &amp; Entrance marking scheme
                  </span>
                )}
                <span className="font-mono text-slate-400">Page 1 / 3</span>
              </div>
            </div>
          </div>

          {/* Right Canvas (5 cols): Real-Time Rubric Intelligence Breakdown */}
          <div className="flex flex-col justify-between space-y-4 bg-white p-4 sm:p-6 lg:col-span-5 dark:bg-slate-950">
            <div>
              {/* Score Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <span className="font-mono text-[11px] font-bold text-[#2A6AED] dark:text-blue-400">
                    Evaluation Result
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Itemized Rubric Card
                  </h4>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-extrabold text-[#2A6AED] dark:text-blue-400">
                    12.5{" "}
                    <span className="text-xs font-normal text-slate-400">
                      / 15
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    83.3% (Top 5% Band)
                  </span>
                </div>
              </div>

              {/* Rubric Category Meters */}
              <div className="mt-3 space-y-3">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Introduction & Context
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      3.5 / 4.0
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full w-[88%] rounded-full bg-[#2A6AED]" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Empirical Data & RBI Citations
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      5.5 / 6.0
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full w-[92%] rounded-full bg-emerald-500" />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">
                      Way Forward & Synthesis
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white">
                      3.5 / 5.0
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full w-[70%] rounded-full bg-sky-500" />
                  </div>
                </div>
              </div>

              {/* Real-time Evaluator Note */}
              <div className="mt-4 space-y-1.5 rounded-md border border-slate-200/70 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#2A6AED] dark:text-blue-400">
                  <Sparkles className="h-3 w-3" />
                  <span>Senior Evaluator Recommendation:</span>
                </div>
                <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                  &ldquo;Candidate demonstrated strong empirical backing with
                  the RBI reference. For Attempt 3, add a brief 2-column box
                  diagram contrasting El Niño vs. Indian Ocean Dipole to capture
                  full presentation credit.&rdquo;
                </p>
              </div>
            </div>

            {/* Bottom Cockpit Quick Action */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs dark:border-slate-800">
              <span className="font-mono text-[11px] text-slate-500">
                Attempt 2 of 3 • +2.5 Mark Surge
              </span>
              <button
                type="button"
                onClick={() =>
                  setActiveLayer(
                    activeLayer === "rubric"
                      ? "margin"
                      : activeLayer === "margin"
                        ? "model"
                        : "rubric"
                  )
                }
                className="inline-flex cursor-pointer items-center gap-1 font-semibold text-[#2A6AED] hover:underline dark:text-blue-400"
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
