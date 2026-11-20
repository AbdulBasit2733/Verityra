"use client"

import { Suspense, useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
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
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  MailCheck,
  RefreshCw,
  ShieldAlert,
} from "lucide-react"
import {
  resendVerificationEmailAction,
  verifyEmailAction,
} from "@/actions/auth-actions"
import { AuthPageFrame } from "@/components/layout/auth/auth-page-frame"
import { BRAND_CONFIG } from "@/lib/brand"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const initialEmail = searchParams.get("email") || ""

  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<
    "verifying" | "verified" | "error" | "idle"
  >(token && initialEmail ? "verifying" : "idle")
  const [message, setMessage] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendFeedback, setResendFeedback] = useState<string | null>(null)
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(
    null
  )

  useEffect(() => {
    if (!token || !initialEmail) return

    let cancelled = false
    verifyEmailAction({ email: initialEmail, token })
      .then((res) => {
        if (cancelled) return
        if (res.success) {
          setStatus("verified")
          setMessage(res.message || "Your email address has been verified.")
        } else {
          setStatus("error")
          setMessage(res.error || "Verification link is invalid or expired.")
        }
      })
      .catch(() => {
        if (cancelled) return
        setStatus("error")
        setMessage(
          "Unable to verify email address right now. Please try again."
        )
      })

    return () => {
      cancelled = true
    }
  }, [token, initialEmail])

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return

    setResendLoading(true)
    setResendFeedback(null)
    setDevVerificationUrl(null)

    try {
      const result = await resendVerificationEmailAction(email)
      if (!result.success) {
        setStatus("error")
        setMessage(result.error || "Could not resend verification email.")
      } else {
        setResendFeedback(
          result.message ||
            "A new verification link has been sent to your inbox."
        )
        if (result.data?.devVerificationUrl) {
          setDevVerificationUrl(result.data.devVerificationUrl)
        }
      }
    } catch {
      setStatus("error")
      setMessage(
        "An unexpected error occurred while resending the verification link."
      )
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Card className="auth-form-surface p-2 sm:p-4">
      <CardHeader className="space-y-1.5 pb-6">
        <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-[#2A6AED]">
          <MailCheck className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-black text-slate-900 dark:text-white">
          Email Verification
        </CardTitle>
        <CardDescription className="text-sm text-slate-500 dark:text-slate-300">
          Confirm your candidate email address for account security and
          evaluation notifications
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {status === "verifying" && (
          <div className="flex flex-col items-center justify-center space-y-3 py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2A6AED]" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Verifying your email address...
            </p>
          </div>
        )}

        {status === "verified" && (
          <div className="space-y-5">
            <Alert className="rounded-md border-emerald-500 bg-emerald-50 py-4 text-sm text-emerald-800">
              <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
              <AlertDescription className="font-semibold">
                {message ||
                  "Your email address has been verified successfully."}
              </AlertDescription>
            </Alert>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/student/dashboard" className="w-full">
                <Button className="h-11 w-full rounded-md bg-[#2A6AED] font-bold text-white hover:bg-[#1E55C7]">
                  Continue to Student Dashboard
                </Button>
              </Link>
              <Link href="/signin" className="w-full">
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-md border-slate-200 font-semibold"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        )}

        {(status === "error" || status === "idle") && (
          <div className="space-y-5">
            {status === "error" && message && (
              <Alert variant="destructive" className="rounded-md py-3 text-sm">
                <ShieldAlert className="mr-2 h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {resendFeedback && (
              <Alert className="rounded-md border-emerald-500 bg-emerald-50 py-3 text-sm text-emerald-800">
                <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
                <AlertDescription>{resendFeedback}</AlertDescription>
              </Alert>
            )}

            {devVerificationUrl && (
              <div className="space-y-1.5 rounded-md border border-blue-200 bg-blue-50/80 p-4 text-xs">
                <p className="font-bold text-[#2A6AED]">
                  Development Verification Link:
                </p>
                <a
                  href={devVerificationUrl}
                  className="font-mono text-xs break-all text-[#2A6AED] underline"
                >
                  {devVerificationUrl}
                </a>
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-4">
              <div>
                <Label
                  htmlFor="verify-email"
                  className="text-xs font-bold text-slate-900 dark:text-slate-100"
                >
                  Registered Email Address
                </Label>
                <div className="mt-1.5">
                  <Input
                    id="verify-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="h-11 rounded-md"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={resendLoading}
                className="h-11 w-full rounded-md bg-[#2A6AED] font-bold text-white hover:bg-[#1E55C7]"
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Verification Link...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Send Verification Link
                  </>
                )}
              </Button>
            </form>
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t border-slate-100 pt-4">
        <Link
          href="/signin"
          className="inline-flex items-center text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Sign In
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function VerifyEmailPage() {
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
      </div>

      <div className="mt-4 px-4 sm:mx-auto sm:w-full sm:max-w-lg sm:px-0">
        <Suspense
          fallback={
            <Card className="auth-form-surface p-8 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#2A6AED]" />
            </Card>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </AuthPageFrame>
  )
}
