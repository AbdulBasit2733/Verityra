import { NextResponse } from "next/server"
import { getEvaluationQueue } from "@/lib/queue/evaluation-queue"
import { getCurrentUser } from "@/lib/auth-guard"
import { Role } from "@prisma/client"

/**
 * Evaluation Queue Telemetry Endpoint
 *
 * Inspects Redis Queue status, active jobs, and backlog depth.
 * The evaluation worker runs as a dedicated standalone service in `worker/`.
 */

async function authorizeWorkerManagement(request: Request) {
  const internalSecret = process.env.EVALUATION_WORKER_SECRET
  if (
    internalSecret &&
    request.headers.get("x-evaluation-worker-secret") === internalSecret
  )
    return true
  const user = await getCurrentUser()
  return user?.role === Role.ADMIN
}

export async function GET(request: Request) {
  try {
    if (!(await authorizeWorkerManagement(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const queue = getEvaluationQueue()
    if (!queue) {
      return NextResponse.json(
        {
          status: "unavailable",
          message: "Redis queue connection is not configured or unavailable.",
        },
        { status: 503 }
      )
    }

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount().catch(() => 0),
      queue.getActiveCount().catch(() => 0),
      queue.getCompletedCount().catch(() => 0),
      queue.getFailedCount().catch(() => 0),
      queue.getDelayedCount().catch(() => 0),
    ])

    return NextResponse.json({
      status: "active",
      architecture: "standalone-worker-daemon",
      workerService: "worker/src/index.ts",
      queue: {
        waiting,
        active,
        completed,
        failed,
        delayed,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[Queue Telemetry API] Error fetching queue status:", error)
    return NextResponse.json(
      {
        status: "error",
        message: error.message || "Failed to fetch queue metrics",
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  return GET(request)
}
