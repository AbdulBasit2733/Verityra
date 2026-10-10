import { createClient, SupabaseClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

let supabaseClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

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
      url: `${bucketName}/${data.path}`,
    }
  }

  // Fallback to local file storage when Supabase Storage is not yet configured
  const fullDirPath = path.join(LOCAL_STORAGE_DIR, bucketName, path.dirname(filePath))
  if (!fs.existsSync(fullDirPath)) {
    fs.mkdirSync(fullDirPath, { recursive: true })
  }

  const fullFilePath = path.join(LOCAL_STORAGE_DIR, bucketName, filePath)
  fs.writeFileSync(fullFilePath, fileBuffer)

  return {
    path: filePath,
    url: `/api/files/download?bucket=${encodeURIComponent(bucketName)}&file=${encodeURIComponent(filePath)}`,
  }
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
      throw new Error(`Failed to generate signed URL: ${error?.message || "Unknown error"}`)
    }

    return data.signedUrl
  }

  // Fallback to local secure route
  return `/api/files/download?bucket=${encodeURIComponent(bucketName)}&file=${encodeURIComponent(filePath)}`
}
