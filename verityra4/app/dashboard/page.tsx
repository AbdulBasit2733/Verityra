import { requireAuth } from "@/lib/auth-guard"
import { Role } from "@prisma/client"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function DashboardDispatcherPage() {
  const user = await requireAuth()
  if (user.role === Role.ADMIN) {
    redirect("/admin")
  }
  redirect("/student/dashboard")
}
