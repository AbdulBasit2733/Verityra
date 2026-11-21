"use server"

import { getCurrentUser, resolvePersistedAdminActor } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { uploadPrivateFile } from "@/lib/supabase"
import { Role, TestSeriesStatus, TestSeriesType } from "@prisma/client"
import { revalidatePath } from "next/cache"
import {
  invalidateTestCatalogCache,
  invalidateLeaderboardCache,
} from "@/lib/cache"
import { ActionResult } from "./auth-actions"

const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]
const MAX_DOCUMENT_SIZE_BYTES = 25 * 1024 * 1024

function documentValidationError(file: File): string | null {
  if (!DOCUMENT_MIME_TYPES.includes(file.type)) {
    return "Upload a PDF or JPG, PNG, or WebP document."
  }
  if (file.size === 0 || file.size > MAX_DOCUMENT_SIZE_BYTES) {
    return "The document must be smaller than 25 MB and cannot be empty."
  }
  return null
}

function safeDocumentName(fileName: string): string {
  return (fileName.split(/[\\/]/).pop() || "document").replace(/[^\w.-]/g, "_")
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export type CreateTestSeriesInput = {
  title: string
  description?: string
  academicYear?: string // e.g. "2025 Batch"
  price?: number // in INR (e.g. 499)
  maxMarks?: number
  maxAttempts?: number
  durationMinutes?: number
  startDate?: string
  endDate?: string
  studentInstructions?: string
  privateEvaluationInstructions?: string
  status?: TestSeriesStatus
  type?: TestSeriesType
  standard?: string
  stream?: string
  bundlePrice?: number // in INR (e.g. 299)
  badge?: string
}

/**
 * Server Action: Create Test Series (ADMIN ONLY)
 */
export async function createTestSeriesAction(
  input: CreateTestSeriesInput
): Promise<ActionResult<{ id: string }>> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  if (!input.title?.trim()) {
    return {
      success: false,
      error: "Test series title is required.",
    }
  }

  const slug = `${slugify(input.title)}-${Date.now().toString(36)}`
  const priceInPaise = Math.round((input.price || 0) * 100)
  const maxAttempts =
    input.maxAttempts && input.maxAttempts > 0 ? input.maxAttempts : 3
  const academicYear = input.academicYear?.trim() || "2025"

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    return {
      success: true,
      message:
        "Test series created (Dev Mode). Connect PostgreSQL to persist permanently.",
      data: { id: "dev-test-series-" + Date.now() },
    }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }

  // Batch Uniqueness Enforcement: One series per Standard + Stream + Academic Batch
  if (input.standard && input.stream) {
    const existingSeries = await prisma.testSeries.findFirst({
      where: {
        standard: input.standard,
        stream: input.stream,
        academicYear,
      },
      select: { id: true, title: true },
    })

    if (existingSeries) {
      return {
        success: false,
        error: `A Test Series bundle for "${input.standard}" (${input.stream}) ${academicYear} Batch already exists ("${existingSeries.title}"). Each academic batch can only be created once.`,
      }
    }
  }

  const bundlePriceInPaise =
    input.bundlePrice !== undefined && input.bundlePrice !== null
      ? Math.round(input.bundlePrice * 100)
      : null

  const created = await prisma.testSeries.create({
    data: {
      title: input.title.trim(),
      slug,
      description: input.description?.trim() || "",
      price: priceInPaise,
      bundlePrice: bundlePriceInPaise ?? undefined,
      type: input.type || "BUNDLE",
      standard: input.standard || undefined,
      stream: input.stream || undefined,
      badge: input.badge || undefined,
      academicYear,
      maxMarks: input.maxMarks || 100,
      maxAttempts,
      durationMinutes: input.durationMinutes || 180,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      studentInstructions: input.studentInstructions || "",
      privateEvaluationInstructions: input.privateEvaluationInstructions || "",
      status: input.status || TestSeriesStatus.DRAFT,
      isPublished: input.status === TestSeriesStatus.PUBLISHED,
    },
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId: actor.user.id,
      action: "TEST_SERIES_CREATED",
      targetType: "TestSeries",
      targetId: created.id,
      details: `Created test series "${created.title}" with max attempts ${maxAttempts} and price ₹${input.price}`,
    },
  })

  revalidatePath("/admin/test-series")
  revalidatePath("/tests")
  invalidateTestCatalogCache()

  return {
    success: true,
    message: "Test series created successfully.",
    data: { id: created.id },
  }
}

