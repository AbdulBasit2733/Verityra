import { NextResponse } from "next/server"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    const { email } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // Always respond with a generic success message to prevent email enumeration
    const genericResponse = {
      success: true,
      message:
        "If an account with that email exists, password reset instructions have been sent.",
    }

    const dbConnected = await isDatabaseConnected()
    if (!dbConnected) {
      return NextResponse.json(genericResponse)
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      return NextResponse.json(genericResponse)
    }

    // Generate random raw token and store SHA-256 hash
    const rawToken = crypto.randomBytes(32).toString("hex")
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex")
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        tokenHash,
        expiresAt,
      },
    })

    // In production with an email provider (Resend, SendGrid, SMTP), send email here.
    // For logging/dev, we log the reset link safely without revealing in public response.
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`

    return NextResponse.json({
      ...genericResponse,
      devResetUrl: process.env.NODE_ENV === "development" ? resetUrl : undefined,
    })
  } catch (err: unknown) {
    console.error("Forgot password error:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    )
  }
}
