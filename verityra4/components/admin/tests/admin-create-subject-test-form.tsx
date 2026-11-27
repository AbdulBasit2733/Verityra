"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/sonner"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { SearchableCombobox } from "@/components/ui/searchable-combobox"
import { MasterItem } from "@/lib/mock-masters"
import { TestSeriesAttachmentOption } from "@/actions/question-paper-actions"
import { normalizePrivateFileUrl } from "@/lib/file-urls"
import {
  prepareSubjectTestDocumentUploadsAction,
  saveSubjectTestFormAction,
  type SubjectTestDocumentRole,
} from "@/actions/test-series-actions"
import { uploadFileToSignedUrl } from "@/lib/direct-upload"
import { AdminPdfPreviewModal } from "@/components/admin/question-papers/admin-pdf-preview-modal"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertTriangle,
  FileText,
  UploadCloud,
  FileCheck,
  X,
  Loader2,
  Layers,
  Award,
  Clock,
  RotateCcw,
  BookOpenCheck,
  ShieldAlert,
  Download,
  Eye,
  FolderOpen,
} from "lucide-react"

const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]
const MAX_QUESTION_PAPER_BYTES = 5 * 1024 * 1024 // 5 MB max for Question Paper
const MAX_SUPPORTING_DOC_BYTES = 10 * 1024 * 1024 // 10 MB max for Model Answer / Answer Sheet Template

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function extractReadableFilename(fileUrl: string, fallback: string): string {
  try {
    const parsed = new URL(fileUrl, "http://localhost")
    const paramFile = parsed.searchParams.get("file")
    const rawName = (paramFile || parsed.pathname).split("/").pop()
    return rawName ? decodeURIComponent(rawName) : fallback
  } catch {
    return fileUrl.split("/").pop()?.split("?")[0] || fallback
  }
}

export interface SubjectTestDocumentStatus {
  paperMissing?: boolean
  modelMissing?: boolean
  templateMissing?: boolean
}

export interface AdminSubjectTestEditData {
  id: string
  title: string
  subject: string
  testSeriesId?: string | null
  description?: string | null
  price: number // in paise from database
  isStandalone: boolean
  maxMarks: number
  durationMinutes: number
  maxAttempts: number
  studentInstructions?: string | null
  privateEvaluationInstructions?: string | null
  questionPaperUrl?: string | null
  modelAnswerUrl?: string | null
  answerSheetUrl?: string | null
  isPublished: boolean
}

interface AdminCreateSubjectTestFormProps {
  availableSubjects: MasterItem[]
  availableSeries: TestSeriesAttachmentOption[]
  mode?: "create" | "edit"
  initialData?: AdminSubjectTestEditData
  defaultSeriesId?: string
  documentStatus?: SubjectTestDocumentStatus
}

const DEFAULT_STUDENT_INSTRUCTIONS = `1. Read all questions thoroughly before answering.
2. Maintain margins and clearly write question numbers corresponding to the question paper.
3. Solve all compulsory sections within the allotted duration.
4. Scan and convert your completed physical answer sheets into a single, high-contrast upright PDF document before uploading.`

const DEFAULT_EVALUATION_INSTRUCTIONS = `CONFIDENTIAL AI & HUMAN EVALUATION RUBRIC:
1. Award marks for step-by-step conceptual clarity, mathematical working, and final results.
2. Accept mathematically or conceptually valid alternate methods.
3. Award method marks when an arithmetic slip occurs with otherwise correct methodology.
4. Flag uncertainty when handwriting is illegible.`

