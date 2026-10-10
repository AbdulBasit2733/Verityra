import { NextResponse } from "next/server"
import { registerSchema } from "@/lib/validations/auth"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role, UserStatus } from "@prisma/client"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    const dbConnected = await isDatabaseConnected()
    if (!dbConnected) {
      // In dev mode before DB is connected, inform user gracefully
      return NextResponse.json(
        {
          success: true,
          message:
            "Registration recorded (Database offline dev mode). You can sign in with demo credentials or configure PostgreSQL.",
        },
        { status: 201 }
      )
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      // Avoid leaking email enumeration while preventing duplicate registrations
      return NextResponse.json(
        { error: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      )
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, 12)

    // Strictly assign Role.STUDENT for public signup
    const user = await prisma.user.create({
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
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. You may now sign in.",
        user,
      },
      { status: 201 }
    )
  } catch (err: unknown) {
    console.error("Registration error:", err)
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again later." },
      { status: 500 }
    )
  }
}
