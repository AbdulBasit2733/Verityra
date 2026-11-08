import Link from "next/link"
import { ShieldCheck, Lock, Mail } from "lucide-react"

export function Footer({
  variant = "default",
}: {
  variant?: "default" | "light"
}) {
  if (variant === "light") {
    return (
      <footer className="overflow-hidden border-t border-slate-200 bg-[#F8FAFC] py-10 text-slate-700 sm:py-12">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="grid gap-8 border-b border-slate-200 pb-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
            <div>
              <Link
                href="/"
                className="inline-flex min-h-11 items-center gap-2.5 rounded-lg focus-visible:ring-2 focus-visible:ring-[#2A6AED] focus-visible:outline-none"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2A6AED] font-bold text-white">
                  V
                </span>
                <span className="font-heading text-xl font-extrabold tracking-tight text-slate-950">
                  Verityra
                </span>
              </Link>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
                A focused workspace for handwritten examination practice,
                feedback, and progress.
              </p>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">Platform</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <Link className="hover:text-[#1E55C7]" href="/tests">
                    Test Series
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#1E55C7]" href="/#how-it-works">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#1E55C7]"
                    href="/question-papers"
                  >
                    Resources
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#1E55C7]" href="/leaderboard">
                    Leaderboard
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">Candidates</h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <Link className="hover:text-[#1E55C7]" href="/signin">
                    Sign in
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#1E55C7]" href="/signup">
                    Create account
                  </Link>
                </li>
                <li>
                  <Link
                    className="hover:text-[#1E55C7]"
                    href="/student/dashboard"
                  >
                    Candidate workspace
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-950">
                Trust & support
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                <li>
                  <Link className="hover:text-[#1E55C7]" href="/privacy">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link className="hover:text-[#1E55C7]" href="/terms">
                    Terms of service
                  </Link>
                </li>
                <li>
                  <a
                    className="hover:text-[#1E55C7]"
                    href="mailto:support@verityra.com"
                  >
                    support@verityra.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col gap-2 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} Verityra Technologies. All rights
              reserved.
            </p>
            <p className="inline-flex items-center gap-2">
              <ShieldCheck
                aria-hidden="true"
                className="h-4 w-4 text-[#2A6AED]"
              />
              Candidate privacy and attempt limits matter.
            </p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="overflow-hidden border-t border-slate-800/90 bg-[#0B132B] pt-10 pb-8 text-slate-300 min-[375px]:pt-12 min-[375px]:pb-10 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-7xl px-3.5 min-[375px]:px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid:
            - Mobile S/M/L (320px - 639px): 2-column grid where Brand & Trust span 2 cols, and Platform + Candidates sit side-by-side in 2 columns for compact height.
            - Tablet (sm: 640px+): 2-column or 12-column responsive layout.
            - Desktop (md/lg): 12-column asymmetrical SaaS layout (5 + 2 + 2 + 3).
        */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 pb-8 min-[375px]:gap-x-6 min-[375px]:pb-10 sm:gap-8 sm:pb-12 md:grid-cols-12 lg:gap-10">
          {/* 1. Brand & Security Badges (Full width on mobile S/M/L, 5 cols on desktop) */}
          <div className="col-span-2 space-y-3.5 md:col-span-5">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2A6AED] text-sm font-bold text-white shadow-md shadow-blue-500/20 transition-colors group-hover:bg-[#1E55C7] min-[375px]:h-9 min-[375px]:w-9 min-[375px]:text-base">
                V
              </div>
              <span className="font-heading text-base font-bold tracking-tight text-white min-[375px]:text-lg sm:text-xl">
                Verityra
              </span>
            </Link>

            <p className="max-w-md text-[11.5px] leading-relaxed text-slate-400 min-[375px]:text-xs sm:text-[13px]">
              The premier subjective examination test series platform. Authentic
              handwritten practice, printable standardized margin templates, and
              rigorous rubric-based evaluation.
            </p>

            {/* Security Pill Badges - Responsive for 320px, 375px, 425px */}
            <div className="grid grid-cols-1 items-stretch gap-2 pt-1 min-[390px]:flex min-[390px]:flex-wrap min-[390px]:items-center">
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800/90 bg-slate-900/90 px-2.5 py-1.5 text-[10.5px] text-slate-300 min-[375px]:text-[11px]">
                <Lock className="h-3 w-3 shrink-0 text-[#2A6AED]" />
                <span className="truncate">256-Bit Encrypted Uploads</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800/90 bg-slate-900/90 px-2.5 py-1.5 text-[10.5px] text-slate-300 min-[375px]:text-[11px]">
                <ShieldCheck className="h-3 w-3 shrink-0 text-emerald-400" />
                <span className="truncate">Strict 3-Attempt Isolation</span>
              </div>
            </div>
          </div>

          {/* 2. Platform Links (1 col on Mobile S/M/L, 2 cols on desktop) */}
          <div className="col-span-1 space-y-2.5 sm:space-y-3 md:col-span-2">
            <h4 className="text-[11px] font-bold tracking-wider text-white uppercase min-[375px]:text-xs">
              Platform
            </h4>
            <ul className="space-y-2 text-[11.5px] text-slate-400 min-[375px]:text-xs sm:space-y-2.5 sm:text-[13px]">
              <li>
                <Link
                  href="/tests"
                  className="inline-block py-0.5 transition-colors hover:text-white"
                >
                  Test Series
                </Link>
              </li>
              <li>
                <Link
                  href="/#how-it-works"
                  className="inline-block py-0.5 transition-colors hover:text-white"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/question-papers"
                  className="inline-block py-0.5 transition-colors hover:text-white"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/leaderboard"
                  className="inline-block py-0.5 transition-colors hover:text-white"
                >
                  Live Leaderboard
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Candidate Portal Links (1 col on Mobile S/M/L, 2 cols on desktop) */}
          <div className="col-span-1 space-y-2.5 sm:space-y-3 md:col-span-2">
            <h4 className="text-[11px] font-bold tracking-wider text-white uppercase min-[375px]:text-xs">
              Candidates
            </h4>
            <ul className="space-y-2 text-[11.5px] text-slate-400 min-[375px]:text-xs sm:space-y-2.5 sm:text-[13px]">
              <li>
                <Link
                  href="/signin"
                  className="inline-block py-0.5 transition-colors hover:text-white"
                >
                  Candidate Sign In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="inline-block py-0.5 transition-colors hover:text-white"
                >
                  Create Account
                </Link>
              </li>
              <li>
                <Link
                  href="/student/dashboard"
                  className="inline-block py-0.5 transition-colors hover:text-white"
                >
                  Workspace
                </Link>
              </li>
              <li>
                <Link
                  href="/student/profile"
                  className="inline-block py-0.5 transition-colors hover:text-white"
                >
                  Profile & Records
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Trust & Security (Full width 2-col card/section on Mobile S/M/L, 3 cols on desktop) */}
          <div className="col-span-2 space-y-2.5 border-t border-slate-800/60 pt-2 sm:space-y-3 md:col-span-3 md:border-t-0 md:pt-0">
            <h4 className="text-[11px] font-bold tracking-wider text-white uppercase min-[375px]:text-xs">
              Trust & Security
            </h4>
            <ul className="space-y-2 text-[11.5px] text-slate-400 min-[375px]:text-xs sm:space-y-2.5 sm:text-[13px]">
              <li className="flex flex-wrap gap-x-4 gap-y-1.5 md:block md:space-y-2.5">
                <Link
                  href="/privacy"
                  className="inline-block py-0.5 transition-colors hover:text-white"
                >
                  Privacy Policy & Data Vault
                </Link>
                <span className="text-slate-700 md:hidden">•</span>
                <Link
                  href="/terms"
                  className="inline-block py-0.5 transition-colors hover:text-white md:block"
                >
                  Terms of Examination
                </Link>
              </li>
              <li className="pt-0.5">
                <a
                  href="mailto:support@verityra.com"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800/80 bg-slate-900/70 px-2.5 py-1.5 text-[11px] text-slate-300 transition-colors hover:text-white min-[375px]:text-xs"
                >
                  <Mail className="h-3 w-3 shrink-0 text-[#2A6AED]" />
                  <span className="font-medium">support@verityra.com</span>
                </a>
              </li>
              <li className="text-[10.5px] leading-relaxed text-slate-500 min-[375px]:text-[11px]">
                Strict confidential evaluation. Instructions and model rubrics
                are server-isolated.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-800/80 pt-5 text-center text-[11px] text-slate-500 min-[375px]:text-xs sm:flex-row sm:pt-6 sm:text-left">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} Verityra Technologies. All rights
            reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1.5 min-[375px]:gap-x-5">
            <Link
              href="/privacy"
              className="transition-colors hover:text-slate-300"
            >
              Privacy Notice
            </Link>
            <span className="text-slate-700 sm:hidden">•</span>
            <Link
              href="/terms"
              className="transition-colors hover:text-slate-300"
            >
              Terms of Service
            </Link>
            <span className="text-slate-700 sm:hidden">•</span>
            <Link
              href="/contact"
              className="transition-colors hover:text-slate-300"
            >
              Security Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
