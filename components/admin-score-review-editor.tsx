"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, CheckCircle2, ShieldCheck, AlertTriangle, FileText, ArrowRight } from "lucide-react"
import { adminReviewScoreAction } from "@/actions/evaluation-actions"

export function AdminScoreReviewEditor({
  submissionId,
  initialEvaluation,
  fileUrl,
}: {
  submissionId: string
  initialEvaluation: any
  fileUrl: string
}) {
  const router = useRouter()

  const [questions, setQuestions] = useState<any[]>(initialEvaluation.questions || [])
  const [adminNotes, setAdminNotes] = useState(initialEvaluation.adminNotes || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Recalculate total dynamically based on edited question scores
  const calculatedTotal = questions.reduce((acc, q) => acc + (parseFloat(q.marksAwarded) || 0), 0)
  const percentage = Number(((calculatedTotal / initialEvaluation.maxMarks) * 100).toFixed(2))

  function handleScoreChange(index: number, newScore: number) {
    const updated = [...questions]
    updated[index] = { ...updated[index], marksAwarded: newScore }
    setQuestions(updated)
  }

  function handleNotesChange(index: number, notes: string) {
    const updated = [...questions]
    updated[index] = { ...updated[index], adminNotes: notes }
    setQuestions(updated)
  }

  async function handleSaveReview(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const adjustments = questions.map((q) => ({
        questionEvaluationId: q.id,
        newMarksAwarded: Number(q.marksAwarded),
        adminNotes: q.adminNotes,
      }))

      const res = await adminReviewScoreAction(submissionId, adjustments, adminNotes)

      if (!res.success) {
        setError(res.error || "Failed to update review.")
        setLoading(false)
        return
      }

      setSuccess("Evaluation score adjusted and finalized with audit trail!")
      setLoading(false)
      router.refresh()
    } catch {
      setError("An unexpected server error occurred.")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSaveReview} className="space-y-6">
      {error && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="py-2 text-xs border-emerald-500 bg-emerald-50 text-emerald-800">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Answer Sheet Access Bar */}
      <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-[#D5E5F2] shadow-sm">
        <div className="flex items-center gap-2 text-xs">
          <FileText className="h-4 w-4 text-[#0784B5]" />
          <span className="font-semibold text-[#0B192C]">Student Handwritten Scan:</span>
          <span className="text-[#4B6375]">Protected Private Storage</span>
        </div>
        <a
          href={fileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0784B5] text-white text-xs font-semibold hover:bg-[#0784B5]/90"
        >
          <FileText className="h-3.5 w-3.5" />
          Open Student Answer Sheet
        </a>
      </div>

      {/* Score Summary Box */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-[#D5E5F2] bg-white p-4 shadow-sm">
          <span className="text-xs text-[#4B6375] block">Calculated Total</span>
          <span className="text-2xl font-extrabold text-[#0784B5]">
            {calculatedTotal} / {initialEvaluation.maxMarks}
          </span>
        </Card>
        <Card className="border-[#D5E5F2] bg-white p-4 shadow-sm">
          <span className="text-xs text-[#4B6375] block">Calculated Percentage</span>
          <span className="text-2xl font-extrabold text-emerald-600">{percentage}%</span>
        </Card>
        <Card className="border-[#D5E5F2] bg-white p-4 shadow-sm">
          <span className="text-xs text-[#4B6375] block">Evaluation Status</span>
          <span className="text-sm font-bold text-[#0B192C] block mt-1">
            {initialEvaluation.status}
          </span>
        </Card>
      </div>

      {/* Question scoring table */}
      <Card className="border-[#D5E5F2] bg-white shadow-sm overflow-hidden">
        <CardHeader className="py-4 border-b border-[#D5E5F2]">
          <CardTitle className="text-sm font-bold text-[#0B192C]">
            Question-wise Score Adjustment & Override
          </CardTitle>
          <CardDescription className="text-xs text-[#4B6375]">
            Verify each question score against student scan and rubric. Changes are recorded in AuditLog.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#CADEEF]/20 text-xs font-semibold text-[#0B192C]">
              <TableRow>
                <TableHead className="w-[80px]">Question</TableHead>
                <TableHead className="w-[100px]">Max Marks</TableHead>
                <TableHead className="w-[140px]">Awarded Marks</TableHead>
                <TableHead>Feedback & Concepts</TableHead>
                <TableHead className="w-[220px]">Admin Override Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {questions.map((q, index) => (
                <TableRow key={q.id}>
                  <TableCell className="font-bold text-[#0784B5]">{q.questionNumber}</TableCell>
                  <TableCell className="font-semibold">{q.maxMarks}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step={0.5}
                      min={0}
                      max={q.maxMarks}
                      value={q.marksAwarded}
                      onChange={(e) => handleScoreChange(index, parseFloat(e.target.value) || 0)}
                      className="border-[#D5E5F2] h-8 text-xs font-bold text-[#0784B5]"
                    />
                  </TableCell>
                  <TableCell className="text-[#4B6375] space-y-1">
                    <p>{q.feedback}</p>
                    {q.missingConcepts && (
                      <p className="text-[11px] text-amber-800 italic">
                        Missing: {q.missingConcepts}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      value={q.adminNotes || ""}
                      onChange={(e) => handleNotesChange(index, e.target.value)}
                      placeholder="Audit reason..."
                      className="border-[#D5E5F2] h-8 text-xs"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Overall Admin Audit Notes */}
      <Card className="border-[#D5E5F2] bg-white shadow-sm p-4 space-y-2">
        <Label className="text-xs font-bold text-[#0B192C]">
          Overall Admin Review Audit Justification
        </Label>
        <Textarea
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          placeholder="Record justification for score adjustments or confirmation of review..."
          rows={3}
          className="border-[#D5E5F2] text-xs"
        />
      </Card>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold text-xs h-10"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ShieldCheck className="h-4 w-4 mr-2" />}
        Save Adjusted Scores & Approve Result (Write Audit Log)
      </Button>
    </form>
  )
}
