import {
  BookOpen,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Languages,
  MapPin,
  Phone,
  Star,
  Users,
} from "lucide-react"

import { BRAND_CONFIG } from "@/lib/brand"

const instituteFeatures = [
  {
    icon: Users,
    title: "Small batch sizes & personal focus",
    copy: "Focused cohorts designed for individual attention from Jr. KG through Class XII, NEET-UG & JEE.",
  },
  {
    icon: BookOpen,
    title: "Study materials & doubt clearing",
    copy: "Structured practice sheets, regular mock tests, and dedicated faculty doubt-clearing sessions.",
  },
  {
    icon: Languages,
    title: "English Grammar & Spoken English",
    copy: `Strong academic grammar foundation alongside spoken English training via ${BRAND_CONFIG.trainingAcademyName}.`,
  },
  {
    icon: CheckCircle2,
    title: "Wheelchair-accessible campus",
    copy: "Step-free accessible entrance, parking, classroom seating, and restroom facilities.",
  },
]

export function InstituteHighlightsSection() {
  const { contact } = BRAND_CONFIG

  return (
    <section
      aria-labelledby="institute-highlights-heading"
      className="border-b border-blue-100 bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
          {/* Left Column: Institute Story & Features */}
          <div>
            <p className="inline-flex items-center gap-2 rounded-sm border border-amber-200 bg-amber-50 px-3.5 py-1.5 text-xs font-bold text-amber-800">
              <Star
                aria-hidden="true"
                className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
              />
              {contact.rating}★ Rated · {BRAND_CONFIG.instituteName}
            </p>

            <h2
              id="institute-highlights-heading"
              className="mt-4 max-w-xl font-heading text-3xl font-extrabold tracking-[-0.03em] text-slate-950 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.12]"
            >
              Classroom mentorship in Chhatrapati Sambhajinagar, extended
              online.
            </h2>

            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              {BRAND_CONFIG.instituteName} combines small-batch classroom
              coaching in Kiradpura with {BRAND_CONFIG.name}’s online portal for
              free and paid test series and question papers, helping students
              build steady mastery across CBSE, ICSE, State Board, NEET-UG, JEE,
              NTSE, Olympiads, UGC NET, and English Grammar.
            </p>

            <ul className="mt-8 grid gap-x-8 gap-y-6 border-t border-blue-100 pt-6 sm:grid-cols-2">
              {instituteFeatures.map(({ icon: Icon, title, copy }) => (
                <li
                  key={title}
                  className="border-b border-blue-100/80 pb-5 sm:border-b-0 sm:pb-0"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#F8FAFF] text-[#2A6AED] ring-1 ring-blue-100">
                    <Icon aria-hidden="true" className="h-4.5 w-4.5" />
                  </span>
                  <h3 className="mt-3 font-heading text-base font-bold text-slate-950">
                    {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-slate-600">
                    {copy}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Campus Address, Hours & Contact Panel */}
          <aside className="rounded-md border border-blue-200/80 bg-[#F4F8FF] p-6 shadow-none sm:p-8">
            <div className="flex items-center justify-between gap-3 border-b border-blue-200/70 pb-5">
              <div>
                <h3 className="font-heading text-xl font-extrabold text-slate-950">
                  {BRAND_CONFIG.instituteName}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-[#1E55C7]">
                  Kiradpura Campus, Chhatrapati Sambhajinagar
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-sm bg-white px-3 py-1 text-xs font-bold text-slate-900 shadow-2xs ring-1 ring-blue-100">
                <Star
                  aria-hidden="true"
                  className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                />
                {contact.rating} / 5
              </span>
            </div>

            <dl className="mt-6 space-y-5 text-sm">
              <div className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-white text-[#2A6AED] ring-1 ring-blue-100">
                  <MapPin aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <dt className="text-xs font-bold text-slate-500">
                    Address
                  </dt>
                  <dd className="mt-1 leading-6 font-medium text-slate-800">
                    {contact.address}
                  </dd>
                </div>
              </div>

              <div className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-white text-[#2A6AED] ring-1 ring-blue-100">
                  <Phone aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <dt className="text-xs font-bold text-slate-500">
                    Phone
                  </dt>
                  <dd className="mt-1">
                    <a
                      href={contact.phoneHref}
                      className="inline-flex min-h-11 items-center font-heading text-base font-bold text-[#1E55C7] underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none"
                    >
                      {contact.phone}
                    </a>
                  </dd>
                </div>
              </div>

              <div className="flex gap-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-white text-[#2A6AED] ring-1 ring-blue-100">
                  <Clock3 aria-hidden="true" className="h-5 w-5" />
                </span>
                <div>
                  <dt className="text-xs font-bold text-slate-500">
                    Coaching Hours
                  </dt>
                  <dd className="mt-1 space-y-1 text-slate-700">
                    <p className="font-semibold text-slate-900">
                      {contact.weekdayHours}
                    </p>
                    <p className="font-semibold text-slate-900">
                      {contact.sundayHours}
                    </p>
                    <p className="text-xs text-slate-600">
                      {contact.extendedHoursNote}
                    </p>
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-7 flex flex-col gap-2.5 border-t border-blue-200/70 pt-6 sm:flex-row">
              <a
                href={contact.justdialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md bg-[#2A6AED] px-4 text-xs font-bold text-white shadow-sm transition-colors hover:bg-[#1E55C7] focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none"
              >
                Justdial Profile
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
              <a
                href={contact.trainingAcademyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-4 text-xs font-bold text-slate-800 transition-colors hover:border-[#2A6AED] hover:text-[#1E55C7] focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none"
              >
                {BRAND_CONFIG.trainingAcademyName}
                <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}
