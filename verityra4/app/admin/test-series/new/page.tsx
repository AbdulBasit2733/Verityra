import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { requireAdmin } from "@/lib/auth-guard"
import { getMastersOverviewAction } from "@/actions/master-actions"
import { AdminCreateTestSeriesBundleForm } from "@/components/admin/test-series/admin-create-test-series-bundle-form"

export const dynamic = "force-dynamic"

export default async function CreateTestSeriesPage() {
  await requireAdmin("/admin/test-series/new")

  const mastersRes = await getMastersOverviewAction()
  const standards = mastersRes.success && mastersRes.data ? mastersRes.data.standards : []
  const boards = mastersRes.success && mastersRes.data ? mastersRes.data.boards : []

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={BookOpen}
        title="Create Test Series Bundle Master"
        subtitle="Initialize the master batch container for an academic program. Subject tests (Mathematics, Science, etc.) are added from the Subject Tests screen."
        showRefresh={false}
      >
        <Link href="/admin/test-series">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-md px-3.5 text-xs font-semibold"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Catalog
          </Button>
        </Link>
      </PageHeader>

      <AdminCreateTestSeriesBundleForm
        availableStandards={standards}
        availableBoards={boards}
      />
    </div>
  )
}
