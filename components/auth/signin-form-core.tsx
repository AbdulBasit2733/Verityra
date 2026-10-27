"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { signIn, getSession, useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, User } from "lucide-react"
import { resolvePostLoginTarget } from "@/lib/auth-guard"

export interface SignInFormCoreProps {
  isMobile?: boolean
}

export function SignInFormCore({ isMobile }: SignInFormCoreProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Redirect if user is already authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      if (session.user.role === "ADMIN") {
        router.replace("/admin")
      } else {
        router.replace("/student/dashboard")
      }
    }
  }, [status, session, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        setError(res.error)
        setLoading(false)
        return
      }

      // Fetch freshly signed-in session to obtain the user's role
      const freshSession = await getSession()
      const role = freshSession?.user?.role
      const paramCallback = searchParams.get("callbackUrl")
      let targetUrl = resolvePostLoginTarget(role, paramCallback)

      // Fallback for offline demo credentials if role was not yet in session
      if (!role && email.toLowerCase().trim() === "admin@verityra.com") {
        targetUrl = "/admin"
      }

      router.push(targetUrl)
      router.refresh()
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  function fillDemoAdmin() {
    setEmail("admin@verityra.com")
    setPassword("AdminSecurePassword123!")
    setError(null)
  }

  function fillDemoStudent() {
    setEmail("student@verityra.com")
    setPassword("StudentSecurePassword123!")
    setError(null)
  }

  return (
    <div className="w-full space-y-6">
      {/* Demo Credentials Quick Switcher Pills */}
      <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>Quick Demo Access:</span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-mono">1-Click Autofill</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillDemoAdmin}
            className="h-8 text-[11px] font-bold border-slate-200 dark:border-slate-700 hover:border-[#2A6AED] hover:text-[#2A6AED] dark:hover:text-blue-400 bg-white dark:bg-slate-800 rounded-lg cursor-pointer"
          >
            <ShieldCheck className="mr-1 h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400 shrink-0" />
            Demo Admin
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={fillDemoStudent}
            className="h-8 text-[11px] font-bold border-slate-200 dark:border-slate-700 hover:border-[#2A6AED] hover:text-[#2A6AED] dark:hover:text-blue-400 bg-white dark:bg-slate-800 rounded-lg cursor-pointer"
          >
            <User className="mr-1 h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400 shrink-0" />
            Demo Candidate
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="py-3 text-xs sm:text-sm rounded-xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`email-${isMobile ? "mobile" : "desktop"}`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Registered Email
          </Label>
          <Input
            id={`email-${isMobile ? "mobile" : "desktop"}`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="candidate@verityra.com"
            disabled={loading}
            className="h-11 sm:h-10 text-sm rounded-xl border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor={`password-${isMobile ? "mobile" : "desktop"}`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Account Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#2A6AED] dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id={`password-${isMobile ? "mobile" : "desktop"}`}
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className="h-11 sm:h-10 text-sm pr-10 rounded-xl border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-11 sm:h-11 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all cursor-pointer mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Session...
            </>
          ) : (
            <>
              Sign In to Workspace
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-bold text-[#2A6AED] dark:text-blue-400 hover:underline">
          Create candidate account
        </Link>
      </div>
    </div>
  )
}
