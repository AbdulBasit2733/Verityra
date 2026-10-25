import { Role } from "@prisma/client"

/**
 * Pure helper to resolve post-login redirect targets based on role and requested callback.
 * Prevents admins from landing in candidate panels and students from landing in admin panels.
 */
export function resolvePostLoginTarget(
  role: Role | string | undefined,
  callbackUrl?: string | null
): string {
  if (role === Role.ADMIN || role === "ADMIN") {
    if (callbackUrl && !callbackUrl.startsWith("/student")) {
      return callbackUrl
    }
    return "/admin"
  }

  if (role === Role.STUDENT || role === "STUDENT") {
    if (callbackUrl && !callbackUrl.startsWith("/admin")) {
      return callbackUrl
    }
    return "/student/dashboard"
  }

  return callbackUrl || "/dashboard"
}
