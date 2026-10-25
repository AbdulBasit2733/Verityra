import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Role, UserStatus } from "@prisma/client"
import { redirect } from "next/navigation"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
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
