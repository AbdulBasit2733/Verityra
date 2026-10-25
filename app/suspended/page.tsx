"use client"

import Link from "next/link"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Ban, LogOut, Mail } from "lucide-react"

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-red-200 shadow-2xl shadow-red-900/5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 border border-red-200">
          <Ban className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Account Suspended
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your examination account has been flagged or suspended by administrative governance. Access to test submissions and evaluations is temporarily disabled.
          </p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-600 space-y-1 text-left">
          <p className="font-bold text-slate-800">Support Inquiry:</p>
          <p>
            If you believe this suspension is in error or wish to appeal, please contact the examination controller desk at{" "}
            <a href="mailto:support@verityra.com" className="font-semibold text-[#2A6AED] underline">
              support@verityra.com
            </a>.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50 font-semibold h-11 rounded-xl text-sm"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out of Account
          </Button>
          <Link href="/" className="w-full">
            <Button variant="ghost" className="w-full text-slate-500 hover:text-slate-800 font-semibold h-11 rounded-xl text-sm">
              Public Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
