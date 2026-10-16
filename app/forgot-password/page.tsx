"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { requestPasswordResetAction } from "@/actions/auth-actions"

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

      setMessage(result.message || "Password reset instructions have been generated.")
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
        <h2 className="text-center text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link href="/signin" className="font-bold text-[#2A6AED] hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card className="border-slate-200/90 bg-white shadow-2xl shadow-blue-900/5 rounded-3xl p-2 sm:p-4">
          <CardHeader className="space-y-1.5 pb-6">
            <CardTitle className="text-2xl font-black text-slate-900">Forgot Password</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Enter your registered email address to receive password reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="py-3 text-sm rounded-xl">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="py-3 text-sm border-emerald-500 bg-emerald-50 text-emerald-800 rounded-xl">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {devResetUrl && (
              <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs space-y-1.5">
                <p className="font-bold text-[#2A6AED]">Development Reset Link:</p>
                <Link href={devResetUrl} className="text-[#2A6AED] underline font-mono break-all text-xs">
                  {devResetUrl}
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-xs font-bold text-slate-900">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="mt-1.5 border-slate-200 text-sm h-12 rounded-xl focus-visible:ring-[#2A6AED]/20 focus-visible:border-[#2A6AED]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-bold h-12 rounded-xl shadow-md shadow-blue-500/20 text-sm"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Password Reset Instructions
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-2 justify-center">
            <Link href="/signin" className="text-xs font-semibold text-slate-500 hover:text-[#2A6AED] flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
