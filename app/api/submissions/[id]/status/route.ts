import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getEvaluationStatus } from '@/lib/queue/evaluation-queue'

/**
 * Submission Status Polling Endpoint
 *
 * GET /api/submissions/[id]/status
 *
 * Returns the current status of a submission and its evaluation job.
 * Used by the frontend to poll for real-time updates during evaluation.
 *
 * Response format:
 * {
 *   submissionId: string
 *   submissionStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REVIEW_REQUIRED"
 *   evaluationStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "REVIEW_REQUIRED" | ...
 *   percentage?: number (if evaluation complete)
 *   totalMarksAwarded?: number (if evaluation complete)
 *   jobStatus: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED" | "RETRYING"
 *   progress: number (0-100)
 *   error?: string (if job failed)
 * }
 *
 * Security Note:
 * - Currently open for all submissions
 * - Consider adding auth to restrict to submission owner + admins
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: submissionId } = await params

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID required' }, { status: 400 })
    }

    // Fetch submission with evaluation data
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      select: {
        id: true,
        status: true,
        submittedAt: true,
        evaluation: {
          select: {
            status: true,
            percentage: true,
            totalMarksAwarded: true,
            maxMarks: true,
            evaluatedAt: true,
            legibilityWarning: true,
            uncertaintyFlag: true,
          },
        },
      },
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Fetch job status from queue (if available)
    const jobStatus = await getEvaluationStatus(submissionId)

    // Build response
    const response = {
      submissionId: submission.id,
      submissionStatus: submission.status,
      submittedAt: submission.submittedAt.toISOString(),

      // Evaluation data (if available)
      evaluationStatus: submission.evaluation?.status || null,
      percentage: submission.evaluation?.percentage || null,
      totalMarksAwarded: submission.evaluation?.totalMarksAwarded || null,
      maxMarks: submission.evaluation?.maxMarks || null,
      evaluatedAt: submission.evaluation?.evaluatedAt?.toISOString() || null,
      legibilityWarning: submission.evaluation?.legibilityWarning || false,
      uncertaintyFlag: submission.evaluation?.uncertaintyFlag || false,

      // Job queue data (if available)
      jobStatus: jobStatus?.status || null,
      progress: jobStatus?.progress || 0,
      jobAttempts: jobStatus?.attempts || 0,
      jobError: jobStatus?.error || null,
      jobQueuedAt: jobStatus?.queuedAt?.toISOString() || null,
      jobStartedAt: jobStatus?.startedAt?.toISOString() || null,
      jobCompletedAt: jobStatus?.completedAt?.toISOString() || null,

      // Computed status for frontend
      isProcessing:
        submission.status === 'PROCESSING' ||
        jobStatus?.status === 'QUEUED' ||
        jobStatus?.status === 'PROCESSING',
      isComplete:
        submission.status === 'COMPLETED' || submission.status === 'REVIEW_REQUIRED',
      isFailed: submission.status === 'FAILED' || jobStatus?.status === 'FAILED',
    }

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('[Status API] Error fetching submission status:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch submission status',
        message: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}