/**
 * Server Action: Update Test Series (ADMIN ONLY)
 */
export async function updateTestSeriesAction(
  id: string,
  input: Partial<CreateTestSeriesInput> & {
    isPublished?: boolean
    resultsPublished?: boolean
  }
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    if (process.env.NODE_ENV === "production") {
      return {
        success: false,
        error: "Database temporarily unavailable. Please try again shortly.",
      }
    }
    return { success: true, message: "Test series updated (Dev Mode)." }
  }

  if (
    input.maxMarks !== undefined &&
    (!Number.isFinite(input.maxMarks) ||
      input.maxMarks <= 0 ||
      input.maxMarks > 10000)
  ) {
    return {
      success: false,
      error: "Maximum marks must be between 1 and 10,000.",
    }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }

  const dataToUpdate: Record<string, unknown> = {}
  if (input.title) dataToUpdate.title = input.title
  if (input.description) dataToUpdate.description = input.description
  if (input.price !== undefined)
    dataToUpdate.price = Math.round(input.price * 100)
  if (input.maxMarks !== undefined) dataToUpdate.maxMarks = input.maxMarks
  if (input.maxAttempts !== undefined)
    dataToUpdate.maxAttempts = input.maxAttempts
  if (input.durationMinutes !== undefined)
    dataToUpdate.durationMinutes = input.durationMinutes
  if (input.studentInstructions)
    dataToUpdate.studentInstructions = input.studentInstructions
  if (input.privateEvaluationInstructions)
    dataToUpdate.privateEvaluationInstructions =
      input.privateEvaluationInstructions
  if (input.status) dataToUpdate.status = input.status
  if (input.isPublished !== undefined)
    dataToUpdate.isPublished = input.isPublished
  if (input.resultsPublished !== undefined)
    dataToUpdate.resultsPublished = input.resultsPublished
  if (input.type) dataToUpdate.type = input.type
  if (input.standard !== undefined) dataToUpdate.standard = input.standard || null
  if (input.stream !== undefined) dataToUpdate.stream = input.stream || null
  if (input.badge !== undefined) dataToUpdate.badge = input.badge || null
  if (input.bundlePrice !== undefined) {
    dataToUpdate.bundlePrice =
      input.bundlePrice !== null ? Math.round(input.bundlePrice * 100) : null
  }
  if (input.startDate) dataToUpdate.startDate = new Date(input.startDate)
  if (input.endDate) dataToUpdate.endDate = new Date(input.endDate)

  await prisma.testSeries.update({
    where: { id },
    data: dataToUpdate,
  })

  await prisma.auditLog.create({
    data: {
      adminId: actor.user.id,
      action: "TEST_SERIES_UPDATED",
      targetType: "TestSeries",
      targetId: id,
      details: `Updated test series configuration`,
    },
  })

  revalidatePath(`/admin/test-series/${id}`)
  revalidatePath("/admin/test-series")
  revalidatePath("/tests")
  invalidateTestCatalogCache()

  return { success: true, message: "Test series updated successfully." }
}

/**
 * Server Action: Publish or Unpublish Test Series (ADMIN ONLY)
 */
export async function togglePublishTestSeriesAction(
  id: string,
  publish: boolean
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected && process.env.NODE_ENV === "production") {
    return {
      success: false,
      error: "Database temporarily unavailable. Please try again shortly.",
    }
  }
  if (dbConnected) {
    const actor = await resolvePersistedAdminActor(sessionUser)
    if (!actor.success) return { success: false, error: actor.error }

    await prisma.testSeries.update({
      where: { id },
      data: {
        isPublished: publish,
        status: publish ? TestSeriesStatus.PUBLISHED : TestSeriesStatus.DRAFT,
      },
    })

    await prisma.auditLog.create({
      data: {
        adminId: actor.user.id,
        action: publish ? "TEST_SERIES_PUBLISHED" : "TEST_SERIES_UNPUBLISHED",
        targetType: "TestSeries",
        targetId: id,
        details: `${publish ? "Published" : "Unpublished"} test series`,
      },
    })
  }

  revalidatePath("/admin/test-series")
  revalidatePath("/tests")
  invalidateTestCatalogCache()
  return {
    success: true,
    message: `Test series ${publish ? "published" : "unpublished"} successfully.`,
  }
}

