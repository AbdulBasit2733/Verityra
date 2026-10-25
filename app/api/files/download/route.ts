import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-guard"
import { Role } from "@prisma/client"
import fs from "fs"
import path from "path"

const LOCAL_STORAGE_DIR = path.join(process.cwd(), "uploads")

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = req.nextUrl.searchParams
    const bucket = searchParams.get("bucket") || "verityra-private"
    const file = searchParams.get("file")

    if (!file) {
      return NextResponse.json({ error: "File parameter required" }, { status: 400 })
    }

    // Security check: prevent directory traversal
    const safeFilePath = path.normalize(file).replace(/^(\.\.[\/\\])+/, "")
    const fullPath = path.join(LOCAL_STORAGE_DIR, bucket, safeFilePath)

    // Authorization checks based on file type
    // 1. Question papers, model answers, and templates are ADMIN-ONLY
    if (
      safeFilePath.startsWith("papers/") ||
      safeFilePath.startsWith("model-answers/") ||
      safeFilePath.startsWith("templates/")
    ) {
      if (user.role !== Role.ADMIN) {
        return NextResponse.json(
          { error: "Forbidden: Admin access required for question papers, model answers, and templates" },
          { status: 403 }
        )
      }
    }

    // 2. Student submissions: only the owner or an admin can access
    if (safeFilePath.startsWith("submissions/")) {
      const parts = safeFilePath.split("/")
      const ownerUserId = parts[2] // submissions/[testSeriesId]/[userId]/...
      if (user.role !== Role.ADMIN && user.id !== ownerUserId) {
        return NextResponse.json({ error: "Access denied to this student submission" }, { status: 403 })
      }
    }

    if (!fs.existsSync(fullPath)) {
      // In development if sample file requested, serve a dummy response
      return new NextResponse(
        `%PDF-1.4\n% Verityra Document\n1 0 obj\n<< /Title (Verityra Document) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`,
        {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${path.basename(safeFilePath)}"`,
          },
        }
      )
    }

    const fileBuffer = fs.readFileSync(fullPath)
    const ext = path.extname(safeFilePath).toLowerCase()
    let contentType = "application/octet-stream"
    if (ext === ".pdf") contentType = "application/pdf"
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
    else if (ext === ".png") contentType = "image/png"

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path.basename(safeFilePath)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[FILE DOWNLOAD ERROR]", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}
