import { requireAdmin } from "@/lib/auth-guard"
import { getAllSubjectTestsAction } from "@/actions/test-series-actions"
import { AdminTestsClient } from "@/components/admin/tests/admin-tests-client"

export const dynamic = "force-dynamic"

export default async function AdminTestsPage() {
  await requireAdmin("/admin/tests")

  const res = await getAllSubjectTestsAction()
  const tests = res.success && res.data ? res.data.tests : []

  return <AdminTestsClient initialTests={tests} />
}
