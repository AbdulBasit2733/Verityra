import { Redis } from "ioredis"
import { config } from "../config.js"

let redisConnection: Redis | null = null

export function getRedisConnection(): Redis {
  if (redisConnection) {
    return redisConnection
  }

  const client = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy(times: number) {
      if (times > 10) {
        console.error("[Worker:Redis] Max reconnection attempts reached.")
        return null
      }
      return Math.min(times * 300, 3000)
    },
  })

  client.on("error", (err: Error) => {
    console.error("[Worker:Redis] Redis connection error:", err.message)
  })

  client.on("connect", () => {
    console.log("[Worker:Redis] Connected successfully to Redis.")
  })

  redisConnection = client
  return client
}

export async function closeRedisConnection(): Promise<void> {
  if (redisConnection) {
    await redisConnection.quit().catch(() => undefined)
    redisConnection = null
  }
}
