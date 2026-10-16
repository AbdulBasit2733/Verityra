"use client"

import * as React from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  Loader2,
  User,
  ArrowLeft,
  ShieldCheck,
  GraduationCap,
  Mail,
  KeyRound,
  FileText,
  Lock,
  Calendar,
  CheckCircle2,
} from "lucide-react"
import { updateStudentProfileAction, changePasswordAction } from "@/actions/auth-actions"

interface StudentProfileProps {
  initialData: {
    name: string
    email: string
    educationLevel: string
    institution: string
    phoneNumber: string
    targetExam: string
    bio: string
    createdAt: string
  }
}

export function StudentProfileClient({ initialData }: StudentProfileProps) {
  const confirm = useConfirm()
  const { showError } = useGlobalError()

  // Profile Form State
  const [name, setName] = React.useState(initialData.name)
  const [educationLevel, setEducationLevel] = React.useState(initialData.educationLevel)
  const [institution, setInstitution] = React.useState(initialData.institution)
  const [targetExam, setTargetExam] = React.useState(initialData.targetExam)
  const [phoneNumber, setPhoneNumber] = React.useState(initialData.phoneNumber)
  const [bio, setBio] = React.useState(initialData.bio)
  const [savingProfile, setSavingProfile] = React.useState(false)

  // Password Form State
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [savingPassword, setSavingPassword] = React.useState(false)

  const displayName = name || initialData.name || "Candidate"
  const displayEmail = initialData.email || "candidate@verityra.com"
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CA"

  const formattedJoinDate = initialData.createdAt
    ? new Date(initialData.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Active"

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()

    const confirmed = await confirm({
      title: "Save Candidate Profile Updates?",
      description:
        "Your updated display name, academic examination target, and credentials will be saved and reflected across your evaluations and future leaderboard rankings.",
      confirmText: "Save Changes",
      cancelText: "Cancel",
      badgeText: "Academic Identity",
    })
    if (!confirmed) return

    setSavingProfile(true)

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
        showError({
          title: "Profile Update Failed",
          message: result.error || "Unable to update candidate profile.",
          code: "PROFILE_UPDATE_ERR",
        })
        setSavingProfile(false)
        return
      }

      toast.success("Profile updated successfully", {
        description: "Your academic details and display identity have been saved.",
      })
      setSavingProfile(false)
    } catch {
      showError({
        title: "Unexpected System Error",
        message: "An unexpected error occurred while saving your profile. Please try again.",
        code: "SYS_ERR",
      })
      setSavingProfile(false)
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      showError({
        title: "Password Mismatch",
        message: "The new password and confirmation password do not match.",
        code: "PWD_MISMATCH",
      })
      return
    }

    const confirmed = await confirm({
      title: "Update Account Password?",
      description:
        "Your account password will be securely re-hashed. You will use this new password on your next sign-in.",
      confirmText: "Update Password",
      cancelText: "Cancel",
      variant: "warning",
      badgeText: "Account Security",
    })
    if (!confirmed) return

    setSavingPassword(true)

    try {
      const result = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      })

      if (!result.success) {
        showError({
          title: "Password Change Failed",
          message: result.error || "Unable to update account password.",
          code: "PWD_CHANGE_ERR",
        })
        setSavingPassword(false)
        return
      }

      toast.success("Password changed successfully", {
        description: result.message || "Your new credentials are now active.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSavingPassword(false)
    } catch {
      showError({
        title: "Unexpected Security Error",
        message: "An unexpected error occurred while updating your password.",
        code: "SYS_ERR",
      })
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Flat Page Header */}
      <div className="space-y-1">
        <Link
          href="/student/dashboard"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#2A6AED] transition-colors mb-1"
        >
          <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
          Back to Candidate Dashboard
        </Link>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] tracking-tight">
          Candidate Profile & Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Manage your academic credentials, examination focus, and account security credentials.
        </p>
      </div>

      {/* Flat Divided Identity Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-slate-200 py-4 px-1">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#2A6AED] to-[#1D4ED8] text-white font-bold text-base flex items-center justify-center shrink-0 shadow-xs">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-[#0F172A] truncate">{displayName}</h2>
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 text-[10px] font-semibold px-2 py-0">
                Verified Candidate
              </Badge>
            </div>
            <p className="text-xs text-[#64748B] truncate flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
              {displayEmail}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
              Target Focus
            </span>
            <span className="font-bold text-[#0F172A]">{targetExam || "UPSC / State PCS"}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
              Submission Allowance
            </span>
            <span className="font-bold text-[#2A6AED]">3 Attempts / Series</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block">
              Member Since
            </span>
            <span className="font-medium text-slate-700 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-400" />
              {formattedJoinDate}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Interface */}
      <Tabs defaultValue="academic" className="w-full space-y-6">
        <TabsList variant="line" className="border-b border-slate-200/80 w-full justify-start gap-4 sm:gap-8 pb-0">
          <TabsTrigger value="academic" className="text-xs sm:text-sm font-semibold pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2A6AED] data-[state=active]:text-[#2A6AED]">
            <GraduationCap className="h-4 w-4 mr-1.5" />
            Academic & Target Focus
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm font-semibold pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2A6AED] data-[state=active]:text-[#2A6AED]">
            <KeyRound className="h-4 w-4 mr-1.5" />
            Security & Password
          </TabsTrigger>
          <TabsTrigger value="quota" className="text-xs sm:text-sm font-semibold pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2A6AED] data-[state=active]:text-[#2A6AED]">
            <FileText className="h-4 w-4 mr-1.5" />
            Three-Attempt Guarantee
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Academic & Personal Form */}
        <TabsContent value="academic" className="space-y-6 pt-2">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                Personal & Examination Focus
              </h3>
              <p className="text-xs text-[#64748B]">
                Update your candidate details below. Your target examination focus helps align your preparation tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs font-bold text-[#0F172A]">
                  Full Display Name
                </Label>
                <Input
                  id="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Candidate Name"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-[#0F172A]">
                  Registered Email Address (Read-only)
                </Label>
                <Input
                  id="email"
                  disabled
                  value={displayEmail}
                  className="h-10 rounded-lg border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="targetExam" className="text-xs font-bold text-[#0F172A]">
                  Target Examination
                </Label>
                <Input
                  id="targetExam"
                  value={targetExam}
                  onChange={(e) => setTargetExam(e.target.value)}
                  placeholder="e.g. UPSC CSE Mains, State PCS, Judicial Services"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="educationLevel" className="text-xs font-bold text-[#0F172A]">
                  Highest Academic Qualification
                </Label>
                <Input
                  id="educationLevel"
                  value={educationLevel}
                  onChange={(e) => setEducationLevel(e.target.value)}
                  placeholder="e.g. B.Tech, B.A. LL.B, M.A."
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="institution" className="text-xs font-bold text-[#0F172A]">
                  University / Institution
                </Label>
                <Input
                  id="institution"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g. Delhi University, National Law School"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phoneNumber" className="text-xs font-bold text-[#0F172A]">
                  Contact Number (Optional)
                </Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio" className="text-xs font-bold text-[#0F172A]">
                Preparation Notes & Optional Subjects
              </Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Optional subjects, focus syllabus areas, and answer-writing stamina goals..."
                rows={4}
                className="rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
              />
            </div>

            <Separator className="bg-slate-200" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Your uploaded handwritten booklets remain encrypted and strictly private to your account.
                </span>
              </div>
              <Button
                type="submit"
                disabled={savingProfile}
                className="w-full sm:w-auto bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-xs sm:text-sm h-10 px-6 rounded-lg shadow-xs"
              >
                {savingProfile ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <User className="h-4 w-4 mr-2" />
                )}
                Save Profile Changes
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab 2: Security & Password Form */}
        <TabsContent value="security" className="space-y-6 pt-2">
          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                Change Account Password
              </h3>
              <p className="text-xs text-[#64748B]">
                Ensure your account is protected with a strong, distinct password.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-bold text-[#0F172A]">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="newPassword" className="text-xs font-bold text-[#0F172A]">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-xs font-bold text-[#0F172A]">
                  Confirm New Password
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* Password Requirement Indicators */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs text-slate-600">
              <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                Password Requirements
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${newPassword.length >= 8 ? "text-emerald-600" : "text-slate-400"}`} />
                  Minimum 8 characters
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${/[A-Z]/.test(newPassword) ? "text-emerald-600" : "text-slate-400"}`} />
                  At least 1 uppercase letter
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${/[0-9]/.test(newPassword) ? "text-emerald-600" : "text-slate-400"}`} />
                  At least 1 number
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className={`h-3 w-3 ${/[^A-Za-z0-9]/.test(newPassword) ? "text-emerald-600" : "text-slate-400"}`} />
                  At least 1 special character
                </span>
              </div>
            </div>

            <Button
              type="submit"
              disabled={savingPassword}
              className="w-full sm:w-auto bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-xs sm:text-sm h-10 px-6 rounded-lg shadow-xs"
            >
              {savingPassword ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <KeyRound className="h-4 w-4 mr-2" />
              )}
              Update Password
            </Button>
          </form>
        </TabsContent>

        {/* Tab 3: Three-Attempt Guarantee Policy */}
        <TabsContent value="quota" className="space-y-5 pt-2">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#2A6AED]" />
              The Three-Attempt Examination Invariant
            </h3>
            <p className="text-xs text-[#64748B]">
              Every registered candidate receives a strict allowance of three accepted handwritten attempts per enrolled test series.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 text-[10px] font-bold">
                Attempt 1
              </Badge>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Diagnostic Baseline</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Attempt the test under strict timed examination conditions to benchmark your baseline pen-on-paper endurance, pacing, and diagrammatic presentation.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 text-[10px] font-bold">
                Attempt 2
              </Badge>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Rubric Rectification</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Study the itemized question-wise feedback and model answers to eliminate structural and conceptual gaps identified in your first submission.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
              <Badge className="bg-[#EFF6FF] text-[#2A6AED] border border-blue-200 text-[10px] font-bold">
                Attempt 3
              </Badge>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900">Exam-Ready Benchmark</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deliver your final polished submission. Your highest finalized score is eligible for inclusion on the public competitive leaderboard.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-200/80 bg-[#EFF6FF]/60 text-xs text-[#1E55C7] leading-relaxed">
            <p className="font-bold">Atomic Protection Guarantee:</p>
            <p className="mt-1 text-slate-600">
              Network drops or invalid uploads before final server confirmation never burn your attempt allowance. Only successfully confirmed, valid handwritten booklets count against your 3 attempts.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
