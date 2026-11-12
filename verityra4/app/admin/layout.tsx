import { requireAdmin } from "@/lib/auth-guard"
import { PortalShell } from "@/components/portal/portal-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Enforce server-side role check
  const user = await requireAdmin("/admin")

  return (
    <PortalShell role="ADMIN" userName={user.name} userEmail={user.email}>
      {children}
    </PortalShell>
  )
}
