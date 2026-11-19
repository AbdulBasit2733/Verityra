import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Clock3,
  ShieldCheck,
  TrendingUp,
  Trophy,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { BRAND_CONFIG } from "@/lib/brand"

const benefits = [
  {
    icon: ShieldCheck,
    title: "A private student workspace",
    copy: "Your enrolled test series, question paper downloads, and progress stay inside your student account.",
  },
  {
    icon: Trophy,
    title: "Visible progression",
    copy: "See the strengths to keep, the conceptual gaps to close, and your next practice step across boards and entrance exams.",
  },
  {
    icon: Clock3,
    title: "A deliberate rhythm",
    copy: "Combine free & paid question papers with timed tests and a 3-attempt policy to build exam consistency.",
  },
]

export function ProgressSection() {
  return (
    <section className="border-b border-blue-100 bg-white py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="ui-ink-surface relative overflow-hidden rounded-md p-6 sm:p-10 lg:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border-[28px] border-white/[0.04]"
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <h2 className="max-w-md font-heading text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                A calmer way to master school &amp; entrance exams.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                Your preparation with {BRAND_CONFIG.instituteName} should leave
                you with a clear next step — keep free &amp; paid test series,
                question papers, feedback, and progress in one place.
              </p>

              <ul className="mt-8 space-y-5">
                {benefits.map(({ icon: Icon, title, copy }) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-white/10 text-[#7FB0FF] ring-1 ring-white/10">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-bold text-white">
                        {title}
                      </h3>
                      <p className="mt-0.5 max-w-sm text-sm leading-6 text-slate-300">
                        {copy}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <Link href="/signup" className="mt-9 inline-flex">
                <Button className="h-12 rounded-md bg-[#2A6AED] px-6 font-bold text-white shadow-sm hover:bg-[#1E55C7]">
                  Start your practice loop
                  <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* IMAGE — recommended 1200 × 900 px (4:3), PNG/WebP, < 250 KB
                Suggested content: feedback / progress dashboard screenshot */}
            <figure className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-white/15 bg-[#162032] shadow-sm">
                <Image
                  src="/images/section-4.png"
                  alt="Question-wise feedback and progress dashboard preview"
                  width={1200}
                  height={900}
                  sizes="(max-width: 1024px) 90vw, 50vw"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs">
                <span className="inline-flex items-center gap-2 font-semibold text-slate-300">
                  <TrendingUp aria-hidden="true" className="h-4 w-4 text-emerald-400" />
                  Attempt 2 vs attempt 1
                </span>
                <span className="font-bold text-white">
                  Structure score improving
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
