"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Ban, LogOut } from "lucide-react"
import { AuthPageFrame } from "@/components/layout/auth/auth-page-frame"

export default function SuspendedPage() {
  return (
    <AuthPageFrame className="flex min-h-dvh flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="auth-form-surface w-full max-w-md space-y-6 border-red-200 p-8 text-center shadow-none sm:p-10 dark:border-red-900/60">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600">
          <Ban className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Account Suspended
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Your examination account has been flagged or suspended by
            administrative governance. Access to test submissions and
            evaluations is temporarily disabled.
          </p>
        </div>

        <div className="space-y-1 rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-left text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
          <p className="font-bold text-slate-800 dark:text-slate-100">
            Support Inquiry:
          </p>
          <p>
            If you believe this suspension is in error or wish to appeal, please
            contact the examination controller desk at{" "}
            <a
              href="mailto:support@verityra.com"
              className="font-semibold text-[#2A6AED] underline"
            >
              support@verityra.com
            </a>
            .
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={async () => {
              await signOut({ redirect: false })
              window.location.href = "/"
            }}
            variant="outline"
            className="h-11 w-full rounded-xl border-red-200 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/40"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out of Account
          </Button>
          <Link href="/" className="w-full">
            <Button
              variant="ghost"
              className="h-11 w-full rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              Public Homepage
            </Button>
          </Link>
        </div>
      </div>
    </AuthPageFrame>
  )
}
