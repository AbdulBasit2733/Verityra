"use client"

import { useState } from "react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { registerStudentAction } from "@/actions/auth-actions"

export default function SignUpPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      // Execute Server Action directly on server
      const result = await registerStudentAction({
        name,
        email,
        password,
        confirmPassword,
      })

      if (!result.success) {
        setError(result.error || "Failed to create account.")
        setLoading(false)
        return
      }

      setSuccess(result.message || "Registration successful! You may now sign in.")
      setLoading(false)

      setTimeout(() => {
        router.push("/signin")
      }, 1500)
    } catch (err) {
      setError("An unexpected server error occurred. Please try again.")
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
          Create candidate account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Already registered?{" "}
          <Link href="/signin" className="font-bold text-[#2A6AED] hover:underline">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <Card className="border-slate-200/90 bg-white shadow-2xl shadow-blue-900/5 rounded-3xl p-2 sm:p-4">
          <CardHeader className="space-y-1.5 pb-6">
            <CardTitle className="text-2xl font-black text-slate-900">Candidate Registration</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Candidate accounts receive student privileges for test series practice
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-xs font-bold text-slate-900">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="mt-1.5 border-slate-200 text-sm h-12 rounded-xl focus-visible:ring-[#2A6AED]/20 focus-visible:border-[#2A6AED]"
                />
              </div>

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

              <div>
                <Label htmlFor="password" className="text-xs font-bold text-slate-900">
                  Password
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters with symbol & number"
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
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="mt-1.5 border-slate-200 text-sm h-12 rounded-xl focus-visible:ring-[#2A6AED]/20 focus-visible:border-[#2A6AED]"
                />
              </div>

              <p className="text-xs text-slate-500 pt-1 leading-relaxed">
                Password must contain at least 8 characters, an uppercase letter, a number, and a special character.
              </p>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-bold h-12 rounded-xl shadow-md shadow-blue-500/20 text-sm mt-2"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Create Candidate Account
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider">
                <span className="bg-white px-3 text-slate-400">Or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => signIn("google", { callbackUrl: "/student/dashboard" })}
              className="w-full border-slate-200 text-sm font-semibold h-12 rounded-xl hover:bg-slate-50 flex items-center justify-center gap-3 text-slate-700 shadow-xs"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
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
          </CardContent>
          <CardFooter className="pt-2 justify-center">
            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-[#2A6AED] flex items-center gap-1.5 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