/**
 * Server Action: Toggle Results Publication (ADMIN ONLY)
 */
export async function togglePublishResultsAction(
  testSeriesId: string,
  publish: boolean
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected && process.env.NODE_ENV === "production") {
    return {
      success: false,
      error: "Database temporarily unavailable. Please try again shortly.",
    }
  }
  if (dbConnected) {
    const actor = await resolvePersistedAdminActor(sessionUser)
    if (!actor.success) return { success: false, error: actor.error }

    await prisma.testSeries.update({
      where: { id: testSeriesId },
      data: { resultsPublished: publish },
    })

    await prisma.auditLog.create({
      data: {
        adminId: actor.user.id,
        action: publish ? "RESULTS_PUBLISHED" : "RESULTS_UNPUBLISHED",
        targetType: "TestSeries",
        targetId: testSeriesId,
        details: `${publish ? "Published" : "Unpublished"} results and leaderboard`,
      },
    })
  }

  revalidatePath(`/admin/test-series/${testSeriesId}`)
  revalidatePath(`/tests/${testSeriesId}`)
  revalidatePath("/leaderboard")
  invalidateLeaderboardCache()
  invalidateTestCatalogCache()

  return {
    success: true,
    message: `Results ${publish ? "published to students and leaderboard" : "hidden"}.`,
  }
}

/**
 * Server Action: Upload Test Paper & Model Answer / Rubric (ADMIN ONLY)
 */
export async function uploadTestPaperAction(
  formData: FormData
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const testSeriesIdValue = formData.get("testSeriesId")
  const testSeriesId =
    typeof testSeriesIdValue === "string" ? testSeriesIdValue : ""
  const title = (formData.get("title") as string) || "Main Question Paper"
  const rubricContent = (formData.get("rubricContent") as string) || ""
  const paperFileValue = formData.get("paperFile")
  const modelAnswerFileValue = formData.get("modelAnswerFile")
  const paperFile = paperFileValue instanceof File ? paperFileValue : null
  const modelAnswerFile =
    modelAnswerFileValue instanceof File ? modelAnswerFileValue : null

  if (!testSeriesId || !paperFile) {
    return {
      success: false,
      error: "Question paper file and test series are required.",
    }
  }

  const paperError = documentValidationError(paperFile)
  const modelError = modelAnswerFile?.size
    ? documentValidationError(modelAnswerFile)
    : null
  const parsedMaxMarks = Number(formData.get("maxMarks") || 100)
  if (paperError || modelError) {
    return {
      success: false,
      error: paperError || modelError || "Invalid document.",
    }
  }
  if (!Number.isFinite(parsedMaxMarks) || parsedMaxMarks <= 0) {
    return { success: false, error: "Maximum marks must be a positive number." }
  }

  if (!(await isDatabaseConnected())) {
    return {
      success: false,
      error: "Connect the database before uploading test documents.",
    }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }

  try {
    if (
      !(await prisma.testSeries.findUnique({
        where: { id: testSeriesId },
        select: { id: true },
      }))
    ) {
      return { success: false, error: "Test series not found." }
    }

    const paperFileName = `papers/${testSeriesId}/${Date.now()}-${safeDocumentName(paperFile.name)}`
    const paperUpload = await uploadPrivateFile(
      "verityra-private",
      paperFileName,
      Buffer.from(await paperFile.arrayBuffer()),
      paperFile.type
    )

    let modelAnswerUrl: string | undefined
    if (modelAnswerFile && modelAnswerFile.size > 0) {
      const modelFileName = `model-answers/${testSeriesId}/${Date.now()}-${safeDocumentName(modelAnswerFile.name)}`
      const modelUpload = await uploadPrivateFile(
        "verityra-private",
        modelFileName,
        Buffer.from(await modelAnswerFile.arrayBuffer()),
        modelAnswerFile.type
      )
      modelAnswerUrl = modelUpload.url
    }

    const createdPaper = await prisma.testPaper.create({
      data: {
        testSeriesId,
        title,
        fileUrl: paperUpload.url,
        modelAnswerUrl,
        rubricContent,
        maxMarks: parsedMaxMarks,
      },
    })

    await prisma.auditLog.create({
      data: {
        adminId: actor.user.id,
        action: "TEST_PAPER_UPLOADED",
        targetType: "TestSeries",
        targetId: testSeriesId,
        details: `Uploaded question paper "${title}" with max marks ${parsedMaxMarks}`,
      },
    })

    revalidatePath(`/admin/test-series/${testSeriesId}`)
    revalidatePath(`/tests/${testSeriesId}`)
    return {
      success: true,
      message: "Question paper and rubric uploaded successfully.",
      data: {
        paper: {
          id: createdPaper.id,
          title: createdPaper.title,
          fileUrl: createdPaper.fileUrl,
          maxMarks: createdPaper.maxMarks,
        },
      },
    }
  } catch (error) {
    console.error("[TEST PAPER UPLOAD ERROR]", error)
    return {
      success: false,
      error:
        "Question paper upload failed. Verify storage configuration and try again.",
    }
  }
}

