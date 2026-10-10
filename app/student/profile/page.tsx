"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, User, ArrowLeft } from "lucide-react"
import { updateStudentProfileAction } from "@/actions/auth-actions"
import { useSession } from "next-auth/react"

export default function StudentProfilePage() {
  const { data: session } = useSession()

  const [name, setName] = useState(session?.user?.name || "")
  const [educationLevel, setEducationLevel] = useState("Graduate / Aspirant")
  const [institution, setInstitution] = useState("")
  const [targetExam, setTargetExam] = useState("UPSC CSE Mains / State PCS")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [bio, setBio] = useState("")

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateStudentProfileAction({
        name,
        educationLevel,
        institution,
        targetExam,
        phoneNumber,
        bio,
      })

      if (!result.success) {
        setError(result.error || "Failed to update profile.")
        setLoading(false)
        return
      }

      setSuccess(result.message || "Profile updated successfully.")
      setLoading(false)
    } catch {
      setError("An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F2F7FA]">
      <Navbar />

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center text-xs font-medium text-[#4B6375] hover:text-[#0784B5] transition-colors"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Dashboard
          </Link>

          <div>
            <h1 className="text-2xl font-extrabold text-[#0B192C]">Candidate Profile</h1>
            <p className="text-xs text-[#4B6375] mt-1">
              Manage your academic background, target examinations, and contact records.
            </p>
          </div>

          <Card className="border-[#D5E5F2] bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base text-[#0B192C] flex items-center gap-2">
                <User className="h-4 w-4 text-[#0784B5]" />
                Personal & Academic Details
              </CardTitle>
              <CardDescription className="text-xs text-[#4B6375]">
                Information displayed on candidate records and leaderboard entries.
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-xs font-medium text-[#0B192C]">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Candidate Name"
                      className="mt-1 border-[#D5E5F2] text-xs h-9"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs font-medium text-[#0B192C]">
                      Email Address (Read-only)
                    </Label>
                    <Input
                      id="email"
                      disabled
                      value={session?.user?.email || "candidate@verityra.com"}
                      className="mt-1 border-[#D5E5F2] bg-[#F2F7FA] text-xs h-9 text-[#4B6375]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="targetExam" className="text-xs font-medium text-[#0B192C]">
                      Target Examination
                    </Label>
                    <Input
                      id="targetExam"
                      value={targetExam}
                      onChange={(e) => setTargetExam(e.target.value)}
                      placeholder="e.g. UPSC CSE, Judiciary, State PCS"
                      className="mt-1 border-[#D5E5F2] text-xs h-9"
                    />
                  </div>

                  <div>
                    <Label htmlFor="educationLevel" className="text-xs font-medium text-[#0B192C]">
                      Highest Qualification
                    </Label>
                    <Input
                      id="educationLevel"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      placeholder="e.g. B.Tech, B.A. LL.B, M.A."
                      className="mt-1 border-[#D5E5F2] text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="institution" className="text-xs font-medium text-[#0B192C]">
                      Institution / University
                    </Label>
                    <Input
                      id="institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="e.g. Delhi University"
                      className="mt-1 border-[#D5E5F2] text-xs h-9"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phoneNumber" className="text-xs font-medium text-[#0B192C]">
                      Contact Number (Optional)
                    </Label>
                    <Input
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="mt-1 border-[#D5E5F2] text-xs h-9"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio" className="text-xs font-medium text-[#0B192C]">
                    Preparation Notes / Aspirant Bio
                  </Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Focus areas, optional subjects, and study schedule notes..."
                    rows={3}
                    className="mt-1 border-[#D5E5F2] text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold text-xs h-9 px-6"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Profile Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
