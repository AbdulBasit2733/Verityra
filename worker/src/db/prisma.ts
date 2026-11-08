import { PrismaClient } from "@prisma/client"
import { config } from "../config.js"

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: config.directUrl || config.databaseUrl,
    },
  },
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
})

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error("[Worker:DB] Failed to connect to database:", error)
    return false
  }
}
