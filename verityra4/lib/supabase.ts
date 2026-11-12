import { createClient, SupabaseClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

  if (!url || !key) {
    return null
  }

  if (!supabaseClient) {
    supabaseClient = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    })
  }

  return supabaseClient
}

const LOCAL_STORAGE_DIR = path.join(process.cwd(), "uploads")

/**
 * Uploads a file buffer either to private Supabase Storage or to local secure storage
 * Returns the storage path / identifier
 */
export async function uploadPrivateFile(
  bucketName: string,
  filePath: string,
  fileBuffer: Buffer,
  contentType: string
): Promise<{ path: string; url: string }> {
  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: true,
      })

    if (error) {
      console.error("[SUPABASE STORAGE ERROR]", error)
      throw new Error(`Failed to upload to Supabase storage: ${error.message}`)
    }

    return {
      path: data.path,
      url: privateFileDownloadUrl(bucketName, data.path),
    }
  }

  // Fallback to local file storage when Supabase Storage is not yet configured
  const fullDirPath = path.join(
    LOCAL_STORAGE_DIR,
    bucketName,
    path.dirname(filePath)
  )
  if (!fs.existsSync(fullDirPath)) {
    fs.mkdirSync(fullDirPath, { recursive: true })
  }

  const fullFilePath = path.join(LOCAL_STORAGE_DIR, bucketName, filePath)
  fs.writeFileSync(fullFilePath, fileBuffer)

  return {
    path: filePath,
    url: privateFileDownloadUrl(bucketName, filePath),
  }
}

export {
  privateFileDownloadUrl,
  normalizePrivateFileUrl,
  parsePrivateFileReference,
} from "./file-urls"

import { privateFileDownloadUrl } from "./file-urls"

export async function downloadPrivateFile(
  bucketName: string,
  filePath: string
): Promise<Buffer> {
  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath)
    if (error || !data) {
      throw new Error(
        `Failed to download from Supabase storage: ${error?.message || "File not found"}`
      )
    }
    return Buffer.from(await data.arrayBuffer())
  }

  const fullPath = path.resolve(LOCAL_STORAGE_DIR, bucketName, filePath)
  const storageRoot = path.resolve(LOCAL_STORAGE_DIR, bucketName) + path.sep
  if (!fullPath.startsWith(storageRoot) || !fs.existsSync(fullPath)) {
    throw new Error("Stored file was not found.")
  }
  return fs.promises.readFile(fullPath)
}

/**
 * Generates a short-lived signed URL for authorized access to private files
 */
export async function getSignedFileUrl(
  bucketName: string,
  filePath: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const supabase = getSupabase()

  if (supabase) {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresInSeconds)

    if (error || !data?.signedUrl) {
      throw new Error(
        `Failed to generate signed URL: ${error?.message || "Unknown error"}`
      )
    }

    return data.signedUrl
  }

  // Fallback to local secure route
  return `/api/files/download?bucket=${encodeURIComponent(bucketName)}&file=${encodeURIComponent(filePath)}`
}
