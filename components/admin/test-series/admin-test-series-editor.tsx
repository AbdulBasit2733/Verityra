"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { createTestSeriesAction, updateTestSeriesAction } from "@/actions/test-series-actions"
import { BookOpen, FileText, Loader2, Save, ShieldAlert, UploadCloud } from "lucide-react"

type EditorValues = {
  title: string
  description: string
  price: number
  maxMarks: number
  durationMinutes: number
  maxAttempts: number
  studentInstructions: string
  privateEvaluationInstructions: string
}

const defaultValues: EditorValues = {
  title: "",
  description: "",
  price: 0,
  maxMarks: 100,
  durationMinutes: 180,
  maxAttempts: 3,
  studentInstructions: `1. Read questions carefully and number responses in clear alignment with the question paper.
2. Maintain margins on the prescribed answer sheet template.
3. Solve all compulsory questions within the allotted duration.
4. Convert completed pages into an upright, high-contrast single PDF document before uploading.`,
  privateEvaluationInstructions: `CONFIDENTIAL EVALUATION CRITERIA:
1. Award marks for accurate concepts, clear reasoning, and relevant evidence.
2. Accept alternative sound methodologies when the underlying principle is rigorously applied.
3. Award method marks where the final answer contains a calculation or presentation slip.
4. Flag uncertainty when handwriting cannot be parsed with high confidence.`,
}

export function AdminTestSeriesEditor({
  testSeriesId,
  initialValues,
  documents,
}: {
  testSeriesId?: string
  initialValues?: Partial<EditorValues>
  documents?: React.ReactNode
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()
  const [values, setValues] = useState<EditorValues>({ ...defaultValues, ...initialValues })
  const [loading, setLoading] = useState(false)

  const set = <K extends keyof EditorValues>(key: K, value: EditorValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const confirmed = await confirm({
      title: testSeriesId ? "Save Test Series Changes?" : "Create New Test Series?",
      description: testSeriesId
        ? "The updated configuration will be used for future enrollments and evaluations."
        : `Create “${values.title || "Untitled series"}” in draft status and continue to document uploads.`,
      confirmText: testSeriesId ? "Save Changes" : "Create Test Series",
      cancelText: "Review Details",
      badgeText: "Test Series Configuration",
    })
    if (!confirmed) return

    setLoading(true)
    try {
      const result = testSeriesId
        ? await updateTestSeriesAction(testSeriesId, values)
        : await createTestSeriesAction({ ...values, status: "DRAFT" })

      if (!result.success) {
        showError({
          title: testSeriesId ? "Update Failed" : "Creation Failed",
          message: result.error || "Unable to save the test series.",
          code: "TEST_SERIES_EDITOR_ERROR",
        })
        return
      }

      toast.success(testSeriesId ? "Test series updated" : "Test series created")
      const createdId = "data" in result && result.data && typeof result.data === "object" && "id" in result.data
        ? String(result.data.id)
        : ""
      router.push(testSeriesId ? `/admin/test-series/${testSeriesId}` : `/admin/test-series/${createdId}`)
      router.refresh()
    } catch {
      showError({
        title: "Save Failed",
        message: "An unexpected error occurred while saving this test series.",
        code: "TEST_SERIES_EDITOR_ERROR",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          <TabsTrigger value="details" className="gap-2 px-4 py-2 text-xs font-semibold sm:text-sm">
            <BookOpen className="h-3.5 w-3.5" /> Details
          </TabsTrigger>
          <TabsTrigger value="instructions" className="gap-2 px-4 py-2 text-xs font-semibold sm:text-sm">
            <FileText className="h-3.5 w-3.5" /> Instructions
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2 px-4 py-2 text-xs font-semibold sm:text-sm">
            <UploadCloud className="h-3.5 w-3.5" /> Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold text-slate-900">Test Series Title</Label>
            <Input id="title" required value={values.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. UPSC CSE Mains 2026 GS Paper II Full Mock" className="h-10 rounded-lg" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-slate-900">Syllabus & Scope Description</Label>
            <Textarea id="description" required value={values.description} onChange={(e) => set("description", e.target.value)} placeholder="Topics, eligibility, question count, and examination format..." rows={4} className="rounded-lg" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Price in INR" htmlFor="price"><Input id="price" type="number" min={0} step={1} required value={values.price} onChange={(e) => set("price", Number(e.target.value))} className="h-10 rounded-lg" /><span className="text-[11px] text-slate-500">0 = Free enrollment</span></Field>
            <Field label="Maximum Total Marks" htmlFor="maxMarks"><Input id="maxMarks" type="number" min={1} max={10000} required value={values.maxMarks} onChange={(e) => set("maxMarks", Number(e.target.value))} className="h-10 rounded-lg" /></Field>
            <Field label="Duration (Minutes)" htmlFor="durationMinutes"><Input id="durationMinutes" type="number" min={10} required value={values.durationMinutes} onChange={(e) => set("durationMinutes", Number(e.target.value))} className="h-10 rounded-lg" /></Field>
            <Field label="Maximum Attempts" htmlFor="maxAttempts"><Input id="maxAttempts" type="number" min={1} max={3} required value={values.maxAttempts} onChange={(e) => set("maxAttempts", Number(e.target.value))} className="h-10 rounded-lg" /><span className="text-[11px] font-semibold text-blue-600">Maximum allowed: 3</span></Field>
          </div>
        </TabsContent>

        <TabsContent value="instructions" className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="studentInstructions" className="text-xs font-bold text-slate-900">Student-Facing Instructions</Label>
              <span className="text-[11px] text-slate-500">Visible to candidates</span>
            </div>
            <Textarea id="studentInstructions" required value={values.studentInstructions} onChange={(e) => set("studentInstructions", e.target.value)} rows={8} className="rounded-lg leading-relaxed" />
          </div>
          <div className="space-y-2 border-l-4 border-amber-500 bg-amber-50/50 py-3 pl-4 pr-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label htmlFor="privateEvaluationInstructions" className="flex items-center gap-1.5 text-xs font-bold text-amber-900"><ShieldAlert className="h-4 w-4" /> Private Evaluation Instructions</Label>
              <span className="rounded bg-amber-200/80 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">Admin only</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-800">These instructions are kept server-side and are never shown to students.</p>
            <Textarea id="privateEvaluationInstructions" required value={values.privateEvaluationInstructions} onChange={(e) => set("privateEvaluationInstructions", e.target.value)} rows={8} className="rounded-lg bg-white font-mono text-xs leading-relaxed" />
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-5 pt-1">
          {testSeriesId && documents ? documents : (
            <div className="border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
              <UploadCloud className="mx-auto mb-3 h-8 w-8 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-900">Save the series first</h3>
              <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500">After creation, return to this editor to upload the question paper, rubric, and answer-sheet template.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Separator />
      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/test-series")} className="h-10 rounded-lg">Cancel</Button>
        <Button type="submit" disabled={loading} className="h-10 rounded-lg bg-[#2A6AED] px-6 font-semibold text-white hover:bg-[#1E55C7]">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {testSeriesId ? "Save Changes" : "Create Test Series"}
        </Button>
      </div>
    </form>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label htmlFor={htmlFor} className="text-xs font-bold text-slate-900">{label}</Label>{children}</div>
}
