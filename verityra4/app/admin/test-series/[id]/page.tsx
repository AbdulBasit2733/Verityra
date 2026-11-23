import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import {
  AdminPublishToggles,
  AdminDeleteSeriesButton,
  AdminTestDocumentForms,
} from "@/components/admin/test-series/admin-test-actions"
import { AdminTestSeriesEditor } from "@/components/admin/test-series/admin-test-series-editor"
import { ArrowLeft, BookOpen } from "lucide-react"
import { TestSeriesStatus } from "@prisma/client"
import { normalizePrivateFileUrl } from "@/lib/supabase"

export const dynamic = "force-dynamic"

type AdminPaper = {
  id: string
  title: string
  fileUrl: string
  maxMarks: number
}
type AdminTemplate = {
  id: string
  title: string
  description: string | null
  fileUrl: string
  templateRequired: boolean
}
type AdminSubjectTestData = {
  id: string
  title: string
  slug: string
  subject: string
  description?: string | null
  price: number
  isStandalone: boolean
  maxMarks: number
  durationMinutes: number
  maxAttempts: number
  questionPaperUrl?: string | null
  answerSheetUrl?: string | null
  modelAnswerUrl?: string | null
  studentInstructions?: string | null
  privateEvaluationInstructions?: string | null
  order: number
  status: string
  isPublished: boolean
  _count?: { submissions: number; registrations: number }
}

type AdminTestSeriesData = {
  id: string
  title: string
  slug: string
  description: string
  price: number
  bundlePrice?: number | null
  type?: "BUNDLE" | "SINGLE_TEST"
  standard?: string | null
  stream?: string | null
  badge?: string | null
  maxMarks: number
  durationMinutes: number
  maxAttempts: number
  status: TestSeriesStatus
  isPublished: boolean
  resultsPublished: boolean
  studentInstructions: string
  privateEvaluationInstructions: string
  papers: AdminPaper[]
  templates: AdminTemplate[]
  tests?: AdminSubjectTestData[]
  _count: { registrations: number; submissions: number }
}
export default async function AdminTestSeriesDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  let testSeries: AdminTestSeriesData | null = null

  try {
    testSeries = (await prisma.testSeries.findUnique({
      where: { id },
      include: {
        papers: true,
        templates: true,
        tests: {
          orderBy: { order: "asc" },
          include: {
            _count: { select: { submissions: true, registrations: true } },
          },
        },
        _count: { select: { registrations: true, submissions: true } },
      },
    })) as unknown as AdminTestSeriesData | null
  } catch (error) {
    console.error("[AdminTestSeriesDetailPage] Database query error:", error)
  }

  if (!testSeries) {
    if (id.startsWith("dev-") || id.startsWith("demo-")) {
      testSeries = {
        id,
        title: "UPSC Civil Services GS I Mock (Development)",
        slug: "upsc-gs-1-dev",
        description: "Full mock test for CSE Mains.",
        price: 0,
        maxMarks: 250,
        durationMinutes: 180,
        maxAttempts: 3,
        status: TestSeriesStatus.PUBLISHED,
        isPublished: true,
        resultsPublished: true,
        studentInstructions: "Standard candidate instructions.",
        privateEvaluationInstructions: "Confidential evaluation criteria.",
        papers: [],
        templates: [],
        _count: { registrations: 12, submissions: 8 },
      }
    } else notFound()
  }

  const documents = (
    <div className="space-y-6">
      <AdminTestDocumentForms
        testSeriesId={testSeries.id}
        initialPapers={testSeries.papers.map((paper) => ({
          id: paper.id,
          title: paper.title,
          fileUrl: normalizePrivateFileUrl(paper.fileUrl) || paper.fileUrl,
          maxMarks: paper.maxMarks,
        }))}
        initialTemplates={testSeries.templates.map((template) => ({
          id: template.id,
          title: template.title,
          description: template.description,
          fileUrl:
            normalizePrivateFileUrl(template.fileUrl) || template.fileUrl,
          templateRequired: template.templateRequired,
        }))}
      />
    </div>
  )

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={BookOpen}
        title={testSeries.title}
        subtitle={`Edit configuration · ${testSeries.slug} · ${testSeries.status}`}
        showRefresh={false}
      >
        <div className="flex flex-wrap items-center gap-2">
          <AdminPublishToggles
            testSeriesId={testSeries.id}
            isPublished={testSeries.isPublished}
            resultsPublished={testSeries.resultsPublished}
          />
          <AdminDeleteSeriesButton
            testSeriesId={testSeries.id}
            title={testSeries.title}
          />
          <Link href="/admin/test-series">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-md px-3 text-xs font-semibold"
            >
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Catalog
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="flex flex-wrap items-center gap-2.5">
        <Badge variant="outline" className="text-xs font-semibold">
          {testSeries.status}
        </Badge>
        {testSeries.resultsPublished && (
          <Badge className="bg-purple-600 text-xs font-semibold text-white">
            Results Live
          </Badge>
        )}
      </div>

      <AdminTestSeriesEditor
        testSeriesId={testSeries.id}
        initialValues={{
          title: testSeries.title,
          description: testSeries.description,
          price: testSeries.price / 100,
          bundlePrice:
            testSeries.bundlePrice !== undefined && testSeries.bundlePrice !== null
              ? testSeries.bundlePrice / 100
              : testSeries.price / 100,
          type: testSeries.type || "BUNDLE",
          standard: testSeries.standard || "10th",
          stream: testSeries.stream || "",
          badge: testSeries.badge || "",
          maxMarks: testSeries.maxMarks,
          durationMinutes: testSeries.durationMinutes,
          maxAttempts: testSeries.maxAttempts,
          studentInstructions: testSeries.studentInstructions,
          privateEvaluationInstructions:
            testSeries.privateEvaluationInstructions,
        }}
        documents={documents}
        subjectTests={testSeries.tests || []}
      />
    </div>
  )
}
