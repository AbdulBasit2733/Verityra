"use server"

import { getCurrentUser } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { uploadPrivateFile } from "@/lib/supabase"
import { Role, TestSeriesStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { ActionResult } from "./auth-actions"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export type CreateTestSeriesInput = {
  title: string
  description: string
  price: number // in INR (e.g. 499)
  maxMarks: number
  maxAttempts?: number
  durationMinutes?: number
  startDate?: string
  endDate?: string
  studentInstructions: string
  privateEvaluationInstructions: string
  status?: TestSeriesStatus
}

/**
 * Server Action: Create Test Series (ADMIN ONLY)
 */
export async function createTestSeriesAction(input: CreateTestSeriesInput): Promise<ActionResult<{ id: string }>> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  if (!input.title || !input.description || !input.studentInstructions || !input.privateEvaluationInstructions) {
    return { success: false, error: "Please fill in all required fields including instructions." }
  }

  const slug = `${slugify(input.title)}-${Date.now().toString(36)}`
  const priceInPaise = Math.round((input.price || 0) * 100)
  const maxAttempts = input.maxAttempts && input.maxAttempts > 0 ? input.maxAttempts : 3

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: true,
      message: "Test series created (Dev Mode). Connect PostgreSQL to persist permanently.",
      data: { id: "dev-test-series-" + Date.now() },
    }
  }

  const created = await prisma.testSeries.create({
    data: {
      title: input.title,
      slug,
      description: input.description,
      price: priceInPaise,
      maxMarks: input.maxMarks || 100,
      maxAttempts,
      durationMinutes: input.durationMinutes || 180,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      studentInstructions: input.studentInstructions,
      privateEvaluationInstructions: input.privateEvaluationInstructions,
      status: input.status || TestSeriesStatus.DRAFT,
      isPublished: input.status === TestSeriesStatus.PUBLISHED,
    },
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId: user.id,
      action: "TEST_SERIES_CREATED",
      targetType: "TestSeries",
      targetId: created.id,
      details: `Created test series "${created.title}" with max attempts ${maxAttempts} and price ₹${input.price}`,
    },
  })

  revalidatePath("/admin/test-series")
  revalidatePath("/tests")

  return { success: true, message: "Test series created successfully.", data: { id: created.id } }
}

/**
 * Server Action: Update Test Series (ADMIN ONLY)
 */
export async function updateTestSeriesAction(
  id: string,
  input: Partial<CreateTestSeriesInput> & { isPublished?: boolean; resultsPublished?: boolean }
): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return { success: true, message: "Test series updated (Dev Mode)." }
  }

  const dataToUpdate: Record<string, unknown> = {}
  if (input.title) dataToUpdate.title = input.title
  if (input.description) dataToUpdate.description = input.description
  if (input.price !== undefined) dataToUpdate.price = Math.round(input.price * 100)
  if (input.maxMarks !== undefined) dataToUpdate.maxMarks = input.maxMarks
  if (input.maxAttempts !== undefined) dataToUpdate.maxAttempts = input.maxAttempts
  if (input.durationMinutes !== undefined) dataToUpdate.durationMinutes = input.durationMinutes
  if (input.studentInstructions) dataToUpdate.studentInstructions = input.studentInstructions
  if (input.privateEvaluationInstructions) dataToUpdate.privateEvaluationInstructions = input.privateEvaluationInstructions
  if (input.status) dataToUpdate.status = input.status
  if (input.isPublished !== undefined) dataToUpdate.isPublished = input.isPublished
  if (input.resultsPublished !== undefined) dataToUpdate.resultsPublished = input.resultsPublished
  if (input.startDate) dataToUpdate.startDate = new Date(input.startDate)
  if (input.endDate) dataToUpdate.endDate = new Date(input.endDate)

  await prisma.testSeries.update({
    where: { id },
    data: dataToUpdate,
  })

  await prisma.auditLog.create({
    data: {
      adminId: user.id,
      action: "TEST_SERIES_UPDATED",
      targetType: "TestSeries",
      targetId: id,
      details: `Updated test series configuration`,
    },
  })

  revalidatePath(`/admin/test-series/${id}`)
  revalidatePath("/admin/test-series")
  revalidatePath("/tests")

  return { success: true, message: "Test series updated successfully." }
}

/**
 * Server Action: Publish or Unpublish Test Series (ADMIN ONLY)
 */
export async function togglePublishTestSeriesAction(id: string, publish: boolean): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (dbConnected) {
    await prisma.testSeries.update({
      where: { id },
      data: {
        isPublished: publish,
        status: publish ? TestSeriesStatus.PUBLISHED : TestSeriesStatus.DRAFT,
      },
    })

    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: publish ? "TEST_SERIES_PUBLISHED" : "TEST_SERIES_UNPUBLISHED",
        targetType: "TestSeries",
        targetId: id,
        details: `${publish ? "Published" : "Unpublished"} test series`,
      },
    })
  }

  revalidatePath("/admin/test-series")
  revalidatePath("/tests")
  return { success: true, message: `Test series ${publish ? "published" : "unpublished"} successfully.` }
}

