import dotenv from "dotenv"
dotenv.config()

export interface WorkerConfig {
  redisUrl: string
  databaseUrl: string
  directUrl?: string
  geminiApiKey: string
  geminiModel: string
  supabaseUrl?: string
  supabaseServiceKey?: string
  resendApiKey?: string
  resendFromEmail: string
  appBaseUrl: string
  port: number
  workerConcurrency: number
  recoveryIntervalMs: number
}

export const config: WorkerConfig = {
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",
  databaseUrl: process.env.DATABASE_URL || "",
  directUrl: process.env.DIRECT_URL,
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  geminiModel: process.env.GEMINI_MODEL?.trim() || "gemini-3.8-flash",
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceKey:
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL || "evaluations@verityra.com",
  appBaseUrl: (
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ).replace(/\/+$/, ""),
  port: parseInt(process.env.PORT || "8080", 10),
  workerConcurrency: Math.max(
    1,
    parseInt(process.env.WORKER_CONCURRENCY || "3", 10)
  ),
  recoveryIntervalMs: Math.max(
    60_000,
    parseInt(process.env.EVALUATION_RECOVERY_INTERVAL_MS || "180000", 10)
  ),
}

export function validateWorkerConfig(): void {
  if (!process.env.REDIS_URL) {
    console.warn(
      "[Config] REDIS_URL is not set. Defaulting to redis://localhost:6379"
    )
  }
  if (!process.env.DATABASE_URL) {
    console.warn("[Config] DATABASE_URL is not set.")
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn(
      "[Config] GEMINI_API_KEY is not set. Evaluations will run in simulation mode."
    )
  }
}
