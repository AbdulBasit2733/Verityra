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
import { createSubjectTestAction } from "@/actions/test-series-actions"
import {
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
} from "lucide-react"

interface AdminCreateSubjectTestFormProps {
  availableSubjects: MasterItem[]
  availableSeries: TestSeriesAttachmentOption[]
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
}: AdminCreateSubjectTestFormProps) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()

  const [loading, setLoading] = React.useState(false)

  // Form Fields
  const [title, setTitle] = React.useState("")
  const [subject, setSubject] = React.useState("Mathematics")
  const [testSeriesId, setTestSeriesId] = React.useState<string>("")
  const [attachToSeries, setAttachToSeries] = React.useState(true)
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("99")
  const [isStandalone, setIsStandalone] = React.useState(true)
  const [maxMarks, setMaxMarks] = React.useState("80")
  const [durationMinutes, setDurationMinutes] = React.useState("180")
  const [maxAttempts, setMaxAttempts] = React.useState("3")
  const [studentInstructions, setStudentInstructions] = React.useState(
    DEFAULT_STUDENT_INSTRUCTIONS
  )
  const [privateEvaluationInstructions, setPrivateEvaluationInstructions] =
    React.useState(DEFAULT_EVALUATION_INSTRUCTIONS)
  const [isPublished, setIsPublished] = React.useState(true)

  // Document Uploads
  const [paperFile, setPaperFile] = React.useState<File | null>(null)
  const [modelAnswerFile, setModelAnswerFile] = React.useState<File | null>(null)
  const [answerSheetTemplateFile, setAnswerSheetTemplateFile] = React.useState<File | null>(null)

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

  // Auto-fill title suggestion
  React.useEffect(() => {
    if (selectedSeries && subject && !title) {
      setTitle(`${selectedSeries.title} — ${subject} Mock 1`)
    }
  }, [selectedSeries, subject, title])

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

    const confirmed = await confirm({
      title: "Publish Subject Test?",
      description: attachToSeries && selectedSeries
        ? `This test for "${subject}" will be created and attached to "${selectedSeries.title}". Students enrolled in the bundle will get instant access.`
        : `This test for "${subject}" will be created as a standalone examination paper.`,
      confirmText: "Create Subject Test",
      cancelText: "Review Details",
      badgeText: "Subject Test Record",
    })
    if (!confirmed) return

    setLoading(true)
    try {
      // In development / demo mode or standard upload:
      let paperUrl: string | undefined
      if (paperFile) {
        paperUrl = `/api/files/download?bucket=verityra-private&file=tests/${encodeURIComponent(paperFile.name)}`
      }
      let modelUrl: string | undefined
      if (modelAnswerFile) {
        modelUrl = `/api/files/download?bucket=verityra-private&file=model-answers/${encodeURIComponent(modelAnswerFile.name)}`
      }
      let templateUrl: string | undefined
      if (answerSheetTemplateFile) {
        templateUrl = `/api/files/download?bucket=verityra-private&file=templates/${encodeURIComponent(answerSheetTemplateFile.name)}`
      }

      const res = await createSubjectTestAction({
        testSeriesId: attachToSeries && testSeriesId ? testSeriesId : null,
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim() || undefined,
        price: isStandalone ? parseFloat(price) || 0 : 0,
        isStandalone,
        maxMarks: parseFloat(maxMarks) || 80,
        durationMinutes: parseInt(durationMinutes, 10) || 180,
        maxAttempts: parseInt(maxAttempts, 10) || 3,
        questionPaperUrl: paperUrl,
        modelAnswerUrl: modelUrl,
        answerSheetUrl: templateUrl,
        studentInstructions: studentInstructions.trim() || undefined,
        privateEvaluationInstructions: privateEvaluationInstructions.trim() || undefined,
        status: isPublished ? ("PUBLISHED" as any) : ("DRAFT" as any),
        isPublished,
      })

      if (!res.success) {
        throw new Error(res.error || "Failed to create subject test.")
      }

      toast.success("Subject test created successfully!", {
        description: res.message,
      })
      router.push("/admin/tests")
      router.refresh()
    } catch (err: any) {
      showError({
        title: "Creation Failed",
        message: err?.message || "An unexpected error occurred while creating the test.",
        code: "TEST_CREATE_ERROR",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 12-Column Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Exam Documents & Series Attachment (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Document Uploads */}
          <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
            <div className="border-b border-border/60 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-primary" /> Examination Documents
              </h3>
              <span className="text-[11px] text-muted-foreground">PDF Format</span>
            </div>

            {/* Question Paper PDF */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Question Paper PDF</span>
                <span className="text-[10px] text-primary font-bold">Mandatory for Candidates</span>
              </Label>
              {paperFile ? (
                <div className="flex items-center justify-between p-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                      {paperFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPaperFile(null)}
                    className="text-muted-foreground hover:text-rose-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 rounded-md border border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                  <UploadCloud className="h-5 w-5 text-muted-foreground mb-1" />
                  <span className="text-xs font-semibold text-foreground">
                    Upload official question paper PDF
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">
                    Drag and drop or browse files
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setPaperFile(f)
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Model Answer PDF */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Model Answer Key PDF (Optional)</span>
                <span className="text-[10px] text-muted-foreground">For AI Reference</span>
              </Label>
              {modelAnswerFile ? (
                <div className="flex items-center justify-between p-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                      {modelAnswerFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModelAnswerFile(null)}
                    className="text-muted-foreground hover:text-rose-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-between p-2.5 rounded-md border border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                  <span className="text-xs text-muted-foreground">
                    Select model answer key PDF...
                  </span>
                  <span className="text-[10px] text-primary font-semibold">Browse</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setModelAnswerFile(f)
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Answer Sheet Template PDF */}
            <div className="space-y-1.5 pt-1">
              <Label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>Answer Sheet Template PDF (Optional)</span>
                <span className="text-[10px] text-muted-foreground">For Candidate Printout</span>
              </Label>
              {answerSheetTemplateFile ? (
                <div className="flex items-center justify-between p-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-center gap-2 truncate">
                    <FileCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-xs font-semibold text-foreground truncate max-w-[200px]">
                      {answerSheetTemplateFile.name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAnswerSheetTemplateFile(null)}
                    className="text-muted-foreground hover:text-rose-600 p-1"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center justify-between p-2.5 rounded-md border border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                  <span className="text-xs text-muted-foreground">
                    Select blank template PDF...
                  </span>
                  <span className="text-[10px] text-primary font-semibold">Browse</span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) setAnswerSheetTemplateFile(f)
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
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
                  Creating Test...
                </>
              ) : (
                <>
                  <FileText className="mr-1.5 h-3.5 w-3.5" />
                  Create Subject Test
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
