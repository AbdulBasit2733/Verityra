/**
 * Uploads a File directly from the browser to a Supabase Signed Upload URL
 * via HTTP PUT, bypassing Next.js / Vercel 4.5 MB Server Action payload limits.
 */
export async function uploadFileToSignedUrl(
  signedUrl: string,
  file: File
): Promise<void> {
  const body = new FormData()
  body.append("cacheControl", "3600")
  body.append("", file)

  const response = await fetch(signedUrl, {
    method: "PUT",
    headers: {
      "x-upsert": "true",
    },
    body,
  })

  if (!response.ok) {
    let detail = response.statusText || `HTTP ${response.status}`
    try {
      const text = await response.text()
      if (text) {
        try {
          const parsed = JSON.parse(text) as { message?: string; error?: string }
          detail = parsed.message || parsed.error || detail
        } catch {
          detail = text.slice(0, 200)
        }
      }
    } catch {
      // Ignore secondary body read error
    }
    throw new Error(`Storage upload failed (${response.status}): ${detail}`)
  }
}
