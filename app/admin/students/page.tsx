import { prisma, isDatabaseConnected } from "@/lib/prisma"
import {
  AdminStudentRegistrationRow,
  AdminStudentsClient,
} from "@/components/admin-students-client"

export const dynamic = "force-dynamic"

export default async function AdminStudentsPage() {
  const dbConnected = await isDatabaseConnected()

  let registrations: any[] = []

  if (dbConnected) {
    registrations = await prisma.testRegistration.findMany({
      take: 100,
      select: {
        id: true,
        attemptsUsed: true,
        maxAttempts: true,
        registeredAt: true,
        user: {
          select: { name: true, email: true },
        },
        testSeries: {
          select: { title: true },
        },
      },
      orderBy: { registeredAt: "desc" },
    })
  } else {
    registrations = [
      {
        id: "demo-reg-1",
        attemptsUsed: 3,
        maxAttempts: 3,
        registeredAt: new Date(),
        user: { name: "Aarav Sharma", email: "aarav@example.com" },
        testSeries: { title: "UPSC Civil Services GS I Mock", maxMarks: 250 },
      },
    ]
  }

  const rows: AdminStudentRegistrationRow[] = registrations.map((reg) => ({
    id: reg.id,
    studentName: reg.user?.name || "Student",
    studentEmail: reg.user?.email || "",
    testTitle: reg.testSeries?.title || "Mock Examination",
    attemptsUsed: reg.attemptsUsed,
    maxAttempts: reg.maxAttempts,
    registeredAt: new Date(reg.registeredAt).toISOString(),
  }))

  return <AdminStudentsClient registrations={rows} />
}
