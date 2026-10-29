import { createEvaluationWorker, recoverPendingEvaluationJobs, shutdownQueue } from "@/lib/queue/evaluation-queue"

const worker = createEvaluationWorker()

if (!worker) {
  console.error("[Evaluation Worker] REDIS_URL is required to start the worker.")
  process.exit(1)
}

console.log("[Evaluation Worker] Running.")

const recoveryIntervalMs = Math.max(
  60_000,
  Number(process.env.EVALUATION_RECOVERY_INTERVAL_MS || 180_000)
)
const recoveryTimer = setInterval(() => {
  void recoverPendingEvaluationJobs().catch((error) => {
    console.error('[Evaluation Worker] Recovery sweep failed:', error)
  })
}, recoveryIntervalMs)
void recoverPendingEvaluationJobs().catch((error) => {
  console.error('[Evaluation Worker] Initial recovery sweep failed:', error)
})

async function shutdown(signal: string) {
  console.log(`[Evaluation Worker] Received ${signal}; shutting down.`)
  clearInterval(recoveryTimer)
  await shutdownQueue()
  process.exit(0)
}

process.on("SIGINT", () => void shutdown("SIGINT"))
process.on("SIGTERM", () => void shutdown("SIGTERM"))
