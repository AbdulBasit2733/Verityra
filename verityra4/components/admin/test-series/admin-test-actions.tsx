"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { cn } from "@/lib/utils"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  Loader2,
  UploadCloud,
  Globe,
  EyeOff,
  FileText,
  Download,
  Trash2,
} from "lucide-react"
import {
  uploadTestPaperAction,
  uploadAnswerSheetTemplateAction,
  togglePublishTestSeriesAction,
  togglePublishResultsAction,
  deleteTestSeriesAction,
} from "@/actions/test-series-actions"
import { normalizePrivateFileUrl } from "@/lib/file-urls"

type PaperDocument = {
  id: string
  title: string
  fileUrl: string
  maxMarks: number
}
type TemplateDocument = {
  id: string
  title: string
  description?: string | null
  fileUrl: string
  templateRequired: boolean
}

export function AdminTestDocumentForms({
  testSeriesId,
  initialPapers = [],
  initialTemplates = [],
}: {
  testSeriesId: string
  initialPapers?: PaperDocument[]
  initialTemplates?: TemplateDocument[]
}) {
  const { showError } = useGlobalError()
  const [papers, setPapers] = useState<PaperDocument[]>(initialPapers)
  const [templates, setTemplates] =
    useState<TemplateDocument[]>(initialTemplates)

  // Paper form states
  const [paperTitle, setPaperTitle] = useState(
    "Main Examination Question Paper"
  )
  const [maxMarks] = useState("100")
  const [rubricContent, setRubricContent] = useState("")
  const [paperFile, setPaperFile] = useState<File | null>(null)
  const [paperLoading, setPaperLoading] = useState(false)

  // Template form states
  const [templateTitle, setTemplateTitle] = useState(
    "Standard Printable Margin Answer Sheet"
  )
  const [templateDescription] = useState(
    "Margin-aligned ruled answer booklet format."
  )
  const [templateRequired, setTemplateRequired] = useState(true)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [templateLoading, setTemplateLoading] = useState(false)

  async function handlePaperUpload() {
    if (!paperFile) return
    setPaperLoading(true)

    try {
      const formData = new FormData()
      formData.append("testSeriesId", testSeriesId)
      formData.append("title", paperTitle)
      formData.append("maxMarks", maxMarks)
      formData.append("rubricContent", rubricContent)
      formData.append("paperFile", paperFile)

      const res = await uploadTestPaperAction(formData)
      if (res.success) {
        toast.success("Question Paper & Rubric Uploaded", {
          description:
            res.message || `"${paperTitle}" attached to test series.`,
        })
        setPaperFile(null)
        const uploadData =
          "data" in res ? (res.data as { paper?: PaperDocument }) : undefined
        if (uploadData?.paper) {
          const p = uploadData.paper
          setPapers((current) => [
            ...current,
            { ...p, fileUrl: normalizePrivateFileUrl(p.fileUrl) || p.fileUrl },
          ])
        }
      } else {
        showError({
          title: "Question Paper Upload Failed",
          message: res.error || "Unable to upload question paper.",
          code: "PAPER_UPLOAD_ERR",
        })
      }
      setPaperLoading(false)
    } catch {
      showError({
        title: "Upload Error",
        message:
          "An unexpected error occurred while uploading the question paper.",
        code: "PAPER_UPLOAD_ERR",
      })
      setPaperLoading(false)
    }
  }

  async function handleTemplateUpload() {
    if (!templateFile) return
    setTemplateLoading(true)

    try {
      const formData = new FormData()
      formData.append("testSeriesId", testSeriesId)
      formData.append("title", templateTitle)
      formData.append("description", templateDescription)
      formData.append("templateRequired", String(templateRequired))
      formData.append("templateFile", templateFile)

      const res = await uploadAnswerSheetTemplateAction(formData)
      if (res.success) {
        toast.success("Margin Answer Sheet Template Uploaded", {
          description:
            res.message || `"${templateTitle}" attached for candidates.`,
        })
        setTemplateFile(null)
        const uploadData =
          "data" in res
            ? (res.data as { template?: TemplateDocument })
            : undefined
        if (uploadData?.template) {
          const t = uploadData.template
          setTemplates((current) => [
            ...current,
            { ...t, fileUrl: normalizePrivateFileUrl(t.fileUrl) || t.fileUrl },
          ])
        }
      } else {
        showError({
          title: "Template Upload Failed",
          message: res.error || "Unable to upload answer sheet template.",
          code: "TPL_UPLOAD_ERR",
        })
      }
      setTemplateLoading(false)
    } catch {
      showError({
        title: "Upload Error",
        message: "An unexpected error occurred while uploading the template.",
        code: "TPL_UPLOAD_ERR",
      })
      setTemplateLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-8 divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0">
      {/* Upload Question Paper — Flat Section */}
      <div className="space-y-4 md:pr-6">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#0F172A] sm:text-base">
            <FileText className="h-4 w-4 shrink-0 text-[#2A6AED]" />
            Upload Question Paper & Rubric
          </h3>
          <p className="mt-0.5 text-xs text-[#64748B]">
            PDF paper and model answer rubric used for grading.
          </p>
        </div>

        <div
          role="group"
          aria-label="Upload question paper and rubric"
          className="space-y-3.5"
        >
          <div>
            <Label className="text-xs font-bold text-[#0F172A]">
              Paper Title
            </Label>
            <Input
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="mt-1 h-10 rounded-md border-slate-200 bg-white text-xs sm:text-sm"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-[#0F172A]">
              Paper PDF File
            </Label>
            <Input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
              className="mt-1 h-10 rounded-md border-slate-200 bg-white text-xs sm:text-sm"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-[#0F172A]">
              Rubric & Model Answer Summary
            </Label>
            <Textarea
              value={rubricContent}
              onChange={(e) => setRubricContent(e.target.value)}
              placeholder="Question 1 (10 marks): key points... Question 2 (15 marks): concepts..."
              rows={3}
              className="mt-1 rounded-md border-slate-200 bg-white text-xs sm:text-sm"
            />
          </div>

          <Button
            type="button"
            onClick={handlePaperUpload}
            disabled={!paperFile || paperLoading}
            className="h-10 w-full rounded-md bg-[#2A6AED] text-xs font-semibold text-white hover:bg-[#1E55C7] sm:text-sm"
          >
            {paperLoading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-1.5 h-4 w-4" />
            )}
            Upload Paper & Rubric
          </Button>
        </div>
      </div>

      {/* Upload Answer Sheet Template — Flat Section */}
      <div className="flex flex-col justify-between space-y-4 pt-6 md:pt-0 md:pl-6">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#0F172A] sm:text-base">
            <Download className="h-4 w-4 shrink-0 text-[#2A6AED]" />
            Upload Answer Sheet Template
          </h3>
          <p className="mt-0.5 text-xs text-[#64748B]">
            Printable PDF template provided to students for handwriting.
          </p>
        </div>

        <div
          role="group"
          aria-label="Upload answer sheet template"
          className="space-y-3.5"
        >
          <div>
            <Label className="text-xs font-bold text-[#0F172A]">
              Template Title
            </Label>
            <Input
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              className="mt-1 h-10 rounded-md border-slate-200 bg-white text-xs sm:text-sm"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-[#0F172A]">
              Template PDF / Image File
            </Label>
            <Input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
              className="mt-1 h-10 rounded-md border-slate-200 bg-white text-xs sm:text-sm"
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="templateRequired"
              checked={templateRequired}
              onChange={(e) => setTemplateRequired(e.target.checked)}
              className="rounded-sm border-slate-300 text-[#2A6AED] focus:ring-[#2A6AED]"
            />
            <Label
              htmlFor="templateRequired"
              className="cursor-pointer text-xs font-medium text-slate-700"
            >
              Strict Template Required for this examination
            </Label>
          </div>

          <Button
            type="button"
            onClick={handleTemplateUpload}
            disabled={!templateFile || templateLoading}
            className="h-10 w-full rounded-md bg-[#2A6AED] text-xs font-semibold text-white hover:bg-[#1E55C7] sm:text-sm"
          >
            {templateLoading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="mr-1.5 h-4 w-4" />
            )}
            Upload Printable Template
          </Button>
        </div>
      </div>
      <div className="col-span-full grid grid-cols-1 gap-6 border-t border-slate-200 pt-6 md:grid-cols-2">
        <AttachedDocumentList
          title={`Attached Question Papers (${papers.length})`}
          empty="No question papers uploaded yet."
          items={papers}
          linkLabel="View PDF"
        />
        <AttachedDocumentList
          title={`Attached Margin Templates (${templates.length})`}
          empty="No answer templates uploaded yet."
          items={templates}
          linkLabel="View Template"
          template
        />
      </div>
    </div>
  )
}

function AttachedDocumentList({
  title,
  empty,
  items,
  linkLabel,
  template = false,
}: {
  title: string
  empty: string
  items: Array<PaperDocument | TemplateDocument>
  linkLabel: string
  template?: boolean
}) {
  return (
    <section className="space-y-3 rounded-md border border-slate-200/80 bg-white p-5 shadow-none dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
        {title}
      </h3>
      {items.length ? (
        <div className="divide-y divide-slate-100 border-t border-slate-100 dark:divide-slate-800 dark:border-slate-800">
          {items.map((item) => {
            const resolvedHref =
              normalizePrivateFileUrl(item.fileUrl) || item.fileUrl
            return (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 py-3 text-xs"
              >
                <div>
                  <span className="block font-bold text-slate-900 dark:text-slate-100">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {template
                      ? (item as TemplateDocument).templateRequired
                        ? "Mandatory for students"
                        : "Optional format"
                      : `Max Marks: ${(item as PaperDocument).maxMarks}`}
                  </span>
                </div>
                <a
                  href={resolvedHref}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 font-bold text-[#2A6AED] hover:underline"
                >
                  {linkLabel}
                </a>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-500">{empty}</p>
      )}
    </section>
  )
}

export function AdminPublishToggles({
  testSeriesId,
  isPublished,
  resultsPublished,
}: {
  testSeriesId: string
  isPublished: boolean
  resultsPublished: boolean
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()
  const [pubLoading, setPubLoading] = useState(false)
  const [resLoading, setResLoading] = useState(false)

  async function handleTogglePublish() {
    const nextState = !isPublished
    const confirmed = await confirm({
      title: nextState
        ? "Publish Test Series to Public Catalog?"
        : "Unpublish Test Series from Catalog?",
      description: nextState
        ? "Candidates will immediately be able to view and enroll in this test series."
        : "New enrollments will be paused while existing candidates retain workspace access.",
      confirmText: nextState ? "Publish Series" : "Unpublish Series",
      cancelText: "Cancel",
      variant: nextState ? "default" : "warning",
      badgeText: "Catalog Visibility",
    })
    if (!confirmed) return

    setPubLoading(true)
    const res = await togglePublishTestSeriesAction(testSeriesId, nextState)
    setPubLoading(false)

    if (res.success) {
      toast.success(
        nextState ? "Test Series Published" : "Test Series Unpublished",
        {
          description: res.message,
        }
      )
      router.refresh()
    } else {
      showError({
        title: "Publication Update Failed",
        message: res.error || "Could not update publication status.",
        code: "PUBLISH_ERR",
      })
    }
  }

  async function handleToggleResults() {
    const nextState = !resultsPublished
    const confirmed = await confirm({
      title: nextState
        ? "Publish Finalized Results to Public Leaderboard?"
        : "Hide Series Results from Public Leaderboard?",
      description: nextState
        ? "Evaluated candidate rankings for this test series will become visible on the public leaderboard."
        : "This test series will be hidden from the public leaderboard until re-published.",
      confirmText: nextState ? "Publish Leaderboard" : "Hide Leaderboard",
      cancelText: "Cancel",
      variant: nextState ? "default" : "warning",
      badgeText: "Leaderboard Governance",
    })
    if (!confirmed) return

    setResLoading(true)
    const res = await togglePublishResultsAction(testSeriesId, nextState)
    setResLoading(false)

    if (res.success) {
      toast.success(
        nextState
          ? "Leaderboard Results Published"
          : "Leaderboard Results Hidden",
        {
          description: res.message,
        }
      )
      router.refresh()
    } else {
      showError({
        title: "Leaderboard Update Failed",
        message: res.error || "Could not update leaderboard visibility.",
        code: "LEADERBOARD_ERR",
      })
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Toggle
        variant="outline"
        size="sm"
        pressed={isPublished}
        disabled={pubLoading}
        onClick={handleTogglePublish}
        aria-label="Toggle test series catalog publication"
        className={cn(
          "h-8 rounded-md px-2.5 text-xs font-semibold transition-all",
          isPublished
            ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:text-white aria-pressed:bg-emerald-600 aria-pressed:text-white"
            : "border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
        )}
      >
        {pubLoading ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Globe className="mr-1.5 h-3.5 w-3.5" />
        )}
        <span>{isPublished ? "Unpublish" : "Publish to Catalog"}</span>
      </Toggle>

      <Toggle
        variant="outline"
        size="sm"
        pressed={resultsPublished}
        disabled={resLoading}
        onClick={handleToggleResults}
        aria-label="Toggle leaderboard visibility"
        className={cn(
          "h-8 rounded-md px-2.5 text-xs font-semibold transition-all",
          resultsPublished
            ? "border-purple-600 bg-purple-600 text-white hover:bg-purple-700 hover:text-white aria-pressed:bg-purple-600 aria-pressed:text-white"
            : "border-[#2A6AED] text-[#2A6AED] hover:bg-blue-50/50"
        )}
      >
        {resLoading ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <EyeOff className="mr-1.5 h-3.5 w-3.5" />
        )}
        <span>
          {resultsPublished ? "Hide Leaderboard" : "Publish Leaderboard"}
        </span>
      </Toggle>
    </div>
  )
}

export function AdminDeleteSeriesButton({
  testSeriesId,
  title,
}: {
  testSeriesId: string
  title: string
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    const confirmed = await confirm({
      title: `Delete "${title}"?`,
      description:
        "Are you sure you want to delete this test series bundle? This will permanently delete the bundle, all attached subject tests, and exam materials. This action cannot be undone.",
      confirmText: "Delete Test Series",
      cancelText: "Cancel",
      variant: "destructive",
      badgeText: "Permanent Deletion",
    })
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await deleteTestSeriesAction(testSeriesId)
      if (res.success) {
        toast.success(res.message || "Test series deleted successfully.")
        router.push("/admin/test-series")
      } else if (res.data?.requiresForce) {
        const forceConfirmed = await confirm({
          title: "Force Delete Test Series?",
          description: `⚠️ WARNING: ${res.error}\n\nAre you sure you want to FORCE delete this test series?`,
          confirmText: "Yes, Force Delete",
          cancelText: "Cancel",
          variant: "destructive",
          badgeText: "High Risk",
        })

        if (forceConfirmed) {
          const forceRes = await deleteTestSeriesAction(testSeriesId, {
            force: true,
          })
          if (forceRes.success) {
            toast.success(
              forceRes.message || "Test series force deleted successfully."
            )
            router.push("/admin/test-series")
          } else {
            toast.error(forceRes.error || "Failed to force delete test series.")
          }
        }
      } else {
        toast.error(res.error || "Failed to delete test series.")
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={loading}
      onClick={handleDelete}
      className="h-8 rounded-md border-rose-200 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/40"
    >
      {loading ? (
        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
      )}
      <span>Delete Series</span>
    </Button>
  )
}
