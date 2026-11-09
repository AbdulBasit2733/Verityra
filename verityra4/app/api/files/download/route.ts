import { NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-guard"
import { RegistrationStatus, Role } from "@prisma/client"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { getSupabase } from "@/lib/supabase"
import fs from "fs"
import path from "path"

const LOCAL_STORAGE_DIR = path.join(process.cwd(), "uploads")
const SAMPLES_DIR = path.join(process.cwd(), "public", "samples")

function generateFallbackPdf(title: string, subtitle: string, lines: string[]): Buffer {
  const content = [
    "BT",
    "/F1 15 Tf",
    "50 740 Td",
    "(VERITYRA EXAMINATION PLATFORM) Tj",
    "/F1 11 Tf",
    "0 -22 Td",
    `(${title.replace(/[()\\]/g, "")}) Tj`,
    "/F2 9 Tf",
    "0 -16 Td",
    `(${subtitle.replace(/[()\\]/g, "")}) Tj`,
    "0 -24 Td",
    ...lines.map((l) => `(${l.replace(/[()\\]/g, "")}) Tj\n0 -14 Td`),
    "ET",
    "0.75 w",
    "110 40 m",
    "110 760 l",
    "S",
    "40 705 m",
    "570 705 l",
    "S",
  ].join("\n")

  const streamLength = Buffer.byteLength(content)

  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<<
  /Type /Page
  /Parent 2 0 R
  /MediaBox [0 0 612 792]
  /Contents 4 0 R
  /Resources <<
    /Font <<
      /F1 5 0 R
      /F2 6 0 R
    >>
  >>
>>
endobj
4 0 obj
<< /Length ${streamLength} >>
stream
${content}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000260 00000 n 
0000000360 00000 n 
0000000445 00000 n 
trailer
<< /Size 7 /Root 1 0 R >>
startxref
530
%%EOF`

  return Buffer.from(pdf, "utf8")
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const bucket = searchParams.get("bucket") || "verityra-private"
    const file = searchParams.get("file")
    const isDownload = searchParams.get("download") === "1" || searchParams.get("download") === "true"

    if (!file || bucket !== "verityra-private") {
      return NextResponse.json({ error: "A valid private file is required." }, { status: 400 })
    }

    const safeFilePath = path.posix.normalize(file.replace(/\\/g, "/"))
    if (safeFilePath.startsWith("../") || safeFilePath === ".." || path.posix.isAbsolute(safeFilePath)) {
      return NextResponse.json({ error: "Invalid file path." }, { status: 400 })
    }

    const segments = safeFilePath.split("/")
    const fileType = segments[0]
    const testSeriesIdCandidate = segments.length > 2 ? segments[1] : ""
    const ownerUserIdCandidate = segments.length > 2 ? segments[2] : ""
    const filename = segments[segments.length - 1]

    const user = await getCurrentUser()
    if (!user && fileType !== "question-papers") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dbConnected = await isDatabaseConnected()

    // Authorization evaluation
    if (fileType === "question-papers") {
      // Standalone question papers are openly accessible if published
      if (user?.role !== Role.ADMIN) {
        if (dbConnected) {
          const paper = await (prisma as any).questionPaper.findFirst({
            where: {
              OR: [
                { fileUrl: { contains: safeFilePath } },
                { fileUrl: { contains: filename } },
                ...(testSeriesIdCandidate ? [{ id: testSeriesIdCandidate }] : []),
              ],
            },
            select: { id: true, isPublished: true },
          })

          if (paper && !paper.isPublished) {
            return NextResponse.json({ error: "This question paper is currently unpublished." }, { status: 403 })
          }

          if (paper) {
            // Asynchronously increment download counter
            ;(prisma as any).questionPaper
              .update({
                where: { id: paper.id },
                data: { downloadsCount: { increment: 1 } },
              })
              .catch(() => {})
          }
        }
      }
    } else if (fileType === "submissions") {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      const isOwner = user.id === ownerUserIdCandidate
      const isDemoSubmission =
        process.env.NODE_ENV === "development" && (
          safeFilePath.startsWith("submissions/demo/") ||
          safeFilePath.startsWith("submissions/dev-") ||
          filename === "sample-attempt.pdf"
        )

      if (user.role !== Role.ADMIN && !isOwner && !isDemoSubmission) {
        if (dbConnected) {
          const matchingSubmission = await prisma.submission.findFirst({
            where: {
              userId: user.id,
              OR: [
                { fileUrl: { contains: safeFilePath } },
                { fileUrl: { contains: filename } },
              ],
            },
            select: { id: true },
          })
          if (!matchingSubmission) {
            return NextResponse.json({ error: "Access denied to this student submission" }, { status: 403 })
          }
        } else {
          return NextResponse.json({ error: "Access denied to this student submission" }, { status: 403 })
        }
      }
    } else if (fileType === "papers" || fileType === "templates") {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      if (user.role !== Role.ADMIN) {
        // In development only, allow explicit demo/dev fixtures to bypass registration
        const isDevDemoResource =
          process.env.NODE_ENV === "development" &&
          (testSeriesIdCandidate.startsWith("demo-") ||
           testSeriesIdCandidate.startsWith("dev-") ||
           safeFilePath.startsWith("papers/demo-") ||
           safeFilePath.startsWith("templates/demo-"))

        if (!isDevDemoResource) {
          if (!dbConnected) {
            return NextResponse.json(
              { error: "Database unavailable to verify test registration." },
              { status: 503 }
            )
          }

          // Identify test series that owns this paper or template
          let resolvedTestSeriesId = testSeriesIdCandidate
          if (!resolvedTestSeriesId) {
            if (fileType === "papers") {
              const paper = await prisma.testPaper.findFirst({
                where: {
                  OR: [
                    { fileUrl: { contains: safeFilePath } },
                    { fileUrl: { contains: filename } },
                  ],
                },
                select: { testSeriesId: true },
              })
              resolvedTestSeriesId = paper?.testSeriesId || ""
            } else {
              const tpl = await prisma.answerSheetTemplate.findFirst({
                where: {
                  OR: [
                    { fileUrl: { contains: safeFilePath } },
                    { fileUrl: { contains: filename } },
                  ],
                },
                select: { testSeriesId: true },
              })
              resolvedTestSeriesId = tpl?.testSeriesId || ""
            }
          }

          const registration = await prisma.testRegistration.findFirst({
            where: {
              userId: user.id,
              OR: [
                ...(resolvedTestSeriesId ? [{ testSeriesId: resolvedTestSeriesId }, { testSeries: { slug: resolvedTestSeriesId } }] : []),
                { testSeries: { papers: { some: { fileUrl: { contains: filename } } } } },
                { testSeries: { templates: { some: { fileUrl: { contains: filename } } } } },
              ],
              status: { in: [RegistrationStatus.ACTIVE, RegistrationStatus.COMPLETED] },
            },
            select: { id: true },
          })

          if (!registration) {
            // Also check if test series is published
            const testSeries = await prisma.testSeries.findFirst({
              where: {
                id: resolvedTestSeriesId,
                isPublished: true,
              },
              select: { id: true },
            })

            if (!testSeries) {
              return NextResponse.json(
                { error: "Enroll in this test series to access its official papers and margin templates." },
                { status: 403 }
              )
            }
          }
        }
      }
    } else if (fileType === "model-answers") {
      if (!user || user.role !== Role.ADMIN) {
        return NextResponse.json({ error: "Admin access required for model answer keys." }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: "Unsupported private file type." }, { status: 400 })
    }

    // Retrieve file buffer
    let fileBuffer: Buffer | null = null
    const supabase = getSupabase()

    if (supabase) {
      try {
        const { data, error } = await supabase.storage.from(bucket).download(safeFilePath)
        if (!error && data) {
          fileBuffer = Buffer.from(await data.arrayBuffer())
        }
      } catch {
        // Fall back to local disk
      }
    }

    if (!fileBuffer) {
      const fullPath = path.resolve(LOCAL_STORAGE_DIR, bucket, safeFilePath)
      const storageRoot = path.resolve(LOCAL_STORAGE_DIR, bucket) + path.sep
      if (fullPath.startsWith(storageRoot) && fs.existsSync(fullPath)) {
        fileBuffer = await fs.promises.readFile(fullPath)
      }
    }

    // Development-only fallbacks for explicit test fixtures
    const isDevFixture =
      process.env.NODE_ENV === "development" &&
      (safeFilePath.includes("/demo/") ||
       safeFilePath.startsWith("papers/demo-") ||
       safeFilePath.startsWith("templates/demo-") ||
       safeFilePath.startsWith("question-papers/") ||
       testSeriesIdCandidate.startsWith("demo-") ||
       testSeriesIdCandidate.startsWith("dev-"))

    if (!fileBuffer && isDevFixture) {
      const samplePath = path.join(SAMPLES_DIR, filename)
      if (fs.existsSync(samplePath)) {
        fileBuffer = await fs.promises.readFile(samplePath)
      } else {
        const defaultSample = path.join(SAMPLES_DIR, "class-10-science-sample-answer-sheet.pdf")
        if (fs.existsSync(defaultSample)) {
          fileBuffer = await fs.promises.readFile(defaultSample)
        }
      }

      if (!fileBuffer) {
        const title = filename.replace(/\.pdf$/i, "").replace(/[-_]/g, " ").toUpperCase()
        const category = fileType.toUpperCase()
        fileBuffer = generateFallbackPdf(
          title,
          `Verityra ${category} Document`,
          [
            "Official examination material prepared for authorized candidate usage.",
            "Ensure answers are numbered clearly and written within designated margins.",
            `Generated for verified user: ${user?.email || user?.name || "Student"}`
          ]
        )
      }
    }

    if (!fileBuffer) {
      return NextResponse.json(
        { error: "The requested document could not be found." },
        { status: 404 }
      )
    }

    const ext = path.extname(safeFilePath).toLowerCase()
    let contentType = "application/octet-stream"
    if (ext === ".pdf") contentType = "application/pdf"
    else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg"
    else if (ext === ".png") contentType = "image/png"
    else if (ext === ".webp") contentType = "image/webp"

    const dispositionType = isDownload ? "attachment" : "inline"
    const downloadFilename = filename || (ext ? `document${ext}` : "document.pdf")

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${dispositionType}; filename="${downloadFilename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[FILE DOWNLOAD ERROR]", error)
    return NextResponse.json({ error: "Failed to download file" }, { status: 500 })
  }
}
