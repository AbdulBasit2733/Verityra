"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { PageHeader } from "@/components/ui/page-header"
import { ArrowLeft, BookOpen, Loader2, ShieldAlert } from "lucide-react"
import { createTestSeriesAction } from "@/actions/test-series-actions"
import { TestSeriesStatus } from "@prisma/client"

export default function CreateTestSeriesPage() {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [maxMarks, setMaxMarks] = useState<number>(100)
  const [durationMinutes, setDurationMinutes] = useState<number>(180)
  const [maxAttempts, setMaxAttempts] = useState<number>(3)
  const [status] = useState<TestSeriesStatus>(TestSeriesStatus.DRAFT)
  const [studentInstructions, setStudentInstructions] = useState(
    `1. Read questions carefully and number responses in clear alignment with the question paper.
2. Maintain margins on the prescribed answer sheet template.
3. Solve all compulsory questions within the allotted duration.
4. Convert completed pages into an upright, high-contrast single PDF document before uploading.`
  )
  const [privateEvaluationInstructions, setPrivateEvaluationInstructions] = useState(
    `CONFIDENTIAL EVALUATION CRITERIA:
1. Question 1: Award 40% for accurate core definition, 40% for step-by-step breakdown, 20% for practical relevance.
2. Accept alternative sound methodologies if the underlying principle is rigorously applied.
3. Partial credit: Deduct 1 mark for missing units or calculation slips, but award method marks.
4. Flag uncertainty immediately if handwriting cannot be parsed with high confidence.`
  )

  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const confirmed = await confirm({
      title: "Create New Test Series Specification?",
      description: `This will create "${title}" in DRAFT status with ${maxAttempts} default attempts and isolated student/evaluator instructions.`,
      confirmText: "Create Test Series",
      cancelText: "Review Details",
      badgeText: "Catalog Configuration",
    })
    if (!confirmed) return

    setLoading(true)

    try {
      const res = await createTestSeriesAction({
        title,
        description,
        price: Number(price),
        maxMarks: Number(maxMarks),
        durationMinutes: Number(durationMinutes),
        maxAttempts: Number(maxAttempts),
        studentInstructions,
        privateEvaluationInstructions,
        status,
      })

      if (!res.success) {
        showError({
          title: "Test Series Creation Failed",
          message: res.error || "Failed to create test series.",
          code: "CREATE_SERIES_ERR",
        })
        setLoading(false)
        return
      }

      toast.success("Test series created", {
        description: `"${title}" is ready for question paper and margin template uploads.`,
      })
      router.push(`/admin/test-series/${res.data?.id || ""}`)
      router.refresh()
    } catch {
      showError({
        title: "Unexpected Server Error",
        message: "An unexpected server error occurred while creating the test series.",
        code: "SYS_ERR",
      })
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <PageHeader
        icon={BookOpen}
        title="Create Test Series"
        subtitle="Configure examination rules, attempt limits, and establish separate student vs. evaluator instruction boundaries"
        showRefresh={false}
      >
        <Link href="/admin/test-series">
          <Button
            variant="outline"
            size="sm"
            className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Catalog
          </Button>
        </Link>
      </PageHeader>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-bold text-[#0F172A]">
              Test Series Title
            </Label>
            <Input
              id="title"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. UPSC CSE Mains 2026 GS Paper II Full Mock"
              className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-bold text-[#0F172A]">
              Syllabus & Scope Description
            </Label>
            <Textarea
              id="description"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Overview of topics, eligibility, question count, and examination format..."
              rows={3}
              className="rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-bold text-[#0F172A]">
                Price in INR (₹)
              </Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={1}
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0 for free"
                className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
              />
              <span className="text-[11px] text-slate-400 block">0 = Free Enrollment</span>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxMarks" className="text-xs font-bold text-[#0F172A]">
                Maximum Total Marks
              </Label>
              <Input
                id="maxMarks"
                type="number"
                min={1}
                required
                value={maxMarks}
                onChange={(e) => setMaxMarks(Number(e.target.value))}
                className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="durationMinutes" className="text-xs font-bold text-[#0F172A]">
                Duration (Minutes)
              </Label>
              <Input
                id="durationMinutes"
                type="number"
                min={10}
                required
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="h-10 rounded-lg border-slate-200 bg-white text-xs sm:text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxAttempts" className="text-xs font-bold text-[#2A6AED]">
                Max Attempts Allowed
              </Label>
              <Input
                id="maxAttempts"
                type="number"
                min={1}
                max={5}
                required
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="h-10 rounded-lg border-blue-200 bg-white text-xs sm:text-sm font-bold text-[#2A6AED]"
              />
              <span className="text-[11px] text-[#2A6AED] font-semibold block">
                Default: 3 attempts
              </span>
            </div>
          </div>
        </div>

        <Separator className="bg-slate-200" />

        {/* TWO SEPARATE INSTRUCTION SYSTEMS */}
        <div className="space-y-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <Label htmlFor="studentInstructions" className="text-xs font-bold text-[#0F172A]">
                A. Student-Facing Instructions (Public to Candidates)
              </Label>
              <span className="text-[11px] text-slate-400">Displayed on test & workspace</span>
            </div>
            <Textarea
              id="studentInstructions"
              required
              value={studentInstructions}
              onChange={(e) => setStudentInstructions(e.target.value)}
              rows={4}
              className="rounded-lg border-slate-200 bg-white text-xs sm:text-sm leading-relaxed"
            />
          </div>

          <div className="border-l-4 border-amber-500 bg-amber-50/40 pl-4 py-3 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label
                htmlFor="privateEvaluationInstructions"
                className="text-xs font-bold text-amber-900 flex items-center gap-1.5"
              >
                <ShieldAlert className="h-4 w-4 text-amber-700 shrink-0" />
                B. Private Evaluation Instructions (CONFIDENTIAL — For Evaluator Only)
              </Label>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded uppercase">
                Never exposed to students
              </span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Provide exact marking criteria, partial credit formulas, acceptable alternative answers, and uncertainty thresholds.
            </p>
            <Textarea
              id="privateEvaluationInstructions"
              required
              value={privateEvaluationInstructions}
              onChange={(e) => setPrivateEvaluationInstructions(e.target.value)}
              rows={4}
              className="rounded-lg border-amber-300 text-xs bg-white text-slate-900 leading-relaxed font-mono"
            />
          </div>
        </div>

        <Separator className="bg-slate-200" />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-xs sm:text-sm h-10 px-6 rounded-lg"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Test Series & Proceed to Document Uploads
          </Button>
        </div>
      </form>
    </div>
  )
}