/**
 * Server Action: Upload Answer Sheet Template (ADMIN ONLY)
 */
export async function uploadAnswerSheetTemplateAction(
  formData: FormData
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const testSeriesIdValue = formData.get("testSeriesId")
  const testSeriesId =
    typeof testSeriesIdValue === "string" ? testSeriesIdValue : ""
  const title =
    (formData.get("title") as string) || "Standard Answer Sheet Template"
  const description = formData.get("description") as string
  const templateRequired = formData.get("templateRequired") === "true"
  const templateFileValue = formData.get("templateFile")
  const templateFile =
    templateFileValue instanceof File ? templateFileValue : null

  if (!testSeriesId || !templateFile) {
    return {
      success: false,
      error: "Template file and test series ID are required.",
    }
  }

  const fileError = documentValidationError(templateFile)
  if (fileError) return { success: false, error: fileError }

  if (!(await isDatabaseConnected())) {
    return {
      success: false,
      error: "Connect the database before uploading test documents.",
    }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }

  try {
    if (
      !(await prisma.testSeries.findUnique({
        where: { id: testSeriesId },
        select: { id: true },
      }))
    ) {
      return { success: false, error: "Test series not found." }
    }

    const templateFileName = `templates/${testSeriesId}/${Date.now()}-${safeDocumentName(templateFile.name)}`
    const templateUpload = await uploadPrivateFile(
      "verityra-private",
      templateFileName,
      Buffer.from(await templateFile.arrayBuffer()),
      templateFile.type
    )

    const createdTemplate = await prisma.answerSheetTemplate.create({
      data: {
        testSeriesId,
        title,
        fileUrl: templateUpload.url,
        description,
        templateRequired,
      },
    })

    await prisma.auditLog.create({
      data: {
        adminId: actor.user.id,
        action: "ANSWER_TEMPLATE_UPLOADED",
        targetType: "TestSeries",
        targetId: testSeriesId,
        details: `Uploaded answer sheet template "${title}"`,
      },
    })

    revalidatePath(`/admin/test-series/${testSeriesId}`)
    revalidatePath(`/tests/${testSeriesId}`)
    return {
      success: true,
      message: "Answer sheet template uploaded successfully.",
      data: {
        template: {
          id: createdTemplate.id,
          title: createdTemplate.title,
          description: createdTemplate.description,
          fileUrl: createdTemplate.fileUrl,
          templateRequired: createdTemplate.templateRequired,
        },
      },
    }
  } catch (error) {
    console.error("[ANSWER SHEET TEMPLATE UPLOAD ERROR]", error)
    return {
      success: false,
      error:
        "Template upload failed. Verify storage configuration and try again.",
    }
  }
}

/**
 * Server Action: Validate Test Series Deletion (Pre-flight Check)
 * Checks if a test series has active registrations before allowing deletion
 */
export async function validateTestSeriesDeletionAction(
  testSeriesId: string
): Promise<ActionResult<{ canDelete: boolean; activeRegistrations: number }>> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: false,
      error: "Database connection required to validate deletion.",
    }
  }

  const activeRegistrations = await prisma.testRegistration.count({
    where: {
      testSeriesId,
      status: "ACTIVE",
    },
  })

  if (activeRegistrations > 0) {
    return {
      success: false,
      error: `Cannot delete test series with ${activeRegistrations} active registration${activeRegistrations > 1 ? "s" : ""}. Please archive instead or cancel all registrations first.`,
      data: { canDelete: false, activeRegistrations },
    }
  }

  return {
    success: true,
    message: "Test series can be safely deleted.",
    data: { canDelete: true, activeRegistrations: 0 },
  }
}

