"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  UploadCloud,
  Loader2,
  Lock,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Image as ImageIcon,
  FileCheck,
} from "lucide-react"
import { submitAnswerSheetAction } from "@/actions/submission-actions"

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_SUBMISSION_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]

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
  const [fileError, setFileError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewAcknowledged, setPreviewAcknowledged] = useState(false)
  const [evaluatingState, setEvaluatingState] =
    useState<EvaluatingState | null>(null)

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
    if (
      !evaluatingState ||
      evaluatingState.status === "COMPLETED" ||
      evaluatingState.status === "FAILED"
    ) {
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
          toast.info("Evaluation Continuing in Background", {
            description:
              "Your answer sheet was saved safely and AI grading is continuing in the background. Refresh shortly to view your scorecard.",
          })
          setEvaluatingState(null)
          router.refresh()
        }
        return
      }

      try {
        const res = await fetch(
          `/api/submissions/${evaluatingState.submissionId}/status`
        )
        if (!res.ok) return
        const data = await res.json()

        if (isCancelled) return

        if (
          data.submissionStatus === "COMPLETED" ||
          data.evaluationStatus === "COMPLETED"
        ) {
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
          toast.success(
            `Attempt #${evaluatingState.attemptNumber} Evaluated Successfully!`,
            {
              description:
                data.totalMarksAwarded != null
                  ? `Score: ${data.totalMarksAwarded} / ${data.maxMarks} marks (${data.percentage}%). Detailed scorecard is now available!`
                  : "Detailed rubric breakdown is now available in your scorecard.",
            }
          )
          router.refresh()
        } else if (
          data.submissionStatus === "REVIEW_REQUIRED" ||
          data.evaluationStatus === "REVIEW_REQUIRED"
        ) {
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
          toast.info(
            `Attempt #${evaluatingState.attemptNumber} Evaluated (Flagged for Review)`,
            {
              description:
                "Evaluation has finished and was flagged for moderation review.",
            }
          )
          router.refresh()
        } else if (
          data.submissionStatus === "FAILED" ||
          data.jobStatus === "FAILED"
        ) {
          clearInterval(interval)
          setEvaluatingState((prev) =>
            prev ? { ...prev, status: "FAILED" } : null
          )
          toast.error("Evaluation Encountered an Issue", {
            description:
              data.jobError ||
              "The evaluation worker encountered an issue. Your attempt has been saved.",
          })
          router.refresh()
        } else {
          // Still QUEUED or PROCESSING
          setEvaluatingState((prev) => {
            if (!prev) return null
            const nextProgress =
              data.progress > 0
                ? data.progress
                : Math.min(90, prev.progress + 15)
            return {
              ...prev,
              status:
                data.jobStatus === "PROCESSING" ||
                data.submissionStatus === "PROCESSING"
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
      <div className="flex flex-col justify-between gap-4 border-y border-red-200 bg-red-50/40 px-5 py-6 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-red-100 text-red-600">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-900 sm:text-base">
              3-Attempt Quota Exhausted ({attemptsUsed} / {maxAttempts} Used)
            </h3>
            <p className="mt-0.5 text-xs leading-relaxed text-red-700 sm:text-sm">
              You have completed all {maxAttempts} allowable handwritten
              submissions for this test series. Further uploads are locked.
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="w-fit shrink-0 border-red-300 bg-white text-red-700"
        >
          Locked by 3-Attempt Invariant
        </Badge>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (fileError) {
      toast.error("Cannot upload invalid file", { description: fileError })
      return
    }
    if (!file) {
      const msg = "Please select your scanned PDF or image booklet before submitting."
      setFileError(msg)
      toast.warning("No answer booklet selected", { description: msg })
      return
    }
    if (!ALLOWED_SUBMISSION_TYPES.includes(file.type)) {
      const msg = `Unsupported file format (${file.type}). Upload PDF, JPG, PNG, or WEBP.`
      setFileError(msg)
      toast.error("Unsupported format", { description: msg })
      return
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      const msg = `File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 10 MB maximum limit. Please compress your PDF before submitting.`
      setFileError(msg)
      toast.error("File size exceeded", { description: msg })
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
          message:
            result.error || "Unable to process your handwritten submission.",
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
          description:
            result.message ||
            "Your handwritten booklet has been encrypted and stored.",
        })
      }
      router.refresh()
    } catch {
      showError({
        title: "Unexpected Upload Error",
        message:
          "An unexpected network or server error occurred during submission.",
        code: "UPLOAD_EXCEPTION",
      })
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2.5">
          <UploadCloud className="h-4.5 w-4.5 shrink-0 text-[#2A6AED]" />
          <div>
            <h3 className="text-sm font-bold text-[#0F172A] sm:text-base">
              Submit Attempt #{nextAttempt} of {maxAttempts}
            </h3>
            <p className="text-xs text-[#64748B]">
              Upload your scanned handwritten response booklet (PDF or clear
              image pages, max 10MB).
            </p>
          </div>
        </div>
        <Badge
          variant="outline"
          className="w-fit border-blue-200 bg-[#EFF6FF] text-[11px] font-semibold text-[#2A6AED]"
        >
          {maxAttempts - attemptsUsed} Attempt
          {maxAttempts - attemptsUsed === 1 ? "" : "s"} Remaining
        </Badge>
      </div>

      {/* Live AI Evaluation Status Card */}
      {evaluatingState && (
        <div className="space-y-3 rounded-md border border-blue-200 bg-blue-50/70 p-4 shadow-2xs dark:border-blue-900/60 dark:bg-blue-950/40">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              {evaluatingState.status === "COMPLETED" ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : evaluatingState.status === "FAILED" ? (
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
              ) : (
                <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#2A6AED]" />
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
                  ? "w-fit shrink-0 border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                  : evaluatingState.status === "FAILED"
                    ? "w-fit shrink-0 border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : "w-fit shrink-0 border-blue-300 bg-white text-[#2A6AED] dark:bg-slate-900 dark:text-blue-400"
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

          {evaluatingState.status !== "COMPLETED" &&
            evaluatingState.status !== "FAILED" && (
              <div className="space-y-1.5 pt-1">
                <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200/70 dark:bg-blue-900/50">
                  <div
                    className="h-full w-full origin-left rounded-full bg-[#2A6AED] motion-safe:transition-transform motion-reduce:transition-none duration-500"
                    style={{ transform: `scaleX(${Math.min(100, Math.max(0, evaluatingState.progress)) / 100})` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>OCR transcription & criteria matching</span>
                  <span>{evaluatingState.progress}% complete</span>
                </div>
              </div>
            )}

          {evaluatingState.status === "COMPLETED" &&
            evaluatingState.marksAwarded != null && (
              <div className="flex items-center justify-between border-t border-blue-200/60 pt-2 text-xs dark:border-blue-900/40">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                  Score: {evaluatingState.marksAwarded} /{" "}
                  {evaluatingState.maxMarks} ({evaluatingState.percentage}%)
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
          className="group flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-slate-300 bg-slate-50/50 p-6 text-center transition-colors hover:border-[#2A6AED] hover:bg-[#EFF6FF]/30 sm:p-8"
        >
          <div className="mb-2.5 flex h-11 w-11 items-center justify-center rounded-sm border border-slate-200 bg-white text-[#2A6AED]">
            <FileText className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-bold text-[#0F172A] transition-colors group-hover:text-[#2A6AED] sm:text-sm">
              {file
                ? file.name
                : "Click to select scanned handwritten answer sheet"}
            </p>
            <Input
              id="answerSheetFile"
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null
                if (!selectedFile) return
                if (!ALLOWED_SUBMISSION_TYPES.includes(selectedFile.type)) {
                  const msg = `Unsupported file format (${selectedFile.type || "unknown"}). Upload PDF, JPG, PNG, or WEBP.`
                  setFileError(msg)
                  toast.error("Unsupported format", { description: msg })
                  e.currentTarget.value = ""
                  setFile(null)
                  return
                }
                if (selectedFile.size === 0) {
                  const msg = "Selected file is empty (0 bytes)."
                  setFileError(msg)
                  toast.error("Empty file rejected", { description: msg })
                  e.currentTarget.value = ""
                  setFile(null)
                  return
                }
                if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
                  const msg = `File size (${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 10 MB limit. Please compress your booklet to 10 MB or less.`
                  setFileError(msg)
                  toast.error("File exceeds 10 MB limit", { description: msg })
                  e.currentTarget.value = ""
                  setFile(null)
                  return
                }
                setFileError(null)
                setFile(selectedFile)
              }}
              className="hidden"
            />
            <p className="text-[11px] text-[#64748B] sm:text-xs">
              {file
                ? `File size: ${(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for encrypted submission`
                : "PDF, JPG, PNG or WEBP up to 10MB • Upright orientation recommended"}
            </p>
          </div>
        </label>

        {fileError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-md border border-rose-300 bg-rose-50 px-3.5 py-2.5 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{fileError}</span>
          </div>
        )}

        {/* File Preview Section */}
        {file && (
          <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-blue-100 dark:bg-blue-950">
                {file.type === "application/pdf" ? (
                  <FileCheck className="h-5 w-5 text-[#2A6AED]" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-[#2A6AED]" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                  {file.name}
                </h4>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
                  <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>
                    {file.type === "application/pdf"
                      ? "PDF Document"
                      : "Image File"}
                  </span>
                  {file.type === "application/pdf" && (
                    <>
                      <span>•</span>
                      <span>
                        ~{estimatePageCount(file.size)} pages (estimated)
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Image Preview Thumbnail */}
            {previewUrl && file.type.startsWith("image/") && (
              <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                <img
                  src={previewUrl}
                  alt="Preview of uploaded file"
                  className="h-auto max-h-64 w-full object-contain"
                />
              </div>
            )}

            {/* Legibility Checklist */}
            <div className="space-y-2 border-t border-slate-200 pt-2 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Before submitting, verify:
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    All pages are upright (not rotated or upside-down)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    Handwriting is clear and legible (no blur, sufficient
                    lighting)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    All answer sheet pages are included (no missing pages)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="font-medium">
                    Illegible submissions may receive reduced scores
                  </span>
                </li>
              </ul>

              {/* Acknowledgment Checkbox */}
              <label className="group flex cursor-pointer items-start gap-2.5 pt-2">
                <input
                  type="checkbox"
                  checked={previewAcknowledged}
                  onChange={(e) => setPreviewAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 cursor-pointer rounded-sm border-slate-300 text-[#2A6AED] focus:ring-[#2A6AED]"
                />
                <span className="text-xs font-medium text-slate-700 transition-colors group-hover:text-[#2A6AED] dark:text-slate-300">
                  I confirm all pages are legible, upright, and complete
                </span>
              </label>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[11px] text-[#64748B]">
            * Submitting consumes 1 attempt allowance. Invalid file formats
            rejected prior to storage do not consume an attempt.
          </p>
          <Button
            type="submit"
            disabled={!file || loading || !previewAcknowledged || Boolean(fileError)}
            className="h-10 w-full shrink-0 rounded-md bg-[#2A6AED] px-6 text-xs font-semibold text-white hover:bg-[#1E55C7] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading Booklet...
              </>
            ) : (
              `Confirm & Submit Attempt #${nextAttempt}`
            )}
          </Button>
        </div>
      </form>

      <Dialog open={loading} onOpenChange={() => {}}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Loader2 className="h-5 w-5 animate-spin text-[#2A6AED]" />
              Uploading Answer Booklet...
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed">
              Encrypting and uploading your handwritten submission to the
              evaluation queue. Please do not close or refresh this page.
            </DialogDescription>
          </DialogHeader>
          {file && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-900">
              <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
