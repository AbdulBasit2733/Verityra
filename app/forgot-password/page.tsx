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
    <div className="flex min-h-screen flex-col justify-center bg-[#F2F7FA] py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0784B5] text-white font-bold text-xl">
            V
          </div>
          <span className="font-heading text-2xl font-bold tracking-tight text-[#0784B5]">
            Verityra
          </span>
        </Link>
        <h2 className="text-center text-2xl font-extrabold tracking-tight text-[#0B192C]">
          Reset your password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Card className="border-[#D5E5F2] bg-white shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">Forgot Password</CardTitle>
            <CardDescription className="text-xs">
              Enter your registered email address to receive password reset instructions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4 py-2 text-xs">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="mb-4 py-2 text-xs border-emerald-500 bg-emerald-50 text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            {devResetUrl && (
              <div className="mb-4 p-3 rounded-lg bg-[#CADEEF]/40 border border-[#39ACE7] text-xs">
                <p className="font-semibold text-[#0784B5] mb-1">Development Reset Link:</p>
                <Link href={devResetUrl} className="text-[#0784B5] underline font-mono break-all">
                  Click here to open Reset Password page
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs font-medium text-[#0B192C]">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="candidate@example.com"
                  className="mt-1 border-[#D5E5F2] text-xs h-9 focus-visible:ring-[#39ACE7]"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold h-10 mt-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Send Reset Link
              </Button>
            </form>
          </CardContent>
          <CardFooter className="pt-0 justify-center">
            <Link href="/signin" className="text-xs text-[#4B6375] hover:text-[#0784B5] flex items-center gap-1">
              <ArrowLeft className="h-3 w-3" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
