import { cache } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Role, UserStatus, type User } from "@prisma/client"
import { redirect } from "next/navigation"

const adminSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
} as const

const studentSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  status: true,
} as const

export type PersistedAdminActor = Pick<
  User,
  "id" | "email" | "name" | "role" | "status"
>
export type PersistedStudentActor = Pick<
  User,
  "id" | "email" | "name" | "role" | "status"
>

export type PersistedAdminResult =
  | { success: true; user: PersistedAdminActor }
  | { success: false; error: string }

export const getCurrentUser = cache(async () => {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
})

export class PersistedUserLookupError extends Error {
  constructor(
    message = "Database connection unavailable during user resolution."
  ) {
    super(message)
    this.name = "PersistedUserLookupError"
  }
}

/**
 * Resolves the authenticated user from the database with self-healing fallback to email.
 * This guarantees foreign-key integrity for database inserts (payments, registrations, submissions).
 * Throws PersistedUserLookupError if the database is unreachable, distinguishing outages from unknown users.
 */
export const getPersistedCurrentUser = cache(
  async (): Promise<PersistedStudentActor | null> => {
    const sessionUser = await getCurrentUser()
    if (!sessionUser) return null

    let dbErrorOccurred = false

    // 1. Primary lookup by session user ID
    if (sessionUser.id) {
      try {
        const userById = await prisma.user.findUnique({
          where: { id: sessionUser.id },
          select: studentSelect,
        })
        if (userById) {
          return userById.status !== UserStatus.SUSPENDED ? userById : null
        }
      } catch (err) {
        dbErrorOccurred = true
        console.warn("[getPersistedCurrentUser] Lookup by ID error:", err)
      }
    }

    // 2. Self-healing fallback lookup by email (resolves OAuth provider ID mismatch or stale session)
    if (sessionUser.email) {
      const normalizedEmail = sessionUser.email.toLowerCase().trim()
      try {
        const userByEmail = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          select: studentSelect,
        })
        if (userByEmail) {
          return userByEmail.status !== UserStatus.SUSPENDED
            ? userByEmail
            : null
        }
      } catch (err) {
        dbErrorOccurred = true
        console.warn("[getPersistedCurrentUser] Lookup by email error:", err)
      }
    }

    if (dbErrorOccurred) {
      throw new PersistedUserLookupError()
    }

    return null
  }
)

export async function resolvePersistedAdminActor(
  sessionUser: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
): Promise<PersistedAdminResult> {
  if (sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const actor = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: adminSelect,
  })

  if (
    !actor ||
    actor.role !== Role.ADMIN ||
    actor.status !== UserStatus.ACTIVE
  ) {
    return {
      success: false,
      error:
        "An active persisted administrator account is required. Sign in with an administrator account.",
    }
  }

  return { success: true, user: actor }
}

export async function requireAuth(returnUrl?: string) {
  const user = await getCurrentUser()
  if (!user) {
    const dest = returnUrl
      ? `/signin?callbackUrl=${encodeURIComponent(returnUrl)}`
      : "/signin"
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
