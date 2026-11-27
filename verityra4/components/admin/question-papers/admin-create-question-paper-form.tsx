"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import {
  uploadQuestionPaperAction,
  TestSeriesAttachmentOption,
} from "@/actions/question-paper-actions"
import { EXAMINATION_STREAMS } from "@/lib/mock-question-papers"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FileText,
  UploadCloud,
  Loader2,
  CheckCircle2,
  Layers,
  ArrowLeft,
  X,
  FileCheck,
  Sparkles,
  AlertTriangle,
  Link2,
} from "lucide-react"

const COMMON_SUBJECTS = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Social Science",
  "English",
  "General Studies",
]

const STANDARDS = [
  { label: "Class 10th", value: "10th" },
  { label: "Class 11th", value: "11th" },
  { label: "Class 12th", value: "12th" },
  { label: "NEET-UG", value: "NEET" },
  { label: "JEE Main / Advanced", value: "JEE" },
  { label: "Foundation & Olympiad", value: "Foundation" },
  { label: "General Examination", value: "General" },
]

export function AdminCreateQuestionPaperForm({
  availableSeries = [],
}: {
  availableSeries: TestSeriesAttachmentOption[]
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()

  const [loading, setLoading] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState<string>("CBSE Board")
  const [subject, setSubject] = React.useState("")
  const [standard, setStandard] = React.useState("10th")
  const [year, setYear] = React.useState(new Date().getFullYear().toString())
  const [maxMarks, setMaxMarks] = React.useState("100")
  const [durationMinutes, setDurationMinutes] = React.useState("180")
  const [description, setDescription] = React.useState("")
  const [isPublished, setIsPublished] = React.useState(true)

  // Attachment state
  const [attachToSeries, setAttachToSeries] = React.useState(false)
  const [selectedSeriesId, setSelectedSeriesId] = React.useState<string>("")
  const [isStandalone, setIsStandalone] = React.useState(true)
  const [standalonePrice, setStandalonePrice] = React.useState("99")

  // File state
  const MAX_QUESTION_PAPER_BYTES = 5 * 1024 * 1024
  const [file, setFile] = React.useState<File | null>(null)
  const [fileError, setFileError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files?.[0]
    if (droppedFile) validateAndSetFile(droppedFile)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) validateAndSetFile(selected)
    e.target.value = ""
  }

  const validateAndSetFile = (f: File) => {
    if (f.type !== "application/pdf") {
      const msg = `Invalid format (${f.type || "unknown"}). Please select a PDF document.`
      setFileError(msg)
      toast.error("Invalid file format", { description: msg })
      return
    }
    if (f.size === 0) {
      const msg = "Selected PDF file is empty (0 bytes)."
      setFileError(msg)
      toast.error("Empty file rejected", { description: msg })
      return
    }
    if (f.size > MAX_QUESTION_PAPER_BYTES) {
      const msg = `Selected file (${(f.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB Question Paper limit.`
      setFileError(msg)
      toast.error("File exceeds 5 MB limit", { description: msg })
      return
    }
    setFileError(null)
    setFile(f)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Question paper title is required.")
      return
    }
    if (fileError) {
      toast.error("Fix document validation error before submitting", {
        description: fileError,
      })
      return
    }
    if (!file) {
      const msg = "Please upload a PDF question paper document (max 5 MB)."
      setFileError(msg)
      toast.error(msg)
      return
    }
    if (file.size === 0 || file.size > MAX_QUESTION_PAPER_BYTES) {
      const msg = `Selected file (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 5 MB limit.`
      setFileError(msg)
      toast.error("File exceeds 5 MB limit", { description: msg })
      return
    }
    if (attachToSeries && !selectedSeriesId) {
      toast.error("Please select a target Test Series bundle to attach.")
      return
    }

    const confirmed = await confirm({
      title: "Publish Question Paper Master?",
      description: attachToSeries
        ? `This paper will be created in the Question Paper Bank and automatically attached to the selected Test Series as an active subject exam.`
        : `This paper will be published to the public Question Paper Bank for student practice.`,
      confirmText: "Create Question Paper",
      cancelText: "Review Details",
      badgeText: "Question Paper Master Record",
    })
    if (!confirmed) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("category", category)
      formData.append("subject", subject.trim() || "General")
      formData.append("year", year)
      formData.append("maxMarks", maxMarks)
      formData.append("durationMinutes", durationMinutes)
      formData.append("description", description.trim())
      formData.append("isPublished", String(isPublished))
      formData.append("paperFile", file)

      if (attachToSeries && selectedSeriesId) {
        formData.append("testSeriesId", selectedSeriesId)
        formData.append("isStandalone", String(isStandalone))
        formData.append("standalonePrice", standalonePrice)
      }

      const res = await uploadQuestionPaperAction(formData)
      if (!res.success) {
        throw new Error(res.error || "Failed to create question paper.")
      }

      toast.success("Question paper created successfully", {
        description: res.message,
      })
      router.push("/admin/question-papers")
      router.refresh()
    } catch (err: any) {
      showError({
        title: "Creation Failed",
        message: err?.message || "An unexpected error occurred while uploading.",
        code: "QP_CREATE_ERROR",
      })
    } finally {
      setLoading(false)
    }
  }

  const selectedSeries = availableSeries.find((s) => s.id === selectedSeriesId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Sleek, Non-Card Master Form Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: File Dropzone & Attachment Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* File Upload Section */}
          <div className="rounded-lg border border-border/80 bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> Question Paper PDF *
              </Label>
              <span className="text-[11px] text-muted-foreground">Max 5 MB</span>
            </div>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-center cursor-pointer transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : file
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div className="space-y-2">
                  <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
                    <FileCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground truncate max-w-[240px]">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB · PDF Document
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 pt-1"
                  >
                    <X className="h-3 w-3" /> Replace PDF
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">
                      Drag and drop official PDF paper
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      or click to browse your local device (PDF, max 5 MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            {fileError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
              >
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          {/* Test Series Attachment Section */}
          <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label
                  htmlFor="attach-toggle"
                  className="text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer"
                >
                  <Link2 className="h-4 w-4 text-primary" /> Attach to Test Series / Bundle
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Link this paper directly to a comprehensive test series package.
                </p>
              </div>
              <input
                id="attach-toggle"
                type="checkbox"
                checked={attachToSeries}
                onChange={(e) => {
                  setAttachToSeries(e.target.checked)
                  if (!e.target.checked) setSelectedSeriesId("")
                }}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {attachToSeries && (
              <div className="space-y-4 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-foreground">
                    Select Target Test Series *
                  </Label>
                  <Select
                    value={selectedSeriesId}
                    onValueChange={(val) => setSelectedSeriesId(val || "")}
                  >
                    <SelectTrigger className="h-9 text-xs">
                      <SelectValue placeholder="Choose target test series bundle..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSeries.map((s) => (
                        <SelectItem key={s.id} value={s.id} className="text-xs">
                          {s.standard ? `[Class ${s.standard}] ` : ""}
                          {s.title}
                          {s.type === "BUNDLE" ? " (Bundle)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSeries && (
                    <p className="text-[11px] text-primary font-medium flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Paper will be added under &quot;{selectedSeries.title}&quot;
                    </p>
                  )}
                </div>

                <div className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label
                        htmlFor="standalone-purchase-toggle"
                        className="text-xs font-bold text-foreground cursor-pointer"
                      >
                        Allow Standalone Purchase
                      </Label>
                      <p className="text-[11px] text-muted-foreground">
                        Students can buy only this subject test without buying the full bundle.
                      </p>
                    </div>
                    <input
                      id="standalone-purchase-toggle"
                      type="checkbox"
                      checked={isStandalone}
                      onChange={(e) => setIsStandalone(e.target.checked)}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                    />
                  </div>

                  {isStandalone && (
                    <div className="space-y-1 pt-1">
                      <Label className="text-xs font-bold text-foreground">
                        Individual Subject Price (INR ₹)
                      </Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          min={0}
                          value={standalonePrice}
                          onChange={(e) => setStandalonePrice(e.target.value)}
                          className="h-8 text-xs w-28"
                        />
                        <span className="text-[11px] text-muted-foreground">
                          (0 = Free individual enrollment)
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Master Record Parameters (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-bold text-foreground">
                Question Paper Title *
              </Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CBSE Class 10th Mathematics Standard Pre-Board Mock 1"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-xs font-bold text-foreground">
                Subject Name *
              </Label>
              <Input
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics, Science, Social Science"
                className="h-9 text-xs"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-colors font-medium"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="category" className="text-xs font-bold text-foreground">
                  Exam Stream / Board
                </Label>
                <Select value={category} onValueChange={(val) => setCategory(val || "CBSE Board")}>
                  <SelectTrigger id="category" className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EXAMINATION_STREAMS.map((st) => (
                      <SelectItem key={st} value={st} className="text-xs">
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="standard" className="text-xs font-bold text-foreground">
                  Standard / Class
                </Label>
                <Select value={standard} onValueChange={(val) => setStandard(val || "10th")}>
                  <SelectTrigger id="standard" className="h-9 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STANDARDS.map((std) => (
                      <SelectItem key={std.value} value={std.value} className="text-xs">
                        {std.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="year" className="text-xs font-bold text-foreground">
                  Academic Year
                </Label>
                <Input
                  id="year"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="maxMarks" className="text-xs font-bold text-foreground">
                  Maximum Marks
                </Label>
                <Input
                  id="maxMarks"
                  type="number"
                  min={1}
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="durationMinutes" className="text-xs font-bold text-foreground">
                  Duration (Minutes)
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={15}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-bold text-foreground">
                Syllabus & Scope Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Curriculum coverage, question distribution, and sectional details..."
                rows={3}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <div>
                <Label htmlFor="publish-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                  Publish to Public Library
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Immediately visible to candidates and visitors.
                </p>
              </div>
              <input
                id="publish-toggle"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <Link href="/admin/question-papers">
              <Button type="button" variant="outline" size="sm" className="h-9 text-xs font-semibold">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading || Boolean(fileError)}
              size="sm"
              className="h-9 px-5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Creating Paper...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-1.5 h-3.5 w-3.5" />
                  {attachToSeries ? "Create & Attach to Series" : "Publish Question Paper"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={loading} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Uploading Question Paper...
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Uploading your PDF to private storage and creating the question
              paper record. Please wait without closing this page.
            </DialogDescription>
          </DialogHeader>
          {file && (
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 text-xs">
              <p className="truncate font-medium">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </form>
  )
}
