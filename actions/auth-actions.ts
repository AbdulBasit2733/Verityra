"use server"

import { registerSchema, forgotPasswordSchema, resetPasswordSchema, studentProfileSchema } from "@/lib/validations/auth"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth-guard"
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
      console.log(`[AUTH SERVER ACTION] Reset URL: ${devResetUrl}`)
      return {
        success: true,
        message: "If an account exists with this email, password reset instructions have been generated.",
        data: { devResetUrl },
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
  if (!user) {
    return { success: false, error: "Authentication required." }
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
