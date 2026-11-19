import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Atom, Award, BookOpenCheck } from "lucide-react"

/*
  IMAGES (place in /public/images/landing/)
  - section-3-1.jpeg → 960 × 1120 px (large tile, portrait)
  - section-3-2.png  → 480 × 480 px  (square thumbnail)
  - section-3-3.jpeg → 480 × 480 px  (square thumbnail)
*/
const featured = {
  icon: BookOpenCheck,
  label: "School Academics · Jr. KG to Class XII",
  title: "CBSE, ICSE & State Board",
  detail:
    "Strong fundamentals from Jr. KG through Class X & XII boards, including dedicated Foundation Classes (VI–X), mock tests, and downloadable question papers.",
  image: "/images/section-3-1.jpeg",
  alt: "Students studying General Science and Mathematics together with practice papers",
}

const compact = [
  {
    icon: Atom,
    label: "Engineering & Medical Entrance",
    title: "JEE (Main & Adv) & NEET-UG",
    detail:
      "Chapter-wise and full-syllabus free & paid online test series and practice papers engineered for NEET-UG and JEE rank readiness.",
    image: "/images/section-3-2.png",
    alt: "Student solving an Advanced JEE Physics mock booklet with textbooks",
  },
  {
    icon: Award,
    label: "Olympiads, Higher Ed & Language",
    title: "Olympiads, NTSE, UGC NET & English",
    detail:
      "Targeted practice sets for NTSE & school Olympiads, UGC NET preparation, and structured English Grammar & Spoken English modules.",
    image: "/images/section-3-3.jpeg",
    alt: "Student reviewing and highlighting an academic study booklet",
  },
]

const coveredStreams = [
  "Jr. KG – Class V",
  "Foundation (Class VI–X)",
  "CBSE · ICSE · State Board",
  "NEET-UG",
  "JEE Main & Advanced",
  "NTSE & Olympiads",
  "UGC NET",
  "English Grammar & Spoken English",
]

export function ExamPathsSection() {
  const FeaturedIcon = featured.icon

  return (
    <section className="relative isolate overflow-x-clip border-b border-blue-100 bg-[#F3F7FF] py-16 sm:py-20 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-16 -left-20 h-56 w-56 rounded-full border-[24px] border-white/70" />
        <div className="absolute -right-12 bottom-[-8rem] h-80 w-80 rotate-12 rounded-md bg-blue-100/80" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-2xl font-heading text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Coaching &amp; online test paths from Jr. KG to NEET &amp; JEE.
          </h2>
          <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
            <Link
              href="/tests"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-blue-200 bg-white px-5 text-sm font-bold text-[#1E55C7] transition-colors hover:border-[#2A6AED] focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none"
            >
              Browse test series
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/question-papers"
              className="inline-flex min-h-11 items-center gap-2 rounded-md border border-blue-200 bg-white px-5 text-sm font-bold text-slate-800 transition-colors hover:border-[#2A6AED] hover:text-[#1E55C7] focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none"
            >
              Question papers
              <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:grid-rows-2">
          {/* Featured tile */}
          <Link
            href="/tests"
            className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-md border border-blue-200 bg-blue-100 shadow-sm focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:ring-offset-2 focus-visible:outline-none lg:row-span-2"
          >
            <Image
              src={featured.image}
              alt={featured.alt}
              width={960}
              height={1120}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0B1B45]/90 via-[#0B1B45]/40 to-transparent"
            />
            <div className="relative p-6 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-[#2A6AED] shadow-xs">
                <FeaturedIcon aria-hidden="true" className="h-5 w-5" />
              </span>
              <p className="mt-5 text-sm font-semibold text-blue-100">
                {featured.label}
              </p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <h3 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
                  {featured.title}
                </h3>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/25 bg-white/15 text-white transition-colors group-hover:bg-white group-hover:text-[#2A6AED]">
                  <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-2 max-w-md text-sm leading-6 text-blue-50/90">
                {featured.detail}
              </p>
            </div>
          </Link>

          {/* Compact tiles */}
          {compact.map(({ icon: Icon, label, title, detail, image, alt }) => (
            <Link
              key={title}
              href="/tests"
              className="group flex flex-col overflow-hidden rounded-md border border-blue-200/80 bg-white shadow-none transition-colors hover:border-[#2A6AED] focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none sm:flex-row"
            >
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-blue-100 sm:aspect-auto sm:w-2/5">
                <Image
                  src={image}
                  alt={alt}
                  width={480}
                  height={480}
                  sizes="(max-width: 640px) 100vw, 20vw"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-blue-50 text-[#2A6AED]">
                  <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <p className="mt-4 text-xs font-semibold text-[#1E55C7]">
                  {label}
                </p>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <h3 className="font-heading text-xl font-bold text-slate-950">
                    {title}
                  </h3>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-slate-400 transition-colors group-hover:text-[#2A6AED]"
                  />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {detail}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <ul
          aria-label="All covered courses and examinations"
          className="mt-8 flex flex-wrap items-center gap-2"
        >
          {coveredStreams.map((stream) => (
            <li
              key={stream}
              className="rounded-sm border border-blue-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              {stream}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
