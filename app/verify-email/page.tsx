"use client"

import { Suspense, useEffect, useState } from "react"
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

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const initialEmail = searchParams.get("email") || ""

  const [email, setEmail] = useState(initialEmail)
  const [status, setStatus] = useState<"verifying" | "verified" | "error" | "idle">(
    token && initialEmail ? "verifying" : "idle"
  )
  const [message, setMessage] = useState<string | null>(null)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendFeedback, setResendFeedback] = useState<string | null>(null)
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !initialEmail) return

    let cancelled = false
    setStatus("verifying")
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
        setMessage("Unable to verify email address right now. Please try again.")
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
          result.message || "A new verification link has been sent to your inbox."
        )
        if (result.data?.devVerificationUrl) {
          setDevVerificationUrl(result.data.devVerificationUrl)
        }
      }
    } catch {
      setStatus("error")
      setMessage("An unexpected error occurred while resending the verification link.")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <Card className="border-slate-200/90 bg-white shadow-2xl shadow-blue-900/5 rounded-3xl p-2 sm:p-4">
      <CardHeader className="space-y-1.5 pb-6">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#2A6AED] mb-2">
          <MailCheck className="h-5 w-5" />
        </div>
        <CardTitle className="text-2xl font-black text-slate-900">
          Email Verification
        </CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Confirm your candidate email address for account security and evaluation notifications
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {status === "verifying" && (
          <div className="flex flex-col items-center justify-center py-8 space-y-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2A6AED]" />
            <p className="text-sm font-semibold text-slate-700">
              Verifying your email address...
            </p>
          </div>
        )}

        {status === "verified" && (
          <div className="space-y-5">
            <Alert className="py-4 text-sm border-emerald-500 bg-emerald-50 text-emerald-800 rounded-2xl">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
              <AlertDescription className="font-semibold">
                {message || "Your email address has been verified successfully."}
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/student/dashboard" className="w-full">
                <Button className="w-full h-11 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-bold">
                  Continue to Student Dashboard
                </Button>
              </Link>
              <Link href="/signin" className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-11 rounded-xl border-slate-200 font-semibold"
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
              <Alert variant="destructive" className="py-3 text-sm rounded-xl">
                <ShieldAlert className="h-4 w-4 mr-2" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {resendFeedback && (
              <Alert className="py-3 text-sm border-emerald-500 bg-emerald-50 text-emerald-800 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
                <AlertDescription>{resendFeedback}</AlertDescription>
              </Alert>
            )}

            {devVerificationUrl && (
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs space-y-1.5">
                <p className="font-bold text-[#2A6AED]">Development Verification Link:</p>
                <a
                  href={devVerificationUrl}
                  className="text-[#2A6AED] underline font-mono break-all text-xs"
                >
                  {devVerificationUrl}
                </a>
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-4">
              <div>
                <Label htmlFor="verify-email" className="text-xs font-bold text-slate-900">
                  Registered Email Address
                </Label>
                <div className="mt-1.5">
                  <Input
                    id="verify-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="candidate@example.com"
                    className="h-11 rounded-xl"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={resendLoading}
                className="w-full h-11 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-bold"
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
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
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
    <div className="flex min-h-screen flex-col justify-center bg-slate-50/70 py-16 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6 group">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#2A6AED] to-[#1D4ED8] text-white font-black text-2xl shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-105">
            V
          </div>
          <span className="font-heading text-3xl font-black tracking-tight text-slate-900 group-hover:text-[#2A6AED] transition-colors">
            Verityra
          </span>
        </Link>
      </div>

      <div className="mt-4 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Suspense
          fallback={
            <Card className="border-slate-200/90 bg-white shadow-2xl rounded-3xl p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-[#2A6AED] mx-auto" />
            </Card>
          }
        >
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  )
}
