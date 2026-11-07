import type { ComponentType, SVGProps } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  Landmark,
  Lightbulb,
  Lock,
  PenLine,
  Repeat2,
  Scale,
  Trophy,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const highlights = [
  { icon: Repeat2, value: "3", label: "attempts per registration" },
  { icon: PenLine, value: "1", label: "clear practice loop" },
  { icon: Lock, value: "100%", label: "candidate-owned progress" },
]

const exams = [
  { icon: Landmark, label: "UPSC" },
  { icon: BookOpenCheck, label: "State PCS" },
  { icon: Scale, label: "Judicial services" },
]

type IconType = ComponentType<SVGProps<SVGSVGElement>>

function FloatTile({
  icon: Icon,
  className,
  tone = "blue",
}: {
  icon: IconType
  className: string
  tone?: "blue" | "amber" | "emerald"
}) {
  const tones = {
    blue: "bg-white text-[#2A6AED] border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
  }
  return (
    <span
      aria-hidden="true"
      className={`absolute z-20 hidden h-12 w-12 items-center justify-center rounded-2xl border shadow-lg shadow-blue-900/10 sm:flex ${tones[tone]} ${className}`}
    >
      <Icon className="h-6 w-6" />
    </span>
  )
}

/**
 * lg+: exactly the visible viewport height (100dvh − navbar). Sizes derive
 * from viewport width/height so nothing is cut off from 1366×768 upward.
 */