/**
 * Server Action: Toggle Results Publication (ADMIN ONLY)
 */
export async function togglePublishResultsAction(testSeriesId: string, publish: boolean): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (dbConnected) {
    await prisma.testSeries.update({
      where: { id: testSeriesId },
      data: { resultsPublished: publish },
    })

    await prisma.auditLog.create({
      data: {
        adminId: user.id,
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

  return { success: true, message: `Results ${publish ? "published to students and leaderboard" : "hidden"}.` }
}

/**
 * Server Action: Upload Test Paper & Model Answer / Rubric (ADMIN ONLY)
 */
export async function uploadTestPaperAction(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const testSeriesId = formData.get("testSeriesId") as string
  const title = (formData.get("title") as string) || "Main Question Paper"
  const maxMarks = parseFloat(formData.get("maxMarks") as string) || 100
  const rubricContent = (formData.get("rubricContent") as string) || ""
  const paperFile = formData.get("paperFile") as File | null
  const modelAnswerFile = formData.get("modelAnswerFile") as File | null

  if (!testSeriesId || !paperFile) {
    return { success: false, error: "Question paper file and test series are required." }
  }

  // Upload question paper to private Supabase bucket
  const paperBytes = Buffer.from(await paperFile.arrayBuffer())
  const paperFileName = `papers/${testSeriesId}/${Date.now()}-${paperFile.name}`
  const paperUpload = await uploadPrivateFile("verityra-private", paperFileName, paperBytes, paperFile.type)

  let modelAnswerUrl: string | undefined = undefined
  if (modelAnswerFile && modelAnswerFile.size > 0) {
    const modelBytes = Buffer.from(await modelAnswerFile.arrayBuffer())
    const modelFileName = `model-answers/${testSeriesId}/${Date.now()}-${modelAnswerFile.name}`
    const modelUpload = await uploadPrivateFile("verityra-private", modelFileName, modelBytes, modelAnswerFile.type)
    modelAnswerUrl = modelUpload.url
  }

  const dbConnected = await isDatabaseConnected()
  if (dbConnected) {
    await prisma.testPaper.create({
      data: {
        testSeriesId,
        title,
        fileUrl: paperUpload.url,
        modelAnswerUrl,
        rubricContent,
        maxMarks,
      },
    })

    await prisma.auditLog.create({
      data: {
        adminId: user.id,
        action: "TEST_PAPER_UPLOADED",
        targetType: "TestSeries",
        targetId: testSeriesId,
        details: `Uploaded question paper "${title}" with max marks ${maxMarks}`,
      },
    })
  }

  revalidatePath(`/admin/test-series/${testSeriesId}`)
  return { success: true, message: "Question paper and rubric uploaded successfully." }
}

/**
 * Server Action: Upload Answer Sheet Template (ADMIN ONLY)
 */
export async function uploadAnswerSheetTemplateAction(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const testSeriesId = formData.get("testSeriesId") as string
  const title = (formData.get("title") as string) || "Standard Answer Sheet Template"
  const description = formData.get("description") as string
  const templateRequired = formData.get("templateRequired") === "true"
  const templateFile = formData.get("templateFile") as File | null

  if (!testSeriesId || !templateFile) {
    return { success: false, error: "Template file and test series ID are required." }
  }

  const templateBytes = Buffer.from(await templateFile.arrayBuffer())
  const templateFileName = `templates/${testSeriesId}/${Date.now()}-${templateFile.name}`
  const templateUpload = await uploadPrivateFile("verityra-private", templateFileName, templateBytes, templateFile.type)

  const dbConnected = await isDatabaseConnected()
  if (dbConnected) {
    await prisma.answerSheetTemplate.create({
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
        adminId: user.id,
        action: "ANSWER_TEMPLATE_UPLOADED",
        targetType: "TestSeries",
        targetId: testSeriesId,
        details: `Uploaded answer sheet template "${title}"`,
      },
    })
  }

  revalidatePath(`/admin/test-series/${testSeriesId}`)
  return { success: true, message: "Answer sheet template uploaded successfully." }
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
export async function archiveTestSeriesAction(testSeriesId: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return {
      success: false,
      error: "Database connection required.",
    }
  }

  await prisma.testSeries.update({
    where: { id: testSeriesId },
    data: {
      status: TestSeriesStatus.ARCHIVED,
      isPublished: false,
    },
  })

  await prisma.auditLog.create({
    data: {
      adminId: user.id,
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
