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
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react"
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
      const targetUrl = resolvePostLoginTarget(role, paramCallback)

      router.push(targetUrl)
      router.refresh()
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="w-full space-y-5">

      {error && (
        <Alert variant="destructive" role="alert" className="rounded-lg py-3 text-xs sm:text-sm">
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
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="candidate@verityra.com"
            disabled={loading}
            className="auth-control h-11 bg-transparent text-sm"
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
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              disabled={loading}
              className="auth-control h-11 pr-10 text-sm font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-50 hover:text-[#1E55C7] dark:hover:bg-blue-950/50 dark:hover:text-blue-200"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="auth-primary-action mt-2 w-full text-xs shadow-md shadow-blue-500/20 sm:text-sm"
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
