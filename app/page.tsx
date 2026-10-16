import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion"
import {
  PenTool,
  UploadCloud,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  FileDown,
  Target,
  RotateCcw,
  Check,
} from "lucide-react"
import { getLeaderboardAction } from "@/actions/leaderboard-actions"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  const leaderboardPreview = await getLeaderboardAction()

  const featuredTests = [
    {
      id: "upsc-mains-gs1",
      title: "UPSC Civil Services General Studies Paper I Mock",
      description:
        "Comprehensive subjective test covering Indian Heritage, Culture, History and Geography with standard 20-question format.",
      duration: "180 mins",
      marks: 250,
      price: 0,
      isFree: true,
      maxAttempts: 3,
      category: "Civil Services",
    },
    {
      id: "state-psc-mains-essay",
      title: "State PSC Advanced Essay & Analytical Writing",
      description:
        "Thematic essay writing under timed conditions. Evaluated against rigorous articulation, coherence, and structure rubrics.",
      duration: "180 mins",
      marks: 150,
      price: 499,
      isFree: false,
      maxAttempts: 3,
      category: "State Administration",
    },
    {
      id: "judiciary-mains-law",
      title: "Judicial Services Criminal & Civil Law Practice Paper",
      description:
        "Fact-based legal problem scenarios and procedural jurisprudence drafting tested on official legal margins.",
      duration: "180 mins",
      marks: 200,
      price: 699,
      isFree: false,
      maxAttempts: 3,
      category: "Judicial Services",
    },
  ]

  const faqs = [
    {
      q: "How do I print and use the standardized margin sheets?",
      a: "Upon enrolling in any test series, you can immediately download the official margin-aligned PDF booklet from your test workspace. Print the template on standard A4 paper or use ruled sheets respecting the prescribed left (25mm) and right (20mm) margin boundaries.",
    },
    {
      q: "Why is handwritten answer submission mandatory?",
      a: "Competitive subjective examinations like UPSC CSE and State PCS demand physical pen-on-paper endurance, real-time handwriting legibility, diagrammatic spatial layout, and rigorous pacing. Typing tests cannot simulate these authentic exam-hall conditions.",
    },
    {
      q: "How does the strict three-attempt allowance work?",
      a: "Every registration grants you three accepted attempts. Attempt 1 serves as your diagnostic baseline under timed conditions. Attempt 2 allows you to rectify rubric deficiencies using the provided model answers. Attempt 3 benchmarks your exam-ready final polish for the public leaderboard.",
    },
    {
      q: "What happens if an upload fails or my internet connection drops?",
      a: "Verityra's submission vault uses atomic transaction safety. If a file upload is corrupted, invalid, or disconnected before final server confirmation, your attempt allowance is never consumed. Only successfully verified booklets count against your 3 attempts.",
    },
    {
      q: "Who formulates the model answers and marking rubrics?",
      a: "All marking schemes, partial-credit formulas, and question-by-question model solutions are formulated by experienced subjective exam educators and administrators in strict alignment with official UPSC and PCS examination standards.",
    },
    {
      q: "Can I submit scanned copies taken from a mobile phone camera?",
      a: "Yes! You can use any standard mobile document scanner (such as Adobe Scan or Microsoft Lens) to capture high-clarity photos of your handwritten pages, compile them into a single PDF, and submit directly through your candidate dashboard.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-white dark:!bg-[#0b1120] overflow-x-hidden selection:bg-[#DBEAFE] selection:text-[#1E55C7] dark:selection:bg-[#1E3A8A] dark:selection:text-[#DBEAFE]">
      <Navbar />

      <main className="flex-1">
        {/* 1. HERO SECTION — PIXEL-PERFECT SAAS PROPORTIONS */}
        <section className="hero-section relative overflow-hidden bg-white dark:!bg-[#0b1120] pt-8 pb-14 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
          {/* Subtle SaaS Backdrop: Top Radial Spotlight + Masked Architectural Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(42,106,237,0.12),transparent)] dark:bg-[radial-gradient(ellipse_80%_55%_at_50%_-10%,rgba(59,130,246,0.22),transparent)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f060_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f060_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b80_1px,transparent_1px),linear-gradient(to_bottom,#1e293b80_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_75%_50%_at_50%_0%,#000_65%,transparent_100%)] pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
              
              {/* Left Column (7 cols on lg) */}
              <div className="lg:col-span-7 flex flex-col items-center sm:items-start text-center sm:text-left space-y-4 sm:space-y-5">
                
                {/* Eyebrow Announcement Pill */}
                <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-2 rounded-full border border-blue-200/90 dark:border-blue-500/30 bg-[#EFF6FF]/90 dark:!bg-blue-950/40 p-1 pr-3 text-[11px] font-semibold text-[#1E55C7] dark:text-blue-300 shadow-2xs dark:shadow-none animate-fade-up">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#2A6AED] dark:bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                    3x Attempts
                  </span>
                  <span className="font-semibold tracking-tight text-slate-800 dark:text-slate-200">
                    UPSC • State PCS • Judiciary Mains
                  </span>
                </div>

                {/* Display Headline — Balanced Poppins SaaS Scale */}
                <h1 className="text-2xl min-[375px]:text-[1.75rem] sm:text-4xl lg:text-[2.65rem] xl:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.22] sm:leading-[1.16] animate-fade-up delay-100">
                  Master Mains Answer Writing with{" "}
                  <span className="bg-gradient-to-r from-[#2A6AED] via-[#1E55C7] to-[#3B82F6] dark:from-[#60A5FA] dark:via-[#3B82F6] dark:to-[#93C5FD] bg-clip-text text-transparent">
                    Standardized Handwritten
                  </span>{" "}
                  Practice.
                </h1>

                {/* Value Proposition */}
                <p className="text-xs min-[375px]:text-[13.5px] sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl font-normal animate-fade-up delay-100">
                  Download official margin-aligned PDF booklets, write solutions with pen and paper under timed conditions, and receive itemized question-by-question rubric scores across three progressive attempts.
                </p>

                {/* Scannable Feature Check Pills */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-0.5 animate-fade-up delay-200">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 dark:!bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400 shrink-0" />
                    Printable A4 Margin Booklets
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 dark:!bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400 shrink-0" />
                    Itemized Rubric Feedback
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 dark:!bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-slate-700 dark:text-slate-300">
                    <Check className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400 shrink-0" />
                    Live Rank Benchmark
                  </span>
                </div>

                {/* Action CTAs — Standard SaaS Button Heights (h-11) */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-1 animate-fade-up delay-200">
                  <Link href="/tests" className="w-full sm:w-auto">
                    <Button className="group h-11 px-6 text-xs sm:text-sm font-semibold bg-[#2A6AED] hover:bg-[#1E55C7] dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-md shadow-[#2A6AED]/20 hover:shadow-lg hover:shadow-[#2A6AED]/30 dark:shadow-blue-900/40 transition-all active:scale-[0.98] rounded-xl w-full sm:w-auto">
                      Explore Test Series
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="h-11 px-6 text-xs sm:text-sm font-semibold border border-slate-200 bg-white hover:border-[#2A6AED]/50 hover:bg-[#EFF6FF]/70 text-slate-800 hover:text-[#1E55C7] dark:!bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:!bg-slate-800 dark:hover:border-blue-500/50 dark:hover:text-blue-300 rounded-xl w-full sm:w-auto shadow-2xs dark:shadow-none transition-all"
                    >
                      Start Free Mock Test
                    </Button>
                  </Link>
                </div>

                {/* Bento Trust Metrics Strip */}
                <div className="w-full pt-3 sm:pt-4 grid grid-cols-3 gap-2.5 sm:gap-3.5 max-w-lg animate-fade-up delay-300">
                  <div className="rounded-xl bg-slate-50/80 dark:!bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 p-2.5 sm:p-3.5 text-center sm:text-left transition-colors hover:border-blue-200 hover:bg-[#EFF6FF]/40 dark:hover:border-blue-500/40 dark:hover:!bg-blue-950/20">
                    <p className="text-base sm:text-xl font-bold text-[#2A6AED] dark:text-blue-400 leading-none">
                      3x
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-tight">
                      Attempts / Test
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50/80 dark:!bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 p-2.5 sm:p-3.5 text-center sm:text-left transition-colors hover:border-blue-200 hover:bg-[#EFF6FF]/40 dark:hover:border-blue-500/40 dark:hover:!bg-blue-950/20">
                    <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white leading-none">
                      100%
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-tight">
                      Pen & Paper
                    </p>
                  </div>
                  <div className="rounded-xl bg-slate-50/80 dark:!bg-slate-900/80 border border-slate-200/70 dark:border-slate-800 p-2.5 sm:p-3.5 text-center sm:text-left transition-colors hover:border-blue-200 hover:bg-[#EFF6FF]/40 dark:hover:border-blue-500/40 dark:hover:!bg-blue-950/20">
                    <p className="text-base sm:text-xl font-bold text-emerald-600 dark:text-emerald-400 leading-none">
                      Rubric
                    </p>
                    <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-tight">
                      Itemized Score
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols on lg): SaaS Answer Sheet & Rubric Evaluation Showcase */}
              <div className="lg:col-span-5 relative animate-fade-up delay-200">
                <div className="rounded-2xl p-1.5 sm:p-2 bg-gradient-to-b from-blue-100/70 via-slate-100/60 to-slate-200/50 dark:from-blue-900/30 dark:via-slate-900/90 dark:to-slate-950 border border-blue-200/70 dark:border-slate-800/80 shadow-mockup">
                  <div className="rounded-xl bg-white dark:!bg-slate-950 border border-slate-200/90 dark:border-slate-800 overflow-hidden">
                    
                    {/* Top Window Bar */}
                    <div className="bg-slate-900 dark:!bg-slate-950 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="h-2 w-2 rounded-full bg-rose-400/90" />
                          <span className="h-2 w-2 rounded-full bg-amber-400/90" />
                          <span className="h-2 w-2 rounded-full bg-emerald-400/90" />
                        </div>
                        <span className="text-[11px] font-mono font-medium text-slate-300 truncate ml-1">
                          GS1-Mains-Booklet.pdf
                        </span>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#2A6AED]/25 dark:bg-blue-500/20 border border-blue-400/30 px-2 py-0.5 text-[10px] font-semibold text-blue-300 shrink-0">
                        <RotateCcw className="h-2.5 w-2.5 text-blue-400" />
                        Attempt 1 of 3
                      </span>
                    </div>

                    {/* Standardized Margin Sheet Header */}
                    <div className="bg-gradient-to-r from-[#1E55C7] via-[#2A6AED] to-[#3B82F6] dark:from-[#1E3A8A] dark:via-[#1D4ED8] dark:to-[#2563EB] px-3.5 py-2.5 sm:px-4 sm:py-3 text-white flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-blue-100 font-mono font-semibold">
                          ROLL #248910 • Q.4 (15 MARKS)
                        </p>
                        <h3 className="text-xs font-bold text-white truncate mt-0.5">
                          UPSC CSE General Studies Paper I
                        </h3>
                      </div>
                      <Badge className="bg-white/20 text-white border-0 text-[10px] font-semibold px-2 py-0.5 shrink-0">
                        25mm Margin
                      </Badge>
                    </div>

                    {/* Ruled Paper Answer Body */}
                    <div className="p-3 sm:p-3.5 bg-white dark:!bg-slate-900/60 border-b border-slate-100 dark:border-slate-800">
                      <div className="border-x-2 border-rose-200/80 dark:border-rose-500/35 px-2.5 sm:px-3 py-2 bg-ruled-paper hero-ruled-paper space-y-2 rounded-sm">
                        <div className="bg-white/95 hero-question-card p-2 rounded-lg border border-slate-200/90 dark:border-slate-800">
                          <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                            <span className="text-[#2A6AED] dark:text-blue-400 font-bold">Q.4)</span> Elucidate the impact of Indian monsoon spatial fluctuations on the agrarian economy.
                          </p>
                        </div>

                        <div className="text-[11px] text-slate-700 dark:text-slate-300 font-serif italic leading-relaxed pl-2 border-l-2 border-[#2A6AED] dark:border-blue-500">
                          <p>
                            <span className="font-sans not-italic font-bold text-[10px] uppercase tracking-wider text-[#2A6AED] dark:text-blue-400 block">
                              1. Monsoon Teleconnections:
                            </span>
                            Governing ~70% of annual precipitation, South-West monsoon variability directly dictates{" "}
                            <span className="bg-amber-100/90 dark:!bg-amber-950/80 text-slate-900 dark:text-amber-200 border border-transparent dark:border-amber-700/40 not-italic font-sans font-semibold px-1 rounded">
                              Kharif sowing acreage
                            </span>{" "}
                            and rural credit liquidity.
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-1.5 bg-emerald-50/95 dark:!bg-emerald-950/50 border border-emerald-200/90 dark:border-emerald-800/60 px-2.5 py-1.5 rounded-lg text-[11px] text-emerald-800 dark:text-emerald-300 font-medium">
                          <span className="flex items-center gap-1 font-semibold">
                            <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Margin & Word Limit: Verified
                          </span>
                          <span className="text-[10px] bg-emerald-600 dark:bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">
                            +1.5 Bonus
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Visual Rubric Scorecard Panel */}
                    <div className="p-3.5 sm:p-4 bg-slate-900 dark:!bg-slate-950 text-white space-y-2.5 border-t border-slate-800">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-400">
                            Itemized Rubric Evaluation
                          </p>
                          <h4 className="text-xs font-bold text-white">
                            Question-Wise Score Breakdown
                          </h4>
                        </div>
                        <div className="bg-slate-800 dark:!bg-slate-900 border border-slate-700 dark:border-slate-800 px-2.5 py-1 rounded-lg text-right shrink-0">
                          <span className="text-base sm:text-lg font-bold text-blue-400">16.5</span>
                          <span className="text-[11px] text-slate-400 font-medium"> / 20</span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300">Conceptual Depth & Keywords</span>
                            <span className="font-semibold text-white">4.5 / 5.0</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full w-[90%] rounded-full bg-[#2A6AED] dark:bg-blue-500" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300">Intro-Body-Conclusion Flow</span>
                            <span className="font-semibold text-emerald-400">4.0 / 4.0</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full w-full rounded-full bg-emerald-400" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-300">Spatial & Policy Citations</span>
                            <span className="font-semibold text-sky-400">8.0 / 11.0</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full w-[74%] rounded-full bg-sky-400" />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1.5 text-[10px] font-semibold text-center">
                        <div className="rounded-md bg-blue-500/20 border border-blue-400/40 text-blue-300 py-1 px-1 truncate">
                          ✓ 1. Baseline
                        </div>
                        <div className="rounded-md bg-[#2A6AED] dark:bg-blue-600 text-white py-1 px-1 truncate">
                          → 2. Rectify
                        </div>
                        <div className="rounded-md bg-slate-800 dark:!bg-slate-900 border border-transparent dark:border-slate-800/80 text-slate-400 py-1 px-1 truncate">
                          3. Rank Push
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. 4-STEP EXAMINATION WORKFLOW SECTION */}
        <section id="how-it-works" className="py-14 sm:py-20 lg:py-24 bg-slate-50/70 border-y border-slate-200/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2.5">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 text-[11px] px-3 py-1 font-semibold rounded-full">
                Standardized Exam Routine
              </Badge>
              <h2 className="text-xl min-[375px]:text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                How Verityra Powers Exam Readiness
              </h2>
              <p className="text-slate-600 text-xs min-[375px]:text-sm sm:text-base leading-relaxed">
                Four structured phases engineered to build authentic writing stamina, presentation speed, and rubric alignment under genuine test conditions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              
              {/* Step 1 */}
              <div className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2A6AED] transition-colors duration-300 group-hover:bg-[#2A6AED] group-hover:text-white">
                      <FileDown className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-blue-100 group-hover:text-blue-200 transition-colors">
                      01
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">1. Download Template</h3>
                  <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                    Download the official margin-aligned answer booklet (PDF) configured specifically for your test format with exact UPSC and PCS margin boundaries.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-[#2A6AED] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 shrink-0" /> Printable A4 margin sheets
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2A6AED] transition-colors duration-300 group-hover:bg-[#2A6AED] group-hover:text-white">
                      <PenTool className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-blue-100 group-hover:text-blue-200 transition-colors">
                      02
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">2. Write by Hand</h3>
                  <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                    Write out full answers offline using pen and paper under timed conditions. Train your real-world handwriting stamina, structural layout, and pace.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-[#2A6AED] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 shrink-0" /> Authentic pen & paper endurance
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2A6AED] transition-colors duration-300 group-hover:bg-[#2A6AED] group-hover:text-white">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-blue-100 group-hover:text-blue-200 transition-colors">
                      03
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">3. Scan & Upload</h3>
                  <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                    Capture high-clarity scans from any phone camera and upload the multi-page PDF directly to our 256-bit encrypted submission vault.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-[#2A6AED] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 shrink-0" /> Atomic 3-attempt verification
                  </span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="group p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center text-[#2A6AED] transition-colors duration-300 group-hover:bg-[#2A6AED] group-hover:text-white">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold text-blue-100 group-hover:text-blue-200 transition-colors">
                      04
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1.5">4. Rubrics & Rank</h3>
                  <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                    Review itemized marks against the model answer rubric, inspect missing concepts, view actionable feedback, and benchmark on the live leaderboard.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <span className="text-xs font-semibold text-[#2A6AED] flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5 shrink-0" /> Transparent live leaderboard
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. DEDICATED 3-ATTEMPT ITERATIVE MASTERY SECTION */}
        <section id="iterative-mastery" className="py-14 sm:py-20 lg:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14 space-y-2.5">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 text-[11px] px-3 py-1 font-semibold rounded-full">
                The Three-Attempt Guarantee
              </Badge>
              <h2 className="text-xl min-[375px]:text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                Iterative Mastery: From Baseline to Top Rank
              </h2>
              <p className="text-slate-600 text-xs min-[375px]:text-sm sm:text-base leading-relaxed">
                Why single-submission tests fail candidates: Verityra grants 3 calibrated attempts per registered test series to transform structural flaws into top-percentile performance.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 items-stretch">
              
              {/* Attempt 1 Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="h-1.5 w-full bg-slate-100">
                  <div className="h-full w-1/3 bg-blue-400 rounded-r-full" />
                </div>

                <div className="p-5 sm:p-6 space-y-4 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className="border-blue-200 text-[#2A6AED] bg-[#EFF6FF] font-semibold text-[11px] px-2.5 py-0.5">
                      Attempt 1
                    </Badge>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Phase 1: Diagnosis
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Baseline Diagnostics
                    </h3>
                    <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                      <span>Avg. Benchmark: 40% – 50%</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                    Write without preconceived notions under strict timed pressure. Expose structural bottlenecks, pacing flaws, keyword omissions, and presentation deficits.
                  </p>

                  <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <li className="flex items-start gap-2">
                      <Target className="h-3.5 w-3.5 text-[#2A6AED] shrink-0 mt-0.5" />
                      <span>Pinpoints time management bottlenecks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-3.5 w-3.5 text-[#2A6AED] shrink-0 mt-0.5" />
                      <span>Identifies missing intro/conclusion frameworks</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Target className="h-3.5 w-3.5 text-[#2A6AED] shrink-0 mt-0.5" />
                      <span>Establishes objective starting rubric score</span>
                    </li>
                  </ul>
                </div>

                <div className="px-5 py-3.5 sm:px-6 border-t border-slate-100 bg-slate-50/80 text-center">
                  <p className="text-xs text-slate-600 font-semibold">
                    Outcome: Comprehensive Diagnostic Report
                  </p>
                </div>
              </div>

              {/* Attempt 2 Card */}
              <div className="rounded-2xl border-2 border-[#2A6AED] bg-white overflow-hidden flex flex-col justify-between shadow-md shadow-blue-500/10 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="bg-gradient-to-r from-[#1E55C7] via-[#2A6AED] to-[#3B82F6] text-white text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 text-center flex items-center justify-center gap-1.5">
                  <TrendingUp className="h-3 w-3 shrink-0" />
                  <span>Crucial Pivot — Maximum Score Gain</span>
                </div>

                <div className="p-5 sm:p-6 space-y-4 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge className="bg-[#2A6AED] text-white font-semibold text-[11px] px-2.5 py-0.5 border-0">
                      Attempt 2
                    </Badge>
                    <span className="text-[11px] font-semibold text-[#2A6AED] uppercase tracking-wider">
                      Phase 2: Rectification
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Rubric Rectification
                    </h3>
                    <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[11px] font-semibold">
                      <span>Avg. Benchmark: 62% – 72% (+20% Surge)</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                    Incorporate the administrator&apos;s model answers and marking rubrics. Eliminate structural gaps, integrate schematics, and refine argument cohesion.
                  </p>

                  <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Applies standard model answer templates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Embeds required flowcharts & committee citations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Substantial score elevation across all questions</span>
                    </li>
                  </ul>
                </div>

                <div className="px-5 py-3.5 sm:px-6 border-t border-blue-100 bg-[#EFF6FF]/70 text-center">
                  <p className="text-xs text-[#2A6AED] font-bold">
                    Outcome: Flawless Rubric Alignment
                  </p>
                </div>
              </div>

              {/* Attempt 3 Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                <div className="h-1.5 w-full bg-slate-100">
                  <div className="h-full w-full bg-emerald-500" />
                </div>

                <div className="p-5 sm:p-6 space-y-4 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant="outline" className="border-blue-200 text-[#2A6AED] bg-[#EFF6FF] font-semibold text-[11px] px-2.5 py-0.5">
                      Attempt 3
                    </Badge>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Phase 3: Benchmark
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      Exam-Ready Mastery
                    </h3>
                    <div className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-0.5 rounded-md bg-[#EFF6FF] text-[#2A6AED] text-[11px] font-semibold">
                      <span>Avg. Benchmark: 78% – 88% (Top Rank)</span>
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13.5px] text-slate-600 leading-relaxed">
                    Perform your final pen-on-paper simulation at peak speed and analytical clarity. Your score is officially recorded and published to the live leaderboard.
                  </p>

                  <ul className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <li className="flex items-start gap-2">
                      <Award className="h-3.5 w-3.5 text-[#2A6AED] shrink-0 mt-0.5" />
                      <span>Full 3-hour exam endurance readiness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Award className="h-3.5 w-3.5 text-[#2A6AED] shrink-0 mt-0.5" />
                      <span>Strict margin discipline and legibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Award className="h-3.5 w-3.5 text-[#2A6AED] shrink-0 mt-0.5" />
                      <span>Official ranking push on transparent leaderboard</span>
                    </li>
                  </ul>
                </div>

                <div className="px-5 py-3.5 sm:px-6 border-t border-slate-100 bg-slate-50/80 text-center">
                  <p className="text-xs text-slate-600 font-semibold">
                    Outcome: Published Leaderboard Percentile
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4. FEATURED TEST SERIES CATALOG PREVIEW */}
        <section className="py-14 sm:py-20 lg:py-24 bg-slate-50/70 border-t border-slate-200/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 sm:mb-14 gap-4">
              <div className="space-y-2">
                <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 text-[11px] px-3 py-1 font-semibold rounded-full">
                  Catalog Preview
                </Badge>
                <h2 className="text-xl min-[375px]:text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                  Featured Test Series
                </h2>
                <p className="text-slate-600 text-xs min-[375px]:text-sm sm:text-base">
                  Enroll in targeted practice modules crafted by experienced subjective examination educators.
                </p>
              </div>
              <Link href="/tests" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-10 sm:h-11 px-5 border-slate-200 bg-white text-slate-800 hover:border-[#2A6AED] hover:bg-blue-50/50 text-xs sm:text-sm font-semibold rounded-xl"
                >
                  View Full Catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
              {featuredTests.map((test) => (
                <div
                  key={test.id}
                  className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="space-y-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge variant="outline" className="text-[11px] font-semibold border-blue-200 text-[#2A6AED] bg-[#EFF6FF] px-2.5 py-0.5">
                        {test.category}
                      </Badge>
                      {test.isFree ? (
                        <Badge className="bg-emerald-600 text-white font-semibold text-[11px] border-0 px-2.5 py-0.5">
                          Free Test
                        </Badge>
                      ) : (
                        <span className="text-base sm:text-lg font-bold text-slate-900">
                          ₹{test.price}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-2 leading-snug">
                      {test.title}
                    </h3>
                    <p className="text-xs sm:text-[13.5px] text-slate-600 line-clamp-3 leading-relaxed">
                      {test.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-5 border-t border-slate-100 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#2A6AED] shrink-0" />
                        {test.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-[#2A6AED] shrink-0" />
                        {test.marks} Marks
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#2A6AED]">
                        3 Attempts
                      </span>
                    </div>

                    <Link href="/tests" className="block w-full">
                      <Button className="w-full bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-xs sm:text-sm h-10 sm:h-11 rounded-xl shadow-2xs transition-all">
                        View Details & Enroll
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. LEADERBOARD PREVIEW SECTION */}
        <section className="py-14 sm:py-20 lg:py-24 bg-white border-t border-slate-200/80">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              <div className="lg:col-span-5 space-y-4 text-center sm:text-left">
                <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 text-[11px] px-3 py-1 font-semibold rounded-full">
                  Transparent Rankings
                </Badge>
                <h2 className="text-xl min-[375px]:text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight">
                  Benchmark Against Top Aspirants
                </h2>
                <p className="text-slate-600 text-xs min-[375px]:text-sm sm:text-base leading-relaxed">
                  Compare your performance across finalized assessments. Rankings are computed strictly from verified handwritten answer sheets, giving you an authentic pulse of where you stand nationwide.
                </p>
                <div className="pt-1">
                  <Link href="/leaderboard" className="block sm:inline-block">
                    <Button className="w-full sm:w-auto h-10 sm:h-11 px-6 bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 text-xs sm:text-sm">
                      Explore Full Leaderboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-card overflow-hidden">
                  <div className="px-4 py-3.5 sm:px-6 sm:py-4 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Recent Published Rankings
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Finalized Evaluated Answer Copies
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[11px] font-semibold text-[#2A6AED] border-blue-200 bg-[#EFF6FF] inline-flex items-center gap-1.5 px-2.5 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live
                    </Badge>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {leaderboardPreview.length > 0 ? (
                      leaderboardPreview.slice(0, 4).map((item) => (
                        <div
                          key={item.rank}
                          className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4 text-xs sm:text-sm hover:bg-blue-50/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                                item.rank === 1
                                  ? "bg-amber-100 text-amber-800 border border-amber-300"
                                  : item.rank === 2
                                  ? "bg-slate-200 text-slate-800"
                                  : item.rank === 3
                                  ? "bg-amber-700/20 text-amber-900"
                                  : "bg-[#EFF6FF] text-[#2A6AED]"
                              }`}
                            >
                              {item.rank}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">
                                {item.studentName}
                              </p>
                              <p className="text-[11px] text-slate-500 truncate">
                                {item.testTitle}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold text-[#2A6AED] text-xs sm:text-sm">
                              {item.score} / {item.maxMarks}
                            </p>
                            <p className="text-[11px] font-medium text-emerald-600">
                              {item.percentage}% Score
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-500 text-xs sm:text-sm">
                        No published rankings yet. Be the first candidate to submit!
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 6. FAQS SECTION */}
        <section id="faqs" className="py-12 min-[375px]:py-14 sm:py-20 lg:py-24 bg-slate-50/70 border-t border-slate-200/80">
          <div className="mx-auto max-w-3xl px-3.5 min-[375px]:px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 min-[375px]:mb-10 sm:mb-14 space-y-2.5">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 text-[11px] px-3 py-1 font-semibold rounded-full">
                Got Questions?
              </Badge>
              <h2 className="text-xl min-[375px]:text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600 text-xs min-[375px]:text-sm sm:text-base max-w-xl mx-auto">
                Everything you need to know about testing, handwritten submissions, and evaluation rules.
              </p>
            </div>

            <Accordion defaultValue={["faq-0"]} className="space-y-2.5 min-[375px]:space-y-3 sm:space-y-3.5">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`}>
                  <AccordionTrigger>
                    <span className="flex items-start gap-2.5 sm:gap-3 text-left">
                      <HelpCircle className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-[#2A6AED] shrink-0 mt-0.5" />
                      <span>{faq.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pl-6.5 sm:pl-7.5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* 7. CONTAINED SAAS CTA BANNER */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white border-t border-slate-200/60">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#1E55C7] via-[#2A6AED] to-[#1D4ED8] px-5 py-10 sm:px-12 sm:py-14 lg:py-16 text-center text-white shadow-edtech">
              <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
              <div className="relative mx-auto max-w-2xl space-y-4">
                <h2 className="text-xl min-[375px]:text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight">
                  Begin Your Examination Preparation Today
                </h2>
                <p className="text-blue-100 text-xs min-[375px]:text-sm sm:text-base leading-relaxed">
                  Download your first answer-sheet template, write with precision, and track your rank with Verityra.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button className="h-11 px-6 text-xs sm:text-sm bg-[#FFFFFF] dark:!bg-[#FFFFFF] text-[#1E55C7] dark:!text-[#1E55C7] hover:bg-blue-50 font-semibold shadow-md rounded-xl w-full sm:w-auto">
                      Create Candidate Account
                    </Button>
                  </Link>
                  <Link href="/tests" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="h-11 px-6 text-xs sm:text-sm border border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold rounded-xl w-full sm:w-auto"
                    >
                      Browse Tests
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
