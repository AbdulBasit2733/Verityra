import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Lock,
  PenLine,
  Repeat2,
} from "lucide-react"

import { Button } from "@/components/ui/button"

const highlights = [
  { icon: Repeat2, value: "3", label: "attempts per registration" },
  { icon: PenLine, value: "1", label: "clear practice loop" },
  { icon: Lock, value: "100%", label: "candidate-owned progress" },
]

/**
 * Desktop (lg+): the section is exactly the visible viewport height
 * (100dvh minus the navbar) and every size inside it is derived from
 * viewport width/height, so nothing is cut off on 1366×768 up to 1920×1080+.
 * Mobile/tablet: normal stacked flow.
 */
export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden border-b border-blue-100 bg-[#F8FAFF] py-8 sm:py-12 lg:flex lg:h-[calc(100dvh-76px)] lg:min-h-[540px] lg:items-center lg:py-6">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-[-12%] -right-32 h-[55%] w-[58%] rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute -bottom-40 left-[-8%] h-72 w-[72%] rounded-[50%] bg-blue-200/50 blur-2xl" />
        <div className="absolute inset-0 grid-dot-pattern opacity-60" />
      </div>

      <div className="mx-auto grid w-full max-w-[1480px] items-center gap-8 px-5 sm:px-8 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:px-12">
        {/* Copy */}
        <div className="relative z-10">
          <h1 className="font-heading text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.02] font-extrabold tracking-[-0.05em] text-slate-950 lg:text-[clamp(2.5rem,min(3.7vw,8.5vh),4.5rem)]">
            Write better answers.
            <span className="block text-[#2A6AED]">See real progress.</span>
          </h1>

          <p className="mt-5 max-w-lg text-pretty text-base leading-7 text-slate-600 lg:mt-[clamp(0.75rem,2.4vh,1.5rem)] lg:text-[clamp(1rem,1.1vw+0.2vh,1.25rem)] lg:leading-[1.65]">
            Practice handwritten test series built for serious exams, with question-wise rubric feedback that shows exactly what to improve next.
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
                className="h-12 w-full rounded-xl border-blue-300 bg-white/70 px-6 text-base font-bold text-slate-800 hover:border-[#2A6AED] hover:bg-blue-50 hover:text-[#1E55C7] sm:w-auto"
              >
                <BookOpen
                  aria-hidden="true"
                  className="mr-2 h-5 w-5 text-[#2A6AED]"
                />
                See how it works
              </Button>
            </Link>
          </div>

          {/* Compact stat strip */}
          <ul className="mt-8 grid max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-3 lg:mt-[clamp(1.5rem,4.5vh,2.75rem)]">
            {highlights.map(({ icon: Icon, value, label }) => (
              <li
                key={label}
                className="flex items-center gap-3 rounded-xl border border-blue-100 bg-white/80 px-3 py-2.5 backdrop-blur"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2A6AED]">
                  <Icon aria-hidden="true" className="h-4 w-4" />
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

        {/* Image — height is tied to the viewport so it never overflows.
            Source: 1300 × 1040 px (5:4). Subject should sit right of centre. */}
        <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
          <div
            aria-hidden="true"
            className="absolute inset-[8%] rounded-full bg-blue-300/30 blur-[80px]"
          />
          <div
            aria-hidden="true"
            className="absolute -top-3 -right-3 hidden h-full w-[94%] rounded-[2rem] border-2 border-blue-200/70 sm:block"
          />
          <div className="relative aspect-[5/4] w-full overflow-hidden rounded-[2rem] border border-white/70 bg-blue-100 shadow-2xl shadow-blue-900/10 lg:aspect-auto lg:h-[calc(100dvh-76px-3rem)] lg:max-h-[46rem]">
            <Image
              src="/images/hero-img1.png"
              alt="Students preparing for school and competitive examinations"
              width={1300}
              height={1040}
              priority
              sizes="(max-width: 1024px) 90vw, 46vw"
              className="h-full w-full object-cover object-[70%_center]"
            />
          </div>

          {/* Chips sit inside the image bounds so they are never clipped */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/95 p-2.5 pr-4 shadow-xl shadow-blue-900/10 backdrop-blur-xl sm:left-auto sm:right-4 sm:top-5">
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

          <div className="absolute bottom-4 left-4 z-20 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/95 p-2.5 pr-4 shadow-xl shadow-blue-900/10 backdrop-blur-xl sm:bottom-5">
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
    </section>
  )
}