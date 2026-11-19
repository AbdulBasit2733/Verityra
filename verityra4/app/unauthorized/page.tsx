import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft, LayoutDashboard } from "lucide-react"
import { AuthPageFrame } from "@/components/layout/auth/auth-page-frame"

export default function UnauthorizedPage() {
  return (
    <AuthPageFrame className="flex min-h-dvh flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="auth-form-surface w-full max-w-md space-y-6 p-8 text-center sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Access Restricted
          </h1>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Your account does not possess the required role privileges to access
            this area of the examination platform.
          </p>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <Link href="/dashboard" className="w-full">
            <Button className="auth-primary-action h-11 w-full text-sm">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Return to Your Dashboard
            </Button>
          </Link>
          <Link href="/" className="w-full">
            <Button
              variant="outline"
              className="h-11 w-full rounded-md border-border text-sm font-semibold"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </AuthPageFrame>
  )
}
