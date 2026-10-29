import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-guard"
import { RegistrationStatus, Role } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { getSupabase } from "@/lib/supabase"
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

    if (!file || bucket !== "verityra-private") {
      return NextResponse.json({ error: "A valid private file is required." }, { status: 400 })
    }

    const safeFilePath = path.posix.normalize(file.replace(/\\/g, "/"))
    if (safeFilePath.startsWith("../") || safeFilePath === ".." || path.posix.isAbsolute(safeFilePath)) {
      return NextResponse.json({ error: "Invalid file path." }, { status: 400 })
    }

    const [fileType, testSeriesId, ownerUserId] = safeFilePath.split("/")
    if (!testSeriesId || !safeFilePath.includes("/")) {
      return NextResponse.json({ error: "Invalid file path." }, { status: 400 })
    }

    if (fileType === "submissions") {
      if (user.role !== Role.ADMIN && user.id !== ownerUserId) {
        return NextResponse.json({ error: "Access denied to this student submission" }, { status: 403 })
      }
    } else if (fileType === "papers" || fileType === "templates") {
      if (user.role !== Role.ADMIN) {
        const registration = await prisma.testRegistration.findFirst({
          where: {
            userId: user.id,
            testSeriesId,
            status: { in: [RegistrationStatus.ACTIVE, RegistrationStatus.COMPLETED] },
          },
          select: { id: true },
        })
        if (!registration) {
          return NextResponse.json({ error: "Register for this test series to access its documents." }, { status: 403 })
        }
      }
    } else if (fileType === "model-answers") {
      if (user.role !== Role.ADMIN) {
        return NextResponse.json({ error: "Admin access required." }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: "Unsupported private file." }, { status: 400 })
    }

    let fileBuffer: Buffer
    const supabase = getSupabase()
    if (supabase) {
      const { data, error } = await supabase.storage.from(bucket).download(safeFilePath)
      if (error || !data) {
        return NextResponse.json({ error: "File not found." }, { status: 404 })
      }
      fileBuffer = Buffer.from(await data.arrayBuffer())
    } else {
      const fullPath = path.resolve(LOCAL_STORAGE_DIR, bucket, safeFilePath)
      const storageRoot = path.resolve(LOCAL_STORAGE_DIR, bucket) + path.sep
      if (!fullPath.startsWith(storageRoot) || !fs.existsSync(fullPath)) {
        return NextResponse.json({ error: "File not found." }, { status: 404 })
      }
      fileBuffer = await fs.promises.readFile(fullPath)
    }

    const ext = path.extname(safeFilePath).toLowerCase()
    let contentType = "application/octet-stream"
    if (ext === ".pdf") contentType = "application/pdf"
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
    else if (ext === ".png") contentType = "image/png"
    else if (ext === ".webp") contentType = "image/webp"

    return new NextResponse(new Uint8Array(fileBuffer), {
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
