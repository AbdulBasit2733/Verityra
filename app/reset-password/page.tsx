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
    <Card className="border-[#D5E5F2] bg-white shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg">Reset Password</CardTitle>
        <CardDescription className="text-xs">
          Choose a strong password with letters, numbers, and symbols
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 py-2 text-xs">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 py-2 text-xs border-emerald-500 bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password" className="text-xs font-medium text-[#0B192C]">
              New Password
            </Label>
            <div className="relative mt-1">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-[#D5E5F2] pr-10 text-xs h-9 focus-visible:ring-[#39ACE7]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#4B6375] hover:text-[#0784B5]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <Label htmlFor="confirmPassword" className="text-xs font-medium text-[#0B192C]">
              Confirm New Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 border-[#D5E5F2] text-xs h-9 focus-visible:ring-[#39ACE7]"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold h-10 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update Password
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
  )
}

export default function ResetPasswordPage() {
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
          Set a new password
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="text-center py-10 text-xs text-[#4B6375]">Loading reset password form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}
