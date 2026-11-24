"use server"

import { getCurrentUser } from "@/lib/auth-guard"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Role } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { ActionResult } from "./auth-actions"
import {
  MasterItem,
  DEFAULT_STANDARDS,
  DEFAULT_BOARDS,
  DEFAULT_SUBJECTS,
} from "@/lib/mock-masters"

// In-memory runtime fallbacks for development / demo mode
let runtimeSubjects: MasterItem[] = DEFAULT_SUBJECTS.map((s) => ({
  ...s,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))
let runtimeStandards: MasterItem[] = DEFAULT_STANDARDS.map((s) => ({
  ...s,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))
let runtimeBoards: MasterItem[] = DEFAULT_BOARDS.map((b) => ({
  ...b,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}))

/**
 * Get active standards, boards, and subjects in a single round-trip for dropdowns
 */
export async function getMastersOverviewAction(): Promise<
  ActionResult<{
    standards: MasterItem[]
    boards: MasterItem[]
    subjects: MasterItem[]
  }>
> {
  const dbConnected = await isDatabaseConnected()

  if (!dbConnected) {
    return {
      success: true,
      data: {
        standards: runtimeStandards.filter((s) => s.isActive),
        boards: runtimeBoards.filter((b) => b.isActive),
        subjects: runtimeSubjects.filter((s) => s.isActive),
      },
    }
  }

  try {
    const [dbStandards, dbBoards, dbSubjects] = await Promise.all([
      prisma.standardMaster.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      prisma.boardMaster.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
      prisma.subjectMaster.findMany({
        where: { isActive: true },
        orderBy: { name: "asc" },
      }),
    ])

    return {
      success: true,
      data: {
        standards:
          dbStandards.length > 0
            ? dbStandards.map((s) => ({
                id: s.id,
                name: s.name,
                code: s.code,
                order: s.order,
                description: s.description,
                isActive: s.isActive,
                createdAt: s.createdAt.toISOString(),
                updatedAt: s.updatedAt.toISOString(),
              }))
            : runtimeStandards.filter((s) => s.isActive),
        boards:
          dbBoards.length > 0
            ? dbBoards.map((b) => ({
                id: b.id,
                name: b.name,
                code: b.code,
                description: b.description,
                isActive: b.isActive,
                createdAt: b.createdAt.toISOString(),
                updatedAt: b.updatedAt.toISOString(),
              }))
            : runtimeBoards.filter((b) => b.isActive),
        subjects:
          dbSubjects.length > 0
            ? dbSubjects.map((sub) => ({
                id: sub.id,
                name: sub.name,
                code: sub.code,
                description: sub.description,
                isActive: sub.isActive,
                createdAt: sub.createdAt.toISOString(),
                updatedAt: sub.updatedAt.toISOString(),
              }))
            : runtimeSubjects.filter((s) => s.isActive),
      },
    }
  } catch (err: any) {
    console.error("[GET MASTERS OVERVIEW ERROR]", err)
    return {
      success: true,
      data: {
        standards: runtimeStandards.filter((s) => s.isActive),
        boards: runtimeBoards.filter((b) => b.isActive),
        subjects: runtimeSubjects.filter((s) => s.isActive),
      },
    }
  }
}

// ==========================================
// 1. SUBJECT MASTER ACTIONS
// ==========================================

export async function getSubjectsAction(params?: {
  query?: string
  activeOnly?: boolean
}): Promise<ActionResult<{ subjects: MasterItem[] }>> {
  const dbConnected = await isDatabaseConnected()
  const q = params?.query?.trim().toLowerCase()

  if (!dbConnected) {
    let list = runtimeSubjects
    if (params?.activeOnly) list = list.filter((s) => s.isActive)
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q))
    return { success: true, data: { subjects: list } }
  }

  try {
    const records = await prisma.subjectMaster.findMany({
      where: {
        ...(params?.activeOnly ? { isActive: true } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { name: "asc" },
    })

    if (records.length === 0 && !q) {
      return { success: true, data: { subjects: runtimeSubjects } }
    }

    return {
      success: true,
      data: {
        subjects: records.map((r) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          description: r.description,
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      },
    }
  } catch (err: any) {
    return { success: true, data: { subjects: runtimeSubjects } }
  }
}

export async function createSubjectAction(data: {
  name: string
  code?: string
  description?: string
  isActive?: boolean
}): Promise<ActionResult<{ subject: MasterItem }>> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const name = data.name.trim()
  if (!name) return { success: false, error: "Subject name is required." }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    const newItem: MasterItem = {
      id: "sub-dev-" + Date.now(),
      name,
      code: data.code?.trim() || null,
      description: data.description?.trim() || null,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    runtimeSubjects = [newItem, ...runtimeSubjects]
    revalidatePath("/admin/masters")
    return { success: true, message: `Subject "${name}" created.`, data: { subject: newItem } }
  }

  try {
    const created = await prisma.subjectMaster.create({
      data: {
        name,
        code: data.code?.trim() || null,
        description: data.description?.trim() || null,
        isActive: data.isActive ?? true,
      },
    })

    revalidatePath("/admin/masters")
    revalidatePath("/admin/masters/subjects")
    return {
      success: true,
      message: `Subject "${name}" created successfully.`,
      data: {
        subject: {
          id: created.id,
          name: created.name,
          code: created.code,
          description: created.description,
          isActive: created.isActive,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
      },
    }
  } catch (err: any) {
    if (err.code === "P2002") {
      return { success: false, error: `Subject with name "${name}" already exists.` }
    }
    return { success: false, error: err.message || "Failed to create subject." }
  }
}

export async function updateSubjectAction(
  id: string,
  data: { name: string; code?: string; description?: string; isActive?: boolean }
): Promise<ActionResult<{ subject: MasterItem }>> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const name = data.name.trim()
  if (!name) return { success: false, error: "Subject name is required." }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    runtimeSubjects = runtimeSubjects.map((s) =>
      s.id === id
        ? {
            ...s,
            name,
            code: data.code?.trim() || null,
            description: data.description?.trim() || null,
            isActive: data.isActive ?? s.isActive,
            updatedAt: new Date().toISOString(),
          }
        : s
    )
    const updated = runtimeSubjects.find((s) => s.id === id)!
    revalidatePath("/admin/masters")
    return { success: true, message: `Subject "${name}" updated.`, data: { subject: updated } }
  }

  try {
    const updated = await prisma.subjectMaster.update({
      where: { id },
      data: {
        name,
        code: data.code?.trim() || null,
        description: data.description?.trim() || null,
        isActive: data.isActive,
      },
    })

    revalidatePath("/admin/masters")
    revalidatePath("/admin/masters/subjects")
    return {
      success: true,
      message: `Subject "${name}" updated successfully.`,
      data: {
        subject: {
          id: updated.id,
          name: updated.name,
          code: updated.code,
          description: updated.description,
          isActive: updated.isActive,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      },
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update subject." }
  }
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    runtimeSubjects = runtimeSubjects.filter((s) => s.id !== id)
    revalidatePath("/admin/masters")
    return { success: true, message: "Subject removed." }
  }

  try {
    await prisma.subjectMaster.delete({ where: { id } })
    revalidatePath("/admin/masters")
    revalidatePath("/admin/masters/subjects")
    return { success: true, message: "Subject deleted successfully." }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete subject." }
  }
}

// ==========================================
// 2. STANDARD / CLASS MASTER ACTIONS
// ==========================================

export async function getStandardsAction(params?: {
  query?: string
  activeOnly?: boolean
}): Promise<ActionResult<{ standards: MasterItem[] }>> {
  const dbConnected = await isDatabaseConnected()
  const q = params?.query?.trim().toLowerCase()

  if (!dbConnected) {
    let list = runtimeStandards
    if (params?.activeOnly) list = list.filter((s) => s.isActive)
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q))
    return { success: true, data: { standards: list } }
  }

  try {
    const records = await prisma.standardMaster.findMany({
      where: {
        ...(params?.activeOnly ? { isActive: true } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { order: "asc" },
    })

    if (records.length === 0 && !q) {
      return { success: true, data: { standards: runtimeStandards } }
    }

    return {
      success: true,
      data: {
        standards: records.map((r) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          order: r.order,
          description: r.description,
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      },
    }
  } catch (err: any) {
    return { success: true, data: { standards: runtimeStandards } }
  }
}

export async function createStandardAction(data: {
  name: string
  code?: string
  order?: number
  description?: string
  isActive?: boolean
}): Promise<ActionResult<{ standard: MasterItem }>> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const name = data.name.trim()
  if (!name) return { success: false, error: "Standard name is required." }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    const newItem: MasterItem = {
      id: "std-dev-" + Date.now(),
      name,
      code: data.code?.trim() || null,
      order: data.order ?? 10,
      description: data.description?.trim() || null,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    runtimeStandards = [newItem, ...runtimeStandards]
    revalidatePath("/admin/masters")
    return { success: true, message: `Standard "${name}" created.`, data: { standard: newItem } }
  }

  try {
    const created = await prisma.standardMaster.create({
      data: {
        name,
        code: data.code?.trim() || null,
        order: data.order ?? 0,
        description: data.description?.trim() || null,
        isActive: data.isActive ?? true,
      },
    })

    revalidatePath("/admin/masters")
    revalidatePath("/admin/masters/standards")
    return {
      success: true,
      message: `Standard "${name}" created successfully.`,
      data: {
        standard: {
          id: created.id,
          name: created.name,
          code: created.code,
          order: created.order,
          description: created.description,
          isActive: created.isActive,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
      },
    }
  } catch (err: any) {
    if (err.code === "P2002") {
      return { success: false, error: `Standard with name "${name}" already exists.` }
    }
    return { success: false, error: err.message || "Failed to create standard." }
  }
}

export async function updateStandardAction(
  id: string,
  data: { name: string; code?: string; order?: number; description?: string; isActive?: boolean }
): Promise<ActionResult<{ standard: MasterItem }>> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const name = data.name.trim()
  if (!name) return { success: false, error: "Standard name is required." }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    runtimeStandards = runtimeStandards.map((s) =>
      s.id === id
        ? {
            ...s,
            name,
            code: data.code?.trim() || null,
            order: data.order ?? s.order,
            description: data.description?.trim() || null,
            isActive: data.isActive ?? s.isActive,
            updatedAt: new Date().toISOString(),
          }
        : s
    )
    const updated = runtimeStandards.find((s) => s.id === id)!
    revalidatePath("/admin/masters")
    return { success: true, message: `Standard "${name}" updated.`, data: { standard: updated } }
  }

  try {
    const updated = await prisma.standardMaster.update({
      where: { id },
      data: {
        name,
        code: data.code?.trim() || null,
        order: data.order,
        description: data.description?.trim() || null,
        isActive: data.isActive,
      },
    })

    revalidatePath("/admin/masters")
    revalidatePath("/admin/masters/standards")
    return {
      success: true,
      message: `Standard "${name}" updated successfully.`,
      data: {
        standard: {
          id: updated.id,
          name: updated.name,
          code: updated.code,
          order: updated.order,
          description: updated.description,
          isActive: updated.isActive,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      },
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update standard." }
  }
}

export async function deleteStandardAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    runtimeStandards = runtimeStandards.filter((s) => s.id !== id)
    revalidatePath("/admin/masters")
    return { success: true, message: "Standard removed." }
  }

  try {
    await prisma.standardMaster.delete({ where: { id } })
    revalidatePath("/admin/masters")
    revalidatePath("/admin/masters/standards")
    return { success: true, message: "Standard deleted successfully." }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete standard." }
  }
}

// ==========================================
// 3. BOARD MASTER ACTIONS
// ==========================================

export async function getBoardsAction(params?: {
  query?: string
  activeOnly?: boolean
}): Promise<ActionResult<{ boards: MasterItem[] }>> {
  const dbConnected = await isDatabaseConnected()
  const q = params?.query?.trim().toLowerCase()

  if (!dbConnected) {
    let list = runtimeBoards
    if (params?.activeOnly) list = list.filter((b) => b.isActive)
    if (q) list = list.filter((b) => b.name.toLowerCase().includes(q))
    return { success: true, data: { boards: list } }
  }

  try {
    const records = await prisma.boardMaster.findMany({
      where: {
        ...(params?.activeOnly ? { isActive: true } : {}),
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      },
      orderBy: { name: "asc" },
    })

    if (records.length === 0 && !q) {
      return { success: true, data: { boards: runtimeBoards } }
    }

    return {
      success: true,
      data: {
        boards: records.map((r) => ({
          id: r.id,
          name: r.name,
          code: r.code,
          description: r.description,
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
      },
    }
  } catch (err: any) {
    return { success: true, data: { boards: runtimeBoards } }
  }
}

export async function createBoardAction(data: {
  name: string
  code?: string
  description?: string
  isActive?: boolean
}): Promise<ActionResult<{ board: MasterItem }>> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const name = data.name.trim()
  if (!name) return { success: false, error: "Board name is required." }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    const newItem: MasterItem = {
      id: "brd-dev-" + Date.now(),
      name,
      code: data.code?.trim() || null,
      description: data.description?.trim() || null,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    runtimeBoards = [newItem, ...runtimeBoards]
    revalidatePath("/admin/masters")
    return { success: true, message: `Board "${name}" created.`, data: { board: newItem } }
  }

  try {
    const created = await prisma.boardMaster.create({
      data: {
        name,
        code: data.code?.trim() || null,
        description: data.description?.trim() || null,
        isActive: data.isActive ?? true,
      },
    })

    revalidatePath("/admin/masters")
    revalidatePath("/admin/masters/boards")
    return {
      success: true,
      message: `Board "${name}" created successfully.`,
      data: {
        board: {
          id: created.id,
          name: created.name,
          code: created.code,
          description: created.description,
          isActive: created.isActive,
          createdAt: created.createdAt.toISOString(),
          updatedAt: created.updatedAt.toISOString(),
        },
      },
    }
  } catch (err: any) {
    if (err.code === "P2002") {
      return { success: false, error: `Board with name "${name}" already exists.` }
    }
    return { success: false, error: err.message || "Failed to create board." }
  }
}

export async function updateBoardAction(
  id: string,
  data: { name: string; code?: string; description?: string; isActive?: boolean }
): Promise<ActionResult<{ board: MasterItem }>> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const name = data.name.trim()
  if (!name) return { success: false, error: "Board name is required." }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    runtimeBoards = runtimeBoards.map((b) =>
      b.id === id
        ? {
            ...b,
            name,
            code: data.code?.trim() || null,
            description: data.description?.trim() || null,
            isActive: data.isActive ?? b.isActive,
            updatedAt: new Date().toISOString(),
          }
        : b
    )
    const updated = runtimeBoards.find((b) => b.id === id)!
    revalidatePath("/admin/masters")
    return { success: true, message: `Board "${name}" updated.`, data: { board: updated } }
  }

  try {
    const updated = await prisma.boardMaster.update({
      where: { id },
      data: {
        name,
        code: data.code?.trim() || null,
        description: data.description?.trim() || null,
        isActive: data.isActive,
      },
    })

    revalidatePath("/admin/masters")
    revalidatePath("/admin/masters/boards")
    return {
      success: true,
      message: `Board "${name}" updated successfully.`,
      data: {
        board: {
          id: updated.id,
          name: updated.name,
          code: updated.code,
          description: updated.description,
          isActive: updated.isActive,
          createdAt: updated.createdAt.toISOString(),
          updatedAt: updated.updatedAt.toISOString(),
        },
      },
    }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update board." }
  }
}

export async function deleteBoardAction(id: string): Promise<ActionResult> {
  const user = await getCurrentUser()
  if (!user || user.role !== Role.ADMIN) {
    return { success: false, error: "Unauthorized. Admin privileges required." }
  }

  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    runtimeBoards = runtimeBoards.filter((b) => b.id !== id)
    revalidatePath("/admin/masters")
    return { success: true, message: "Board removed." }
  }

  try {
    await prisma.boardMaster.delete({ where: { id } })
    revalidatePath("/admin/masters")
    revalidatePath("/admin/masters/boards")
    return { success: true, message: "Board deleted successfully." }
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete board." }
  }
}
