import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { requireAdmin } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import { getSubjectsAction } from "@/actions/master-actions"
import { getTestSeriesForAttachmentAction } from "@/actions/question-paper-actions"
import {
  AdminCreateSubjectTestForm,
  AdminSubjectTestEditData,
} from "@/components/admin/tests/admin-create-subject-test-form"

export const dynamic = "force-dynamic"

export default async function EditSubjectTestPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  await requireAdmin(`/admin/tests/${id}`)

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      testSeries: {
        select: { id: true, title: true },
      },
    },
  })

  if (!test) {
    notFound()
  }

  const [subjectsRes, seriesRes] = await Promise.all([
    getSubjectsAction({ activeOnly: true }),
    getTestSeriesForAttachmentAction(),
  ])

  const subjects = subjectsRes.success && subjectsRes.data ? subjectsRes.data.subjects : []
  const series = seriesRes.success && seriesRes.data ? seriesRes.data.testSeries : []

  const initialData: AdminSubjectTestEditData = {
    id: test.id,
    title: test.title,
    subject: test.subject,
    testSeriesId: test.testSeriesId,
    description: test.description,
    price: test.price,
    isStandalone: test.isStandalone,
    maxMarks: test.maxMarks,
    durationMinutes: test.durationMinutes,
    maxAttempts: test.maxAttempts,
    studentInstructions: test.studentInstructions,
    privateEvaluationInstructions: test.privateEvaluationInstructions,
    questionPaperUrl: test.questionPaperUrl,
    modelAnswerUrl: test.modelAnswerUrl,
    answerSheetUrl: test.answerSheetUrl,
    isPublished: test.status === "PUBLISHED" || test.isPublished,
  }

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={FileText}
        title={`Edit ${test.subject} Test`}
        subtitle={`Update configuration, marks, duration, syllabus, documents, or series attachment for "${test.title}".`}
        showRefresh={false}
      >
        <div className="flex items-center gap-2">
          {test.slug && (
            <Link href={`/tests/${test.slug}`} target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-md px-3 text-xs font-semibold"
              >
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Preview Public
              </Button>
            </Link>
          )}
          {test.testSeriesId && (
            <Link href={`/admin/test-series/${test.testSeriesId}`}>
              <Button
                variant="outline"
                size="sm"
                className="h-10 rounded-md px-3 text-xs font-semibold"
              >
                Back to Series
              </Button>
            </Link>
          )}
          <Link href="/admin/tests">
            <Button
              variant="outline"
              size="sm"
              className="h-10 rounded-md px-3 text-xs font-semibold"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Tests
            </Button>
          </Link>
        </div>
      </PageHeader>

      <AdminCreateSubjectTestForm
        availableSubjects={subjects}
        availableSeries={series}
        mode="edit"
        initialData={initialData}
      />
    </div>
  )
}
