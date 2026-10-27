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
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  FileCheck2,
  ScanLine,
  Sliders,
  Scale,
  Compass,
  Star,
  Users,
  ChevronRight,
} from "lucide-react"
import { getLeaderboardAction } from "@/actions/leaderboard-actions"
import { KpiMetricStrip, KpiMetric } from "@/components/shared/kpi-metric-strip"
import { InteractiveRubricShowcase } from "@/components/interactive-rubric-showcase"
import { HeroCockpitPreview } from "@/components/hero-cockpit-preview"

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
      tier: "Diagnostic Free Pass",
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
      tier: "Pro Series",
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
      tier: "Specialized Practice",
    },
  ]

  const testimonials = [
    {
      name: "Ananya Sharma",
      exam: "UPSC Civil Services Mains (AIR 84 Ranker)",
      quote:
        "The 3-attempt model was a revelation. In my first attempt on GS Paper II, I lost marks on constitutional precedents. The itemized rubric pinpointed exactly where my conclusions fell short, helping me boost my score by +28 marks.",
      badge: "Verified Candidate • Attempt 3 Finalist",
      gain: "+28 Marks Gain",
    },
    {
      name: "Vikramaditya Rao",
      exam: "State PCS Administrative Officer",
      quote:
        "Most online test series only give vague handwritten scribbles weeks later. Verityra gave me detailed rubric scores for every single question in under 15 minutes, with clear margin compliance verification.",
      badge: "State Rank 4 • Verified Submission",
      gain: "+34 Marks Gain",
    },
    {
      name: "Neha Kulkarni",
      exam: "Judicial Services Exam Aspirant",
      quote:
        "Formatting legal answers within official A4 margins requires physical handwriting muscle memory. Verityra's printable booklets and optical boundary radar keep you completely aligned with the commission format.",
      badge: "Judicial Aspirant • 3x Attempt User",
      gain: "+22 Marks Gain",
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
    <div className="flex min-h-screen flex-col bg-slate-50/50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 overflow-x-hidden selection:bg-[#DBEAFE] selection:text-[#1E55C7] dark:selection:bg-[#1E3A8A] dark:selection:text-[#DBEAFE]">
      <Navbar />

      <main className="flex-1">
        {/* =========================================================================
            1. MODERN SAAS FLOATING AURORA COMMAND HERO
            ========================================================================= */}
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
          {/* Ambient Aurora Glow & Dot Matrix Canvas */}
          <div className="absolute inset-0 aurora-glow-blue pointer-events-none" />
          <div className="absolute inset-0 grid-dot-pattern [mask-image:radial-gradient(ellipse_75%_55%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Centered Hero Header */}
            <div className="text-center max-w-4xl mx-auto space-y-6">
              
              {/* Product Eyebrow Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200/80 dark:border-blue-500/30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-200 shadow-sm animate-fade-up">
                <span className="flex h-2 w-2 rounded-full bg-[#2A6AED] animate-pulse" />
                <span className="font-semibold text-[#2A6AED] dark:text-blue-400">Verityra 2.0</span>
                <span className="text-slate-400">•</span>
                <span>The Intelligent Evaluation Cloud for Subjective Exams</span>
              </div>

              {/* Bold Headline */}
              <h1 className="text-3xl min-[375px]:text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] font-heading animate-fade-up delay-100">
                Master Mains Answer Writing with{" "}
                <span className="bg-gradient-to-r from-[#2A6AED] via-[#1E55C7] to-[#3B82F6] dark:from-[#60A5FA] dark:via-[#3B82F6] dark:to-[#93C5FD] bg-clip-text text-transparent">
                  Pen, Paper & AI Precision.
                </span>
              </h1>

              {/* Subtitle Value Proposition */}
              <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto font-sans animate-fade-up delay-150">
                Download standardized A4 margin booklets, write handwritten answers under timed exam conditions, and receive itemized question-by-question scoring against official civil service rubrics within minutes.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2 animate-fade-up delay-200">
                <Link href="/tests" className="w-full sm:w-auto">
                  <Button className="group h-12 px-7 text-sm font-semibold bg-[#2A6AED] hover:bg-[#1E55C7] dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all active:scale-[0.98] rounded-xl w-full sm:w-auto cursor-pointer">
                    Start Free Diagnostic Mock
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <a href="#bento-matrix" className="w-full sm:w-auto">
                  <Button
                    variant="outline"
                    className="h-12 px-6 text-sm font-semibold border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md text-slate-800 hover:text-[#1E55C7] dark:text-slate-200 dark:hover:text-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 rounded-xl w-full sm:w-auto shadow-xs transition-all cursor-pointer"
                  >
                    <Sparkles className="mr-2 h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                    Explore 3-Attempt Engine
                  </Button>
                </a>
              </div>

              {/* Scannable Micro-Trust Indicators */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  Official 25mm UPSC Margins
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  15-Minute Rubric Turnaround
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  3 Guaranteed Diagnostic Attempts
                </span>
              </div>
            </div>

            {/* Interactive Mains Cockpit Showcase */}
            <div className="mt-12 sm:mt-16 animate-fade-up delay-300">
              <HeroCockpitPreview />
            </div>
          </div>
        </section>

        {/* =========================================================================
            2. FLAT KPI CREDIBILITY STRIP
            ========================================================================= */}
        <section className="bg-white dark:bg-slate-950 border-y border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl">
            <KpiMetricStrip columns={4}>
              <KpiMetric
                label="Answer Sheets Evaluated"
                value="10,000+"
                subtext="Verified handwritten submissions"
                icon={CheckCircle2}
                variant="blue"
              />
              <KpiMetric
                label="Average Turnaround"
                value="< 15 Mins"
                subtext="Question-by-question scoring"
                icon={Zap}
                variant="indigo"
              />
              <KpiMetric
                label="Margin Compliance"
                value="100%"
                subtext="Official A4 UPSC/PCS bounds"
                icon={ShieldCheck}
                variant="emerald"
              />
              <KpiMetric
                label="3-Attempt Guarantee"
                value="3x Multi-Pass"
                subtext="Baseline to top-percentile"
                icon={RotateCcw}
                variant="amber"
              />
            </KpiMetricStrip>
          </div>
        </section>

        {/* =========================================================================
            3. THE BENTO MATRIX: THE SUBJECTIVE EVALUATION OS
            ========================================================================= */}
        <section id="bento-matrix" className="py-16 sm:py-24 lg:py-32 bg-slate-50/60 dark:bg-[#030712] border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-[11px] px-3.5 py-1 font-semibold rounded-full">
                The Evaluation OS
              </Badge>
              <h2 className="text-2xl min-[375px]:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-heading">
                Engineered for Authentic Exam Mastery
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed font-sans">
                Every tool, rubric rule, and margin check built to simulate real commission standards and eliminate guesswork from subjective test preparation.
              </p>
            </div>

            {/* 12-Column Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
              
              {/* Tile 1 (Span 7): The 3-Attempt Progression Engine */}
              <div className="md:col-span-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group glass-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2A6AED] dark:text-blue-400">
                      <RotateCcw className="h-5 w-5" />
                    </div>
                    <Badge className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                      +25% Average Surge
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading">
                      Atomic 3-Attempt Iterative Progression
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-sans">
                      Single-submission tests fail candidates. Verityra gives you 3 calibrated attempts per registered test: diagnose raw flaws in Attempt 1, rectify deficiencies using model answers in Attempt 2, and lock in your top benchmark in Attempt 3.
                    </p>
                  </div>

                  {/* 3 Steps Mini-Bar */}
                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 text-center">
                      <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">Pass 1</span>
                      <span className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono">42%</span>
                      <span className="text-[10px] text-slate-500 block">Diagnostic</span>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-center">
                      <span className="text-[10px] font-bold uppercase text-[#2A6AED] dark:text-blue-400 font-mono block">Pass 2</span>
                      <span className="text-sm sm:text-base font-extrabold text-[#2A6AED] dark:text-blue-400 font-mono">68%</span>
                      <span className="text-[10px] text-blue-600 dark:text-blue-300 font-semibold block">+26 Marks</span>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-center">
                      <span className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 font-mono block">Pass 3</span>
                      <span className="text-sm sm:text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">87%</span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold block">Top Rank</span>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Enrolled candidates never re-purchase to improve scores</span>
                  <span className="font-semibold text-[#2A6AED] dark:text-blue-400 inline-flex items-center gap-1">
                    Guaranteed Access <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>

              {/* Tile 2 (Span 5): Physical A4 Margin Radar */}
              <div className="md:col-span-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group glass-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <ScanLine className="h-5 w-5" />
                    </div>
                    <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono">
                      25mm / 20mm Spec
                    </Badge>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-heading">
                      Physical A4 Margin Radar
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-sans">
                      Official UPSC and PCS answer sheets enforce strict left and right margin boundaries. Our optical engine flags spillover before negative marking hits your score.
                    </p>
                  </div>

                  {/* Optical Visual Meter */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Left Bound (25mm):</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Cleared</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-full" />
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>Right Bound (20mm):</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Compliant</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-full" />
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  Prevents automatic commission pen-bleed deductions
                </div>
              </div>

              {/* Tile 3 (Span 4): Zero-Loss Upload Vault */}
              <div className="md:col-span-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all glass-card">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                    Atomic Upload Vault
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    256-bit encrypted submission pipeline with chunked retry. Network disruptions or accidental disconnects never burn your attempt allowance.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                  Transaction-Safe Guarantee
                </div>
              </div>

              {/* Tile 4 (Span 4): Itemized Rubric Intelligence */}
              <div className="md:col-span-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all glass-card">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
                    <Target className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                    Itemized Rubric Metrics
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Evaluates introductions, empirical citations, constitutional case laws, diagrams, and balanced conclusions with discrete mark allotments.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  UPSC GS Paper I–IV Aligned
                </div>
              </div>

              {/* Tile 5 (Span 4): 15-Minute Turnaround */}
              <div className="md:col-span-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all glass-card">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
                    <Zap className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                    Instant Turnaround
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Stop waiting 3 to 4 weeks for traditional coaching institute evaluation batches. Review actionable scores while test content is fresh in your memory.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                  &lt; 15 Mins Average Delivery
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            4. INTERACTIVE LIVE RUBRIC ENGINE EXPERIENCE
            ========================================================================= */}
        <section className="py-16 sm:py-24 lg:py-32 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-[11px] px-3.5 py-1 font-semibold rounded-full">
                Interactive Simulator
              </Badge>
              <h2 className="text-2xl min-[375px]:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-heading">
                Step Inside the Evaluation Engine
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed font-sans">
                Toggle through Attempt 1, 2, and 3 to see how Verityra catches missed precedents, verifies margin discipline, and benchmarks candidates.
              </p>
            </div>

            <InteractiveRubricShowcase />
          </div>
        </section>

        {/* =========================================================================
            5. THE 4-STAGE CANDIDATE WORKFLOW
            ========================================================================= */}
        <section id="how-it-works" className="py-16 sm:py-24 lg:py-32 bg-slate-50/60 dark:bg-[#030712] border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-[11px] px-3.5 py-1 font-semibold rounded-full">
                Exam Workflow
              </Badge>
              <h2 className="text-2xl min-[375px]:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-heading">
                From Pen & Paper to Nationwide Rank in 4 Steps
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed font-sans">
                Engineered to train authentic examination stamina without taking your hands away from real pen and paper.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              
              {/* Step 1 */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group glass-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2A6AED] dark:text-blue-400 group-hover:bg-[#2A6AED] group-hover:text-white transition-colors">
                      <FileDown className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-mono">01</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                    Download A4 Booklet
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Print the exact margin-aligned answer booklet template configured specifically for your targeted commission format.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-[#2A6AED] dark:text-blue-400">
                  Printable 25mm Guidelines
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group glass-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2A6AED] dark:text-blue-400 group-hover:bg-[#2A6AED] group-hover:text-white transition-colors">
                      <PenTool className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-mono">02</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                    Write Under Timer
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Execute answers offline with physical pen and paper under the standard 3-hour exam countdown clock.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-[#2A6AED] dark:text-blue-400">
                  Authentic Exam Endurance
                </div>
              </div>

              {/* Step 3 */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group glass-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2A6AED] dark:text-blue-400 group-hover:bg-[#2A6AED] group-hover:text-white transition-colors">
                      <UploadCloud className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-mono">03</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                    Phone Camera Scan
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Capture your pages using Adobe Scan or any mobile document scanner and upload the compiled PDF securely.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-[#2A6AED] dark:text-blue-400">
                  Atomic Upload Safety
                </div>
              </div>

              {/* Step 4 */}
              <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group glass-card">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-[#2A6AED] dark:text-blue-400 group-hover:bg-[#2A6AED] group-hover:text-white transition-colors">
                      <Award className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-700 font-mono">04</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white font-heading">
                    Rubrics & Benchmark
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    Review question-by-question scoring, model answer comparisons, and your live national leaderboard percentile.
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 text-xs font-semibold text-[#2A6AED] dark:text-blue-400">
                  Published Percentile Rank
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            6. FEATURED TEST SERIES CATALOG (SAAS PRICING / TIERS)
            ========================================================================= */}
        <section className="py-16 sm:py-24 lg:py-32 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 sm:mb-16 gap-4">
              <div className="space-y-2">
                <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-[11px] px-3.5 py-1 font-semibold rounded-full">
                  Test Catalog
                </Badge>
                <h2 className="text-2xl min-[375px]:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                  Curated Subjective Examination Modules
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base font-sans">
                  Crafted by experienced subjective exam educators in accordance with official commission guidelines.
                </p>
              </div>
              <Link href="/tests" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-11 px-5 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-[#2A6AED] hover:bg-blue-50/50 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer"
                >
                  View Full Catalog
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTests.map((test) => (
                <div
                  key={test.id}
                  className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group glass-card"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="outline" className="text-xs font-semibold border-blue-200 text-[#2A6AED] bg-[#EFF6FF] dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 px-2.5 py-0.5">
                        {test.category}
                      </Badge>
                      {test.isFree ? (
                        <Badge className="bg-emerald-600 text-white font-semibold text-xs border-0 px-2.5 py-0.5">
                          Free Diagnostic
                        </Badge>
                      ) : (
                        <div className="text-right">
                          <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                            ₹{test.price}
                          </span>
                        </div>
                      )}
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug font-heading">
                      {test.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-sans">
                      {test.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800/80 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400 shrink-0" />
                        {test.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400 shrink-0" />
                        {test.marks} Marks
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-[#2A6AED] dark:text-blue-400">
                        3 Attempts
                      </span>
                    </div>

                    <Link href="/tests" className="block w-full">
                      <Button className="w-full bg-[#2A6AED] hover:bg-[#1E55C7] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm h-11 rounded-xl shadow-xs transition-all cursor-pointer">
                        View Details & Enroll
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            7. LIVE LEADERBOARD PREVIEW
            ========================================================================= */}
        <section className="py-16 sm:py-24 lg:py-32 bg-slate-50/60 dark:bg-[#030712] border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              <div className="lg:col-span-5 space-y-4 text-center sm:text-left">
                <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-[11px] px-3.5 py-1 font-semibold rounded-full">
                  Transparent Rankings
                </Badge>
                <h2 className="text-2xl min-[375px]:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-heading">
                  Benchmark Against Top Aspirants Nationwide
                </h2>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed font-sans">
                  Rankings are computed strictly from verified handwritten copies. See where you stand across evaluated batches and track your percentile surge.
                </p>
                <div className="pt-2">
                  <Link href="/leaderboard" className="block sm:inline-block">
                    <Button className="w-full sm:w-auto h-11 px-6 bg-[#2A6AED] hover:bg-[#1E55C7] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold rounded-xl shadow-md shadow-blue-500/20 text-xs sm:text-sm cursor-pointer">
                      Explore Full Leaderboard
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden glass-card">
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider font-heading">
                        Recent Published Rankings
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Verified Handwritten Copies
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs font-semibold text-[#2A6AED] dark:text-blue-400 border-blue-200 dark:border-blue-800 bg-[#EFF6FF] dark:bg-blue-950/60 inline-flex items-center gap-1.5 px-2.5 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Feed
                    </Badge>
                  </div>
                  
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {leaderboardPreview.length > 0 ? (
                      leaderboardPreview.slice(0, 4).map((item) => (
                        <div
                          key={item.rank}
                          className="flex items-center justify-between gap-3 px-5 py-4 text-xs sm:text-sm hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs font-mono ${
                                item.rank === 1
                                  ? "bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60"
                                  : item.rank === 2
                                  ? "bg-slate-200 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                                  : item.rank === 3
                                  ? "bg-amber-700/20 text-amber-900 dark:bg-amber-950/40 dark:text-amber-400"
                                  : "bg-[#EFF6FF] text-[#2A6AED] dark:bg-blue-950/60 dark:text-blue-400"
                              }`}
                            >
                              #{item.rank}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-slate-900 dark:text-white text-xs sm:text-sm truncate font-heading">
                                {item.studentName}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {item.testTitle}
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 font-mono">
                            <p className="font-bold text-[#2A6AED] dark:text-blue-400 text-xs sm:text-sm">
                              {item.score} / {item.maxMarks}
                            </p>
                            <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                              {item.percentage}% Score
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                        No published rankings yet. Be the first candidate to submit!
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* =========================================================================
            8. SOCIAL PROOF & ASPIRANT HALL OF FAME
            ========================================================================= */}
        <section className="py-16 sm:py-24 lg:py-32 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-[11px] px-3.5 py-1 font-semibold rounded-full">
                Candidate Success
              </Badge>
              <h2 className="text-2xl min-[375px]:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight font-heading">
                Proven Results from Real Aspirants
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base leading-relaxed font-sans">
                Read how candidates used Verityra&apos;s iterative rubric feedback to systematically elevate their mains scores.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t, idx) => (
                <div
                  key={idx}
                  className="rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 p-6 sm:p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all glass-card"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[11px] font-bold border-0">
                        {t.gain}
                      </Badge>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed font-sans">
                      &ldquo;{t.quote}&rdquo;
                    </p>
                  </div>

                  <div className="pt-5 mt-6 border-t border-slate-200/70 dark:border-slate-800/80">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white font-heading">
                      {t.name}
                    </h4>
                    <p className="text-xs text-[#2A6AED] dark:text-blue-400 font-medium">
                      {t.exam}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {t.badge}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================================================
            9. FREQUENTLY ASKED QUESTIONS (ACCORDION)
            ========================================================================= */}
        <section id="faqs" className="py-16 sm:py-24 lg:py-32 bg-slate-50/60 dark:bg-[#030712] border-b border-slate-200/80 dark:border-slate-800">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-16 space-y-3">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800 text-[11px] px-3.5 py-1 font-semibold rounded-full">
                Got Questions?
              </Badge>
              <h2 className="text-2xl min-[375px]:text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight font-heading">
                Frequently Asked Questions
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-base max-w-xl mx-auto font-sans">
                Everything you need to know about testing, handwritten submissions, and evaluation rules.
              </p>
            </div>

            <Accordion defaultValue={["faq-0"]} className="space-y-3">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`faq-${index}`}
                  className="border border-slate-200/90 dark:border-slate-800 rounded-2xl px-5 py-1.5 bg-white dark:bg-slate-900/80 shadow-xs"
                >
                  <AccordionTrigger className="hover:no-underline cursor-pointer">
                    <span className="flex items-start gap-3 text-left font-semibold text-slate-900 dark:text-white text-xs sm:text-sm font-heading">
                      <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5 text-[#2A6AED] dark:text-blue-400 shrink-0 mt-0.5" />
                      <span>{faq.q}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pl-7 sm:pl-8 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* =========================================================================
            10. HIGH-IMPACT AURORA CTA BANNER
            ========================================================================= */}
        <section className="py-16 sm:py-24 bg-white dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E55C7] via-[#2A6AED] to-[#1D4ED8] dark:from-[#1E3A8A] dark:via-[#1D4ED8] dark:to-[#2563EB] px-6 py-12 sm:px-14 sm:py-16 lg:py-20 text-center text-white shadow-2xl">
              <div className="absolute inset-0 bg-dot-pattern opacity-10 pointer-events-none" />
              <div className="relative mx-auto max-w-2xl space-y-5">
                <Badge className="bg-white/20 text-white border-0 text-xs px-3 py-1 font-semibold inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Free Diagnostic Evaluation Available
                </Badge>
                <h2 className="text-2xl min-[375px]:text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-heading">
                  Experience Authentic Exam Simulation Today
                </h2>
                <p className="text-blue-100 text-xs sm:text-base leading-relaxed font-sans max-w-xl mx-auto">
                  Download your first answer-sheet template, write with precision, and benchmark your rank nationwide with Verityra.
                </p>
                <div className="pt-3 flex flex-col sm:flex-row justify-center gap-3.5">
                  <Link href="/signup" className="w-full sm:w-auto">
                    <Button className="h-12 px-7 text-xs sm:text-sm bg-white dark:bg-white text-[#1E55C7] dark:text-[#1E55C7] hover:bg-blue-50 font-bold shadow-lg rounded-xl w-full sm:w-auto cursor-pointer">
                      Create Candidate Account
                    </Button>
                  </Link>
                  <Link href="/tests" className="w-full sm:w-auto">
                    <Button
                      variant="outline"
                      className="h-12 px-7 text-xs sm:text-sm border border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white font-semibold rounded-xl w-full sm:w-auto cursor-pointer"
                    >
                      Browse All Test Series
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
