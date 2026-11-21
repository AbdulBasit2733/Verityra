import Link from "next/link"
import { ArrowLeft, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { requireAdmin } from "@/lib/auth-guard"
import { getSubjectsAction } from "@/actions/master-actions"
import { getTestSeriesForAttachmentAction } from "@/actions/question-paper-actions"
import { AdminCreateSubjectTestForm } from "@/components/admin/tests/admin-create-subject-test-form"

export const dynamic = "force-dynamic"

export default async function CreateSubjectTestPage() {
  await requireAdmin("/admin/tests/new")

  const [subjectsRes, seriesRes] = await Promise.all([
    getSubjectsAction({ activeOnly: true }),
    getTestSeriesForAttachmentAction(),
  ])

  const subjects = subjectsRes.success && subjectsRes.data ? subjectsRes.data.subjects : []
  const series = seriesRes.success && seriesRes.data ? seriesRes.data.testSeries : []

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={FileText}
        title="Create Subject Test"
        subtitle="Create an individual subject test (Mathematics, Science, etc.) with marks, duration, syllabus, documents, and attach to a test series bundle."
        showRefresh={false}
      >
        <Link href="/admin/tests">
          <Button
            variant="outline"
            size="sm"
            className="h-10 rounded-md px-3.5 text-xs font-semibold"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Subject Tests
          </Button>
        </Link>
      </PageHeader>

      <AdminCreateSubjectTestForm
        availableSubjects={subjects}
        availableSeries={series}
      />
    </div>
  )
}
