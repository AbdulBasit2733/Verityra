/**
 * Lightweight Sliding-Window Rate Limiter
 * Protects CPU-intensive operations (bcrypt hashing, order creation, password resets)
 * from brute-force floods and Denial-of-Service attacks.
 */

interface RateLimitBucket {
  timestamps: number[]
}

const globalForRateLimit = globalThis as unknown as {
  rateLimitStore: Map<string, RateLimitBucket> | undefined
}

const store = globalForRateLimit.rateLimitStore ?? new Map<string, RateLimitBucket>()
if (process.env.NODE_ENV !== "production") {
  globalForRateLimit.rateLimitStore = store
}

export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60_000
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now()
  const windowStart = now - windowMs

  // Prevent unbounded memory growth by pruning stale keys
  if (store.size > 1000) {
    for (const [k, bucket] of store.entries()) {
      const valid = bucket.timestamps.filter((t) => t > windowStart)
      if (valid.length === 0) {
        store.delete(k)
      } else {
        bucket.timestamps = valid
      }
    }
  }

  const bucket = store.get(key) || { timestamps: [] }
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart)

  if (bucket.timestamps.length >= maxRequests) {
    const oldestInWindow = bucket.timestamps[0]
    const retryAfterSeconds = Math.max(1, Math.ceil((oldestInWindow + windowMs - now) / 1000))
    return { allowed: false, retryAfterSeconds }
  }

  bucket.timestamps.push(now)
  store.set(key, bucket)
  return { allowed: true, retryAfterSeconds: 0 }
}
