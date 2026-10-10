"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck, User } from "lucide-react"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/student/dashboard"

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

      router.push(callbackUrl)
      router.refresh()
    } catch {
      setError("An unexpected error occurred. Please try again.")
      setLoading(false)
    }
  }

  function fillDemoAdmin() {
    setEmail("admin@verityra.com")
    setPassword("AdminSecurePassword123!")
  }

  function fillDemoStudent() {
    setEmail("student@verityra.com")
    setPassword("StudentSecurePassword123!")
  }

  return (
    <Card className="border-[#D5E5F2] bg-white shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-lg">Sign In</CardTitle>
        <CardDescription className="text-xs">
          Enter your registered credentials to access your tests and records
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 py-2 text-xs">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
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

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-xs font-medium text-[#0B192C]">
                Password
              </Label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-[#0784B5] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
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

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold h-10 mt-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Sign In
          </Button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#D5E5F2]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-[#4B6375]">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full border-[#D5E5F2] text-xs font-medium h-9 hover:bg-[#CADEEF]/20 flex items-center justify-center gap-2"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.18 3.66-9.15z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.43 7.37 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.17 0 9.99 0 12s.46 3.83 1.26 5.42l4.02-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.57 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          Continue with Google
        </Button>

        {/* Quick Demo Credentials helper */}
        <div className="mt-6 rounded-lg bg-[#CADEEF]/30 p-3 border border-[#9BD4E4] text-[11px] space-y-2">
          <p className="font-semibold text-[#0784B5]">Quick Demo Login Shortcuts:</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={fillDemoStudent}
              className="bg-white border-[#39ACE7] text-[#0784B5] text-[11px] h-7"
            >
              <User className="h-3 w-3 mr-1" />
              Fill Demo Student
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={fillDemoAdmin}
              className="bg-white border-[#0784B5] text-[#0784B5] text-[11px] h-7"
            >
              <ShieldCheck className="h-3 w-3 mr-1" />
              Fill Demo Admin
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 justify-center">
        <Link href="/" className="text-xs text-[#4B6375] hover:text-[#0784B5] flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" />
          Back to Home
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function SignInPage() {
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
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-xs text-[#4B6375]">
          Or{" "}
          <Link href="/signup" className="font-semibold text-[#0784B5] hover:underline">
            create a new candidate account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense fallback={<div className="text-center py-10 text-xs text-[#4B6375]">Loading sign in form...</div>}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}
