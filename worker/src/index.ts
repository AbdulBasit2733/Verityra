import http from "http"
import { config, validateWorkerConfig } from "./config.js"
import { checkDatabaseConnection } from "./db/prisma.js"
import { createEvaluationWorker, recoverPendingEvaluationJobs, shutdownWorker } from "./queue/processor.js"

console.log("==================================================")
console.log("       VERITYRA AI EVALUATION WORKER DAEMON       ")
console.log("==================================================")

validateWorkerConfig()

// Initialize background BullMQ evaluation worker
const worker = createEvaluationWorker()
console.log(`[Worker] Started BullMQ evaluation listener (Concurrency: ${config.workerConcurrency}).`)

// Initial database connection check
void checkDatabaseConnection().then((connected) => {
  if (connected) {
    console.log("[Worker] Database connection established.")
  } else {
    console.warn("[Worker] Warning: Initial database ping failed. Ensure DATABASE_URL is valid.")
  }
})

// HTTP Health Check Server for Hosting Platforms (Render, Railway, Fly.io, AWS ECS)
const healthServer = http.createServer((req, res) => {
  if (req.url === "/health" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(
      JSON.stringify({
        status: "healthy",
        service: "verityra-ai-evaluation-worker",
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

healthServer.listen(config.port, "0.0.0.0", () => {
  console.log(`[Worker] Health check HTTP server listening on port ${config.port}`)
})

// Periodic Stalled Job Recovery Sweep (every 3 minutes)
const recoveryTimer = setInterval(() => {
  void recoverPendingEvaluationJobs().catch((err) => {
    console.error("[Worker] Recovery sweep error:", err)
  })
}, config.recoveryIntervalMs)

// Run initial recovery sweep after 10 seconds
setTimeout(() => {
  void recoverPendingEvaluationJobs().catch((err) => {
    console.error("[Worker] Initial recovery sweep error:", err)
  })
}, 10_000)

// Graceful Process Termination
async function handleShutdown(signal: string) {
  console.log(`\n[Worker] Received ${signal}. Initiating graceful shutdown...`)
  clearInterval(recoveryTimer)

  healthServer.close(() => {
    console.log("[Worker] Health check server closed.")
  })

  try {
    await shutdownWorker()
    console.log("[Worker] Worker queues drained and database disconnected.")
  } catch (err) {
    console.error("[Worker] Error during shutdown:", err)
  }

  process.exit(0)
}

process.on("SIGINT", () => void handleShutdown("SIGINT"))
process.on("SIGTERM", () => void handleShutdown("SIGTERM"))
