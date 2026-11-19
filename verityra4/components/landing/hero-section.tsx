import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Atom,
  Award,
  BookOpen,
  BookOpenCheck,
  CheckCircle2,
  GraduationCap,
  Languages,
  Microscope,
  PenLine,
  Repeat2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { BRAND_CONFIG } from "@/lib/brand"

const highlights = [
  { icon: GraduationCap, value: "Jr. KG–XII", label: "Boards, NEET, JEE & more" },
  { icon: BookOpen, value: "Free & Paid", label: "Test series & papers" },
  { icon: Repeat2, value: "3", label: "attempts per test series" },
]

const exams = [
  { icon: BookOpenCheck, label: "CBSE · ICSE · State Board" },
  { icon: Atom, label: "JEE (Main & Adv)" },
  { icon: Microscope, label: "NEET-UG" },
  { icon: Award, label: "Olympiads & NTSE" },
  { icon: Languages, label: "UGC NET & English Grammar" },
]

/**
 * lg+: exactly the visible viewport height (100dvh − navbar). Sizes derive
 * from viewport width/height so nothing is cut off from 1366×768 upward.
 */
export function HeroSection() {
  return (
    <section className="relative isolate overflow-x-clip border-b border-blue-100 bg-[#F4F8FF] py-10 sm:py-14 lg:flex lg:h-[calc(100dvh-76px)] lg:min-h-[560px] lg:flex-col lg:justify-center lg:py-0 lg:pb-14">
      {/* ---------- Decorative edtech shapes ---------- */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* graph-paper panel behind the image */}
        <div className="absolute top-[8%] right-[2%] hidden h-[78%] w-[40%] rounded-md bg-[linear-gradient(rgba(42,106,237,0.13)_1px,transparent_1px),linear-gradient(90deg,rgba(42,106,237,0.13)_1px,transparent_1px)] [background-size:26px_26px] lg:block" />

        {/* ruled exam paper strip, bottom-left */}
        <div className="absolute bottom-0 left-0 hidden h-[34%] w-[34%] bg-[linear-gradient(rgba(42,106,237,0.14)_1px,transparent_1px)] [mask-image:linear-gradient(to_top_right,black_20%,transparent_75%)] [background-size:100%_28px] lg:block" />
        {/* red margin line like an answer booklet */}
        <div className="absolute top-0 bottom-0 left-[6%] hidden w-px bg-rose-300/40 lg:block" />

        {/* rings + geometric marks */}
        <div className="absolute top-12 left-[44%] hidden h-28 w-28 rounded-full border-[14px] border-white/80 lg:block" />
        <div className="absolute bottom-24 left-[47%] hidden h-14 w-14 rotate-12 rounded-sm border-2 border-blue-300/70 lg:block" />
        <div className="absolute top-[22%] left-[3%] hidden h-5 w-5 rotate-45 rounded-sm bg-[#2A6AED]/25 lg:block" />

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
              Excel in Boards, NEET &amp; JEE.
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
            Online free &amp; paid test series and question papers by{" "}
            {BRAND_CONFIG.instituteName}. From Jr. KG–XII school boards (CBSE,
            ICSE &amp; State Board) to NEET-UG, JEE, Olympiads, NTSE, UGC NET,
            and English Grammar — write on paper, upload, and get question-wise
            feedback.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row lg:mt-[clamp(1rem,3.2vh,2rem)]">
            <Link href="/tests">
              <Button className="h-12 w-full rounded-md bg-[#2A6AED] px-6 text-base font-bold text-white shadow-sm hover:bg-[#1E55C7] sm:w-auto">
                Explore test series
                <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/question-papers">
              <Button
                variant="outline"
                className="h-12 w-full rounded-md border-blue-300 bg-white px-6 text-base font-bold text-slate-800 hover:border-[#2A6AED] hover:bg-blue-50 hover:text-[#1E55C7] sm:w-auto"
              >
                <BookOpen
                  aria-hidden="true"
                  className="mr-2 h-5 w-5 text-[#2A6AED]"
                />
                Question papers
              </Button>
            </Link>
          </div>

          <ul className="mt-8 grid max-w-2xl grid-cols-1 divide-y divide-blue-200/80 border-y border-blue-200/80 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:mt-[clamp(1.25rem,4vh,2.5rem)]">
            {highlights.map(({ icon: Icon, value, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 py-3 sm:px-4 sm:first:pl-0 sm:last:pr-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-blue-100/80 text-[#2A6AED]">
                  <Icon aria-hidden="true" className="h-4.5 w-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-lg leading-none font-extrabold text-slate-950">
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
        <figure className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-md border border-blue-200 bg-blue-100 shadow-sm lg:aspect-auto lg:h-[min(68dvh,38rem)]">
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
          <figcaption className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
              <PenLine aria-hidden="true" className="h-3.5 w-3.5 text-[#2A6AED]" />
              Free &amp; Paid Test Series, Online Exams &amp; Question Papers
            </span>
            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-700">
              <CheckCircle2 aria-hidden="true" className="h-3.5 w-3.5 text-emerald-600" />
              {BRAND_CONFIG.contact.rating}★ Rated Institute, Chhatrapati Sambhajinagar
            </span>
          </figcaption>
        </figure>
      </div>

      {/* ---------- Exam strip pinned to the bottom (lg+) ---------- */}
      <div className="absolute inset-x-0 bottom-0 hidden border-t border-blue-100 bg-white lg:block">
        <div className="mx-auto flex h-12 w-full max-w-7xl items-center gap-4 px-5 sm:px-8 lg:px-10">
          <span className="shrink-0 text-xs font-semibold text-slate-600">
            Streams covered
          </span>
          <ul className="flex flex-wrap items-center gap-2">
            {exams.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="inline-flex items-center gap-2 rounded-sm border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1E55C7]"
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
