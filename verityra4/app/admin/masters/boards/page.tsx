import { requireAdmin } from "@/lib/auth-guard"
import { getMastersOverviewAction } from "@/actions/master-actions"
import { AdminMastersClient } from "@/components/admin/masters/admin-masters-client"

export const dynamic = "force-dynamic"

export default async function AdminBoardMasterPage() {
  await requireAdmin("/admin/masters/boards")

  const res = await getMastersOverviewAction()
  const data = res.success && res.data ? res.data : { subjects: [], standards: [], boards: [] }

  return (
    <AdminMastersClient
      initialTab="boards"
      initialSubjects={data.subjects}
      initialStandards={data.standards}
      initialBoards={data.boards}
    />
  )
}
