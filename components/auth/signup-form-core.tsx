"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, ArrowRight, CheckCircle2 } from "lucide-react"
import { registerStudentAction } from "@/actions/auth-actions"

export interface SignUpFormCoreProps {
  isMobile?: boolean
}

export function SignUpFormCore({ isMobile }: SignUpFormCoreProps) {
  const router = useRouter()
  const { data: session, status } = useSession()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const redirectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
    }
  }, [])

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
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const result = await registerStudentAction({
        name,
        email,
        password,
        confirmPassword,
      })

      if (!result.success) {
        setError(result.error || "Failed to create account.")
        setLoading(false)
        return
      }

      setSuccess(result.message || "Registration successful! You may now sign in.")
      setLoading(false)

      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
      redirectTimerRef.current = setTimeout(() => {
        router.push("/signin")
      }, 1500)
    } catch {
      setError("An unexpected server error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-5">
      {error && (
        <Alert variant="destructive" className="py-3 text-xs sm:text-sm rounded-xl">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="py-3 text-xs sm:text-sm rounded-xl border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor={`name-${isMobile ? "mobile" : "desktop"}`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Full Candidate Name
          </Label>
          <Input
            id={`name-${isMobile ? "mobile" : "desktop"}`}
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ananya Sharma"
            disabled={loading}
            className="h-11 sm:h-10 text-sm rounded-xl border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor={`email-${isMobile ? "mobile" : "desktop"}`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Official Email Address
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor={`password-${isMobile ? "mobile" : "desktop"}`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Password
            </Label>
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

          <div className="space-y-1.5">
            <Label htmlFor={`confirm-password-${isMobile ? "mobile" : "desktop"}`} className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Confirm Password
            </Label>
            <Input
              id={`confirm-password-${isMobile ? "mobile" : "desktop"}`}
              type={showPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className="h-11 sm:h-10 text-sm rounded-xl border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 focus:bg-white dark:focus:bg-slate-900 font-mono"
            />
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
              Registering Account...
            </>
          ) : (
            <>
              Create Candidate Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="pt-2 text-center text-xs text-slate-600 dark:text-slate-400">
        Already registered?{" "}
        <Link href="/signin" className="font-bold text-[#2A6AED] dark:text-blue-400 hover:underline">
          Sign in here
        </Link>
      </div>
    </div>
  )
}
