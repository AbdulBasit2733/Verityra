import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

/**
 * Standard configuration for interactive Prisma transactions across remote database connections.
 * Accommodates cross-region network latency (e.g. Supabase pooler) and prevents P2028 transaction expiration.
 */
export const DB_TX_OPTIONS = {
  maxWait: 10_000, // 10 seconds to wait for a connection from the pool
  timeout: 25_000, // 25 seconds execution window for interactive transactions
} as const

// Memoized database connectivity check with 10s TTL to prevent connection churn and redundant SELECT 1 round trips
let lastConnectionCheck = 0
let lastConnectionResult = false
const CONNECTION_CHECK_TTL_MS = 10_000

export async function isDatabaseConnected(): Promise<boolean> {
  const now = Date.now()
  if (now - lastConnectionCheck < CONNECTION_CHECK_TTL_MS) {
    return lastConnectionResult
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    lastConnectionResult = true
    lastConnectionCheck = now
    return true
  } catch {
    lastConnectionResult = false
    lastConnectionCheck = now
    return false
  }
}

/**
 * Manually reset connection cache when a reconnection is attempted
 */
export function resetDatabaseConnectionCache() {
  lastConnectionCheck = 0
}
