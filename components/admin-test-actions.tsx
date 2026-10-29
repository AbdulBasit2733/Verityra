"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { Loader2, UploadCloud, Globe, EyeOff, FileText, Download } from "lucide-react"
import {
  uploadTestPaperAction,
  uploadAnswerSheetTemplateAction,
  togglePublishTestSeriesAction,
  togglePublishResultsAction,
} from "@/actions/test-series-actions"

export function AdminTestDocumentForms({ testSeriesId }: { testSeriesId: string }) {
  const router = useRouter()
  const { showError } = useGlobalError()

  // Paper form states
  const [paperTitle, setPaperTitle] = useState("Main Examination Question Paper")
  const [maxMarks] = useState("100")
  const [rubricContent, setRubricContent] = useState("")
  const [paperFile, setPaperFile] = useState<File | null>(null)
  const [paperLoading, setPaperLoading] = useState(false)

  // Template form states
  const [templateTitle, setTemplateTitle] = useState("Standard Printable Margin Answer Sheet")
  const [templateDescription] = useState("Margin-aligned ruled answer booklet format.")
  const [templateRequired, setTemplateRequired] = useState(true)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [templateLoading, setTemplateLoading] = useState(false)

  async function handlePaperUpload(e: React.FormEvent) {
    e.preventDefault()
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
          description: res.message || `"${paperTitle}" attached to test series.`,
        })
        setPaperFile(null)
        router.refresh()
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
        message: "An unexpected error occurred while uploading the question paper.",
        code: "PAPER_UPLOAD_ERR",
      })
      setPaperLoading(false)
    }
  }

  async function handleTemplateUpload(e: React.FormEvent) {
    e.preventDefault()
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
          description: res.message || `"${templateTitle}" attached for candidates.`,
        })
        setTemplateFile(null)
        router.refresh()
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 divide-y md:divide-y-0 md:divide-x divide-slate-200">
      {/* Upload Question Paper — Flat Section */}
      <div className="space-y-4 md:pr-6">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#2A6AED] shrink-0" />
            Upload Question Paper & Rubric
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            PDF paper and model answer rubric used for grading.
          </p>
        </div>

        <form onSubmit={handlePaperUpload} className="space-y-3.5">
          <div>
            <Label className="text-xs font-bold text-[#0F172A]">Paper Title</Label>
            <Input
              value={paperTitle}
              onChange={(e) => setPaperTitle(e.target.value)}
              className="mt-1 border-slate-200 bg-white text-xs sm:text-sm h-10 rounded-lg"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-[#0F172A]">Paper PDF File</Label>
            <Input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              required
              onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
              className="mt-1 border-slate-200 bg-white text-xs sm:text-sm h-10 rounded-lg"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-[#0F172A]">Rubric & Model Answer Summary</Label>
            <Textarea
              value={rubricContent}
              onChange={(e) => setRubricContent(e.target.value)}
              placeholder="Question 1 (10 marks): key points... Question 2 (15 marks): concepts..."
              rows={3}
              className="mt-1 border-slate-200 bg-white text-xs sm:text-sm rounded-lg"
            />
          </div>

          <Button
            type="submit"
            disabled={!paperFile || paperLoading}
            className="w-full bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs sm:text-sm font-semibold h-10 rounded-lg"
          >
            {paperLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <UploadCloud className="h-4 w-4 mr-1.5" />
            )}
            Upload Paper & Rubric
          </Button>
        </form>
      </div>

      {/* Upload Answer Sheet Template — Flat Section */}
      <div className="space-y-4 pt-6 md:pt-0 md:pl-6 flex flex-col justify-between">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] flex items-center gap-2">
            <Download className="h-4 w-4 text-[#2A6AED] shrink-0" />
            Upload Answer Sheet Template
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5">
            Printable PDF template provided to students for handwriting.
          </p>
        </div>

        <form onSubmit={handleTemplateUpload} className="space-y-3.5">
          <div>
            <Label className="text-xs font-bold text-[#0F172A]">Template Title</Label>
            <Input
              value={templateTitle}
              onChange={(e) => setTemplateTitle(e.target.value)}
              className="mt-1 border-slate-200 bg-white text-xs sm:text-sm h-10 rounded-lg"
            />
          </div>

          <div>
            <Label className="text-xs font-bold text-[#0F172A]">Template PDF / Image File</Label>
            <Input
              type="file"
              accept=".pdf,image/png,image/jpeg,image/webp"
              required
              onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
              className="mt-1 border-slate-200 bg-white text-xs sm:text-sm h-10 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-2 py-2">
            <input
              type="checkbox"
              id="templateRequired"
              checked={templateRequired}
              onChange={(e) => setTemplateRequired(e.target.checked)}
              className="rounded border-slate-300 text-[#2A6AED] focus:ring-[#2A6AED]"
            />
            <Label htmlFor="templateRequired" className="text-xs text-slate-700 cursor-pointer font-medium">
              Strict Template Required for this examination
            </Label>
          </div>

          <Button
            type="submit"
            disabled={!templateFile || templateLoading}
            className="w-full bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs sm:text-sm font-semibold h-10 rounded-lg"
          >
            {templateLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
            ) : (
              <UploadCloud className="h-4 w-4 mr-1.5" />
            )}
            Upload Printable Template
          </Button>
        </form>
      </div>
    </div>
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
      toast.success(nextState ? "Test Series Published" : "Test Series Unpublished", {
        description: res.message,
      })
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
        nextState ? "Leaderboard Results Published" : "Leaderboard Results Hidden",
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
    <div className="flex flex-wrap items-center gap-2.5">
      <Button
        onClick={handleTogglePublish}
        disabled={pubLoading}
        variant={isPublished ? "outline" : "default"}
        className={`text-xs font-semibold h-9 px-3.5 rounded-lg ${
          isPublished
            ? "border-amber-300 text-amber-800 hover:bg-amber-50"
            : "bg-emerald-600 hover:bg-emerald-700 text-white"
        }`}
      >
        {pubLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <Globe className="h-3.5 w-3.5 mr-1.5" />
        )}
        {isPublished ? "Unpublish Series" : "Publish to Catalog"}
      </Button>

      <Button
        onClick={handleToggleResults}
        disabled={resLoading}
        variant="outline"
        className={`text-xs font-semibold h-9 px-3.5 rounded-lg ${
          resultsPublished
            ? "border-purple-300 text-purple-700 hover:bg-purple-50"
            : "border-[#2A6AED] text-[#2A6AED] hover:bg-blue-50/50"
        }`}
      >
        {resLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5 mr-1.5" />
        )}
        {resultsPublished ? "Hide Leaderboard" : "Publish Leaderboard"}
      </Button>
    </div>
  )
}
