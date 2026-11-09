"use server"

import { getCurrentUser, resolvePersistedAdminActor } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { uploadPrivateFile } from "@/lib/supabase"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { ActionResult } from "./auth-actions"

const DOCUMENT_MIME_TYPES = ["application/pdf"]
const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024

function documentValidationError(file: File): string | null {
  if (!DOCUMENT_MIME_TYPES.includes(file.type)) {
    return "Only PDF documents are allowed for question papers."
  }
  if (file.size === 0 || file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return "The document must be smaller than 25 MB and cannot be empty."
  }
  return null
}

function safeDocumentName(fileName: string): string {
  return (fileName.split(/[\\/]/).pop() || "document.pdf").replace(/[^\w.-]/g, "_")
}

export type QuestionPaperData = {
  id: string
  title: string
  description?: string | null
  category: string
  subject?: string | null
  year?: number | null
  maxMarks: number
  durationMinutes?: number | null
  fileUrl: string
  fileSizeBytes?: number | null
  isPublished: boolean
  downloadsCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Server Action: Upload Standalone Question Paper (ADMIN ONLY)
 */
export async function uploadQuestionPaperAction(formData: FormData): Promise<ActionResult<{ paper: QuestionPaperData }>> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const title = (formData.get("title") as string)?.trim()
  const category = (formData.get("category") as string)?.trim() || "General"
  const subject = (formData.get("subject") as string)?.trim() || null
  const description = (formData.get("description") as string)?.trim() || null
  const yearValue = formData.get("year")
  const year = yearValue ? parseInt(String(yearValue), 10) : null
  const maxMarksValue = formData.get("maxMarks")
  const maxMarks = maxMarksValue ? parseFloat(String(maxMarksValue)) : 100
  const durationValue = formData.get("durationMinutes")
  const durationMinutes = durationValue ? parseInt(String(durationValue), 10) : 180
  const isPublished = formData.get("isPublished") !== "false"

  const paperFileValue = formData.get("paperFile")
  const paperFile = paperFileValue instanceof File ? paperFileValue : null

  if (!title) {
    return { success: false, error: "Question paper title is required." }
  }

  if (!paperFile || paperFile.size === 0) {
    return { success: false, error: "A valid PDF question paper file is required." }
  }

  const fileError = documentValidationError(paperFile)
  if (fileError) {
    return { success: false, error: fileError }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected && process.env.NODE_ENV === "production") {
    return { success: false, error: "Database temporarily unavailable. Please try again shortly." }
  }

  try {
    const timestamp = Date.now()
    const fileName = `question-papers/${timestamp}-${safeDocumentName(paperFile.name)}`
    const uploadResult = await uploadPrivateFile(
      "verityra-private",
      fileName,
      Buffer.from(await paperFile.arrayBuffer()),
      paperFile.type
    )

    let createdPaper: any
    if (dbConnected) {
      const actor = await resolvePersistedAdminActor(sessionUser)
      createdPaper = await (prisma as any).questionPaper.create({
        data: {
          title,
          description,
          category,
          subject,
          year,
          maxMarks,
          durationMinutes,
          fileUrl: uploadResult.url,
          fileSizeBytes: paperFile.size,
          isPublished,
          downloadsCount: 0,
        },
      })

      if (actor.success) {
        await prisma.auditLog.create({
          data: {
            adminId: actor.user.id,
            action: "QUESTION_PAPER_UPLOADED",
            targetType: "QuestionPaper",
            targetId: createdPaper.id,
            details: `Uploaded standalone question paper "${title}" (${category}, ${subject || "General"})`,
          },
        }).catch(() => {})
      }
    } else {
      createdPaper = {
        id: "dev-qp-" + timestamp,
        title,
        description,
        category,
        subject,
        year,
        maxMarks,
        durationMinutes,
        fileUrl: uploadResult.url,
        fileSizeBytes: paperFile.size,
        isPublished,
        downloadsCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    }

    revalidatePath("/admin/question-papers")
    revalidatePath("/question-papers")
    revalidatePath("/student/downloads")

    return {
      success: true,
      message: `Question paper "${title}" uploaded successfully.`,
      data: {
        paper: {
          id: createdPaper.id,
          title: createdPaper.title,
          description: createdPaper.description,
          category: createdPaper.category,
          subject: createdPaper.subject,
          year: createdPaper.year,
          maxMarks: createdPaper.maxMarks,
          durationMinutes: createdPaper.durationMinutes,
          fileUrl: createdPaper.fileUrl,
          fileSizeBytes: createdPaper.fileSizeBytes,
          isPublished: createdPaper.isPublished,
          downloadsCount: createdPaper.downloadsCount,
          createdAt: createdPaper.createdAt.toISOString ? createdPaper.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: createdPaper.updatedAt.toISOString ? createdPaper.updatedAt.toISOString() : new Date().toISOString(),
        },
      },
    }
  } catch (error: any) {
    console.error("[UPLOAD QUESTION PAPER ERROR]", error)
    return {
      success: false,
      error: error?.message || "Failed to upload question paper. Please verify file and try again.",
    }
  }
}

/**
 * Server Action: Delete Standalone Question Paper (ADMIN ONLY)
 */
export async function deleteQuestionPaperAction(id: string): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected && process.env.NODE_ENV === "production") {
    return { success: false, error: "Database temporarily unavailable." }
  }

  try {
    if (dbConnected) {
      const actor = await resolvePersistedAdminActor(sessionUser)
      const existing = await (prisma as any).questionPaper.findUnique({ where: { id } })
      if (!existing) {
        return { success: false, error: "Question paper not found." }
      }

      await (prisma as any).questionPaper.delete({ where: { id } })

      if (actor.success) {
        await prisma.auditLog.create({
          data: {
            adminId: actor.user.id,
            action: "QUESTION_PAPER_DELETED",
            targetType: "QuestionPaper",
            targetId: id,
            details: `Deleted question paper "${existing.title}"`,
          },
        }).catch(() => {})
      }
    }

    revalidatePath("/admin/question-papers")
    revalidatePath("/question-papers")
    revalidatePath("/student/downloads")

    return { success: true, message: "Question paper deleted successfully." }
  } catch (error: any) {
    console.error("[DELETE QUESTION PAPER ERROR]", error)
    return { success: false, error: error?.message || "Failed to delete question paper." }
  }
}

