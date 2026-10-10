"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud, Loader2, CheckCircle2, Lock, AlertCircle, FileText } from "lucide-react"
import { submitAnswerSheetAction } from "@/actions/submission-actions"

export function SubmissionUploadForm({
  testSeriesId,
  attemptsUsed,
  maxAttempts,
}: {
  testSeriesId: string
  attemptsUsed: number
  maxAttempts: number
}) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isLimitReached = attemptsUsed >= maxAttempts
  const nextAttempt = attemptsUsed + 1

  if (isLimitReached) {
    return (
      <Card className="border-red-200 bg-red-50/50 shadow-sm">
        <CardContent className="p-6 text-center space-y-3">
          <div className="h-12 w-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-red-900">Attempt Limit Reached</h3>
            <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">
              You have completed all {maxAttempts} allowable handwritten submissions for this test series. Further uploads are blocked. Your evaluated answer sheets and itemized rubric scores remain accessible below.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      setError("Please select your scanned answer sheet file.")
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("testSeriesId", testSeriesId)
      formData.append("file", file)

      // Execute Server Action directly on server
      const result = await submitAnswerSheetAction(formData)

      if (!result.success) {
        setError(result.error || "Submission failed.")
        setLoading(false)
        return
      }

      setSuccess(result.message || `Attempt ${result.data?.attemptNumber} submitted and evaluated successfully!`)
      setFile(null)
      setLoading(false)

      router.refresh()
    } catch (err) {
      console.error(err)
      setError("An unexpected error occurred during submission.")
      setLoading(false)
    }
  }

  return (
    <Card className="border-[#9BD4E4] bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-[#0B192C] flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-[#0784B5]" />
            Submit Attempt {nextAttempt} of {maxAttempts}
          </CardTitle>
          <span className="text-xs font-semibold text-[#0784B5] bg-[#CADEEF]/40 px-2.5 py-0.5 rounded-full">
            {maxAttempts - attemptsUsed} Remaining
          </span>
        </div>
        <CardDescription className="text-xs text-[#4B6375]">
          Upload your scanned handwritten response (PDF or clear image pages). Max file size: 25MB.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4 py-2 text-xs">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 py-2 text-xs border-emerald-500 bg-emerald-50 text-emerald-800">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 mr-2" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-[#CADEEF] rounded-xl p-6 text-center hover:border-[#39ACE7] transition-colors bg-[#F2F7FA]/50">
            <FileText className="h-8 w-8 text-[#0784B5] mx-auto mb-2 opacity-70" />
            <div className="space-y-1">
              <Label htmlFor="answerSheetFile" className="text-xs font-semibold text-[#0784B5] cursor-pointer hover:underline">
                {file ? file.name : "Click to select handwritten answer sheet (PDF / JPG / PNG)"}
              </Label>
              <Input
                id="answerSheetFile"
                type="file"
                accept=".pdf,image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <p className="text-[11px] text-[#4B6375]">
                {file
                  ? `Selected: ${(file.size / (1024 * 1024)).toFixed(2)} MB`
                  : "Ensure all pages are oriented upright and handwriting is clearly legible."}
              </p>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!file || loading}
            className="w-full bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold text-xs h-10"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Encrypting & Evaluating Answer Sheet...
              </>
            ) : (
              `Confirm & Submit Attempt ${nextAttempt}`
            )}
          </Button>

          <p className="text-[11px] text-[#4B6375] text-center">
            * Note: Submitting consumes one attempt. Please ensure you have reviewed your pages before confirming.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
