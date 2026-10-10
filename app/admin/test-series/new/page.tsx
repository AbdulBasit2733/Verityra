"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, CheckCircle2, ShieldAlert, BookOpen } from "lucide-react"
import { createTestSeriesAction } from "@/actions/test-series-actions"
import { TestSeriesStatus } from "@prisma/client"

export default function CreateTestSeriesPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [maxMarks, setMaxMarks] = useState<number>(100)
  const [durationMinutes, setDurationMinutes] = useState<number>(180)
  const [maxAttempts, setMaxAttempts] = useState<number>(3)
  const [status, setStatus] = useState<TestSeriesStatus>(TestSeriesStatus.DRAFT)
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
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

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
        setError(res.error || "Failed to create test series.")
        setLoading(false)
        return
      }

      router.push(`/admin/test-series/${res.data?.id || ""}`)
      router.refresh()
    } catch {
      setError("An unexpected server error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        href="/admin/test-series"
        className="inline-flex items-center text-xs font-medium text-[#4B6375] hover:text-[#0784B5] transition-colors"
      >
        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
        Back to Test Series List
      </Link>

      <div>
        <h1 className="text-2xl font-extrabold text-[#0B192C]">Create Test Series</h1>
        <p className="text-xs text-[#4B6375] mt-1">
          Configure examination rules, attempt limits, and establish separate student vs evaluator instruction boundaries.
        </p>
      </div>

      <Card className="border-[#D5E5F2] bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-[#0B192C]">Test Series Specification</CardTitle>
          <CardDescription className="text-xs text-[#4B6375]">
            All fields will be validated server-side.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4 py-2 text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="title" className="text-xs font-semibold text-[#0B192C]">
                Test Series Title
              </Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. UPSC CSE Mains 2026 GS Paper II Full Mock"
                className="mt-1 border-[#D5E5F2] text-xs h-9"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-xs font-semibold text-[#0B192C]">
                Syllabus & Scope Description
              </Label>
              <Textarea
                id="description"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Overview of topics, eligibility, question count, and examination format..."
                rows={3}
                className="mt-1 border-[#D5E5F2] text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="price" className="text-xs font-semibold text-[#0B192C]">
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
                  className="mt-1 border-[#D5E5F2] text-xs h-9"
                />
                <span className="text-[10px] text-[#4B6375]">0 = Free Registration</span>
              </div>

              <div>
                <Label htmlFor="maxMarks" className="text-xs font-semibold text-[#0B192C]">
                  Maximum Total Marks
                </Label>
                <Input
                  id="maxMarks"
                  type="number"
                  min={1}
                  required
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value))}
                  className="mt-1 border-[#D5E5F2] text-xs h-9"
                />
              </div>

              <div>
                <Label htmlFor="durationMinutes" className="text-xs font-semibold text-[#0B192C]">
                  Duration (Minutes)
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={10}
                  required
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="mt-1 border-[#D5E5F2] text-xs h-9"
                />
              </div>

              <div>
                <Label htmlFor="maxAttempts" className="text-xs font-semibold text-[#0784B5]">
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
                  className="mt-1 border-[#0784B5] text-xs h-9 font-bold text-[#0784B5]"
                />
                <span className="text-[10px] text-[#0784B5] font-medium">Default: 3 attempts</span>
              </div>
            </div>

            {/* TWO SEPARATE INSTRUCTION SYSTEMS */}
            <div className="pt-2 border-t border-[#D5E5F2] space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Label htmlFor="studentInstructions" className="text-xs font-bold text-[#0B192C]">
                    A. Student-Facing Instructions (Public to Candidates)
                  </Label>
                  <span className="text-[11px] text-[#4B6375]">Displayed on test & workspace</span>
                </div>
                <Textarea
                  id="studentInstructions"
                  required
                  value={studentInstructions}
                  onChange={(e) => setStudentInstructions(e.target.value)}
                  rows={4}
                  className="mt-1 border-[#D5E5F2] text-xs leading-relaxed font-sans"
                />
              </div>

              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="privateEvaluationInstructions" className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-amber-700" />
                    B. Private Evaluation Instructions (CONFIDENTIAL — For Evaluator Only)
                  </Label>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded uppercase">
                    Never leaked to students
                  </span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Provide exact marking criteria, partial credit formulas, acceptable alternative answers, and uncertainty thresholds.
                </p>
                <Textarea
                  id="privateEvaluationInstructions"
                  required
                  value={privateEvaluationInstructions}
                  onChange={(e) => setPrivateEvaluationInstructions(e.target.value)}
                  rows={4}
                  className="border-amber-300 text-xs bg-white text-[#0B192C] leading-relaxed font-mono"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold text-xs h-10 mt-4"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Test Series & Proceed to Document Uploads
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