/**
 * Server Action: Toggle Publish Status of Question Paper (ADMIN ONLY)
 */
export async function togglePublishQuestionPaperAction(id: string, isPublished: boolean): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected && process.env.NODE_ENV === "production") {
    return { success: false, error: "Database temporarily unavailable." }
  }

  try {
    if (dbConnected) {
      const actor = await resolvePersistedAdminActor(sessionUser)
      const updated = await (prisma as any).questionPaper.update({
        where: { id },
        data: { isPublished },
      })

      if (actor.success) {
        await prisma.auditLog.create({
          data: {
            adminId: actor.user.id,
            action: isPublished ? "QUESTION_PAPER_PUBLISHED" : "QUESTION_PAPER_UNPUBLISHED",
            targetType: "QuestionPaper",
            targetId: id,
            details: `${isPublished ? "Published" : "Unpublished"} question paper "${updated.title}"`,
          },
        }).catch(() => {})
      }
    }

    revalidatePath("/admin/question-papers")
    revalidatePath("/question-papers")
    revalidatePath("/student/downloads")

    return {
      success: true,
      message: `Question paper ${isPublished ? "published" : "hidden"} successfully.`,
    }
  } catch (error: any) {
    console.error("[TOGGLE PUBLISH QUESTION PAPER ERROR]", error)
    return { success: false, error: error?.message || "Failed to update publish state." }
  }
}
