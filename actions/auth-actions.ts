"use server"

import {
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  studentProfileSchema,
  adminProfileSchema,
  changePasswordSchema,
} from "@/lib/validations/auth"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { getCurrentUser, resolvePersistedAdminActor } from "@/lib/auth-guard"
import bcrypt from "bcryptjs"
import crypto from "crypto"
import { Role, UserStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export type ActionResult<T = unknown> = {
  success: boolean
  message?: string
  error?: string
  data?: T
}

/**
 * Server Action: Student Registration
 * Enforces STUDENT role only, unique email, bcrypt hash.
 */
export async function registerStudentAction(formData: {
  name: string
  email: string
  password: string
  confirmPassword: string
}): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(formData)
  if (!parsed.success) {
    const errorMsg = parsed.error.issues[0]?.message || "Invalid input data."
    return { success: false, error: errorMsg }
  }

  const { name, email, password } = parsed.data
  const normalizedEmail = email.toLowerCase().trim()

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: true,
      message: "Registration received (PostgreSQL offline dev mode). Sign in using demo student or configure DATABASE_URL.",
    }
  }

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  })

  if (existing) {
    return {
      success: false,
      error: "An account with this email address already exists. Please sign in instead.",
    }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  // Strictly enforce Role.STUDENT
  await prisma.user.create({
    data: {
      name,
      email: normalizedEmail,
      passwordHash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
      profile: {
        create: {},
      },
    },
  })

  return {
    success: true,
    message: "Your account has been created successfully. You may now sign in.",
  }
}

/**
 * Server Action: Request Password Reset
 * Generates secure token, avoids email enumeration.
 */
export async function requestPasswordResetAction(email: string): Promise<ActionResult<{ devResetUrl?: string }>> {
  const parsed = forgotPasswordSchema.safeParse({ email })
  if (!parsed.success) {
    return { success: false, error: "Please provide a valid email address." }
  }

  const normalizedEmail = email.toLowerCase().trim()
  const dbConnected = await isDatabaseConnected()

  if (dbConnected) {
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (user) {
      const rawToken = crypto.randomBytes(32).toString("hex")
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiry

      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          tokenHash,
          expiresAt,
        },
      })

      const devResetUrl = `/reset-password?token=${rawToken}`

      return {
        success: true,
        message: "If an account exists with this email, password reset instructions have been generated.",
        // Only include devResetUrl in development mode for security
        ...(process.env.NODE_ENV === "development" && {
          data: { devResetUrl },
        }),
      }
    }
  }

  return {
    success: true,
    message: "If an account exists with this email, password reset instructions have been generated.",
  }
}

/**
 * Server Action: Reset Password
 * Verifies token hash and updates password.
 */
export async function resetPasswordAction(data: {
  token: string
  password: string
  confirmPassword: string
}): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input." }
  }

  const { token, password } = parsed.data
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: true,
      message: "Password reset successful (development mode). You can now sign in.",
    }
  }

  const resetRecord = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  })

  if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
    return {
      success: false,
      error: "This password reset link is invalid or has expired. Please request a new one.",
    }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.$transaction([
    prisma.user.update({
      where: { email: resetRecord.email },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    }),
  ])

  return {
    success: true,
    message: "Your password has been reset successfully. You can now sign in with your new password.",
  }
}

/**
 * Server Action: Update Student Profile
 */
export async function updateStudentProfileAction(profileData: {
  name: string
  educationLevel?: string
  institution?: string
  phoneNumber?: string
  targetExam?: string
  bio?: string
}): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.STUDENT) {
    return { success: false, error: "Candidate authorization required." }
  }

  const parsed = studentProfileSchema.safeParse(profileData)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid profile data." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return { success: true, message: "Profile updated successfully (dev mode)." }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { name: parsed.data.name },
    }),
    prisma.studentProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        educationLevel: parsed.data.educationLevel,
        institution: parsed.data.institution,
        phoneNumber: parsed.data.phoneNumber,
        targetExam: parsed.data.targetExam,
        bio: parsed.data.bio,
      },
      update: {
        educationLevel: parsed.data.educationLevel,
        institution: parsed.data.institution,
        phoneNumber: parsed.data.phoneNumber,
        targetExam: parsed.data.targetExam,
        bio: parsed.data.bio,
      },
    }),
  ])

  revalidatePath("/student/profile")
  revalidatePath("/student")

  return { success: true, message: "Profile updated successfully." }
}

/**
 * Server Action: Get Student Profile Data
 */
