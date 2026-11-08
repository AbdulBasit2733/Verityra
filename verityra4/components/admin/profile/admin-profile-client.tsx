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
  Mail,
  KeyRound,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  FileCheck2,
  ExternalLink,
  BookOpen,
} from "lucide-react"
import { updateAdminProfileAction, changePasswordAction } from "@/actions/auth-actions"
import { PageHeader } from "@/components/ui/page-header"

interface AdminProfileProps {
  initialData: {
    name: string
    email: string
    role: string
    phoneNumber: string
    bio: string
    createdAt: string
    totalReviewsPerformed: number
  }
}

export function AdminProfileClient({ initialData }: AdminProfileProps) {
  const confirm = useConfirm()
  const { showError } = useGlobalError()

  // Profile Form State
  const [name, setName] = React.useState(initialData.name)
  const [phoneNumber, setPhoneNumber] = React.useState(initialData.phoneNumber)
  const [bio, setBio] = React.useState(initialData.bio)
  const [savingProfile, setSavingProfile] = React.useState(false)

  // Password Form State
  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [savingPassword, setSavingPassword] = React.useState(false)

  const displayName = name || initialData.name || "Administrator"
  const displayEmail = initialData.email || "admin@verityra.com"
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AD"

  const formattedJoinDate = initialData.createdAt
    ? new Date(initialData.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Active"

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault()

    const confirmed = await confirm({
      title: "Save Administrator Profile Updates?",
      description:
        "Your administrator display name and contact details will be updated in the system directory and attached to future audit logs.",
      confirmText: "Save Changes",
      cancelText: "Cancel",
      badgeText: "Admin Directory",
    })
    if (!confirmed) return

    setSavingProfile(true)

    try {
      const result = await updateAdminProfileAction({
        name,
        phoneNumber,
        bio,
      })

      if (!result.success) {
        showError({
          title: "Profile Update Failed",
          message: result.error || "Unable to update administrator profile.",
          code: "ADMIN_PROFILE_ERR",
        })
        setSavingProfile(false)
        return
      }

      toast.success("Administrator profile updated", {
        description: "Your administrative details and directory identity have been saved.",
      })
      setSavingProfile(false)
    } catch {
      showError({
        title: "Unexpected System Error",
        message: "An unexpected error occurred while saving your admin profile.",
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
      title: "Update Administrator Credentials?",
      description:
        "Your administrative access password will be securely re-hashed and logged to the security audit trail. Use your new password on subsequent logins.",
      confirmText: "Update Password",
      cancelText: "Cancel",
      variant: "warning",
      badgeText: "Security Credential",
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
          title: "Password Update Failed",
          message: result.error || "Unable to update administrator password.",
          code: "ADMIN_PWD_ERR",
        })
        setSavingPassword(false)
        return
      }

      toast.success("Credentials updated successfully", {
        description: result.message || "Your new administrative password is now active.",
      })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setSavingPassword(false)
    } catch {
      showError({
        title: "Unexpected Security Error",
        message: "An unexpected error occurred while updating your administrator password.",
        code: "SYS_ERR",
      })
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <PageHeader
        icon={User}
        title="Administrator Profile & Settings"
        subtitle="Viewing: Master Credentials, Governance Audit Log & Security Preferences"
        showRefresh={false}
      >
        <Link href="/admin">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Admin Overview
          </Button>
        </Link>
      </PageHeader>

      {/* Tabs Interface */}
      <Tabs defaultValue="profile" className="w-full space-y-6">
        <TabsList variant="line" className="border-b border-slate-200/80 w-full justify-start gap-4 sm:gap-8 pb-0">
          <TabsTrigger value="profile" className="text-xs sm:text-sm font-semibold pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2A6AED] data-[state=active]:text-[#2A6AED]">
            <User className="h-4 w-4 mr-1.5" />
            <span className="sm:hidden">Profile</span>
            <span className="hidden sm:inline">Administrator Profile</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs sm:text-sm font-semibold pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2A6AED] data-[state=active]:text-[#2A6AED]">
            <KeyRound className="h-4 w-4 mr-1.5" />
            <span className="sm:hidden">Security</span>
            <span className="hidden sm:inline">Security & Password</span>
          </TabsTrigger>
          <TabsTrigger value="protocols" className="text-xs sm:text-sm font-semibold pb-3 rounded-none border-b-2 border-transparent data-[state=active]:border-[#2A6AED] data-[state=active]:text-[#2A6AED]">
            <ShieldAlert className="h-4 w-4 mr-1.5" />
            <span className="sm:hidden">Governance</span>
            <span className="hidden sm:inline">Platform Invariants & Governance</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Admin Profile Form */}
        <TabsContent value="profile" className="space-y-6 pt-2">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                Administrative Identity & Office
              </h3>
              <p className="text-xs text-[#64748B]">
                Update your administrative display name and office designation. Changes are attached to all audit log records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="adminName" className="text-xs font-bold text-[#0F172A]">
                  Administrator Full Name
                </Label>
                <Input
                  id="adminName"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Administrator Name"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminEmail" className="text-xs font-bold text-[#0F172A]">
                  Official Email Address (Read-only)
                </Label>
                <Input
                  id="adminEmail"
                  disabled
                  value={displayEmail}
                  className="h-10 rounded-lg border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminRole" className="text-xs font-bold text-[#0F172A]">
                  System Role & Privileges
                </Label>
                <Input
                  id="adminRole"
                  disabled
                  value="Role.ADMIN — Full Governance Authority"
                  className="h-10 rounded-lg border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminPhone" className="text-xs font-bold text-[#0F172A]">
                  Emergency Escalation Contact (Optional)
                </Label>
                <Input
                  id="adminPhone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+91 11 2345 6789"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="adminBio" className="text-xs font-bold text-[#0F172A]">
                Office Designation & Subjective Expertise
              </Label>
              <Textarea
                id="adminBio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Controller of Examinations, Lead Evaluator for Public Administration, UPSC GS Paper I Reviewer..."
                rows={4}
                className="rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
              />
            </div>

            <Separator className="bg-slate-200" />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0" />
                <span>
                  All score adjustments and override actions are logged to the immutable PostgreSQL audit trail.
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
                Save Admin Profile
              </Button>
            </div>
          </form>
        </TabsContent>

        {/* Tab 2: Security & Password Form */}
        <TabsContent value="security" className="space-y-6 pt-2">
          <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
                Change Administrator Password
              </h3>
              <p className="text-xs text-[#64748B]">
                Administrator accounts require high-entropy passwords to safeguard examination confidentiality.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="adminCurrentPassword" className="text-xs font-bold text-[#0F172A]">
                  Current Administrator Password
                </Label>
                <Input
                  id="adminCurrentPassword"
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminNewPassword" className="text-xs font-bold text-[#0F172A]">
                  New Administrator Password
                </Label>
                <Input
                  id="adminNewPassword"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adminConfirmPassword" className="text-xs font-bold text-[#0F172A]">
                  Confirm New Password
                </Label>
                <Input
                  id="adminConfirmPassword"
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
                Password Security Criteria
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
              Update Administrator Credentials
            </Button>
          </form>
        </TabsContent>

        {/* Tab 3: Platform Governance & Invariants */}
        <TabsContent value="protocols" className="space-y-6 pt-2">
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-[#2A6AED]" />
              Core Platform Business Invariants
            </h3>
            <p className="text-xs text-[#64748B]">
              Every administrative action is bound by Verityra&apos;s architectural and domain invariants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-slate-900">1. Strict Three-Attempt Limit</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Active Invariant</Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Protected by atomic database transactions and unique constraints. Overrides require audited justifications via the Candidate Management console.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-slate-900">2. Instruction Isolation</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Strictly Guarded</Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Private evaluation rubrics and model answers are never serialized or returned in student-facing query projections.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-slate-900">3. Zero-AI Marketing Policy</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Brand Rule</Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Public materials strictly emphasize pen-and-paper stamina, margin alignment, and objective rubrics. Automated evaluation is purely an internal pipeline detail.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs sm:text-sm text-slate-900">4. Immutable Audit Trail</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Audited</Badge>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every score adjustment, status change, and attempt override logs the administrator ID, timestamp, and previous-versus-new values.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/admin/test-series">
              <Button variant="outline" className="h-9 text-xs rounded-lg gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Manage Test Series
              </Button>
            </Link>
            <Link href="/admin/submissions">
              <Button variant="outline" className="h-9 text-xs rounded-lg gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5" />
                Review Submissions
              </Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline" className="h-9 text-xs rounded-lg gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                View Audit Trail
              </Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
