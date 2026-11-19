"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

interface SubmissionStatusBadgeProps {
  submissionId: string
  initialStatus: string
  initialPercentage?: number | null
}

interface StatusResponse {
  submissionStatus: string
  evaluationStatus: string | null
  percentage: number | null
  totalMarksAwarded: number | null
  maxMarks: number | null
  jobStatus: string | null
  progress: number
  isProcessing: boolean
  isComplete: boolean
  isFailed: boolean
}

/**
 * Real-time Submission Status Badge with Polling
 *
 * Automatically polls the status endpoint every 3 seconds for PROCESSING submissions
 * Shows progress indicator and updates when evaluation completes
 *
 * Features:
 * - Auto-polling for PROCESSING submissions
 * - Progress indicator
 * - Auto-refresh page when evaluation completes
 * - Error handling and graceful degradation
 */
export function SubmissionStatusBadge({
  submissionId,
  initialStatus,
  initialPercentage,
}: SubmissionStatusBadgeProps) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [percentage, setPercentage] = useState(initialPercentage)
  const [progress, setProgress] = useState(0)
  const [isPolling, setIsPolling] = useState(initialStatus === "PROCESSING")

  useEffect(() => {
    // Only poll if status is PROCESSING
    if (!isPolling || status !== "PROCESSING") {
      return
    }

    let mounted = true
    let pollInterval: NodeJS.Timeout
    let inFlight = false
    const controller = new AbortController()

    const pollStatus = async () => {
      if (inFlight) return
      inFlight = true
      try {
        const response = await fetch(
          `/api/submissions/${submissionId}/status`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        )

        if (!response.ok) {
          console.error(
            "[Polling] Failed to fetch status:",
            response.statusText
          )
          return
        }

        const data: StatusResponse = await response.json()

        if (!mounted) return

        // Update status
        setStatus(data.submissionStatus)
        setPercentage(data.percentage)
        setProgress(data.progress || 0)

        // If evaluation complete, stop polling and refresh
        if (data.isComplete) {
          setIsPolling(false)
          clearInterval(pollInterval)

          // Wait a bit before refreshing to ensure cache is updated
          setTimeout(() => {
            if (mounted) {
              router.refresh()
            }
          }, 1000)
        }

        // If failed, stop polling
        if (data.isFailed) {
          setIsPolling(false)
          clearInterval(pollInterval)
        }
      } catch (error) {
        console.error("[Polling] Error fetching submission status:", error)
        // Continue polling even on error - might be temporary network issue
      } finally {
        inFlight = false
      }
    }

    // Poll immediately
    pollStatus()

    // Then poll every 3 seconds
    pollInterval = setInterval(pollStatus, 3000)

    return () => {
      mounted = false
      controller.abort()
      clearInterval(pollInterval)
    }
  }, [submissionId, status, isPolling])

  // Processing state with animation
  if (status === "PROCESSING") {
    return (
      <div className="flex flex-col gap-1.5">
        <Badge
          variant="outline"
          className="animate-pulse border-blue-200 bg-blue-50 text-[10px] font-semibold text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300"
        >
          <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
          Evaluating...
        </Badge>
        {progress > 0 && progress < 100 && (
          <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full w-full origin-left bg-blue-500 motion-safe:transition-transform motion-reduce:transition-none duration-300 dark:bg-blue-400"
              style={{ transform: `scaleX(${Math.min(100, Math.max(0, progress)) / 100})` }}
            />
          </div>
        )}
      </div>
    )
  }

  // Completed state
  if (status === "COMPLETED") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-300 bg-emerald-50 text-[10px] font-semibold text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-300"
      >
        Evaluated
        {percentage !== null &&
          percentage !== undefined &&
          ` (${percentage.toFixed(1)}%)`}
      </Badge>
    )
  }

  // Review required state
  if (status === "REVIEW_REQUIRED") {
    return (
      <Badge
        variant="outline"
        className="border-amber-300 bg-amber-50 text-[10px] font-semibold text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300"
      >
        Under Review
      </Badge>
    )
  }

  // Failed state
  if (status === "FAILED") {
    return (
      <Badge
        variant="outline"
        className="border-red-300 bg-red-50 text-[10px] font-semibold text-red-800 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-300"
      >
        Failed
      </Badge>
    )
  }

  // Default/pending state
  return (
    <Badge
      variant="outline"
      className="border-slate-300 bg-slate-100 text-[10px] font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      {status}
    </Badge>
  )
}
