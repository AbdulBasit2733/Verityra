import Link from "next/link"
import { ArrowLeft, FileUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { requireAdmin } from "@/lib/auth-guard"
import { getTestSeriesForAttachmentAction } from "@/actions/question-paper-actions"
import { AdminCreateQuestionPaperForm } from "@/components/admin/question-papers/admin-create-question-paper-form"

export const dynamic = "force-dynamic"

export default async function CreateQuestionPaperPage() {
  await requireAdmin("/admin/question-papers/new")

  const seriesRes = await getTestSeriesForAttachmentAction()
  const availableSeries = seriesRes.success && seriesRes.data ? seriesRes.data.testSeries : []

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={FileUp}
        title="Create Question Paper"
        subtitle="Upload master question paper PDF, configure academic metadata, and optionally attach to a test series bundle."
        showRefresh={false}
      >
        <Link href="/admin/question-papers">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-md px-3.5 text-xs font-semibold"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Paper Bank
          </Button>
        </Link>
      </PageHeader>

      <AdminCreateQuestionPaperForm availableSeries={availableSeries} />
    </div>
  )
}