/**
 * Server Action: Archive Test Series (Soft Delete)
 * Safer alternative to deletion - marks test series as ARCHIVED
 */
export async function archiveTestSeriesAction(
  testSeriesId: string
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: false,
      error: "Database connection required.",
    }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }

  await prisma.testSeries.update({
    where: { id: testSeriesId },
    data: {
      status: TestSeriesStatus.ARCHIVED,
      isPublished: false,
    },
  })

  await prisma.auditLog.create({
    data: {
      adminId: actor.user.id,
      action: "TEST_SERIES_ARCHIVED",
      targetType: "TestSeries",
      targetId: testSeriesId,
      details: "Test series archived instead of deletion (safer preservation).",
    },
  })

  revalidatePath("/admin/test-series")
  revalidatePath(`/admin/test-series/${testSeriesId}`)
  return { success: true, message: "Test series archived successfully." }
}

export type CreateSubjectTestInput = {
  testSeriesId?: string | null
  title: string
  subject: string
  subjectId?: string | null
  description?: string
  price: number // in INR (0 = free / bundle-only)
  isStandalone?: boolean
  maxMarks?: number
  durationMinutes?: number
  maxAttempts?: number
  questionPaperUrl?: string
  answerSheetUrl?: string
  modelAnswerUrl?: string
  studentInstructions?: string
  privateEvaluationInstructions?: string
  order?: number
  status?: TestSeriesStatus
  isPublished?: boolean
}

export type UpdateSubjectTestInput = Partial<CreateSubjectTestInput>

/**
 * Server Action: Create Subject Test (ADMIN ONLY)
 * Can be attached to a Test Series bundle or standalone.
 */
export async function createSubjectTestAction(
  input: CreateSubjectTestInput
): Promise<ActionResult<{ id: string }>> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  if (!input.title?.trim() || !input.subject?.trim()) {
    return { success: false, error: "Test title and subject are required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    if (process.env.NODE_ENV === "production") {
      return { success: false, error: "Database temporarily unavailable." }
    }
    return {
      success: true,
      message: "Subject test created (Dev Mode).",
      data: { id: "dev-subject-test-" + Date.now() },
    }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }

  const slug = `${slugify(input.title)}-${Date.now().toString(36)}`
  const priceInPaise = Math.round((input.price || 0) * 100)

  const createdTest = await prisma.test.create({
    data: {
      testSeriesId: input.testSeriesId || null,
      title: input.title.trim(),
      slug,
      subject: input.subject.trim(),
      subjectId: input.subjectId || null,
      description: input.description?.trim() || null,
      price: priceInPaise,
      isStandalone: input.isStandalone ?? true,
      maxMarks: input.maxMarks || 100,
      durationMinutes: input.durationMinutes || 180,
      maxAttempts: input.maxAttempts || 3,
      questionPaperUrl: input.questionPaperUrl || null,
      answerSheetUrl: input.answerSheetUrl || null,
      modelAnswerUrl: input.modelAnswerUrl || null,
      studentInstructions: input.studentInstructions || null,
      privateEvaluationInstructions: input.privateEvaluationInstructions || null,
      order: input.order || 0,
      status: input.status || TestSeriesStatus.DRAFT,
      isPublished: input.isPublished ?? (input.status === TestSeriesStatus.PUBLISHED),
    },
  })

  await prisma.auditLog.create({
    data: {
      adminId: actor.user.id,
      action: "SUBJECT_TEST_CREATED",
      targetType: "Test",
      targetId: createdTest.id,
      details: `Created subject test "${createdTest.title}" (${createdTest.subject}) in series ${input.testSeriesId}`,
    },
  })

  revalidatePath(`/admin/test-series/${input.testSeriesId}`)
  revalidatePath("/admin/test-series")
  revalidatePath("/tests")
  invalidateTestCatalogCache()

  return {
    success: true,
    message: "Subject test created successfully.",
    data: { id: createdTest.id },
  }
}

/**
 * Server Action: Update Subject Test (ADMIN ONLY)
 */