export async function getStudentProfileAction(): Promise<ActionResult<{
  name: string
  email: string
  educationLevel: string
  institution: string
  phoneNumber: string
  targetExam: string
  bio: string
  createdAt: string
}>> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.STUDENT) {
    return { success: false, error: "Candidate authorization required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: true,
      data: {
        name: user.name || "Demo Candidate",
        email: user.email || "student@verityra.com",
        educationLevel: "Graduate / Aspirant",
        institution: "State University",
        phoneNumber: "+91 98765 43210",
        targetExam: "UPSC CSE Mains / State PCS",
        bio: "Focused on GS Paper I & II and public administration optional.",
        createdAt: new Date().toISOString(),
      },
    }
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  })

  if (!dbUser) {
    return { success: false, error: "Candidate record not found." }
  }

  return {
    success: true,
    data: {
      name: dbUser.name || "",
      email: dbUser.email || "",
      educationLevel: dbUser.profile?.educationLevel || "",
      institution: dbUser.profile?.institution || "",
      phoneNumber: dbUser.profile?.phoneNumber || "",
      targetExam: dbUser.profile?.targetExam || "",
      bio: dbUser.profile?.bio || "",
      createdAt: dbUser.createdAt.toISOString(),
    },
  }
}

/**
 * Server Action: Get Admin Profile Data
 */
export async function getAdminProfileAction(): Promise<ActionResult<{
  name: string
  email: string
  role: string
  phoneNumber: string
  bio: string
  createdAt: string
  totalReviewsPerformed: number
}>> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Administrator authorization required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: true,
      data: {
        name: user.name || "System Administrator",
        email: user.email || "admin@verityra.com",
        role: "ADMIN",
        phoneNumber: "+91 11 2345 6789",
        bio: "Lead Controller of Examinations and Evaluation Reviewer.",
        createdAt: new Date().toISOString(),
        totalReviewsPerformed: 12,
      },
    }
  }

  const actor = await resolvePersistedAdminActor(user)
  if (!actor.success) return { success: false, error: actor.error }

  const [dbUser, reviewCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: actor.user.id },
      include: { profile: true },
    }),
    prisma.auditLog.count({
      where: { adminId: actor.user.id },
    }),
  ])

  if (!dbUser) {
    return { success: false, error: "Administrator record not found." }
  }

  return {
    success: true,
    data: {
      name: dbUser.name || "Administrator",
      email: dbUser.email || "",
      role: dbUser.role,
      phoneNumber: dbUser.profile?.phoneNumber || "",
      bio: dbUser.profile?.bio || "",
      createdAt: dbUser.createdAt.toISOString(),
      totalReviewsPerformed: reviewCount,
    },
  }
}

/**
 * Server Action: Update Admin Profile
 */
export async function updateAdminProfileAction(data: {
  name: string
  phoneNumber?: string
  bio?: string
}): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Administrator authorization required." }
  }

  const parsed = adminProfileSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid input data." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return { success: true, message: "Admin profile updated (development mode)." }
  }

  const actor = await resolvePersistedAdminActor(user)
  if (!actor.success) return { success: false, error: actor.error }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: actor.user.id },
      data: { name: parsed.data.name },
    }),
    prisma.studentProfile.upsert({
      where: { userId: actor.user.id },
      create: {
        userId: actor.user.id,
        phoneNumber: parsed.data.phoneNumber,
        bio: parsed.data.bio,
      },
      update: {
        phoneNumber: parsed.data.phoneNumber,
        bio: parsed.data.bio,
      },
    }),
    prisma.auditLog.create({
      data: {
        adminId: actor.user.id,
        action: "UPDATE_ADMIN_PROFILE",
        targetType: "USER",
        targetId: actor.user.id,
        details: JSON.stringify({
          name: parsed.data.name,
          updatedAt: new Date().toISOString(),
        }),
      },
    }),
  ])

  revalidatePath("/admin/profile")
  revalidatePath("/admin")

  return { success: true, message: "Admin profile and credentials updated successfully." }
}

/**
 * Server Action: Change Password (both Student and Admin)
 */
export async function changePasswordAction(data: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user) {
    return { success: false, error: "Authentication required to update password." }
  }

  const parsed = changePasswordSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "Invalid password data." }
  }

  const { currentPassword, newPassword } = parsed.data

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return { success: true, message: "Password updated successfully (development mode)." }
  }

  let userId = user.id
  if (user.role === Role.ADMIN) {
    const actor = await resolvePersistedAdminActor(user)
    if (!actor.success) return { success: false, error: actor.error }
    userId = actor.user.id
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!dbUser || !dbUser.passwordHash) {
    return {
      success: false,
      error: "Account password could not be verified. If you signed in via OAuth, you do not have a local password.",
    }
  }

  const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash)
  if (!isValid) {
    return { success: false, error: "The current password you entered is incorrect." }
  }

  const newHash = await bcrypt.hash(newPassword, 12)

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  })

  // If admin, log security change to audit log
  if (user.role === Role.ADMIN) {
    await prisma.auditLog.create({
      data: {
        adminId: userId,
        action: "PASSWORD_CHANGED",
        targetType: "SECURITY",
        targetId: userId,
        details: JSON.stringify({ timestamp: new Date().toISOString() }),
      },
    })
  }

  return {
    success: true,
    message: "Your password has been changed successfully. Use your new password on your next sign in.",
  }
}
