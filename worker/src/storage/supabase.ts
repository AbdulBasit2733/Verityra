import { createClient, SupabaseClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import { config } from "../config.js"

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: { persistSession: false },
    })
  }

  return supabaseClient
}

const LOCAL_STORAGE_DIR = path.resolve(process.cwd(), "..", "verityra4", "uploads")

export function parsePrivateFileReference(
  fileUrl: string
): { bucket: string; filePath: string } | null {
  if (fileUrl.startsWith("/")) {
    try {
      const url = new URL(fileUrl, "http://localhost")
      const bucket = url.searchParams.get("bucket") || "verityra-private"
      const filePath = url.searchParams.get("file")
      return bucket && filePath ? { bucket, filePath } : null
    } catch {
      return null
    }
  }

  const separator = fileUrl.indexOf("/")
  if (separator <= 0 || separator === fileUrl.length - 1) return null

  const firstSegment = fileUrl.slice(0, separator)
  if (firstSegment === "verityra-private") {
    return { bucket: firstSegment, filePath: fileUrl.slice(separator + 1) }
  }

  if (["papers", "templates", "submissions", "model-answers"].includes(firstSegment)) {
    return { bucket: "verityra-private", filePath: fileUrl }
  }

  return { bucket: firstSegment, filePath: fileUrl.slice(separator + 1) }
}

export async function downloadPrivateFile(bucketName: string, filePath: string): Promise<Buffer> {
  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase.storage.from(bucketName).download(filePath)
    if (!error && data) {
      return Buffer.from(await data.arrayBuffer())
    }
    if (error) {
      console.warn(`[Worker:Storage] Supabase download error for ${filePath}: ${error.message}. Checking local storage fallback.`)
    }
  }

  // Fallback to local storage
  const fullPath = path.resolve(LOCAL_STORAGE_DIR, bucketName, filePath)
  if (fs.existsSync(fullPath)) {
    return await fs.promises.readFile(fullPath)
  }

  throw new Error(`File ${filePath} could not be retrieved from private storage.`)
}
