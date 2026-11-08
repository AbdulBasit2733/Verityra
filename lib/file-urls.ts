/**
 * Isomorphic File URL Utilities
 *
 * Client-safe pure functions for normalizing and resolving private storage download URLs.
 * Safe to import in both client components and server actions.
 */

export function privateFileDownloadUrl(bucketName: string, filePath: string): string {
  return `/api/files/download?bucket=${encodeURIComponent(bucketName)}&file=${encodeURIComponent(filePath)}`
}

export function normalizePrivateFileUrl(fileUrl: string | null | undefined): string | null {
  if (!fileUrl) return null
  if (fileUrl.startsWith("/") || /^https?:\/\//i.test(fileUrl)) return fileUrl

  const reference = parsePrivateFileReference(fileUrl)
  return reference ? privateFileDownloadUrl(reference.bucket, reference.filePath) : null
}

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

  return null
}
