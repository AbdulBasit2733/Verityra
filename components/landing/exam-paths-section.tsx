import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, BookOpenCheck, Landmark, Scale } from "lucide-react"

/*
  IMAGES (place in /public/images/landing/)
  - upsc-path.png      → 960 × 1120 px (large tile, portrait)
  - state-pcs-path.png → 480 × 480 px  (square thumbnail)
  - judicial-path.png  → 480 × 480 px  (square thumbnail)
*/
const featured = {
  icon: Landmark,
  label: "Civil services",
  title: "UPSC preparation",
  detail:
    "Build confidence with structured answer-writing practice for the papers that decide your rank.",
  image: "/images/landing/upsc-path.png",
  alt: "Aspirant revising notes with the Indian Parliament in the background",
}

const compact = [
  {
    icon: BookOpenCheck,
    label: "State examinations",
    title: "State PCS",
    detail: "Practice written responses for your state-level exam path.",
    image: "/images/landing/state-pcs-path.png",
    alt: "Students discussing answers in a study room",
  },
  {
    icon: Scale,
    label: "Legal services",
    title: "Judicial services",
    detail: "Strengthen clarity and structure in your written answers.",
    image: "/images/landing/judicial-path.png",
    alt: "Law books and a gavel on a desk",
  },
]

export function ExamPathsSection() {
  const FeaturedIcon = featured.icon

  return (
    <section className="relative isolate overflow-hidden border-b border-blue-100 bg-[#F3F7FF] py-16 sm:py-20 lg:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-16 -left-20 h-56 w-56 rounded-full border-[24px] border-white/70" />
        <div className="absolute -right-12 bottom-[-8rem] h-80 w-80 rotate-12 rounded-[4rem] bg-blue-100/80" />
      </div>

      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="max-w-2xl font-heading text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            Practice built around the exams you’re preparing for.
          </h2>
          <Link
            href="/tests"
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-blue-200 bg-white px-5 text-sm font-bold text-[#1E55C7] transition-colors hover:border-[#2A6AED] focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none sm:self-auto"
          >
            Browse all test series
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-[1.1fr_1fr] lg:grid-rows-2">
          {/* Featured tile */}
          <Link
            href="/tests"
            className="group relative flex min-h-[26rem] flex-col justify-end overflow-hidden rounded-3xl bg-blue-100 shadow-xl shadow-blue-900/10 focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:ring-offset-2 focus-visible:outline-none lg:row-span-2"
          >
            <Image
              src={featured.image}
              alt={featured.alt}
              width={960}
              height={1120}
              sizes="(max-width: 1024px) 100vw, 55vw"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#0B1B45]/90 via-[#0B1B45]/40 to-transparent"
            />
            <div className="relative p-6 sm:p-8">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#2A6AED] shadow-lg">
                <FeaturedIcon aria-hidden="true" className="h-6 w-6" />
              </span>
              <p className="mt-5 text-sm font-semibold text-blue-100">
                {featured.label}
              </p>
              <div className="mt-1 flex items-center justify-between gap-4">
                <h3 className="font-heading text-2xl font-extrabold text-white sm:text-3xl">
                  {featured.title}
                </h3>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors group-hover:bg-white group-hover:text-[#2A6AED]">
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
              className="group flex flex-col overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm shadow-blue-900/[0.04] transition-colors hover:border-blue-300 focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none sm:flex-row"
            >
              <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-blue-100 sm:aspect-auto sm:w-2/5">
                <Image
                  src={image}
                  alt={alt}
                  width={480}
                  height={480}
                  sizes="(max-width: 640px) 100vw, 20vw"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              </div>
              <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#2A6AED]">
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
      </div>
    </section>
  )
}