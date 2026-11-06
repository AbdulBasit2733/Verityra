import { NextResponse } from 'next/server'
import { createEvaluationWorker } from '@/lib/queue/evaluation-queue'
import { getCurrentUser } from '@/lib/auth-guard'
import { Role } from '@prisma/client'

/**
 * Evaluation Worker Management API
 *
 * This endpoint manages the background evaluation worker that processes
 * submission evaluations asynchronously.
 *
 * Usage:
 * - GET /api/queue/worker - Start the worker (if not already running)
 * - POST /api/queue/worker - Health check / status
 *
 * Deployment Options:
 *
 * 1. Auto-start on Server Boot (Recommended for single-server deployments):
 *    - Worker starts automatically when this route is first loaded
 *    - Suitable for Vercel, single server deployments
 *
 * 2. Manual Start:
 *    - Call GET /api/queue/worker after deployment
 *    - Useful for testing and debugging
 *
 * 3. Separate Worker Process (Recommended for production at scale):
 *    - Deploy worker as separate process/container
 *    - Better isolation and scalability
 *    - See: lib/queue/worker.ts (standalone worker script)
 *
 * Security Note:
 * - Consider adding authentication for production
 * - Or restrict to internal network only
 */

let workerInstance: any = null
let workerStartTime: number | null = null

async function authorizeWorkerManagement(request: Request) {
  const internalSecret = process.env.EVALUATION_WORKER_SECRET
  if (internalSecret && request.headers.get('x-evaluation-worker-secret') === internalSecret) return true
  const user = await getCurrentUser()
  return user?.role === Role.ADMIN
}

// Only auto-start worker when explicitly enabled and never during Next.js build phase
if (
  process.env.AUTO_START_WORKER === 'true' &&
  process.env.NEXT_PHASE !== 'phase-production-build'
) {
  try {
    workerInstance = createEvaluationWorker()
    if (workerInstance) {
      workerStartTime = Date.now()
      console.log('[Worker API] Auto-started evaluation worker')
    }
  } catch (error) {
    console.error('[Worker API] Failed to auto-start worker:', error)
  }
}

/**
 * GET - Start or check worker
 */
export async function GET(request: Request) {
  try {
    if (!(await authorizeWorkerManagement(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!workerInstance) {
      workerInstance = createEvaluationWorker()

      if (!workerInstance) {
        return NextResponse.json(
          {
            status: 'unavailable',
            message: 'Redis not configured. Set REDIS_URL environment variable.',
            documentation: 'https://github.com/OptimalBits/bull#quick-guide',
          },
          { status: 503 }
        )
      }

      workerStartTime = Date.now()

      return NextResponse.json({
        status: 'started',
        message: 'Evaluation worker started successfully',
        startTime: new Date(workerStartTime).toISOString(),
      })
    }

    // Worker already running
    return NextResponse.json({
      status: 'running',
      message: 'Worker already running',
      uptime: workerStartTime ? Math.floor((Date.now() - workerStartTime) / 1000) : null,
      startTime: workerStartTime ? new Date(workerStartTime).toISOString() : null,
    })
  } catch (error: any) {
    console.error('[Worker API] Error starting worker:', error)

    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to start worker',
      },
      { status: 500 }
    )
  }
}

/**
 * POST - Health check / status
 */
export async function POST(request: Request) {
  try {
    if (!(await authorizeWorkerManagement(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const isRunning = !!workerInstance
    const uptime = workerStartTime ? Math.floor((Date.now() - workerStartTime) / 1000) : null

    return NextResponse.json({
      status: isRunning ? 'healthy' : 'stopped',
      worker: isRunning ? 'running' : 'not_running',
      uptime,
      startTime: workerStartTime ? new Date(workerStartTime).toISOString() : null,
      processUptime: Math.floor(process.uptime()),
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Health check failed',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Stop worker (graceful shutdown)
 * Use with caution - typically only needed for maintenance
 */
export async function DELETE(request: Request) {
  try {
    if (!(await authorizeWorkerManagement(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!workerInstance) {
      return NextResponse.json({
        status: 'not_running',
        message: 'Worker is not running',
      })
    }

    await workerInstance.close()
    workerInstance = null
    workerStartTime = null

    return NextResponse.json({
      status: 'stopped',
      message: 'Worker stopped successfully',
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: error.message || 'Failed to stop worker',
      },
      { status: 500 }
    )
  }
}
