import Link from "next/link"
import { ShieldCheck, Lock, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-slate-800/90 bg-[#0B132B] text-slate-300 pt-10 pb-8 min-[375px]:pt-12 min-[375px]:pb-10 sm:py-14 lg:py-16 overflow-hidden">
      <div className="mx-auto max-w-7xl px-3.5 min-[375px]:px-4 sm:px-6 lg:px-8">
        {/* Main Footer Grid:
            - Mobile S/M/L (320px - 639px): 2-column grid where Brand & Trust span 2 cols, and Platform + Candidates sit side-by-side in 2 columns for compact height.
            - Tablet (sm: 640px+): 2-column or 12-column responsive layout.
            - Desktop (md/lg): 12-column asymmetrical SaaS layout (5 + 2 + 2 + 3).
        */}
        <div className="grid grid-cols-2 md:grid-cols-12 gap-y-8 gap-x-4 min-[375px]:gap-x-6 sm:gap-8 lg:gap-10 pb-8 min-[375px]:pb-10 sm:pb-12">
          {/* 1. Brand & Security Badges (Full width on mobile S/M/L, 5 cols on desktop) */}
          <div className="col-span-2 md:col-span-5 space-y-3.5">
            <Link href="/" className="inline-flex items-center gap-2.5 group">
              <div className="flex h-8 w-8 min-[375px]:h-9 min-[375px]:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#2A6AED] to-[#1D4ED8] text-white font-bold text-sm min-[375px]:text-base shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                V
              </div>
              <span className="font-heading text-base min-[375px]:text-lg sm:text-xl font-bold tracking-tight text-white">
                Verityra
              </span>
            </Link>

            <p className="text-[11.5px] min-[375px]:text-xs sm:text-[13px] leading-relaxed text-slate-400 max-w-md">
              The premier subjective examination test series platform. Authentic handwritten practice, printable standardized margin templates, and rigorous rubric-based evaluation.
            </p>

            {/* Security Pill Badges - Responsive for 320px, 375px, 425px */}
            <div className="grid grid-cols-1 min-[390px]:flex min-[390px]:flex-wrap items-stretch min-[390px]:items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1.5 text-[10.5px] min-[375px]:text-[11px] text-slate-300 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800/90">
                <Lock className="h-3 w-3 text-[#2A6AED] shrink-0" />
                <span className="truncate">256-Bit Encrypted Uploads</span>
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10.5px] min-[375px]:text-[11px] text-slate-300 bg-slate-900/90 px-2.5 py-1.5 rounded-lg border border-slate-800/90">
                <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                <span className="truncate">Strict 3-Attempt Isolation</span>
              </div>
            </div>
          </div>

          {/* 2. Platform Links (1 col on Mobile S/M/L, 2 cols on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-2.5 sm:space-y-3">
            <h4 className="text-[11px] min-[375px]:text-xs font-bold uppercase tracking-wider text-white">
              Platform
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-[11.5px] min-[375px]:text-xs sm:text-[13px] text-slate-400">
              <li>
                <Link href="/tests" className="hover:text-white transition-colors inline-block py-0.5">
                  Explore Tests
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-white transition-colors inline-block py-0.5">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/#iterative-mastery" className="hover:text-white transition-colors inline-block py-0.5">
                  3-Attempt Model
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-white transition-colors inline-block py-0.5">
                  Live Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-white transition-colors inline-block py-0.5">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* 3. Candidate Portal Links (1 col on Mobile S/M/L, 2 cols on desktop) */}
          <div className="col-span-1 md:col-span-2 space-y-2.5 sm:space-y-3">
            <h4 className="text-[11px] min-[375px]:text-xs font-bold uppercase tracking-wider text-white">
              Candidates
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-[11.5px] min-[375px]:text-xs sm:text-[13px] text-slate-400">
              <li>
                <Link href="/signin" className="hover:text-white transition-colors inline-block py-0.5">
                  Candidate Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition-colors inline-block py-0.5">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/student/dashboard" className="hover:text-white transition-colors inline-block py-0.5">
                  Workspace
                </Link>
              </li>
              <li>
                <Link href="/student/profile" className="hover:text-white transition-colors inline-block py-0.5">
                  Profile & Records
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Trust & Security (Full width 2-col card/section on Mobile S/M/L, 3 cols on desktop) */}
          <div className="col-span-2 md:col-span-3 space-y-2.5 sm:space-y-3 pt-2 md:pt-0 border-t border-slate-800/60 md:border-t-0">
            <h4 className="text-[11px] min-[375px]:text-xs font-bold uppercase tracking-wider text-white">
              Trust & Security
            </h4>
            <ul className="space-y-2 sm:space-y-2.5 text-[11.5px] min-[375px]:text-xs sm:text-[13px] text-slate-400">
              <li className="flex flex-wrap gap-x-4 gap-y-1.5 md:block md:space-y-2.5">
                <Link href="/privacy" className="hover:text-white transition-colors inline-block py-0.5">
                  Privacy Policy & Data Vault
                </Link>
                <span className="text-slate-700 md:hidden">•</span>
                <Link href="/terms" className="hover:text-white transition-colors inline-block py-0.5 md:block">
                  Terms of Examination
                </Link>
              </li>
              <li className="pt-0.5">
                <a
                  href="mailto:support@verityra.com"
                  className="inline-flex items-center gap-1.5 text-[11px] min-[375px]:text-xs text-slate-300 hover:text-white transition-colors bg-slate-900/70 px-2.5 py-1.5 rounded-lg border border-slate-800/80"
                >
                  <Mail className="h-3 w-3 text-[#2A6AED] shrink-0" />
                  <span className="font-medium">support@verityra.com</span>
                </a>
              </li>
              <li className="text-[10.5px] min-[375px]:text-[11px] text-slate-500 leading-relaxed">
                Strict confidential evaluation. Instructions and model rubrics are server-isolated.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="border-t border-slate-800/80 pt-5 sm:pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] min-[375px]:text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p className="leading-relaxed">
            © {new Date().getFullYear()} Verityra Technologies. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-3.5 min-[375px]:gap-x-5 gap-y-1.5">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">
              Privacy Notice
            </Link>
            <span className="text-slate-700 sm:hidden">•</span>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">
              Terms of Service
            </Link>
            <span className="text-slate-700 sm:hidden">•</span>
            <Link href="/contact" className="hover:text-slate-300 transition-colors">
              Security Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

