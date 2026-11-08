"use client"

import * as React from "react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Sparkles,
  RotateCcw,
  TrendingUp,
  FileText,
  AlertCircle,
  ScanLine,
  Target,
  ArrowRight,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AttemptData {
  attemptNum: 1 | 2 | 3
  phaseTitle: string
  score: number
  maxScore: number
  percentage: number
  badgeColor: string
  verdict: string
  rubrics: {
    name: string
    score: number
    max: number
    note: string
  }[]
  examinerComment: string
  marginCompliance: {
    leftMargin: "Compliant (25mm)" | "Exceeded (-1 mark)"
    rightMargin: "Compliant (20mm)"
    wordCount: string
    handwritingLegibility: string
  }
}

const attemptsData: Record<number, AttemptData> = {
  1: {
    attemptNum: 1,
    phaseTitle: "Diagnostic Baseline",
    score: 44,
    maxScore: 100,
    percentage: 44,
    badgeColor: "bg-blue-100 text-[#1E55C7] dark:bg-blue-950/60 dark:text-blue-300",
    verdict: "Timed pressure exposed pacing flaws and missing legal precedents in Section B.",
    rubrics: [
      {
        name: "Introduction & Contextual Grounding",
        score: 9,
        max: 20,
        note: "Generic preamble. Missed landmark 2024 constitutional bench citation.",
      },
      {
        name: "Core Arguments & Case Substantiation",
        score: 16,
        max: 40,
        note: "Surface-level facts. Arguments lacked empirical data or committee references.",
      },
      {
        name: "Diagrammatic Schematics & Flowcharts",
        score: 7,
        max: 20,
        note: "No spatial diagrams or flowcharts included to break long prose.",
      },
      {
        name: "Balanced Synthesis & Way Forward",
        score: 12,
        max: 20,
        note: "Rushed conclusion due to 3-minute remaining clock crunch.",
      },
    ],
    examinerComment:
      "Solid basic handwriting, but the essay read like raw notes. Candidate must anchor arguments with Law Commission recommendations and structure points into crisp subheadings.",
    marginCompliance: {
      leftMargin: "Compliant (25mm)",
      rightMargin: "Compliant (20mm)",
      wordCount: "1,120 / 1,250 words",
      handwritingLegibility: "88% (Good)",
    },
  },
  2: {
    attemptNum: 2,
    phaseTitle: "Rubric Rectification",
    score: 69,
    maxScore: 100,
    percentage: 69,
    badgeColor: "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    verdict: "+25 Marks Surge! Incorporated model answer schematics and legislative cross-references.",
    rubrics: [
      {
        name: "Introduction & Contextual Grounding",
        score: 15,
        max: 20,
        note: "Significantly enhanced. Opens with Art. 32 and relevant historical lineage.",
      },
      {
        name: "Core Arguments & Case Substantiation",
        score: 28,
        max: 40,
        note: "Included 3 statutory precedents and Sarkaria Commission guidelines.",
      },
      {
        name: "Diagrammatic Schematics & Flowcharts",
        score: 13,
        max: 20,
        note: "Added institutional jurisdiction flowchart within designated boundaries.",
      },
      {
        name: "Balanced Synthesis & Way Forward",
        score: 13,
        max: 20,
        note: "Well-structured multi-stakeholder roadmap with feasible timeline.",
      },
    ],
    examinerComment:
      "Remarkable turnaround. The addition of the jurisdiction diagram saved reading time and earned instant rubric credit. Deepens analytical quality considerably.",
    marginCompliance: {
      leftMargin: "Compliant (25mm)",
      rightMargin: "Compliant (20mm)",
      wordCount: "1,220 / 1,250 words",
      handwritingLegibility: "94% (Very High)",
    },
  },
  3: {
    attemptNum: 3,
    phaseTitle: "Benchmark Mastery",
    score: 87,
    maxScore: 100,
    percentage: 87,
    badgeColor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    verdict: "Top 3% Percentile. Exemplary pacing, spatial balance, and authoritative jurisprudence.",
    rubrics: [
      {
        name: "Introduction & Contextual Grounding",
        score: 18,
        max: 20,
        note: "Concise, authoritative framing with exact constitutional provisions.",
      },
      {
        name: "Core Arguments & Case Substantiation",
        score: 36,
        max: 40,
        note: "Multi-dimensional analysis (Socio-Legal, Fiscal, Administrative).",
      },
      {
        name: "Diagrammatic Schematics & Flowcharts",
        score: 16,
        max: 20,
        note: "Clean box-and-whisker structure without bleeding into margin boundaries.",
      },
      {
        name: "Balanced Synthesis & Way Forward",
        score: 17,
        max: 20,
        note: "Visionary synthesis citing NITI Aayog strategic milestones.",
      },
    ],
    examinerComment:
      "Model benchmark copy. Demonstrates exact exam-hall mastery: strict time discipline, zero margin violations, and lucid articulation.",
    marginCompliance: {
      leftMargin: "Compliant (25mm)",
      rightMargin: "Compliant (20mm)",
      wordCount: "1,245 / 1,250 words",
      handwritingLegibility: "97% (Pristine)",
    },
  },
}

