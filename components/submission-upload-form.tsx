"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { UploadCloud, Loader2, Lock, FileText } from "lucide-react"
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
  const confirm = useConfirm()
  const { showError } = useGlobalError()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const isLimitReached = attemptsUsed >= maxAttempts
  const nextAttempt = attemptsUsed + 1

  if (isLimitReached) {
    return (
      <div className="border-y border-red-200 bg-red-50/40 py-6 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm sm:text-base text-red-900">
              3-Attempt Quota Exhausted ({attemptsUsed} / {maxAttempts} Used)
            </h3>
            <p className="text-xs sm:text-sm text-red-700 mt-0.5 leading-relaxed">
              You have completed all {maxAttempts} allowable handwritten submissions for this test series. Further uploads are locked.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="border-red-300 text-red-700 bg-white shrink-0 w-fit">
          Locked by 3-Attempt Invariant
        </Badge>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) {
      toast.warning("No answer booklet selected", {
        description: "Please select your scanned PDF or image booklet before submitting.",
      })
      return
    }

    const confirmed = await confirm({
      title: `Submit Handwritten Attempt #${nextAttempt} of ${maxAttempts}?`,
      description: `Uploading "${file.name}" will consume 1 of your ${
        maxAttempts - attemptsUsed
      } remaining attempts for this test series. Please verify all pages are legible and upright.`,
      confirmText: `Submit Attempt #${nextAttempt}`,
      cancelText: "Review File",
      variant: "default",
      badgeText: `Attempt ${nextAttempt} of ${maxAttempts}`,
    })
    if (!confirmed) return

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("testSeriesId", testSeriesId)
      formData.append("file", file)

      const result = await submitAnswerSheetAction(formData)

      if (!result.success) {
        showError({
          title: "Answer Sheet Submission Rejected",
          message: result.error || "Unable to process your handwritten submission.",
          code: "SUBMISSION_REJECTED",
        })
        setLoading(false)
        return
      }

      toast.success(`Attempt #${result.data?.attemptNumber || nextAttempt} Evaluated`, {
        description:
          result.message ||
          "Your handwritten booklet has been encrypted, stored, and evaluated.",
      })
      setFile(null)
      setLoading(false)
      router.refresh()
    } catch (err) {
      console.error(err)
      showError({
        title: "Unexpected Upload Error",
        message: "An unexpected network or server error occurred during submission.",
        code: "UPLOAD_EXCEPTION",
      })
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <UploadCloud className="h-4.5 w-4.5 text-[#2A6AED] shrink-0" />
          <div>
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A]">
              Submit Attempt #{nextAttempt} of {maxAttempts}
            </h3>
            <p className="text-xs text-[#64748B]">
              Upload your scanned handwritten response booklet (PDF or clear image pages, max 25MB).
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="text-[11px] font-semibold text-[#2A6AED] bg-[#EFF6FF] border-blue-200 w-fit"
        >
          {maxAttempts - attemptsUsed} Attempt{maxAttempts - attemptsUsed === 1 ? "" : "s"} Remaining
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label
          htmlFor="answerSheetFile"
          className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-[#2A6AED] bg-slate-50/50 hover:bg-[#EFF6FF]/30 rounded-xl p-6 sm:p-8 text-center transition-colors cursor-pointer group"
        >
          <div className="h-11 w-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#2A6AED] mb-2.5">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-bold text-[#0F172A] group-hover:text-[#2A6AED] transition-colors">
              {file ? file.name : "Click to select scanned handwritten answer sheet"}
            </p>
            <Input
              id="answerSheetFile"
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <p className="text-[11px] sm:text-xs text-[#64748B]">
              {file
                ? `File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for encrypted submission`
                : "PDF, JPG, PNG or WEBP up to 25MB • Upright orientation recommended"}
            </p>
          </div>
        </label>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[11px] text-[#64748B]">
            * Submitting consumes 1 attempt allowance. Invalid file formats rejected prior to storage do not consume an attempt.
          </p>
          <Button
            type="submit"
            disabled={!file || loading}
            className="w-full sm:w-auto bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-xs sm:text-sm h-10 px-6 rounded-lg shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Encrypting & Evaluating...
              </>
            ) : (
              `Confirm & Submit Attempt #${nextAttempt}`
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