export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-blue-100 bg-[#F4F8FF] py-10 sm:py-14 lg:flex lg:h-[calc(100dvh-76px)] lg:min-h-[560px] lg:flex-col lg:justify-center lg:py-0 lg:pb-14">
      {/* ---------- Decorative edtech shapes ---------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* soft colour fields */}
        <div className="absolute top-[-14%] right-[-8%] h-[70%] w-[55%] rounded-full bg-blue-200/50 blur-3xl" />
        <div className="absolute bottom-[-20%] left-[-10%] h-[60%] w-[50%] rounded-full bg-sky-200/40 blur-3xl" />

        {/* graph-paper panel behind the image */}
        <div className="absolute top-[8%] right-[2%] hidden h-[78%] w-[40%] rounded-[2.5rem] bg-[linear-gradient(rgba(42,106,237,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(42,106,237,0.13)_1px,transparent_1px)] [background-size:26px_26px] lg:block" />

        {/* ruled exam paper strip, bottom-left */}
        <div className="absolute bottom-0 left-0 hidden h-[34%] w-[34%] bg-[linear-gradient(rgba(42,106,237,0.14)_1px,transparent_1px)] [mask-image:linear-gradient(to_top_right,black_20%,transparent_75%)] [background-size:100%_28px] lg:block" />
        {/* red margin line like an answer booklet */}
        <div className="absolute top-0 bottom-0 left-[6%] hidden w-px bg-rose-300/40 lg:block" />

        {/* rings + geometric marks */}
        <div className="absolute top-12 left-[44%] hidden h-28 w-28 rounded-full border-[14px] border-white/80 lg:block" />
        <div className="absolute bottom-24 left-[47%] hidden h-14 w-14 rotate-12 rounded-xl border-2 border-blue-300/70 lg:block" />
        <div className="absolute top-[22%] left-[3%] hidden h-5 w-5 rotate-45 rounded-[4px] bg-[#2A6AED]/25 lg:block" />

        {/* plus signs */}
        <svg
          className="absolute top-[14%] left-[40%] hidden h-6 w-6 text-[#2A6AED]/50 lg:block"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 4v16M4 12h16" />
        </svg>
        <svg
          className="absolute right-[4%] bottom-[12%] hidden h-5 w-5 text-[#2A6AED]/50 lg:block"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        >
          <path d="M12 4v16M4 12h16" />
        </svg>

        {/* large pencil, bottom-right corner */}
        <svg
          className="absolute -right-6 -bottom-2 hidden h-16 w-80 rotate-[-18deg] opacity-70 xl:block"
          viewBox="0 0 320 64"
          fill="none"
        >
          <rect x="40" y="12" width="230" height="40" rx="4" fill="#BFD6FF" />
          <rect x="40" y="12" width="230" height="10" fill="#9DBFFF" />
          <rect x="270" y="12" width="24" height="40" fill="#F9C9D0" />
          <path d="M40 12 4 32l36 20z" fill="#FDE6C3" />
          <path d="M4 32 14 27v10z" fill="#2A6AED" />
        </svg>
      </div>

      {/* ---------- Content ---------- */}
      <div className="relative mx-auto grid w-full max-w-7xl items-center gap-8 px-5 sm:gap-10 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:gap-12 lg:px-10">
        {/* Copy */}
        <div className="relative z-10">
          <h1 className="font-heading text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.02] font-extrabold tracking-[-0.05em] text-slate-950 lg:text-[clamp(2.25rem,min(3.4vw,7vh),3.5rem)]">
            Practice like it’s exam day.
            <span className="relative block w-fit text-[#2A6AED]">
              Improve with every answer.
              <svg
                aria-hidden="true"
                className="absolute -bottom-2 left-0 h-3 w-full text-[#2A6AED]/35"
                viewBox="0 0 200 12"
                preserveAspectRatio="none"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              >
                <path d="M3 8c30-8 60 4 95-2s64-4 99 0" />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-slate-600 lg:mt-[clamp(1rem,2.8vh,1.75rem)] lg:text-[clamp(1rem,1.05vw+0.2vh,1.1875rem)]">
            Write full-length answers on paper, upload them, and get
            question-wise rubric feedback that shows exactly what to fix, so
            every attempt moves you closer to your UPSC, State PCS, or Judicial
            services goal.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-[clamp(1rem,3.2vh,2rem)]">
            <Link href="/tests">
              <Button className="h-12 w-full rounded-xl bg-[#2A6AED] px-6 text-base font-bold text-white shadow-lg shadow-blue-600/25 hover:bg-[#1E55C7] sm:w-auto">
                Explore test series
                <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="#how-it-works">
              <Button
                variant="outline"
                className="h-12 w-full rounded-xl border-blue-300 bg-white/80 px-6 text-base font-bold text-slate-800 hover:border-[#2A6AED] hover:bg-blue-50 hover:text-[#1E55C7] sm:w-auto"
              >
                <BookOpen
                  aria-hidden="true"
                  className="mr-2 h-5 w-5 text-[#2A6AED]"
                />
                See how it works
              </Button>
            </Link>
          </div>

          <ul className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3 lg:mt-[clamp(1.25rem,4vh,2.5rem)]">
            {highlights.map(({ icon: Icon, value, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/90 px-3.5 py-3 shadow-sm shadow-blue-900/5 backdrop-blur"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2A6AED]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-xl leading-none font-extrabold text-slate-950">
                    {value}
                  </p>
                  <p className="mt-1 text-[11px] leading-[1.25] font-semibold text-slate-600">
                    {label}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Image — source 1300 × 1040 px (5:4). Height tied to viewport. */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <FloatTile icon={GraduationCap} className="-top-5 left-8" />
          <FloatTile
            icon={Lightbulb}
            tone="amber"
            className="top-[42%] -left-6"
          />
          <FloatTile
            icon={Trophy}
            tone="emerald"
            className="-right-5 bottom-[26%]"
          />

          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[2rem] border-4 border-white bg-blue-100 shadow-2xl shadow-blue-900/15 lg:aspect-auto lg:h-[min(72dvh,40rem)]">
            <Image
              src="/images/hero-img1.png"
              alt="Students preparing for school and competitive examinations"
              width={1300}
              height={1040}
              priority
              sizes="(max-width: 1024px) 90vw, 42vw"
              className="h-full w-full object-cover object-[68%_center]"
            />
          </div>

          <div className="absolute top-5 left-4 z-20 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/95 p-2.5 pr-4 shadow-xl shadow-blue-900/10 backdrop-blur-xl sm:right-4 sm:left-auto">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#2A6AED]">
              <PenLine aria-hidden="true" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Write like the real exam
              </p>
              <p className="text-[10px] text-slate-600">
                Build useful repetition
              </p>
            </div>
          </div>

          <div className="absolute bottom-5 left-4 z-20 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/95 p-2.5 pr-4 shadow-xl shadow-blue-900/10 backdrop-blur-xl">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[10px] font-semibold text-slate-500">
                Your next milestone
              </p>
              <p className="text-xs font-bold text-slate-900">
                Keep improving.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- Exam strip pinned to the bottom (lg+) ---------- */}
      <div className="absolute inset-x-0 bottom-0 hidden border-t border-blue-100 bg-white/70 backdrop-blur lg:block">
        <div className="mx-auto flex h-12 w-full max-w-7xl items-center gap-6 px-5 sm:px-8 lg:px-10">
          <span className="text-xs font-semibold text-slate-600">
            Practice paths for
          </span>
          <ul className="flex items-center gap-3">
            {exams.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-bold text-[#1E55C7]"
              >
                <Icon aria-hidden="true" className="h-3.5 w-3.5" />
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
