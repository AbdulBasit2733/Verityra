import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role, UserStatus, type User } from "@prisma/client"
import { redirect } from "next/navigation"

const adminSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
} as const

export type PersistedAdminActor = Pick<User, "id" | "email" | "name" | "role" | "status">

export type PersistedAdminResult =
  | { success: true; user: PersistedAdminActor }
  | { success: false; error: string }

export function canProvisionDevelopmentAdmin(
  sessionUser: { id: string; email?: string | null; role: Role },
  credentials: { email?: string; password?: string },
  runtimeEnvironment = process.env.NODE_ENV
): boolean {
  const configuredEmail = credentials.email?.trim().toLowerCase()
  return (
    runtimeEnvironment === "development" &&
    sessionUser.id === "admin-demo-user-id" &&
    sessionUser.role === Role.ADMIN &&
    Boolean(configuredEmail && credentials.password?.trim()) &&
    sessionUser.email?.trim().toLowerCase() === configuredEmail
  )
}

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
})

export async function resolvePersistedAdminActor(
  sessionUser: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
): Promise<PersistedAdminResult> {
  if (sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  let actor = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: adminSelect,
  })

  if (!actor && sessionUser.id === "admin-demo-user-id") {
    const email = process.env.ADMIN_INITIAL_EMAIL?.trim().toLowerCase()
    const password = process.env.ADMIN_INITIAL_PASSWORD

    if (process.env.NODE_ENV !== "development") {
      return { success: false, error: "Development admin sessions cannot be used in this environment." }
    }
    if (!email || !password) {
      return { success: false, error: "Set ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD to provision the development admin." }
    }
    if (!canProvisionDevelopmentAdmin(sessionUser, { email, password })) {
      return { success: false, error: "The development admin session does not match the configured admin account." }
    }

    actor = await prisma.user.upsert({
      where: { email },
      create: {
        email,
        name: process.env.ADMIN_INITIAL_NAME?.trim() || "Verityra Admin (Local Dev)",
        passwordHash: await bcrypt.hash(password, 12),
        role: Role.ADMIN,
        status: UserStatus.ACTIVE,
      },
      update: {},
      select: adminSelect,
    })
  }

  if (!actor || actor.role !== Role.ADMIN || actor.status !== UserStatus.ACTIVE) {
    return { success: false, error: "An active persisted administrator account is required. Sign in with an administrator account." }
  }

  return { success: true, user: actor }
}

export async function requireAuth(returnUrl?: string) {
  const user = await getCurrentUser()
  if (!user) {
    const dest = returnUrl ? `/signin?callbackUrl=${encodeURIComponent(returnUrl)}` : "/signin"
    redirect(dest)
  }
  if (user.status === UserStatus.SUSPENDED) {
    redirect("/suspended")
  }
  return user
}

export async function requireAdmin(returnUrl?: string) {
  const user = await requireAuth(returnUrl)
  if (user.role !== Role.ADMIN) {
    redirect("/unauthorized")
  }
  return user
}

export async function requireStudent(returnUrl?: string) {
  const user = await requireAuth(returnUrl)
  if (user.role === Role.ADMIN) {
    redirect("/admin")
  }
  if (user.role !== Role.STUDENT) {
    redirect("/unauthorized")
  }
  return user
}

export { resolvePostLoginTarget } from "./auth-routing"
