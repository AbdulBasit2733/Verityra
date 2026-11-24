import { requireAdmin } from "@/lib/auth-guard"
import { getMastersOverviewAction } from "@/actions/master-actions"
import { AdminMastersClient, MasterTab } from "@/components/admin/masters/admin-masters-client"

export const dynamic = "force-dynamic"

export default async function AdminMastersPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  await requireAdmin("/admin/masters")

  const resolvedParams = await searchParams
  const tab: MasterTab =
    resolvedParams.tab === "standards" || resolvedParams.tab === "boards"
      ? (resolvedParams.tab as MasterTab)
      : "subjects"

  const res = await getMastersOverviewAction()
  const data = res.success && res.data ? res.data : { subjects: [], standards: [], boards: [] }

  return (
    <AdminMastersClient
      initialTab={tab}
      initialSubjects={data.subjects}
      initialStandards={data.standards}
      initialBoards={data.boards}
    />
  )
}
