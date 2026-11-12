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

const benefits = [
  {
    icon: ShieldCheck,
    title: "A private workspace",
    copy: "Your submissions, progress, and records stay inside your candidate account.",
  },
  {
    icon: Trophy,
    title: "Visible progression",
    copy: "See the strengths to keep, the gaps to close, and the next practice step.",
  },
  {
    icon: Clock3,
    title: "A deliberate rhythm",
    copy: "Use timed practice and a clear attempt policy to build consistency.",
  },
]

export function ProgressSection() {
  return (
    <section className="border-b border-blue-100 bg-white py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="ui-ink-surface relative overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-14">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full border-[28px] border-white/[0.04]"
          />

          <div className="relative grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <h2 className="max-w-md font-heading text-3xl font-extrabold tracking-[-0.03em] text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                A calmer way to get better at the answer sheet.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                Your preparation should leave you with a next step, not another
                vague score. Keep practice, feedback, and progress in one place.
              </p>

              <ul className="mt-8 space-y-5">
                {benefits.map(({ icon: Icon, title, copy }) => (
                  <li key={title} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#7FB0FF] ring-1 ring-white/10">
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
                <Button className="h-12 rounded-xl bg-[#2A6AED] px-6 font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-[#1E55C7]">
                  Start your practice loop
                  <ArrowRight aria-hidden="true" className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* IMAGE — recommended 1200 × 900 px (4:3), PNG/WebP, < 250 KB
                Suggested content: feedback / progress dashboard screenshot */}
            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#162032] shadow-2xl shadow-black/40">
                <Image
                  src="/images/section-4.png"
                  alt="Question-wise feedback and progress dashboard preview"
                  width={1200}
                  height={900}
                  sizes="(max-width: 1024px) 90vw, 50vw"
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white p-3 pr-5 shadow-xl shadow-black/20 sm:left-[-1.5rem]">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <TrendingUp aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-500">
                    Attempt 2 vs attempt 1
                  </p>
                  <p className="text-sm font-bold text-slate-900">
                    Structure score improving
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
