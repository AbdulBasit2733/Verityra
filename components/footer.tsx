import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-[#D5E5F2] bg-[#F2F7FA] py-12 text-[#4B6375]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0784B5] text-white font-bold text-lg">
                V
              </div>
              <span className="font-heading text-lg font-bold tracking-tight text-[#0784B5]">
                Verityra
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#4B6375]">
              Structured test series platform with authentic handwritten practice, official answer sheet standards, and comprehensive subjective evaluations.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#0B192C] mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/tests" className="hover:text-[#0784B5] transition-colors">
                  Explore Test Series
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="hover:text-[#0784B5] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-[#0784B5] transition-colors">
                  Live Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/#faqs" className="hover:text-[#0784B5] transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>

          {/* Student Portal */}
          <div>
            <h4 className="text-sm font-semibold text-[#0B192C] mb-3">Candidates</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/signin" className="hover:text-[#0784B5] transition-colors">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[#0784B5] transition-colors">
                  Register Account
                </Link>
              </li>
              <li>
                <Link href="/student/dashboard" className="hover:text-[#0784B5] transition-colors">
                  Candidate Dashboard
                </Link>
              </li>
              <li>
                <Link href="/student/profile" className="hover:text-[#0784B5] transition-colors">
                  Profile & Records
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & Contact */}
          <div>
            <h4 className="text-sm font-semibold text-[#0B192C] mb-3">Legal & Security</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="hover:text-[#0784B5] transition-colors">
                  Privacy Policy & Data Security
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#0784B5] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-[#4B6375]">Support: support@verityra.com</span>
              </li>
              <li className="pt-2 text-[11px] text-[#4B6375]/80">
                Encrypted uploads & secure student isolation.
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#D5E5F2] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#4B6375]">
          <p>© {new Date().getFullYear()} Verityra. All rights reserved.</p>
          <div className="flex space-x-6 mt-3 sm:mt-0">
            <Link href="/privacy" className="hover:text-[#0784B5]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#0784B5]">Terms</Link>
            <Link href="/contact" className="hover:text-[#0784B5]">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
