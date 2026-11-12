import Redis from "ioredis"

/**
 * Redis connection for BullMQ queue system
 *
 * Setup instructions:
 *
 * Option 1: Upstash Redis (Serverless, recommended for production)
 * - Create free account at upstash.com
 * - Create Redis database
 * - Add to .env: REDIS_URL="rediss://...@...upstash.io:..."
 *
 * Option 2: Local Redis (Development)
 * - Install Redis: docker run -d -p 6379:6379 redis:7-alpine
 * - Add to .env: REDIS_URL="redis://localhost:6379"
 *
 * Option 3: No Redis (Fallback)
 * - System will fall back to synchronous evaluation
 * - Not recommended for production
 */

const globalForRedis = globalThis as unknown as {
  redisConnection: Redis | null | undefined
  workerRedisConnection: Redis | null | undefined
}

function createRedisInstance(label: string): Redis | null {
  if (
    !process.env.REDIS_URL ||
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return null
  }

  try {
    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
      retryStrategy(times) {
        if (times > 5) {
          return null
        }
        const delay = Math.min(times * 200, 2000)
        return delay
      },
    })

    client.on("error", (err) => {
      console.error(`[Queue:${label}] Redis connection error:`, err.message)
    })

    client.on("connect", () => {
      console.log(`[Queue:${label}] Redis connected successfully`)
    })

    return client
  } catch (error) {
    console.error(`[Queue:${label}] Failed to create Redis connection:`, error)
    return null
  }
}

export function getRedisConnection(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null
  }

  if (globalForRedis.redisConnection) {
    return globalForRedis.redisConnection
  }

  const client = createRedisInstance("Producer")
  globalForRedis.redisConnection = client
  return client
}

export function getWorkerRedisConnection(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null
  }

  if (globalForRedis.workerRedisConnection) {
    return globalForRedis.workerRedisConnection
  }

  const client = createRedisInstance("Worker")
  globalForRedis.workerRedisConnection = client
  return client
}

export async function closeRedisConnection() {
  if (globalForRedis.redisConnection) {
    await globalForRedis.redisConnection.quit().catch(() => undefined)
    globalForRedis.redisConnection = null
  }
  if (globalForRedis.workerRedisConnection) {
    await globalForRedis.workerRedisConnection.quit().catch(() => undefined)
    globalForRedis.workerRedisConnection = null
  }
}
