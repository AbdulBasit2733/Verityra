import http from "http"
import {
  createEvaluationWorker,
  recoverPendingEvaluationJobs,
  shutdownQueue,
} from "@/lib/queue/evaluation-queue"

const worker = createEvaluationWorker()

if (!worker) {
  console.error(
    "[Evaluation Worker] REDIS_URL is required to start the worker."
  )
  process.exit(1)
}

console.log("[Evaluation Worker] Running.")

// When deployed on platforms like Render (Web Service), bind to process.env.PORT to satisfy health checks
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : null
let healthServer: http.Server | null = null

if (port) {
  healthServer = http.createServer((req, res) => {
    if (req.url === "/health" || req.url === "/") {
      res.writeHead(200, { "Content-Type": "application/json" })
      res.end(
        JSON.stringify({
          status: "healthy",
          worker: "running",
          uptimeSeconds: Math.floor(process.uptime()),
          timestamp: new Date().toISOString(),
        })
      )
      return
    }
    res.writeHead(404, { "Content-Type": "text/plain" })
    res.end("Not Found")
  })

  healthServer.listen(port, "0.0.0.0", () => {
    console.log(
      `[Evaluation Worker] Health check server listening on port ${port}`
    )
  })
}

const recoveryIntervalMs = Math.max(
  60_000,
  Number(process.env.EVALUATION_RECOVERY_INTERVAL_MS || 180_000)
)
const recoveryTimer = setInterval(() => {
  void recoverPendingEvaluationJobs().catch((error) => {
    console.error("[Evaluation Worker] Recovery sweep failed:", error)
  })
}, recoveryIntervalMs)
void recoverPendingEvaluationJobs().catch((error) => {
  console.error("[Evaluation Worker] Initial recovery sweep failed:", error)
})

async function shutdown(signal: string) {
  console.log(`[Evaluation Worker] Received ${signal}; shutting down.`)
  clearInterval(recoveryTimer)
  if (healthServer) {
    healthServer.close()
  }
  await shutdownQueue()
  process.exit(0)
}

process.on("SIGINT", () => void shutdown("SIGINT"))
process.on("SIGTERM", () => void shutdown("SIGTERM"))
