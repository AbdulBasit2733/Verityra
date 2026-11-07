import { requireAdmin } from "@/lib/auth-guard"
import { getAdminPaymentsAction } from "@/actions/payment-actions"
import { AdminPaymentsClient } from "@/components/admin/payments/admin-payments-client"

export const dynamic = "force-dynamic"

export default async function AdminPaymentsPage() {
  await requireAdmin("/admin/payments")
  const result = await getAdminPaymentsAction()

  const initialPayments = result.success && result.data ? result.data.payments : []

  return <AdminPaymentsClient initialPayments={initialPayments} />
}
