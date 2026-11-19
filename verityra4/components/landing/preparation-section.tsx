import Image from "next/image"
import {
  Check,
  Clock3,
  FileText,
  PenLine,
  ScanLine,
  ShieldCheck,
} from "lucide-react"
import { BRAND_CONFIG } from "@/lib/brand"

const steps = [
  {
    icon: FileText,
    title: "Choose a test series or question paper",
    copy: "Browse free and paid online test series or downloadable question papers across school boards, NEET-UG, JEE, Olympiads, and English Grammar.",
  },
  {
    icon: PenLine,
    title: "Write under exam conditions",
    copy: "Practice full answers on real paper with structured margins to build pacing, presentation, and conceptual clarity.",
  },
  {
    icon: ScanLine,
    title: "Review feedback & clear doubts",
    copy: "Upload your sheet for question-wise rubric feedback, track growth across 3 attempts, and resolve gaps with faculty support.",
  },
]

const assurances = [
  { icon: FileText, label: "Free & paid question papers" },
  { icon: Clock3, label: "Free & paid test series" },
  { icon: Check, label: "3 attempts per registration" },
  { icon: ShieldCheck, label: "Doubt-clearing support" },
]

export function PreparationSection() {
  return (
    <section
      id="how-it-works"
      className="border-b border-border bg-white py-16 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          {/* IMAGE — recommended 1000 × 1250 px (4:5), PNG/WebP, < 200 KB */}
          <figure className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -top-3 -left-3 h-full w-full rounded-md border border-blue-200/80"
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-md border border-blue-200 bg-blue-100 shadow-sm">
              <Image
                src="/images/section-2.png"
                alt="A student writing an answer on a ruled exam booklet"
                width={1000}
                height={1250}
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="h-full w-full object-cover"
              />
            </div>
            <figcaption className="mt-3 flex items-center justify-between gap-3 border-t border-slate-200 pt-3">
              <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                <Clock3 aria-hidden="true" className="h-4 w-4 text-[#2A6AED]" />
                Exam-style practice
              </span>
              <span className="text-xs font-bold text-slate-900">
                Timed, pen on paper
              </span>
            </figcaption>
          </figure>

          <div>
            <h2 className="max-w-xl font-heading text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              How {BRAND_CONFIG.name}’s online test series &amp; practice loop
              works.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Built by {BRAND_CONFIG.instituteName} to pair classroom guidance
              with structured written testing: access free or paid question
              papers, write under real exam timing, and improve with every
              attempt.
            </p>

            <ol className="relative mt-10 space-y-8">
              <span
                aria-hidden="true"
                className="absolute top-6 bottom-6 left-5 w-px bg-gradient-to-b from-[#2A6AED] via-blue-200 to-blue-100"
              />
              {steps.map(({ icon: Icon, title, copy }, i) => (
                <li key={title} className="relative flex gap-5">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-blue-200 bg-white text-[#2A6AED]">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                    <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-sm bg-[#2A6AED] text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <div className="pt-0.5">
                    <h3 className="font-heading text-lg font-bold text-slate-950">
                      {title}
                    </h3>
                    <p className="mt-1 max-w-md text-sm leading-6 text-slate-600">
                      {copy}
                    </p>
                  </div>
                </li>
              ))}
            </ol>

            <ul className="mt-10 grid grid-cols-1 gap-x-6 gap-y-2.5 border-t border-border pt-6 sm:grid-cols-2">
              {assurances.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-[#2A6AED]" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
