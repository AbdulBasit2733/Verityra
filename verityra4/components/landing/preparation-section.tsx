import Image from "next/image"
import {
  Check,
  Clock3,
  FileText,
  PenLine,
  ScanLine,
  ShieldCheck,
} from "lucide-react"

const steps = [
  {
    icon: FileText,
    title: "Download the booklet",
    copy: "Start with a standardized paper and the margins your exam expects.",
  },
  {
    icon: PenLine,
    title: "Write under pressure",
    copy: "Practice pacing, structure, handwriting, and spatial discipline in one focused session.",
  },
  {
    icon: ScanLine,
    title: "Improve with evidence",
    copy: "Upload your work and use question-wise rubric feedback to choose your next attempt.",
  },
]

const assurances = [
  { icon: Clock3, label: "Timed practice" },
  { icon: ShieldCheck, label: "Private candidate workspace" },
  { icon: Check, label: "Three attempts per registration" },
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
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute -top-4 -left-4 h-full w-full rounded-[2rem] border-2 border-blue-200/70"
            />
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-blue-100 shadow-2xl shadow-blue-900/10">
              <Image
                src="/images/section-2.png"
                alt="A student writing an answer on a ruled exam booklet"
                width={1000}
                height={1250}
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute right-4 -bottom-5 flex items-center gap-3 rounded-2xl border border-blue-100 bg-white/95 p-3 pr-5 shadow-xl shadow-blue-900/10 backdrop-blur-xl sm:right-[-1.5rem]">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-[#2A6AED]">
                <Clock3 aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-semibold text-slate-500">
                  Typical session
                </p>
                <p className="text-sm font-bold text-slate-900">
                  3 hours, pen on paper
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="max-w-xl font-heading text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              A better practice loop for serious written exams.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Move from blank page to exam-ready clarity with a workflow built
              around physical writing, clear rubrics, and deliberate
              improvement.
            </p>

            <ol className="relative mt-10 space-y-8">
              <span
                aria-hidden="true"
                className="absolute top-6 bottom-6 left-6 w-px bg-gradient-to-b from-[#2A6AED] via-blue-200 to-blue-100"
              />
              {steps.map(({ icon: Icon, title, copy }, i) => (
                <li key={title} className="relative flex gap-5">
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-white text-[#2A6AED] shadow-sm">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2A6AED] text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                  </span>
                  <div className="pt-1">
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

            <ul className="mt-10 flex flex-wrap gap-2.5 border-t border-border pt-6">
              {assurances.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold text-slate-700"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 text-[#2A6AED]" />
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
