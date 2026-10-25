import Redis from 'ioredis'

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

let connection: Redis | null = null

export function getRedisConnection(): Redis | null {
  // Skip if no Redis URL configured
  if (!process.env.REDIS_URL) {
    console.warn('[Queue] REDIS_URL not configured. Background jobs disabled. Using synchronous evaluation.')
    return null
  }

  // Return existing connection
  if (connection) {
    return connection
  }

  try {
    // Create new connection
    connection = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null, // Required for BullMQ
      enableReadyCheck: false,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
    })

    connection.on('error', (err) => {
      console.error('[Queue] Redis connection error:', err.message)
    })

    connection.on('connect', () => {
      console.log('[Queue] Redis connected successfully')
    })

    return connection
  } catch (error) {
    console.error('[Queue] Failed to create Redis connection:', error)
    connection = null
    return null
  }
}

export async function closeRedisConnection() {
  if (connection) {
    await connection.quit()
    connection = null
  }
}
