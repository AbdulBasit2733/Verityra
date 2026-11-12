import { requireStudent } from "@/lib/auth-guard"
import { PortalShell } from "@/components/portal/portal-shell"

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireStudent("/student/dashboard")

  return (
    <PortalShell role="STUDENT" userName={user.name} userEmail={user.email}>
      {children}
    </PortalShell>
  )
}