export function InteractiveRubricShowcase() {
  const [selectedAttempt, setSelectedAttempt] = useState<1 | 2 | 3>(2)
  const [activeTab, setActiveTab] = useState<"rubrics" | "margins" | "comment">("rubrics")

  const current = attemptsData[selectedAttempt]

  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
      {/* Top Bar with Attempt Cycler */}
      <div className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#2A6AED] animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2A6AED] dark:text-blue-400">
              Interactive Evaluation Engine
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            Subjective Answer Sheet Rubric Simulator
          </h3>
        </div>

        {/* 3-Attempt Switcher Tabs */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-300/50 dark:border-slate-700/60 self-start md:self-auto">
          {([1, 2, 3] as const).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setSelectedAttempt(num)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                selectedAttempt === num
                  ? "bg-white dark:bg-slate-900 text-[#2A6AED] dark:text-blue-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <RotateCcw className="h-3 w-3" />
              <span>Attempt {num}</span>
              {num === 2 && (
                <span className="hidden sm:inline-block text-[9px] px-1 py-0.2 bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 rounded font-bold">
                  Surge
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Attempt Diagnostic Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={cn("text-xs font-bold border-0 px-2.5 py-0.5", current.badgeColor)}>
                {current.phaseTitle}
              </Badge>
              <span className="text-[11px] font-mono font-semibold text-slate-500">
                Attempt {current.attemptNum} of 3
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white font-mono tracking-tight">
                {current.score}
              </span>
              <span className="text-slate-400 font-semibold text-lg">/ {current.maxScore}</span>
              <span
                className={cn(
                  "ml-auto text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                  current.percentage >= 80
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : current.percentage >= 60
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                    : "bg-blue-100 text-[#1E55C7] dark:bg-blue-950/60 dark:text-blue-300"
                )}
              >
                <TrendingUp className="h-3 w-3" />
                {current.percentage}% Score
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              {current.verdict}
            </p>

            <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Word Count Disciplined</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {current.marginCompliance.wordCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">OCR Margin Compliance</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Pass (25mm)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Legibility Score</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {current.marginCompliance.handwritingLegibility}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="p-3.5 rounded-xl bg-[#EFF6FF]/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-[#2A6AED] dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="leading-snug">
              Notice how the candidate rectifies missing citations between Attempt 1 and 2, boosting their mark by{" "}
              <strong className="text-[#2A6AED] dark:text-blue-300 font-bold">+25 marks</strong> without re-buying the test.
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Tabbed Evaluation Viewer (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sub-nav Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab("rubrics")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer",
                activeTab === "rubrics"
                  ? "bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2A6AED] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Target className="h-3.5 w-3.5" />
              Itemized Rubrics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("margins")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer",
                activeTab === "margins"
                  ? "bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2A6AED] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <ScanLine className="h-3.5 w-3.5" />
              A4 Margin Scanner
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("comment")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-all cursor-pointer",
                activeTab === "comment"
                  ? "bg-[#EFF6FF] dark:bg-blue-950/60 text-[#2A6AED] dark:text-blue-400 border border-blue-200/80 dark:border-blue-800"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Examiner Synthesis
            </button>
          </div>

          {/* TAB 1: Rubric Bars */}
          {activeTab === "rubrics" && (
            <div className="space-y-4 animate-fade-up">
              {current.rubrics.map((r, idx) => {
                const pct = (r.score / r.max) * 100
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-slate-50/60 dark:bg-slate-950/40 border border-slate-200/70 dark:border-slate-800/80 space-y-2 hover:border-blue-300 dark:hover:border-blue-700/60 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {r.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-xs font-mono">
                        <span className="font-bold text-[#2A6AED] dark:text-blue-400">
                          {r.score}
                        </span>
                        <span className="text-slate-400">/ {r.max} Marks</span>
                      </div>
                    </div>

                    <Progress
                      value={pct}
                      className="h-2 bg-slate-200 dark:bg-slate-800"
                      indicatorClassName={cn(
                        pct >= 80
                          ? "bg-emerald-500"
                          : pct >= 60
                          ? "bg-[#2A6AED] dark:bg-blue-500"
                          : "bg-amber-500"
                      )}
                    />

                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 italic">
                      ↳ {r.note}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB 2: Margin Scanner Simulator */}
          {activeTab === "margins" && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-5 space-y-4 animate-fade-up">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Physical Margin Boundaries: Fully Validated
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Standardized Left (25mm) and Right (20mm) UPSC margin compliance.
                    </p>
                  </div>
                </div>
                <Badge className="bg-emerald-600 text-white border-0 text-[10px] font-semibold">
                  Zero Violations
                </Badge>
              </div>

              {/* Simulated Sheet Spec */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 bg-white dark:bg-slate-900/90 font-mono text-xs space-y-2">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>LEFT MARGIN THRESHOLD:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    25.2mm (Clear of Text)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>RIGHT MARGIN THRESHOLD:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    20.4mm (Clear of Text)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>QUESTION NUMBERING PARSER:</span>
                  <span className="text-[#2A6AED] dark:text-blue-400 font-bold">
                    Sequential Q.1 to Q.20 Verified
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>CONTRAST & SCAN RESOLUTION:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    300 DPI (Lossless)
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                *Verityra automatically rejects answer sheets that write beyond official margins, mirroring real UPSC Commission negative marking penalties before final grading.
              </p>
            </div>
          )}

          {/* TAB 3: Examiner Synthesis */}
          {activeTab === "comment" && (
            <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/40 bg-gradient-to-br from-[#EFF6FF]/60 via-white to-white dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900 p-5 space-y-3 animate-fade-up">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Senior Evaluator Summary & Recommendations
                </h4>
              </div>
              <blockquote className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic border-l-2 border-[#2A6AED] pl-3 py-1 leading-relaxed">
                &ldquo;{current.examinerComment}&rdquo;
              </blockquote>
              <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Verified by Subject Matter Expert Board</span>
                <span className="font-mono">Turnaround: 12 mins</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
