import { requireAdmin } from "@/lib/auth-guard"
import { getMastersOverviewAction } from "@/actions/master-actions"
import { AdminMastersClient } from "@/components/admin/masters/admin-masters-client"

export const dynamic = "force-dynamic"

export default async function AdminStandardMasterPage() {
  await requireAdmin("/admin/masters/standards")

  const res = await getMastersOverviewAction()
  const data = res.success && res.data ? res.data : { subjects: [], standards: [], boards: [] }

  return (
    <AdminMastersClient
      initialTab="standards"
      initialSubjects={data.subjects}
      initialStandards={data.standards}
      initialBoards={data.boards}
    />
  )
}
