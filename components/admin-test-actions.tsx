"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, UploadCloud, Globe, EyeOff, FileText, Download } from "lucide-react"
import {
  uploadTestPaperAction,
  uploadAnswerSheetTemplateAction,
  togglePublishTestSeriesAction,
  togglePublishResultsAction,
} from "@/actions/test-series-actions"

export function AdminTestDocumentForms({ testSeriesId }: { testSeriesId: string }) {
  const router = useRouter()

  // Paper form states
  const [paperTitle, setPaperTitle] = useState("Main Examination Question Paper")
  const [maxMarks, setMaxMarks] = useState("100")
  const [rubricContent, setRubricContent] = useState("")
  const [paperFile, setPaperFile] = useState<File | null>(null)
  const [paperLoading, setPaperLoading] = useState(false)
  const [paperMessage, setPaperMessage] = useState<string | null>(null)

  // Template form states
  const [templateTitle, setTemplateTitle] = useState("Standard Printable Margin Answer Sheet")
  const [templateDescription, setTemplateDescription] = useState("Margin-aligned ruled answer booklet format.")
  const [templateRequired, setTemplateRequired] = useState(true)
  const [templateFile, setTemplateFile] = useState<File | null>(null)
  const [templateLoading, setTemplateLoading] = useState(false)
  const [templateMessage, setTemplateMessage] = useState<string | null>(null)

  async function handlePaperUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!paperFile) return
    setPaperLoading(true)
    setPaperMessage(null)

    try {
      const formData = new FormData()
      formData.append("testSeriesId", testSeriesId)
      formData.append("title", paperTitle)
      formData.append("maxMarks", maxMarks)
      formData.append("rubricContent", rubricContent)
      formData.append("paperFile", paperFile)

      const res = await uploadTestPaperAction(formData)
      if (res.success) {
        setPaperMessage(res.message || "Question paper uploaded!")
        setPaperFile(null)
        router.refresh()
      }
      setPaperLoading(false)
    } catch {
      setPaperLoading(false)
    }
  }

  async function handleTemplateUpload(e: React.FormEvent) {
    e.preventDefault()
    if (!templateFile) return
    setTemplateLoading(true)
    setTemplateMessage(null)

    try {
      const formData = new FormData()
      formData.append("testSeriesId", testSeriesId)
      formData.append("title", templateTitle)
      formData.append("description", templateDescription)
      formData.append("templateRequired", String(templateRequired))
      formData.append("templateFile", templateFile)

      const res = await uploadAnswerSheetTemplateAction(formData)
      if (res.success) {
        setTemplateMessage(res.message || "Template uploaded!")
        setTemplateFile(null)
        router.refresh()
      }
      setTemplateLoading(false)
    } catch {
      setTemplateLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Upload Question Paper */}
      <Card className="border-[#D5E5F2] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#0B192C] flex items-center gap-2">
            <FileText className="h-4 w-4 text-[#0784B5]" />
            Upload Question Paper & Rubric
          </CardTitle>
          <CardDescription className="text-xs text-[#4B6375]">
            PDF paper and model answer rubric used for grading.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {paperMessage && (
            <Alert className="mb-4 py-2 text-xs border-emerald-500 bg-emerald-50 text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
              <AlertDescription>{paperMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handlePaperUpload} className="space-y-3">
            <div>
              <Label className="text-xs font-semibold text-[#0B192C]">Paper Title</Label>
              <Input
                value={paperTitle}
                onChange={(e) => setPaperTitle(e.target.value)}
                className="mt-1 border-[#D5E5F2] text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#0B192C]">Paper PDF File</Label>
              <Input
                type="file"
                accept=".pdf"
                required
                onChange={(e) => setPaperFile(e.target.files?.[0] || null)}
                className="mt-1 border-[#D5E5F2] text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#0B192C]">Rubric & Model Answer Summary</Label>
              <Textarea
                value={rubricContent}
                onChange={(e) => setRubricContent(e.target.value)}
                placeholder="Question 1 (10 marks): key points... Question 2 (15 marks): concepts..."
                rows={3}
                className="mt-1 border-[#D5E5F2] text-xs"
              />
            </div>

            <Button
              type="submit"
              disabled={!paperFile || paperLoading}
              className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white text-xs font-semibold h-8"
            >
              {paperLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <UploadCloud className="h-3.5 w-3.5 mr-1" />}
              Upload Paper & Rubric
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Upload Answer Sheet Template */}
      <Card className="border-[#D5E5F2] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold text-[#0B192C] flex items-center gap-2">
            <Download className="h-4 w-4 text-[#0784B5]" />
            Upload Answer Sheet Template
          </CardTitle>
          <CardDescription className="text-xs text-[#4B6375]">
            Printable PDF template provided to students for handwriting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {templateMessage && (
            <Alert className="mb-4 py-2 text-xs border-emerald-500 bg-emerald-50 text-emerald-800">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
              <AlertDescription>{templateMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleTemplateUpload} className="space-y-3">
            <div>
              <Label className="text-xs font-semibold text-[#0B192C]">Template Title</Label>
              <Input
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                className="mt-1 border-[#D5E5F2] text-xs h-8"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold text-[#0B192C]">Template PDF / Image File</Label>
              <Input
                type="file"
                accept=".pdf,image/png,image/jpeg"
                required
                onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                className="mt-1 border-[#D5E5F2] text-xs h-8"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="templateRequired"
                checked={templateRequired}
                onChange={(e) => setTemplateRequired(e.target.checked)}
                className="rounded border-[#D5E5F2] text-[#0784B5]"
              />
              <Label htmlFor="templateRequired" className="text-xs text-[#0B192C] cursor-pointer">
                Strict Template Required for this examination
              </Label>
            </div>

            <Button
              type="submit"
              disabled={!templateFile || templateLoading}
              className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white text-xs font-semibold h-8"
            >
              {templateLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <UploadCloud className="h-3.5 w-3.5 mr-1" />}
              Upload Printable Template
            </Button>
          </form>
        </CardContent>
      </Card>
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
  const [pubLoading, setPubLoading] = useState(false)
  const [resLoading, setResLoading] = useState(false)

  async function handleTogglePublish() {
    setPubLoading(true)
    await togglePublishTestSeriesAction(testSeriesId, !isPublished)
    setPubLoading(false)
    router.refresh()
  }

  async function handleToggleResults() {
    setResLoading(true)
    await togglePublishResultsAction(testSeriesId, !resultsPublished)
    setResLoading(false)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        onClick={handleTogglePublish}
        disabled={pubLoading}
        variant={isPublished ? "outline" : "default"}
        className={`text-xs font-semibold h-8 ${
          isPublished
            ? "border-amber-400 text-amber-700 hover:bg-amber-50"
            : "bg-emerald-600 hover:bg-emerald-700 text-white"
        }`}
      >
        {pubLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Globe className="h-3.5 w-3.5 mr-1" />}
        {isPublished ? "Unpublish Test Series" : "Publish Test Series to Catalog"}
      </Button>

      <Button
        onClick={handleToggleResults}
        disabled={resLoading}
        variant="outline"
        className={`text-xs font-semibold h-8 ${
          resultsPublished
            ? "border-purple-400 text-purple-700 hover:bg-purple-50"
            : "border-[#0784B5] text-[#0784B5] hover:bg-[#CADEEF]/30"
        }`}
      >
        {resLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <EyeOff className="h-3.5 w-3.5 mr-1" />}
        {resultsPublished ? "Hide Results & Leaderboard" : "Publish Results & Leaderboard"}
      </Button>
    </div>
  )
}
