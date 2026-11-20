"use client"

import { useState, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { resetPasswordAction } from "@/actions/auth-actions"
import { AuthPageFrame } from "@/components/layout/auth/auth-page-frame"
import { BRAND_CONFIG } from "@/lib/brand"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      setError("Reset token is missing or invalid.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await resetPasswordAction({
        token,
        password,
        confirmPassword,
      })

      if (!result.success) {
        setError(result.error || "Failed to reset password.")
        setLoading(false)
        return
      }

      setSuccess(result.message || "Your password has been reset successfully.")
      setLoading(false)

      setTimeout(() => {
        router.push("/signin")
      }, 2000)
    } catch {
      setError("An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <Card className="auth-form-surface p-2 sm:p-4">
      <CardHeader className="space-y-1.5 pb-6">
        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
          Set New Password
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
          Choose a strong password with letters, numbers, and symbols
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="rounded-md py-3 text-sm">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="rounded-md border-emerald-500 bg-emerald-50 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label
              htmlFor="password"
              className="text-xs font-bold text-slate-900 dark:text-slate-100"
            >
              New Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="auth-control h-11 pr-12 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div>
            <Label
              htmlFor="confirmPassword"
              className="text-xs font-bold text-slate-900 dark:text-slate-100"
            >
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="auth-control mt-1.5 h-11 text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="auth-primary-action mt-2 h-11 w-full text-sm shadow-xs"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Reset & Save Password
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center pt-2">
        <Link
          href="/signin"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#2A6AED]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <AuthPageFrame className="flex min-h-dvh flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="text-center sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          aria-label={`${BRAND_CONFIG.name} home`}
          className="group mb-6 inline-flex items-center justify-center"
        >
          <Image
            src={BRAND_CONFIG.logo}
            alt={BRAND_CONFIG.name}
            width={2172}
            height={724}
            priority
            className="h-11 w-auto object-contain"
          />
        </Link>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          Create a new password
        </h2>
      </div>

      <div className="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-lg sm:px-0">
        <Suspense
          fallback={
            <div className="py-12 text-center text-sm text-slate-500">
              Loading form...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </AuthPageFrame>
  )
}
