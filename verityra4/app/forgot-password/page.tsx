"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
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
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { requestPasswordResetAction } from "@/actions/auth-actions"
import { AuthPageFrame } from "@/components/layout/auth/auth-page-frame"
import { BRAND_CONFIG } from "@/lib/brand"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    try {
      const result = await requestPasswordResetAction(email)
      if (!result.success) {
        setError(result.error || "Unable to process request.")
        setLoading(false)
        return
      }

      setMessage(
        result.message || "Password reset instructions have been generated."
      )
      if (result.data?.devResetUrl) {
        setDevResetUrl(result.data.devResetUrl)
      }
      setLoading(false)
    } catch {
      setError("An unexpected error occurred.")
      setLoading(false)
    }
  }

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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-300">
          Remember your password?{" "}
          <Link
            href="/signin"
            className="font-bold text-[#2A6AED] hover:underline"
          >
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-lg sm:px-0">
        <Card className="auth-form-surface p-2 sm:p-4">
          <CardHeader className="space-y-1.5 pb-6">
            <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
              Forgot Password
            </CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
              Enter your registered email address to receive password reset
              instructions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="rounded-md py-3 text-sm">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="rounded-md border-emerald-500 bg-emerald-50 py-3 text-sm text-emerald-800">
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {devResetUrl && (
              <div className="space-y-1.5 rounded-md border border-blue-200 bg-blue-50/80 p-4 text-xs">
                <p className="font-bold text-[#2A6AED]">
                  Development Reset Link:
                </p>
                <Link
                  href={devResetUrl}
                  className="font-mono text-xs break-all text-[#2A6AED] underline"
                >
                  {devResetUrl}
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label
                  htmlFor="email"
                  className="text-xs font-bold text-slate-900 dark:text-slate-100"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="auth-control mt-1.5 h-11 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="auth-primary-action h-11 w-full text-sm shadow-xs"
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Send Password Reset Instructions
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
      </div>
    </AuthPageFrame>
  )
}
