"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { resetPasswordAction } from "@/actions/auth-actions"

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
    <Card className="border-slate-200/90 bg-white shadow-2xl shadow-blue-900/5 rounded-3xl p-2 sm:p-4">
      <CardHeader className="space-y-1.5 pb-6">
        <CardTitle className="text-2xl font-black text-slate-900">Set New Password</CardTitle>
        <CardDescription className="text-sm text-slate-500">
          Choose a strong password with letters, numbers, and symbols
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive" className="py-3 text-sm rounded-xl">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="py-3 text-sm border-emerald-500 bg-emerald-50 text-emerald-800 rounded-xl">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="password" className="text-xs font-bold text-slate-900">
              New Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-slate-200 pr-12 text-sm h-12 rounded-xl focus-visible:ring-[#2A6AED]/20 focus-visible:border-[#2A6AED]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-900">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="mt-1.5 border-slate-200 text-sm h-12 rounded-xl focus-visible:ring-[#2A6AED]/20 focus-visible:border-[#2A6AED]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-bold h-12 rounded-xl shadow-md shadow-blue-500/20 text-sm mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Reset & Save Password
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
  )
}

export default function ResetPasswordPage() {
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
          Create a new password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Suspense fallback={<div className="text-center py-12 text-sm text-slate-500">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
