"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { UploadCloud, Loader2, Lock, FileText, CheckCircle2, AlertCircle, Image as ImageIcon, FileCheck } from "lucide-react"
import { submitAnswerSheetAction } from "@/actions/submission-actions"

const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024

type EvaluatingState = {
  submissionId: string
  attemptNumber: number
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "REVIEW_REQUIRED" | "FAILED"
  progress: number
  marksAwarded?: number | null
  maxMarks?: number | null
  percentage?: number | null
}

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewAcknowledged, setPreviewAcknowledged] = useState(false)
  const [evaluatingState, setEvaluatingState] = useState<EvaluatingState | null>(null)

  const isLimitReached = attemptsUsed >= maxAttempts
  const nextAttempt = attemptsUsed + 1

  // Generate preview when file is selected
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      setPreviewAcknowledged(false)
      return
    }

    // For images, create an object URL for preview
    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      // Cleanup URL when component unmounts or file changes
      return () => URL.revokeObjectURL(url)
    }

    // For PDFs, no preview URL needed (will show metadata instead)
    setPreviewUrl(null)
  }, [file])

  // Helper: Estimate PDF page count based on file size (rough heuristic)
  const estimatePageCount = (fileSize: number): number => {
    // Average PDF page size: ~100-200KB for scanned handwriting
    const avgPageSize = 150 * 1024 // 150KB
    return Math.max(1, Math.round(fileSize / avgPageSize))
  }

  // Poll submission status until evaluation is completed or failed
  useEffect(() => {
    if (!evaluatingState || evaluatingState.status === "COMPLETED" || evaluatingState.status === "FAILED") {
      return
    }

    let pollCount = 0
    const maxPolls = 36 // 36 * 2.5s = 90s
    let isCancelled = false

    const interval = setInterval(async () => {
      pollCount++
      if (pollCount > maxPolls) {
        clearInterval(interval)
        if (!isCancelled) {
          toast.info("Evaluation Still Queued", {
            description:
              "Your submission is being processed by the AI evaluation worker. Check back shortly for updated scorecards.",
          })
          setEvaluatingState(null)
          router.refresh()
        }
        return
      }

      try {
        const res = await fetch(`/api/submissions/${evaluatingState.submissionId}/status`)
        if (!res.ok) return
        const data = await res.json()

        if (isCancelled) return

        if (data.submissionStatus === "COMPLETED" || data.evaluationStatus === "COMPLETED") {
          clearInterval(interval)
          setEvaluatingState((prev) =>
            prev
              ? {
                  ...prev,
                  status: "COMPLETED",
                  progress: 100,
                  marksAwarded: data.totalMarksAwarded,
                  maxMarks: data.maxMarks,
                  percentage: data.percentage,
                }
              : null
          )
          toast.success(`Attempt #${evaluatingState.attemptNumber} Evaluated Successfully!`, {
            description:
              data.totalMarksAwarded != null
                ? `Score: ${data.totalMarksAwarded} / ${data.maxMarks} marks (${data.percentage}%). Detailed scorecard is now available!`
                : "Detailed rubric breakdown is now available in your scorecard.",
          })
          router.refresh()
        } else if (data.submissionStatus === "REVIEW_REQUIRED" || data.evaluationStatus === "REVIEW_REQUIRED") {
          clearInterval(interval)
          setEvaluatingState((prev) =>
            prev
              ? {
                  ...prev,
                  status: "REVIEW_REQUIRED",
                  progress: 100,
                  marksAwarded: data.totalMarksAwarded,
                  maxMarks: data.maxMarks,
                  percentage: data.percentage,
                }
              : null
          )
          toast.info(`Attempt #${evaluatingState.attemptNumber} Evaluated (Flagged for Review)`, {
            description: "Evaluation has finished and was flagged for moderation review.",
          })
          router.refresh()
        } else if (data.submissionStatus === "FAILED" || data.jobStatus === "FAILED") {
          clearInterval(interval)
          setEvaluatingState((prev) => (prev ? { ...prev, status: "FAILED" } : null))
          toast.error("Evaluation Encountered an Issue", {
            description:
              data.jobError || "The evaluation worker encountered an issue. Your attempt has been saved.",
          })
          router.refresh()
        } else {
          // Still QUEUED or PROCESSING
          setEvaluatingState((prev) => {
            if (!prev) return null
            const nextProgress = data.progress > 0 ? data.progress : Math.min(90, prev.progress + 15)
            return {
              ...prev,
              status:
                data.jobStatus === "PROCESSING" || data.submissionStatus === "PROCESSING"
                  ? "PROCESSING"
                  : "QUEUED",
              progress: nextProgress,
            }
          })
        }
      } catch (err) {
        console.error("[STATUS POLL ERROR]", err)
      }
    }, 2500)

    return () => {
      isCancelled = true
      clearInterval(interval)
    }
  }, [evaluatingState?.submissionId, evaluatingState?.status, router])

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

      const attemptNum = result.data?.attemptNumber || nextAttempt
      const subId = result.data?.submissionId

      setFile(null)
      setPreviewUrl(null)
      setPreviewAcknowledged(false)
      setLoading(false)

      if (subId) {
        setEvaluatingState({
          submissionId: subId,
          attemptNumber: attemptNum,
          status: "QUEUED",
          progress: 15,
        })
        toast.info(`Attempt #${attemptNum} Submitted — Evaluation Queued`, {
          description:
            result.message ||
            "Your handwritten booklet has been encrypted and stored. Waiting for evaluation results...",
        })
      } else {
        toast.success(`Attempt #${attemptNum} Submitted`, {
          description: result.message || "Your handwritten booklet has been encrypted and stored.",
        })
      }
      router.refresh()
    } catch {
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
              Upload your scanned handwritten response booklet (PDF or clear image pages, max 2MB).
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

      {/* Live AI Evaluation Status Card */}
      {evaluatingState && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 shadow-2xs dark:border-blue-900/60 dark:bg-blue-950/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              {evaluatingState.status === "COMPLETED" ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : evaluatingState.status === "FAILED" ? (
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
              ) : (
                <Loader2 className="h-5 w-5 animate-spin text-[#2A6AED] shrink-0" />
              )}
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {evaluatingState.status === "COMPLETED"
                    ? `Attempt #${evaluatingState.attemptNumber} Evaluated Successfully`
                    : evaluatingState.status === "REVIEW_REQUIRED"
                    ? `Attempt #${evaluatingState.attemptNumber} Evaluated (Flagged for Review)`
                    : evaluatingState.status === "FAILED"
                    ? `Attempt #${evaluatingState.attemptNumber} Evaluation Unsuccessful`
                    : `Evaluating Attempt #${evaluatingState.attemptNumber}...`}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {evaluatingState.status === "COMPLETED"
                    ? "Detailed question scorecard and rubric breakdown have been published."
                    : evaluatingState.status === "REVIEW_REQUIRED"
                    ? "Completed by AI; pending administrative moderator verification."
                    : evaluatingState.status === "FAILED"
                    ? "Your booklet was safely saved. An admin can re-run grading from the console."
                    : "Live polling: verifying handwriting against rubric and model answers."}
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={
                evaluatingState.status === "COMPLETED"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shrink-0 w-fit"
                  : evaluatingState.status === "FAILED"
                  ? "border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300 shrink-0 w-fit"
                  : "border-blue-300 bg-white text-[#2A6AED] dark:bg-slate-900 dark:text-blue-400 shrink-0 w-fit"
              }
            >
              {evaluatingState.status === "COMPLETED"
                ? "Evaluated"
                : evaluatingState.status === "FAILED"
                ? "Failed"
                : evaluatingState.status === "PROCESSING"
                ? "Analyzing Handwriting"
                : "Queued for Evaluation"}
            </Badge>
          </div>

          {evaluatingState.status !== "COMPLETED" && evaluatingState.status !== "FAILED" && (
            <div className="space-y-1.5 pt-1">
              <div className="w-full bg-blue-200/70 dark:bg-blue-900/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-[#2A6AED] h-full transition-all duration-500 rounded-full"
                  style={{ width: `${evaluatingState.progress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>OCR transcription & criteria matching</span>
                <span>{evaluatingState.progress}% complete</span>
              </div>
            </div>
          )}

          {evaluatingState.status === "COMPLETED" && evaluatingState.marksAwarded != null && (
            <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                Score: {evaluatingState.marksAwarded} / {evaluatingState.maxMarks} ({evaluatingState.percentage}%)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Check the Evaluations tab to inspect question-level criteria
              </span>
            </div>
          )}
        </div>
      )}

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
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null
                if (selectedFile && selectedFile.size > MAX_FILE_SIZE_BYTES) {
                  toast.warning("File is too large", { description: "Please compress the scanned booklet to 2 MB or less before uploading." })
                  e.currentTarget.value = ""
                  setFile(null)
                  return
                }
                setFile(selectedFile)
              }}
              className="hidden"
            />
            <p className="text-[11px] sm:text-xs text-[#64748B]">
              {file
                ? `File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for encrypted submission`
                : "PDF, JPG, PNG or WEBP up to 2MB • Upright orientation recommended"}
            </p>
          </div>
        </label>

        {/* File Preview Section */}
        {file && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
                {file.type === "application/pdf" ? (
                  <FileCheck className="h-5 w-5 text-[#2A6AED]" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-[#2A6AED]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {file.name}
                </h4>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-600 dark:text-slate-400">
                  <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{file.type === "application/pdf" ? "PDF Document" : "Image File"}</span>
                  {file.type === "application/pdf" && (
                    <>
                      <span>•</span>
                      <span>~{estimatePageCount(file.size)} pages (estimated)</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Image Preview Thumbnail */}
            {previewUrl && file.type.startsWith("image/") && (
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800">
                <img
                  src={previewUrl}
                  alt="Preview of uploaded file"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            )}

            {/* Legibility Checklist */}
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Before submitting, verify:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>All pages are upright (not rotated or upside-down)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Handwriting is clear and legible (no blur, sufficient lighting)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>All answer sheet pages are included (no missing pages)</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span className="font-medium">Illegible submissions may receive reduced scores</span>
                </li>
              </ul>

              {/* Acknowledgment Checkbox */}
              <label className="flex items-start gap-2.5 pt-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={previewAcknowledged}
                  onChange={(e) => setPreviewAcknowledged(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-slate-300 text-[#2A6AED] focus:ring-[#2A6AED] cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300 group-hover:text-[#2A6AED] transition-colors">
                  I confirm all pages are legible, upright, and complete
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-[11px] text-[#64748B]">
            * Submitting consumes 1 attempt allowance. Invalid file formats rejected prior to storage do not consume an attempt.
          </p>
          <Button
            type="submit"
            disabled={!file || loading || !previewAcknowledged}
            className="w-full sm:w-auto bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-xs sm:text-sm h-10 px-6 rounded-lg shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