export async function updateSubjectTestAction(
  id: string,
  input: UpdateSubjectTestInput
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    if (process.env.NODE_ENV === "production") {
      return { success: false, error: "Database temporarily unavailable." }
    }
    return { success: true, message: "Subject test updated (Dev Mode)." }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }

  const dataToUpdate: Record<string, unknown> = {}
  if (input.title) dataToUpdate.title = input.title.trim()
  if (input.subject) dataToUpdate.subject = input.subject.trim()
  if (input.description !== undefined) dataToUpdate.description = input.description ? input.description.trim() : null
  if (input.price !== undefined) dataToUpdate.price = Math.round(input.price * 100)
  if (input.isStandalone !== undefined) dataToUpdate.isStandalone = input.isStandalone
  if (input.maxMarks !== undefined) dataToUpdate.maxMarks = input.maxMarks
  if (input.durationMinutes !== undefined) dataToUpdate.durationMinutes = input.durationMinutes
  if (input.maxAttempts !== undefined) dataToUpdate.maxAttempts = input.maxAttempts
  if (input.questionPaperUrl !== undefined) dataToUpdate.questionPaperUrl = input.questionPaperUrl
  if (input.answerSheetUrl !== undefined) dataToUpdate.answerSheetUrl = input.answerSheetUrl
  if (input.modelAnswerUrl !== undefined) dataToUpdate.modelAnswerUrl = input.modelAnswerUrl
  if (input.studentInstructions !== undefined) dataToUpdate.studentInstructions = input.studentInstructions
  if (input.privateEvaluationInstructions !== undefined) dataToUpdate.privateEvaluationInstructions = input.privateEvaluationInstructions
  if (input.order !== undefined) dataToUpdate.order = input.order
  if (input.status) dataToUpdate.status = input.status
  if (input.isPublished !== undefined) dataToUpdate.isPublished = input.isPublished

  const updated = await prisma.test.update({
    where: { id },
    data: dataToUpdate,
    select: { id: true, testSeriesId: true },
  })

  await prisma.auditLog.create({
    data: {
      adminId: actor.user.id,
      action: "SUBJECT_TEST_UPDATED",
      targetType: "Test",
      targetId: id,
      details: `Updated subject test details`,
    },
  })

  revalidatePath(`/admin/test-series/${updated.testSeriesId}`)
  revalidatePath("/admin/test-series")
  revalidatePath("/tests")
  invalidateTestCatalogCache()

  return { success: true, message: "Subject test updated successfully." }
}

/**
 * Server Action: Delete Subject Test (ADMIN ONLY)
 */
export async function deleteSubjectTestAction(id: string): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return { success: false, error: "Database connection required." }
  }

  const actor = await resolvePersistedAdminActor(sessionUser)
  if (!actor.success) return { success: false, error: actor.error }

  const test = await prisma.test.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          submissions: true,
          registrations: true,
        },
      },
    },
  })

  if (!test) {
    return { success: false, error: "Subject test not found." }
  }

  if (test._count.submissions > 0) {
    return {
      success: false,
      error: `Cannot delete test because students have submitted ${test._count.submissions} exam attempt(s). Set it to Draft or unpublish it instead to preserve audit records.`,
    }
  }

  await prisma.test.delete({
    where: { id },
  })

  await prisma.auditLog.create({
    data: {
      adminId: actor.user.id,
      action: "SUBJECT_TEST_DELETED",
      targetType: "Test",
      targetId: id,
      details: `Deleted subject test "${test.title}" (${test.subject})`,
    },
  })

  revalidatePath(`/admin/test-series/${test.testSeriesId}`)
  revalidatePath("/admin/test-series")
  revalidatePath("/tests")
  invalidateTestCatalogCache()

  return { success: true, message: "Subject test deleted successfully." }
}

/**
 * Server Action: Toggle Publish Subject Test (ADMIN ONLY)
 */
