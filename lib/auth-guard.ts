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

export type PersistedAdminActor = Pick<User, "id" | "email" | "name" | "role" | "status">

export type PersistedAdminResult =
  | { success: true; user: PersistedAdminActor }
  | { success: false; error: string }

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

  const actor = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: adminSelect,
  })

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
