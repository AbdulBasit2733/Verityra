import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { AdminTestSeriesEditor } from "@/components/admin/test-series/admin-test-series-editor"

export default function CreateTestSeriesPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader
        icon={BookOpen}
        title="Create Test Series"
        subtitle="Set examination details, candidate instructions, and upload documents in one consistent workflow."
        showRefresh={false}
      >
        <Link href="/admin/test-series">
          <Button variant="outline" size="sm" className="h-10 rounded-xl px-3.5 text-xs font-semibold">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Catalog
          </Button>
        </Link>
      </PageHeader>
      <AdminTestSeriesEditor />
    </div>
  )
}
