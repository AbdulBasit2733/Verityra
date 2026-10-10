import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AdminExtraAttemptDialog } from "@/components/admin-extra-attempt-dialog"
import { Users, Award, ShieldCheck } from "lucide-react"
import { Role } from "@prisma/client"

export const dynamic = "force-dynamic"

export default async function AdminStudentsPage() {
  const dbConnected = await isDatabaseConnected()

  let registrations: any[] = []

  if (dbConnected) {
    registrations = await prisma.testRegistration.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, status: true },
        },
        testSeries: {
          select: { id: true, title: true, maxMarks: true },
        },
        submissions: {
          select: { id: true, attemptNumber: true, status: true },
        },
      },
      orderBy: { registeredAt: "desc" },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#0B192C]">
          Candidate Registrations & Overrides
        </h1>
        <p className="text-xs text-[#4B6375] mt-1">
          Review candidate enrollments, track attempt consumption, and grant audited exceptional attempt allowances.
        </p>
      </div>

      <Card className="border-[#D5E5F2] bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#CADEEF]/20 text-xs font-semibold text-[#0B192C]">
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Enrolled Test Series</TableHead>
              <TableHead>Attempts Consumed</TableHead>
              <TableHead>Allowed Maximum</TableHead>
              <TableHead>Registration Date</TableHead>
              <TableHead className="text-right">Audited Override</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {registrations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-[#4B6375]">
                  No student registrations found in the database.
                </TableCell>
              </TableRow>
            ) : (
              registrations.map((reg) => (
                <TableRow key={reg.id} className="hover:bg-[#F2F7FA]/50">
                  <TableCell className="font-semibold text-[#0B192C]">
                    {reg.user.name || "Student"}
                    <span className="block text-[11px] text-[#4B6375] font-normal">{reg.user.email}</span>
                  </TableCell>
                  <TableCell className="text-[#4B6375] max-w-[220px] truncate">
                    {reg.testSeries.title}
                  </TableCell>
                  <TableCell className="font-bold">
                    <span
                      className={
                        reg.attemptsUsed >= reg.maxAttempts
                          ? "text-red-600"
                          : "text-[#0784B5]"
                      }
                    >
                      {reg.attemptsUsed} attempts
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{reg.maxAttempts} allowed</TableCell>
                  <TableCell className="text-[#4B6375]">
                    {new Date(reg.registeredAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <AdminExtraAttemptDialog
                      registrationId={reg.id}
                      studentName={reg.user.name || "Candidate"}
                      testTitle={reg.testSeries.title}
                      currentMax={reg.maxAttempts}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
