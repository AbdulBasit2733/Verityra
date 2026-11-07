import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  Check,
  FileText,
  PenLine,
  ShieldCheck,
  UploadCloud,
} from "lucide-react"


interface AuthPageLayoutProps {
  title: string
  subtitle: string
  mode: "signin" | "signup"
  children: React.ReactNode
}

export function AuthPageLayout({
  title,
  subtitle,
  mode,
  children,
}: AuthPageLayoutProps) {
  const isSignUp = mode === "signup"

  return (
    <div className="auth-page-shell grid min-h-dvh w-full text-foreground lg:grid-cols-[1.02fr_0.98fr]">
      <aside className="auth-stage relative hidden min-h-dvh flex-col justify-between overflow-hidden border-r border-border px-10 py-8 lg:flex xl:px-16">
        <div className="auth-wave" aria-hidden="true" />
        <div className="relative z-10 flex items-center justify-between">
          <BrandMark />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white/70 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:text-slate-300 dark:hover:bg-slate-900/50"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-xl py-12">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-bold tracking-[0.12em] text-secondary-foreground uppercase dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-200">
            <span
              className="h-2 w-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            {isSignUp
              ? "Start with the right practice"
              : "Welcome back to your preparation"}
          </p>
          <h1 className="mt-7 max-w-lg font-heading text-5xl leading-[1.05] font-extrabold tracking-[-0.05em] text-slate-950 xl:text-6xl dark:text-white">
            {isSignUp
              ? "Build your answer-writing habit."
              : "Continue your preparation."}
            <span className="mt-2 block text-primary dark:text-blue-400">
              One deliberate attempt at a time.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-700 dark:text-slate-300">
            Practice on official-style margins, write under realistic
            conditions, and use clear feedback to make your next answer
            stronger.
          </p>

          <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
            {[
              { icon: FileText, label: "Margin booklets" },
              { icon: PenLine, label: "Handwritten practice" },
              { icon: UploadCloud, label: "Rubric feedback" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="rounded-xl border border-white/80 bg-white/65 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700/70 dark:bg-slate-900/50"
              >
                <Icon aria-hidden="true" className="h-5 w-5 text-primary" />
                <p className="mt-3 text-sm leading-5 font-bold text-slate-800 dark:text-slate-100">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span className="inline-flex items-center gap-2">
              <Check aria-hidden="true" className="h-4 w-4 text-emerald-600" />
              Three attempts
            </span>
            <span className="inline-flex items-center gap-2">
              <ShieldCheck
                aria-hidden="true"
                className="h-4 w-4 text-emerald-600"
              />
              Private workspace
            </span>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-blue-200/70 pt-5 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-400">
          <span>Verityra examination platform</span>
          <span className="font-mono">3× attempt policy</span>
        </div>
      </aside>

      <main className="flex min-h-dvh min-w-0 items-center justify-center px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10 xl:px-16">
        <div className="w-full max-w-[30rem]">
          <div className="mb-6 flex items-center justify-between lg:hidden">
            <BrandMark compact />
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 hover:bg-white/70 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none dark:text-slate-200"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Home
              </Link>
            </div>
          </div>
          <div className="mb-6 lg:mb-7">
            <p className="ui-eyebrow">Candidate account</p>
            <h1 className="mt-3 font-heading text-3xl font-extrabold tracking-[-0.04em] text-slate-950 dark:text-white">
              {title}
            </h1>
            <p className="mt-2 text-base leading-6 text-slate-600 dark:text-slate-300">
              {subtitle}
            </p>
          </div>
          <div className="auth-form-surface p-5 sm:p-7 lg:p-8">{children}</div>
          <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400">
            <ShieldCheck
              aria-hidden="true"
              className="h-4 w-4 shrink-0 text-emerald-600"
            />
            Your session is protected by Verityra security controls.
          </p>
        </div>
      </main>
    </div>
  )
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="group inline-flex min-h-11 items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-label="Verityra home"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-blue-600/20 transition-colors group-hover:bg-primary/90">
        <BookOpen aria-hidden="true" className="h-5 w-5" />
      </span>
      <span
        className={`font-heading font-extrabold tracking-[-0.05em] text-slate-950 dark:text-white ${compact ? "text-xl" : "text-2xl"}`}
      >
        Verityra
      </span>
    </Link>
  )
}
