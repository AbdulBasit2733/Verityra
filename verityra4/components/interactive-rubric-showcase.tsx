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
    badgeColor:
      "bg-blue-100 text-[#1E55C7] dark:bg-blue-950/60 dark:text-blue-300",
    verdict:
      "Timed pressure exposed pacing flaws and missing legal precedents in Section B.",
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
    badgeColor:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300",
    verdict:
      "+25 Marks Surge! Incorporated model answer schematics and legislative cross-references.",
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
    badgeColor:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300",
    verdict:
      "Top 3% Percentile. Exemplary pacing, spatial balance, and authoritative jurisprudence.",
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
  const [activeTab, setActiveTab] = useState<"rubrics" | "margins" | "comment">(
    "rubrics"
  )

  const current = attemptsData[selectedAttempt]

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
      {/* Top Bar with Attempt Cycler */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 bg-slate-50 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-950/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-[#2A6AED]" />
            <span className="text-[11px] font-semibold tracking-wider text-[#2A6AED] uppercase dark:text-blue-400">
              Interactive Evaluation Engine
            </span>
          </div>
          <h3 className="mt-0.5 text-base font-bold text-slate-900 sm:text-lg dark:text-white">
            Subjective Answer Sheet Rubric Simulator
          </h3>
        </div>

        {/* 3-Attempt Switcher Tabs */}
        <div className="inline-flex items-center self-start rounded-xl border border-slate-300/50 bg-slate-200/70 p-1 md:self-auto dark:border-slate-700/60 dark:bg-slate-800">
          {([1, 2, 3] as const).map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setSelectedAttempt(num)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                selectedAttempt === num
                  ? "bg-white text-[#2A6AED] shadow-xs dark:bg-slate-900 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <RotateCcw className="h-3 w-3" />
              <span>Attempt {num}</span>
              {num === 2 && (
                <span className="py-0.2 hidden rounded bg-amber-100 px-1 text-[9px] font-bold text-amber-800 sm:inline-block dark:bg-amber-950/80 dark:text-amber-300">
                  Surge
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 items-start gap-6 p-4 sm:p-6 lg:grid-cols-12 lg:gap-8 lg:p-8">
        {/* Left Column: Attempt Diagnostic Summary (4 cols) */}
        <div className="space-y-4 lg:col-span-4">
          <div className="space-y-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <div className="flex items-center justify-between">
              <Badge
                className={cn(
                  "border-0 px-2.5 py-0.5 text-xs font-bold",
                  current.badgeColor
                )}
              >
                {current.phaseTitle}
              </Badge>
              <span className="font-mono text-[11px] font-semibold text-slate-500">
                Attempt {current.attemptNum} of 3
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                {current.score}
              </span>
              <span className="text-lg font-semibold text-slate-400">
                / {current.maxScore}
              </span>
              <span
                className={cn(
                  "ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold",
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

            <p className="text-xs leading-relaxed font-normal text-slate-600 dark:text-slate-300">
              {current.verdict}
            </p>

            <div className="space-y-2 border-t border-slate-200/60 pt-3 dark:border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Word Count Disciplined
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {current.marginCompliance.wordCount}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  OCR Margin Compliance
                </span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Pass (25mm)
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Legibility Score
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {current.marginCompliance.handwritingLegibility}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="flex items-start gap-2.5 rounded-xl border border-blue-200/70 bg-[#EFF6FF]/70 p-3.5 text-xs text-slate-700 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-slate-300">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[#2A6AED] dark:text-blue-400" />
            <p className="leading-snug">
              Notice how the candidate rectifies missing citations between
              Attempt 1 and 2, boosting their mark by{" "}
              <strong className="font-bold text-[#2A6AED] dark:text-blue-300">
                +25 marks
              </strong>{" "}
              without re-buying the test.
            </p>
          </div>
        </div>

        {/* Right Column: Detailed Tabbed Evaluation Viewer (8 cols) */}
        <div className="space-y-4 lg:col-span-8">
          {/* Sub-nav Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab("rubrics")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                activeTab === "rubrics"
                  ? "border border-blue-200/80 bg-[#EFF6FF] text-[#2A6AED] dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <Target className="h-3.5 w-3.5" />
              Itemized Rubrics
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("margins")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                activeTab === "margins"
                  ? "border border-blue-200/80 bg-[#EFF6FF] text-[#2A6AED] dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <ScanLine className="h-3.5 w-3.5" />
              A4 Margin Scanner
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("comment")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                activeTab === "comment"
                  ? "border border-blue-200/80 bg-[#EFF6FF] text-[#2A6AED] dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400"
                  : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Examiner Synthesis
            </button>
          </div>

          {/* TAB 1: Rubric Bars */}
          {activeTab === "rubrics" && (
            <div className="animate-fade-up space-y-4">
              {current.rubrics.map((r, idx) => {
                const pct = (r.score / r.max) * 100
                return (
                  <div
                    key={idx}
                    className="space-y-2 rounded-xl border border-slate-200/70 bg-slate-50/60 p-4 transition-colors hover:border-blue-300 dark:border-slate-800/80 dark:bg-slate-950/40 dark:hover:border-blue-700/60"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 sm:text-sm dark:text-slate-100">
                        {r.name}
                      </span>
                      <div className="flex items-center gap-1.5 font-mono text-xs">
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

                    <p className="text-[11px] text-slate-500 italic sm:text-xs dark:text-slate-400">
                      ↳ {r.note}
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          {/* TAB 2: Margin Scanner Simulator */}
          {activeTab === "margins" && (
            <div className="animate-fade-up space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Physical Margin Boundaries: Fully Validated
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Standardized Left (25mm) and Right (20mm) UPSC margin
                      compliance.
                    </p>
                  </div>
                </div>
                <Badge className="border-0 bg-emerald-600 text-[10px] font-semibold text-white">
                  Zero Violations
                </Badge>
              </div>

              {/* Simulated Sheet Spec */}
              <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-3.5 font-mono text-xs dark:border-slate-800 dark:bg-slate-900/90">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>LEFT MARGIN THRESHOLD:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    25.2mm (Clear of Text)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>RIGHT MARGIN THRESHOLD:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    20.4mm (Clear of Text)
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>QUESTION NUMBERING PARSER:</span>
                  <span className="font-bold text-[#2A6AED] dark:text-blue-400">
                    Sequential Q.1 to Q.20 Verified
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>CONTRAST & SCAN RESOLUTION:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    300 DPI (Lossless)
                  </span>
                </div>
              </div>

              <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                *Verityra automatically rejects answer sheets that write beyond
                official margins, mirroring real UPSC Commission negative
                marking penalties before final grading.
              </p>
            </div>
          )}

          {/* TAB 3: Examiner Synthesis */}
          {activeTab === "comment" && (
            <div className="animate-fade-up space-y-3 rounded-xl border border-blue-200/70 bg-gradient-to-br from-[#EFF6FF]/60 via-white to-white p-5 dark:border-blue-900/40 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                <h4 className="text-xs font-bold tracking-wider text-slate-900 uppercase dark:text-white">
                  Senior Evaluator Summary & Recommendations
                </h4>
              </div>
              <blockquote className="border-l-2 border-[#2A6AED] py-1 pl-3 text-xs leading-relaxed text-slate-700 italic sm:text-sm dark:text-slate-300">
                &ldquo;{current.examinerComment}&rdquo;
              </blockquote>
              <div className="flex items-center justify-between pt-2 text-[11px] text-slate-500 dark:text-slate-400">
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
