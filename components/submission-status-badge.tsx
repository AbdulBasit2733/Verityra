"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

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
  const [isPolling, setIsPolling] = useState(initialStatus === 'PROCESSING')

  useEffect(() => {
    // Only poll if status is PROCESSING
    if (!isPolling || status !== 'PROCESSING') {
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
        const response = await fetch(`/api/submissions/${submissionId}/status`, {
          signal: controller.signal,
          cache: 'no-store',
        })

        if (!response.ok) {
          console.error('[Polling] Failed to fetch status:', response.statusText)
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
        console.error('[Polling] Error fetching submission status:', error)
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
  if (status === 'PROCESSING') {
    return (
      <div className="flex flex-col gap-1.5">
        <Badge
          variant="outline"
          className="border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[10px] font-semibold animate-pulse"
        >
          <Loader2 className="h-2.5 w-2.5 mr-1 animate-spin" />
          Evaluating...
        </Badge>
        {progress > 0 && progress < 100 && (
          <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 dark:bg-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  // Completed state
  if (status === 'COMPLETED') {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-semibold"
      >
        Evaluated
        {percentage !== null && percentage !== undefined && ` (${percentage.toFixed(1)}%)`}
      </Badge>
    )
  }

  // Review required state
  if (status === 'REVIEW_REQUIRED') {
    return (
      <Badge
        variant="outline"
        className="border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 text-[10px] font-semibold"
      >
        Under Review
      </Badge>
    )
  }

  // Failed state
  if (status === 'FAILED') {
    return (
      <Badge
        variant="outline"
        className="border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 text-[10px] font-semibold"
      >
        Failed
      </Badge>
    )
  }

  // Default/pending state
  return (
    <Badge
      variant="outline"
      className="border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 text-[10px] font-semibold"
    >
      {status}
    </Badge>
  )
}
