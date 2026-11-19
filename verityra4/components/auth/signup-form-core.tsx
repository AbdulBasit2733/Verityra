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
import { BRAND_CONFIG } from "@/lib/brand"

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
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(
    null
  )
  const [loading, setLoading] = useState(false)
  const redirectTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null
  )

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

      setSuccess(
        result.message || "Registration successful! You may now sign in."
      )
      setLoading(false)

      if (result.data?.devVerificationUrl) {
        setDevVerificationUrl(result.data.devVerificationUrl)
      } else {
        if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current)
        redirectTimerRef.current = setTimeout(() => {
          router.push("/signin")
        }, 1500)
      }
    } catch {
      setError("An unexpected server error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-5">
      {error && (
        <Alert
          variant="destructive"
          role="alert"
          className="rounded-md py-3 text-xs sm:text-sm"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert
          role="status"
          className="rounded-md border-emerald-300 bg-emerald-50 py-3 text-xs text-emerald-800 sm:text-sm dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200"
        >
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {devVerificationUrl && (
        <div className="space-y-2 rounded-md border border-blue-200 bg-blue-50/90 p-4 text-xs dark:border-blue-900/50 dark:bg-blue-950/40">
          <p className="font-bold text-[#2A6AED] dark:text-blue-400">
            Development Verification Link:
          </p>
          <a
            href={devVerificationUrl}
            className="font-mono text-xs break-all text-[#2A6AED] underline dark:text-blue-300"
          >
            {devVerificationUrl}
          </a>
          <div className="pt-1">
            <Link href={devVerificationUrl}>
              <Button
                size="sm"
                type="button"
                className="h-8 rounded-md bg-[#2A6AED] text-xs font-semibold text-white hover:bg-[#1E55C7]"
              >
                Verify Email Now
              </Button>
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor={`name-${isMobile ? "mobile" : "desktop"}`}
            className="text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Full Candidate Name
          </Label>
          <Input
            id={`name-${isMobile ? "mobile" : "desktop"}`}
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ananya Sharma"
            disabled={loading}
            className="auth-control h-11 bg-transparent text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor={`email-${isMobile ? "mobile" : "desktop"}`}
            className="text-xs font-bold text-slate-700 dark:text-slate-300"
          >
            Official Email Address
          </Label>
          <Input
            id={`email-${isMobile ? "mobile" : "desktop"}`}
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={BRAND_CONFIG.defaultCandidateEmail}
            disabled={loading}
            className="auth-control h-11 bg-transparent text-sm"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor={`password-${isMobile ? "mobile" : "desktop"}`}
              className="text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Password
            </Label>
            <div className="relative">
              <Input
                id={`password-${isMobile ? "mobile" : "desktop"}`}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                disabled={loading}
                className="auth-control h-11 pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 hover:bg-blue-50 hover:text-[#1E55C7] dark:hover:bg-blue-950/50 dark:hover:text-blue-200"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor={`confirm-password-${isMobile ? "mobile" : "desktop"}`}
              className="text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              Confirm Password
            </Label>
            <Input
              id={`confirm-password-${isMobile ? "mobile" : "desktop"}`}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className="auth-control h-11 font-mono text-sm"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="auth-primary-action mt-2 w-full text-xs shadow-xs sm:text-sm"
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
        <Link
          href="/signin"
          className="font-bold text-[#2A6AED] hover:underline dark:text-blue-400"
        >
          Sign in here
        </Link>
      </div>
    </div>
  )
}