export function AdminCreateSubjectTestForm({
  availableSubjects,
  availableSeries,
  mode = "create",
  initialData,
  defaultSeriesId,
  documentStatus,
}: AdminCreateSubjectTestFormProps) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()

  const isEdit = mode === "edit" && !!initialData

  const [loading, setLoading] = React.useState(false)

  // Form Fields
  const [title, setTitle] = React.useState(initialData?.title || "")
  const [subject, setSubject] = React.useState(initialData?.subject || "Mathematics")
  const [testSeriesId, setTestSeriesId] = React.useState<string>(
    initialData?.testSeriesId || defaultSeriesId || ""
  )
  const [attachToSeries, setAttachToSeries] = React.useState(
    initialData ? !!initialData.testSeriesId : defaultSeriesId ? true : true
  )
  const [description, setDescription] = React.useState(initialData?.description || "")
  const [price, setPrice] = React.useState(
    initialData ? Math.round(initialData.price / 100).toString() : "99"
  )
  const [isStandalone, setIsStandalone] = React.useState(
    initialData ? initialData.isStandalone : true
  )
  const [maxMarks, setMaxMarks] = React.useState(
    initialData ? initialData.maxMarks.toString() : "80"
  )
  const [durationMinutes, setDurationMinutes] = React.useState(
    initialData ? initialData.durationMinutes.toString() : "180"
  )
  const [maxAttempts, setMaxAttempts] = React.useState(
    initialData ? initialData.maxAttempts.toString() : "3"
  )
  const [studentInstructions, setStudentInstructions] = React.useState(
    initialData?.studentInstructions ?? DEFAULT_STUDENT_INSTRUCTIONS
  )
  const [privateEvaluationInstructions, setPrivateEvaluationInstructions] =
    React.useState(
      initialData?.privateEvaluationInstructions ?? DEFAULT_EVALUATION_INSTRUCTIONS
    )
  const [isPublished, setIsPublished] = React.useState(
    initialData ? initialData.isPublished : true
  )

  // Document Uploads & Existing Document References
  const [paperFile, setPaperFile] = React.useState<File | null>(null)
  const [modelAnswerFile, setModelAnswerFile] = React.useState<File | null>(null)
  const [answerSheetTemplateFile, setAnswerSheetTemplateFile] = React.useState<File | null>(null)

  const [existingPaperUrl, setExistingPaperUrl] = React.useState<string | null>(
    initialData?.questionPaperUrl || null
  )
  const [existingModelUrl, setExistingModelUrl] = React.useState<string | null>(
    initialData?.modelAnswerUrl || null
  )
  const [existingTemplateUrl, setExistingTemplateUrl] = React.useState<string | null>(
    initialData?.answerSheetUrl || null
  )
  const [clearPaper, setClearPaper] = React.useState(false)
  const [clearModel, setClearModel] = React.useState(false)
  const [clearTemplate, setClearTemplate] = React.useState(false)
  const [previewDoc, setPreviewDoc] = React.useState<{
    title: string
    fileUrl: string
  } | null>(null)
  const [missingFlags, setMissingFlags] = React.useState({
    paper: Boolean(documentStatus?.paperMissing),
    model: Boolean(documentStatus?.modelMissing),
    template: Boolean(documentStatus?.templateMissing),
  })
  const [docsSheetOpen, setDocsSheetOpen] = React.useState(false)
  const [docErrors, setDocErrors] = React.useState<{
    paper?: string | null
    model?: string | null
    template?: string | null
  }>({})

  const subjectOptions = React.useMemo(
    () =>
      availableSubjects.map((s) => ({
        value: s.name,
        label: s.name,
        hint: s.description || (s.code ? `Code: ${s.code}` : undefined),
      })),
    [availableSubjects]
  )

  const seriesOptions = React.useMemo(
    () =>
      availableSeries.map((s) => ({
        value: s.id,
        label: s.title,
        hint: `${s.standard ? `[Class ${s.standard}] ` : ""}${s.type === "BUNDLE" ? "Bundle Package" : "Single"}`,
      })),
    [availableSeries]
  )

  const selectedSeries = availableSeries.find((s) => s.id === testSeriesId)

  // Auto-fill title suggestion only in create mode
  React.useEffect(() => {
    if (!isEdit && selectedSeries && subject && !title) {
      setTitle(`${selectedSeries.title} — ${subject} Mock 1`)
    }
  }, [isEdit, selectedSeries, subject, title])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Subject test title is required.")
      return
    }

    if (!subject.trim()) {
      toast.error("Please select a subject from the master dropdown.")
      return
    }

    if (attachToSeries && !testSeriesId) {
      toast.error("Please select a target Test Series bundle to attach, or uncheck the toggle.")
      return
    }

    if (docErrors.paper || docErrors.model || docErrors.template) {
      setDocsSheetOpen(true)
      toast.error("Fix document validation errors before submitting", {
        description:
          docErrors.paper ||
          docErrors.model ||
          docErrors.template ||
          "Please verify selected files.",
      })
      return
    }

    const preSubmitChecks: Array<[File | null, number, string]> = [
      [paperFile, MAX_QUESTION_PAPER_BYTES, "Question Paper PDF (max 5 MB)"],
      [
        modelAnswerFile,
        MAX_SUPPORTING_DOC_BYTES,
        "Model Answer Key PDF (max 10 MB)",
      ],
      [
        answerSheetTemplateFile,
        MAX_SUPPORTING_DOC_BYTES,
        "Answer Sheet Template PDF (max 10 MB)",
      ],
    ]
    for (const [f, limit, label] of preSubmitChecks) {
      if (f && (!ALLOWED_DOCUMENT_TYPES.includes(f.type) || f.size <= 0 || f.size > limit)) {
        setDocsSheetOpen(true)
        toast.error(`${label} is invalid`, {
          description: `Selected file "${f.name}" (${formatFileSize(f.size)}) violates the format or size limit.`,
        })
        return
      }
    }

    const confirmed = await confirm({
      title: isEdit ? "Save Changes to Subject Test?" : "Publish Subject Test?",
      description: isEdit
        ? `Are you sure you want to update "${title}"? Changes will be immediately reflected for all enrolled candidates.`
        : attachToSeries && selectedSeries
          ? `This test for "${subject}" will be created and attached to "${selectedSeries.title}". Students enrolled in the bundle will get instant access.`
          : `This test for "${subject}" will be created as a standalone examination paper.`,
      confirmText: isEdit ? "Update Subject Test" : "Create Subject Test",
      cancelText: "Review Details",
      badgeText: isEdit ? "Save Changes" : "Subject Test Record",
    })
    if (!confirmed) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("mode", isEdit ? "edit" : "create")
      if (isEdit && initialData) {
        formData.append("id", initialData.id)
      }
      formData.append(
        "testSeriesId",
        attachToSeries && testSeriesId ? testSeriesId : ""
      )
      formData.append("title", title.trim())
      formData.append("subject", subject.trim())
      formData.append("description", description.trim())
      formData.append("isStandalone", String(isStandalone))
      formData.append("price", isStandalone ? String(parseFloat(price) || 0) : "0")
      formData.append("maxMarks", String(parseFloat(maxMarks) || 80))
      formData.append("durationMinutes", String(parseInt(durationMinutes, 10) || 180))
      formData.append("maxAttempts", String(parseInt(maxAttempts, 10) || 3))
      formData.append("studentInstructions", studentInstructions.trim())
      formData.append(
        "privateEvaluationInstructions",
        privateEvaluationInstructions.trim()
      )
      formData.append("isPublished", String(isPublished))

      formData.append("clearQuestionPaper", String(clearPaper && !paperFile))
      formData.append("clearModelAnswer", String(clearModel && !modelAnswerFile))
      formData.append(
        "clearAnswerSheet",
        String(clearTemplate && !answerSheetTemplateFile)
      )

      const selectedDocs: Array<{
        role: SubjectTestDocumentRole
        file: File
        formField: string
        pathField: string
      }> = []
      if (paperFile) {
        selectedDocs.push({
          role: "paper",
          file: paperFile,
          formField: "paperFile",
          pathField: "uploadedPaperPath",
        })
      }
      if (modelAnswerFile) {
        selectedDocs.push({
          role: "model",
          file: modelAnswerFile,
          formField: "modelAnswerFile",
          pathField: "uploadedModelPath",
        })
      }
      if (answerSheetTemplateFile) {
        selectedDocs.push({
          role: "template",
          file: answerSheetTemplateFile,
          formField: "answerSheetTemplateFile",
          pathField: "uploadedTemplatePath",
        })
      }

      if (selectedDocs.length > 0) {
        const prepRes = await prepareSubjectTestDocumentUploadsAction({
          testId: isEdit && initialData ? initialData.id : undefined,
          files: selectedDocs.map((d) => ({
            role: d.role,
            fileName: d.file.name,
            mimeType: d.file.type,
            fileSize: d.file.size,
          })),
        })

        if (!prepRes.success || !prepRes.data) {
          throw new Error(
            prepRes.error || "Failed to prepare secure document uploads."
          )
        }

        const uploads = prepRes.data.uploads
        await Promise.all(
          selectedDocs.map(async (doc) => {
            const slot = uploads[doc.role]
            if (slot && slot.mode === "signed") {
              await uploadFileToSignedUrl(slot.signedUrl, doc.file)
              formData.append(doc.pathField, slot.storagePath)
            } else {
              formData.append(doc.formField, doc.file)
            }
          })
        )
      }

      const res = await saveSubjectTestFormAction(formData)
      if (!res.success) {
        throw new Error(
          res.error ||
            (isEdit
              ? "Failed to update subject test."
              : "Failed to create subject test.")
        )
      }

      toast.success(
        isEdit
          ? "Subject test updated successfully!"
          : "Subject test created successfully!",
        { description: res.message }
      )
      if (isEdit && initialData) {
        if (res.data) {
          if ("questionPaperUrl" in res.data) {
            setExistingPaperUrl(normalizePrivateFileUrl(res.data.questionPaperUrl))
            if (paperFile || clearPaper) {
              setMissingFlags((prev) => ({ ...prev, paper: false }))
            }
          }
          if ("modelAnswerUrl" in res.data) {
            setExistingModelUrl(normalizePrivateFileUrl(res.data.modelAnswerUrl))
            if (modelAnswerFile || clearModel) {
              setMissingFlags((prev) => ({ ...prev, model: false }))
            }
          }
          if ("answerSheetUrl" in res.data) {
            setExistingTemplateUrl(normalizePrivateFileUrl(res.data.answerSheetUrl))
            if (answerSheetTemplateFile || clearTemplate) {
              setMissingFlags((prev) => ({ ...prev, template: false }))
            }
          }
        }
        setPaperFile(null)
        setModelAnswerFile(null)
        setAnswerSheetTemplateFile(null)
        setClearPaper(false)
        setClearModel(false)
        setClearTemplate(false)
        router.refresh()
      } else {
        router.push("/admin/tests")
        router.refresh()
      }
    } catch (err: any) {
      showError({
        title: isEdit ? "Update Failed" : "Creation Failed",
        message: err?.message || "An unexpected error occurred.",
        code: isEdit ? "TEST_UPDATE_ERROR" : "TEST_CREATE_ERROR",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 12-Column Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Exam Documents Sheet Trigger & Series Attachment (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Document Summary Card + Shadcn Sheet Trigger */}
          <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
            <div className="border-b border-border/60 pb-3 flex items-center justify-between gap-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> Examination Documents
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Paper 5 MB · Key/Sheet 10 MB
              </span>
            </div>

            <div className="space-y-2.5">
              {[
                {
                  key: "paper",
                  label: "Question Paper PDF",
                  limitLabel: "Max 5 MB",
                  file: paperFile,
                  url: existingPaperUrl,
                  missing: Boolean(missingFlags.paper && !clearPaper),
                  error: docErrors.paper,
                  previewTitle: `${title || subject || "Subject Test"} — Question Paper`,
                },
                {
                  key: "model",
                  label: "Model Answer Key PDF",
                  limitLabel: "Max 10 MB",
                  file: modelAnswerFile,
                  url: existingModelUrl,
                  missing: Boolean(missingFlags.model && !clearModel),
                  error: docErrors.model,
                  previewTitle: `${title || subject || "Subject Test"} — Model Answer Key`,
                },
                {
                  key: "template",
                  label: "Answer Sheet Template PDF",
                  limitLabel: "Max 10 MB",
                  file: answerSheetTemplateFile,
                  url: existingTemplateUrl,
                  missing: Boolean(missingFlags.template && !clearTemplate),
                  error: docErrors.template,
                  previewTitle: `${title || subject || "Subject Test"} — Answer Sheet Template`,
                },
              ].map((doc) => (
                <div
                  key={doc.key}
                  className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {doc.label}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {doc.file
                        ? `Ready: ${doc.file.name} (${formatFileSize(doc.file.size)})`
                        : doc.url
                          ? extractReadableFilename(doc.url, doc.label)
                          : `Not uploaded · ${doc.limitLabel}`}
                    </p>
                    {doc.error && (
                      <p className="mt-0.5 text-[11px] font-medium text-rose-600">
                        {doc.error}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {doc.file ? (
                      <Badge className="h-5 border-0 bg-emerald-600 px-2 text-[10px] font-bold text-white">
                        Ready
                      </Badge>
                    ) : doc.missing ? (
                      <Badge className="h-5 border-0 bg-amber-600 px-2 text-[10px] font-bold text-white">
                        Missing
                      </Badge>
                    ) : doc.url ? (
                      <>
                        <Badge
                          variant="outline"
                          className="h-5 border-emerald-300 bg-emerald-50 px-2 text-[10px] font-semibold text-emerald-700"
                        >
                          Saved
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setPreviewDoc({
                              title: doc.previewTitle,
                              fileUrl: doc.url!,
                            })
                          }
                          className="h-7 px-2 text-[11px] font-semibold text-primary"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    ) : (
                      <Badge variant="outline" className="h-5 px-2 text-[10px]">
                        Empty
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => setDocsSheetOpen(true)}
              className="h-9 w-full justify-center gap-2 border-primary/40 text-xs font-semibold text-primary hover:bg-primary/5"
            >
              <FolderOpen className="h-4 w-4" />
              Open Examination Documents
            </Button>
          </div>

          {/* Test Series Attachment */}
          <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="attach-toggle" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-primary" /> Attach to Test Series Bundle
                </Label>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Include this paper inside a comprehensive batch package.
                </p>
              </div>
              <input
                id="attach-toggle"
                type="checkbox"
                checked={attachToSeries}
                onChange={(e) => {
                  setAttachToSeries(e.target.checked)
                  if (!e.target.checked) setTestSeriesId("")
                }}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>

            {attachToSeries && (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <Label className="text-xs font-semibold text-foreground">
                  Target Test Series Bundle *
                </Label>
                <SearchableCombobox
                  options={seriesOptions}
                  value={testSeriesId}
                  onValueChange={setTestSeriesId}
                  placeholder="Search target test series bundle..."
                  searchPlaceholder="Search Class 10th, 12th, NEET, JEE bundles..."
                />
                {selectedSeries && (
                  <p className="text-[11px] text-primary font-medium">
                    Enrolled candidates in &quot;{selectedSeries.title}&quot; automatically get access.
                  </p>
                )}
              </div>
            )}

            {/* Standalone Purchase Option */}
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="standalone-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                    Allow Standalone Purchase
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Candidates can purchase only this subject exam without the full bundle.
                  </p>
                </div>
                <input
                  id="standalone-toggle"
                  type="checkbox"
                  checked={isStandalone}
                  onChange={(e) => setIsStandalone(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                />
              </div>

              {isStandalone && (
                <div className="space-y-1 pt-1 border-t border-border/40">
                  <Label className="text-xs font-semibold text-foreground">
                    Individual Test Price (INR ₹)
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      min={0}
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="h-8 text-xs w-28"
                    />
                    <span className="text-[11px] text-muted-foreground">
                      (0 = Free enrollment)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Parameters, Rubric & Instructions (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpenCheck className="h-4 w-4 text-primary" /> Examination Parameters
              </h3>
            </div>

            {/* Subject Selector from SubjectMaster */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">
                Subject Master *
              </Label>
              <SearchableCombobox
                options={subjectOptions}
                value={subject}
                onValueChange={setSubject}
                placeholder="Search subject (e.g. Mathematics, Science)..."
                searchPlaceholder="Search Mathematics, Science, Social Science..."
              />
            </div>

            {/* Test Title */}
            <div className="space-y-1.5">
              <Label htmlFor="test-title" className="text-xs font-bold text-foreground">
                Test Title *
              </Label>
              <Input
                id="test-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Class 10th Mathematics Standard Pre-Board Mock 1"
                className="h-9 text-xs font-semibold"
              />
            </div>

            {/* Max Marks, Duration, Attempts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="maxMarks" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Award className="h-3.5 w-3.5 text-primary" /> Max Marks *
                </Label>
                <Input
                  id="maxMarks"
                  type="number"
                  min={1}
                  required
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="duration" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Duration (Mins) *
                </Label>
                <Input
                  id="duration"
                  type="number"
                  min={15}
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="attempts" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <RotateCcw className="h-3.5 w-3.5 text-primary" /> Max Attempts
                </Label>
                <Input
                  id="attempts"
                  type="number"
                  min={1}
                  max={10}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Syllabus & Scope Description */}
            <div className="space-y-1.5">
              <Label htmlFor="scope-desc" className="text-xs font-semibold text-foreground">
                Syllabus & Scope Description
              </Label>
              <Textarea
                id="scope-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Chapters covered, question distribution, sectional weightage..."
                className="text-xs"
              />
            </div>

            {/* Student Instructions */}
            <div className="space-y-1.5 pt-1">
              <Label htmlFor="student-inst" className="text-xs font-semibold text-foreground">
                Candidate Exam Workspace Instructions
              </Label>
              <Textarea
                id="student-inst"
                rows={4}
                value={studentInstructions}
                onChange={(e) => setStudentInstructions(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            {/* Private Evaluation Instructions */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="eval-inst" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-600" /> Private AI Evaluation Instructions
                </Label>
                <Badge variant="outline" className="text-[10px] text-amber-700 bg-amber-50 border-amber-200">
                  Strictly Confidential
                </Badge>
              </div>
              <Textarea
                id="eval-inst"
                rows={4}
                value={privateEvaluationInstructions}
                onChange={(e) => setPrivateEvaluationInstructions(e.target.value)}
                className="text-xs font-mono"
              />
            </div>

            {/* Publish Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <div>
                <Label htmlFor="pub-test" className="text-xs font-bold text-foreground cursor-pointer">
                  Publish to Catalog
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Immediately visible in student exam catalog and bundle workspaces.
                </p>
              </div>
              <input
                id="pub-test"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <Link href="/admin/tests">
              <Button type="button" variant="outline" size="sm" className="h-9 text-xs font-semibold">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              size="sm"
              className="h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  {isEdit ? "Saving Changes..." : "Creating Test..."}
                </>
              ) : (
                <>
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  {isEdit ? "Update Subject Test" : "Create Subject Test"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <Sheet open={docsSheetOpen} onOpenChange={setDocsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader className="border-b border-border/60 pb-4 text-left">
            <SheetTitle className="flex items-center gap-2 text-base font-bold">
              <FileText className="h-4 w-4 text-primary" />
              Examination Documents
            </SheetTitle>
            <SheetDescription className="text-xs">
              Upload official PDFs or clear scans. Question Paper max size is 5
              MB; Model Answer Key and Answer Sheet Template max size is 10 MB.
            </SheetDescription>
          </SheetHeader>

          <div className="my-5 space-y-5">
            <DocumentUploadSlot
              id="paper-upload"
              label="Question Paper PDF"
              hint="Mandatory · Max 5 MB"
              hintTone="primary"
              emptyTitle="Upload official question paper PDF"
              emptySubtitle="Drag & drop or click to browse (PDF/JPG/PNG · Max 5 MB)"
              maxBytes={MAX_QUESTION_PAPER_BYTES}
              maxSizeLabel="5 MB"
              file={paperFile}
              existingUrl={existingPaperUrl}
              isMissing={Boolean(missingFlags.paper && !clearPaper)}
              errorMessage={docErrors.paper || null}
              onValidationError={(err) =>
                setDocErrors((prev) => ({ ...prev, paper: err }))
              }
              onSelectFile={(f) => {
                setPaperFile(f)
                setClearPaper(false)
                setDocErrors((prev) => ({ ...prev, paper: null }))
              }}
              onClearPending={() => {
                setPaperFile(null)
                setDocErrors((prev) => ({ ...prev, paper: null }))
              }}
              onRemoveExisting={() => {
                setExistingPaperUrl(null)
                setClearPaper(true)
                setDocErrors((prev) => ({ ...prev, paper: null }))
              }}
              onPreview={(url) =>
                setPreviewDoc({
                  title: `${title || subject || "Subject Test"} — Question Paper`,
                  fileUrl: url,
                })
              }
            />

            <DocumentUploadSlot
              id="model-upload"
              label="Model Answer Key PDF (Optional)"
              hint="AI Reference · Max 10 MB"
              emptyTitle="Upload model answer key PDF"
              emptySubtitle="Drag & drop or click to browse (PDF/JPG/PNG · Max 10 MB)"
              maxBytes={MAX_SUPPORTING_DOC_BYTES}
              maxSizeLabel="10 MB"
              file={modelAnswerFile}
              existingUrl={existingModelUrl}
              isMissing={Boolean(missingFlags.model && !clearModel)}
              errorMessage={docErrors.model || null}
              onValidationError={(err) =>
                setDocErrors((prev) => ({ ...prev, model: err }))
              }
              onSelectFile={(f) => {
                setModelAnswerFile(f)
                setClearModel(false)
                setDocErrors((prev) => ({ ...prev, model: null }))
              }}
              onClearPending={() => {
                setModelAnswerFile(null)
                setDocErrors((prev) => ({ ...prev, model: null }))
              }}
              onRemoveExisting={() => {
                setExistingModelUrl(null)
                setClearModel(true)
                setDocErrors((prev) => ({ ...prev, model: null }))
              }}
              onPreview={(url) =>
                setPreviewDoc({
                  title: `${title || subject || "Subject Test"} — Model Answer Key`,
                  fileUrl: url,
                })
              }
            />

            <DocumentUploadSlot
              id="template-upload"
              label="Answer Sheet Template PDF (Optional)"
              hint="Printable Template · Max 10 MB"
              emptyTitle="Upload blank margin template PDF"
              emptySubtitle="Drag & drop or click to browse (PDF/JPG/PNG · Max 10 MB)"
              maxBytes={MAX_SUPPORTING_DOC_BYTES}
              maxSizeLabel="10 MB"
              file={answerSheetTemplateFile}
              existingUrl={existingTemplateUrl}
              isMissing={Boolean(missingFlags.template && !clearTemplate)}
              errorMessage={docErrors.template || null}
              onValidationError={(err) =>
                setDocErrors((prev) => ({ ...prev, template: err }))
              }
              onSelectFile={(f) => {
                setAnswerSheetTemplateFile(f)
                setClearTemplate(false)
                setDocErrors((prev) => ({ ...prev, template: null }))
              }}
              onClearPending={() => {
                setAnswerSheetTemplateFile(null)
                setDocErrors((prev) => ({ ...prev, template: null }))
              }}
              onRemoveExisting={() => {
                setExistingTemplateUrl(null)
                setClearTemplate(true)
                setDocErrors((prev) => ({ ...prev, template: null }))
              }}
              onPreview={(url) =>
                setPreviewDoc({
                  title: `${title || subject || "Subject Test"} — Answer Sheet Template`,
                  fileUrl: url,
                })
              }
            />
          </div>

          <SheetFooter className="border-t border-border/60 pt-4">
            <Button
              type="button"
              onClick={() => setDocsSheetOpen(false)}
              className="h-9 w-full text-xs font-semibold sm:w-auto"
            >
              Done ({[paperFile, modelAnswerFile, answerSheetTemplateFile].filter(Boolean).length} pending upload)
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={loading} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              {paperFile || modelAnswerFile || answerSheetTemplateFile
                ? "Uploading Examination Documents..."
                : "Saving Subject Test..."}
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Please wait while files are validated and encrypted into private
              storage. Do not close or refresh this tab.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 rounded-md border border-border/60 bg-muted/30 p-3 text-xs">
            {paperFile && (
              <p className="truncate font-medium">
                Question Paper: {paperFile.name} ({formatFileSize(paperFile.size)})
              </p>
            )}
            {modelAnswerFile && (
              <p className="truncate font-medium">
                Model Answer: {modelAnswerFile.name} ({formatFileSize(modelAnswerFile.size)})
              </p>
            )}
            {answerSheetTemplateFile && (
              <p className="truncate font-medium">
                Answer Template: {answerSheetTemplateFile.name} ({formatFileSize(answerSheetTemplateFile.size)})
              </p>
            )}
            {!paperFile && !modelAnswerFile && !answerSheetTemplateFile && (
              <p className="text-muted-foreground">
                Updating test configuration and rubric rules...
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {previewDoc && (
        <AdminPdfPreviewModal
          open={Boolean(previewDoc)}
          onOpenChange={(open) => !open && setPreviewDoc(null)}
          title={previewDoc.title}
          fileUrl={previewDoc.fileUrl}
        />
      )}
    </form>
  )
}

function DocumentUploadSlot({
  id,
  label,
  hint,
  hintTone = "muted",
  emptyTitle,
  emptySubtitle,
  maxBytes,
  maxSizeLabel,
  file,
  existingUrl,
  isMissing,
  errorMessage,
  onValidationError,
  onSelectFile,
  onClearPending,
  onRemoveExisting,
  onPreview,
}: {
  id: string
  label: string
  hint: string
  hintTone?: "primary" | "muted"
  emptyTitle: string
  emptySubtitle: string
  maxBytes: number
  maxSizeLabel: string
  file: File | null
  existingUrl: string | null
  isMissing: boolean
  errorMessage?: string | null
  onValidationError?: (error: string | null) => void
  onSelectFile: (file: File) => void
  onClearPending: () => void
  onRemoveExisting: () => void
  onPreview: (url: string) => void
}) {
  const [dragging, setDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const validateAndAccept = (candidate?: File | null) => {
    if (!candidate) return
    if (!ALLOWED_DOCUMENT_TYPES.includes(candidate.type)) {
      const msg = `Unsupported format (${candidate.type || "unknown"}). Upload PDF, JPG, PNG, or WebP.`
      onValidationError?.(msg)
      toast.error("Unsupported file format", { description: msg })
      return
    }
    if (candidate.size === 0) {
      const msg = "Selected file is empty (0 bytes)."
      onValidationError?.(msg)
      toast.error("Empty file rejected", { description: msg })
      return
    }
    if (candidate.size > maxBytes) {
      const msg = `Selected file (${formatFileSize(candidate.size)}) exceeds the ${maxSizeLabel} maximum limit.`
      onValidationError?.(msg)
      toast.error("File too large", { description: msg })
      return
    }
    onValidationError?.(null)
    onSelectFile(candidate)
  }

  const downloadUrl =
    existingUrl &&
    (existingUrl.includes("?")
      ? `${existingUrl}&download=1`
      : `${existingUrl}?download=1`)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id} className="text-xs font-semibold text-foreground">
          {label}
        </Label>
        <span
          className={`text-[10px] ${
            hintTone === "primary"
              ? "font-bold text-primary"
              : "text-muted-foreground"
          }`}
        >
          {hint}
        </span>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".pdf,application/pdf,image/jpeg,image/png,image/webp"
        onChange={(e) => {
          validateAndAccept(e.target.files?.[0])
          e.target.value = ""
        }}
        className="hidden"
      />

      {file ? (
        <div className="flex items-center justify-between gap-2 rounded-md border border-emerald-500/40 bg-emerald-500/5 p-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <FileCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-foreground">
                {file.name}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge className="h-4 border-0 bg-emerald-600 px-1.5 text-[10px] font-bold text-white">
                  New file ready
                </Badge>
                <span className="text-[10px] text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="h-7 px-2 text-[11px] font-semibold text-primary"
            >
              Change
            </Button>
            <button
              type="button"
              onClick={onClearPending}
              aria-label={`Discard selected ${label}`}
              className="rounded p-1 text-muted-foreground hover:text-rose-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : existingUrl ? (
        <div
          className={`space-y-2 rounded-md border p-3 ${
            isMissing
              ? "border-amber-400/70 bg-amber-50/70 dark:border-amber-800 dark:bg-amber-950/30"
              : "border-primary/30 bg-primary/5"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              {isMissing ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
              ) : (
                <FileCheck className="h-4 w-4 shrink-0 text-primary" />
              )}
              <div className="min-w-0">
                <p
                  className="truncate text-xs font-semibold text-foreground"
                  title={existingUrl}
                >
                  {extractReadableFilename(existingUrl, label)}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  {isMissing ? (
                    <Badge className="h-4 border-0 bg-amber-600 px-1.5 text-[10px] font-bold text-white">
                      Missing in storage — re-upload required
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="h-4 border-emerald-300 bg-emerald-50 px-1.5 text-[10px] font-semibold text-emerald-700"
                    >
                      Saved in storage
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">
              {!isMissing && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onPreview(existingUrl)}
                    aria-label={`Preview ${label}`}
                    className="h-7 px-2 text-[11px] font-semibold text-primary"
                  >
                    <Eye className="mr-1 h-3 w-3" /> Preview
                  </Button>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      download
                      aria-label={`Download ${label}`}
                      className="inline-flex h-7 items-center rounded px-2 text-[11px] font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <Download className="h-3 w-3" />
                    </a>
                  )}
                </>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => inputRef.current?.click()}
                className="h-7 px-2 text-[11px] font-semibold"
              >
                {isMissing ? "Upload PDF" : "Replace"}
              </Button>
              <button
                type="button"
                onClick={onRemoveExisting}
                aria-label={`Remove ${label}`}
                title="Remove current document"
                className="rounded p-1 text-muted-foreground hover:text-rose-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {isMissing && (
            <p className="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
              This document URL was saved without an uploaded file in storage.
              Click <strong>Upload PDF</strong> above and save changes to make
              it downloadable for students.
            </p>
          )}
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            validateAndAccept(e.dataTransfer.files?.[0])
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed p-4 text-center transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-border bg-muted/20 hover:border-primary/60 hover:bg-muted/40"
          }`}
        >
          <UploadCloud className="mb-1 h-5 w-5 text-muted-foreground" />
          <span className="text-xs font-semibold text-foreground">
            {emptyTitle}
          </span>
          <span className="mt-0.5 text-[10px] text-muted-foreground">
            {emptySubtitle}
          </span>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-[11px] font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
        >
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