export async function togglePublishSubjectTestAction(
  id: string,
  publish: boolean
): Promise<ActionResult> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected && process.env.NODE_ENV === "production") {
    return { success: false, error: "Database temporarily unavailable." }
  }

  if (dbConnected) {
    const actor = await resolvePersistedAdminActor(sessionUser)
    if (!actor.success) return { success: false, error: actor.error }

    const updated = await prisma.test.update({
      where: { id },
      data: {
        isPublished: publish,
        status: publish ? TestSeriesStatus.PUBLISHED : TestSeriesStatus.DRAFT,
      },
      select: { testSeriesId: true },
    })

    await prisma.auditLog.create({
      data: {
        adminId: actor.user.id,
        action: publish ? "SUBJECT_TEST_PUBLISHED" : "SUBJECT_TEST_UNPUBLISHED",
        targetType: "Test",
        targetId: id,
        details: `${publish ? "Published" : "Unpublished"} subject test`,
      },
    })

    revalidatePath(`/admin/test-series/${updated.testSeriesId}`)
  }

  revalidatePath("/admin/test-series")
  revalidatePath("/admin/tests")
  revalidatePath("/tests")
  invalidateTestCatalogCache()

  return {
    success: true,
    message: `Subject test ${publish ? "published" : "unpublished"} successfully.`,
  }
}

export type AdminAllSubjectTestItem = {
  id: string
  title: string
  slug: string
  subject: string
  price: number
  isStandalone: boolean
  maxMarks: number
  durationMinutes: number
  maxAttempts: number
  questionPaperUrl: string | null
  answerSheetUrl: string | null
  modelAnswerUrl: string | null
  status: TestSeriesStatus
  isPublished: boolean
  testSeriesId: string | null
  testSeriesTitle: string | null
  testSeriesStandard: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Server Action: Get all subject tests across all series (ADMIN ONLY)
 */
export async function getAllSubjectTestsAction(
  query?: string
): Promise<ActionResult<{ tests: AdminAllSubjectTestItem[] }>> {
  const sessionUser = await getCurrentUser()
  if (!sessionUser || sessionUser.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: true,
      data: {
        tests: [
          {
            id: "demo-test-math-10",
            title: "Class 10th CBSE Mathematics Standard Mock 1",
            slug: "class-10th-cbse-mathematics-standard-mock-1",
            subject: "Mathematics",
            price: 99,
            isStandalone: true,
            maxMarks: 80,
            durationMinutes: 180,
            maxAttempts: 3,
            questionPaperUrl: "/api/files/download?file=demo-math-10.pdf",
            answerSheetUrl: null,
            modelAnswerUrl: null,
            status: TestSeriesStatus.PUBLISHED,
            isPublished: true,
            testSeriesId: "demo-series-10",
            testSeriesTitle: "Class 10th CBSE Comprehensive Board Mock Series",
            testSeriesStandard: "10th",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "demo-test-sci-10",
            title: "Class 10th CBSE Science & Technology Mock 1",
            slug: "class-10th-cbse-science-technology-mock-1",
            subject: "Science",
            price: 99,
            isStandalone: true,
            maxMarks: 80,
            durationMinutes: 180,
            maxAttempts: 3,
            questionPaperUrl: "/api/files/download?file=demo-sci-10.pdf",
            answerSheetUrl: null,
            modelAnswerUrl: null,
            status: TestSeriesStatus.PUBLISHED,
            isPublished: true,
            testSeriesId: "demo-series-10",
            testSeriesTitle: "Class 10th CBSE Comprehensive Board Mock Series",
            testSeriesStandard: "10th",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    }
  }

  try {
    const q = query?.trim().toLowerCase()
    const records = await prisma.test.findMany({
      where: q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { subject: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      include: {
        testSeries: {
          select: { id: true, title: true, standard: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return {
      success: true,
      data: {
        tests: records.map((t) => ({
          id: t.id,
          title: t.title,
          slug: t.slug,
          subject: t.subject,
          price: (t.price || 0) / 100,
          isStandalone: t.isStandalone,
          maxMarks: t.maxMarks,
          durationMinutes: t.durationMinutes,
          maxAttempts: t.maxAttempts,
          questionPaperUrl: t.questionPaperUrl,
          answerSheetUrl: t.answerSheetUrl,
          modelAnswerUrl: t.modelAnswerUrl,
          status: t.status,
          isPublished: t.isPublished,
          testSeriesId: t.testSeriesId,
          testSeriesTitle: t.testSeries?.title || null,
          testSeriesStandard: t.testSeries?.standard || null,
          createdAt: t.createdAt.toISOString(),
          updatedAt: t.updatedAt.toISOString(),
        })),
      },
    }
  } catch (err: any) {
    console.error("[GET ALL SUBJECT TESTS ERROR]", err)
    return { success: false, error: "Failed to load subject tests." }
  }
}
