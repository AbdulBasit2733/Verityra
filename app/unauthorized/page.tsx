import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col justify-center items-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-2xl shadow-blue-900/5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Access Restricted
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            Your account does not possess the required role privileges to access this area of the examination platform.
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-3">
          <Link href="/dashboard" className="w-full">
            <Button className="w-full bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-bold h-11 rounded-xl shadow-xs text-sm">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Return to Your Dashboard
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold h-11 rounded-xl text-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
