import Link from "next/link"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileCheck, Edit, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminSubmissionsPage() {
  const dbConnected = await isDatabaseConnected()

  let submissions: any[] = []

  if (dbConnected) {
    submissions = await prisma.submission.findMany({
      include: {
        user: { select: { name: true, email: true } },
        testSeries: { select: { title: true, maxMarks: true } },
        evaluation: true,
      },
      orderBy: { submittedAt: "desc" },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B192C]">Candidate Submissions & Reviews</h1>
          <p className="text-xs text-[#4B6375] mt-1">
            Inspect handwritten responses, review AI structured evaluations, and adjust question scores.
          </p>
        </div>
      </div>

      <Card className="border-[#D5E5F2] bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#CADEEF]/20 text-xs font-semibold text-[#0B192C]">
            <TableRow>
              <TableHead>Candidate</TableHead>
              <TableHead>Test Module</TableHead>
              <TableHead>Attempt</TableHead>
              <TableHead>Evaluation Status</TableHead>
              <TableHead>Awarded Marks</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {submissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-[#4B6375]">
                  No student submissions logged in the database yet.
                </TableCell>
              </TableRow>
            ) : (
              submissions.map((sub) => {
                const isReviewRequired = sub.status === "REVIEW_REQUIRED" || sub.evaluation?.uncertaintyFlag

                return (
                  <TableRow key={sub.id} className="hover:bg-[#F2F7FA]/50">
                    <TableCell className="font-semibold text-[#0B192C]">
                      {sub.user?.name || "Student"}
                      <span className="block text-[11px] text-[#4B6375] font-normal">{sub.user?.email}</span>
                    </TableCell>
                    <TableCell className="text-[#4B6375] max-w-[200px] truncate">
                      {sub.testSeries?.title}
                    </TableCell>
                    <TableCell className="font-semibold">Attempt #{sub.attemptNumber}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          sub.status === "COMPLETED"
                            ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                            : sub.status === "REVIEW_REQUIRED"
                            ? "border-amber-300 text-amber-700 bg-amber-50"
                            : "border-blue-300 text-blue-700 bg-blue-50"
                        }`}
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-bold text-[#0784B5]">
                      {sub.evaluation
                        ? `${sub.evaluation.totalMarksAwarded} / ${sub.evaluation.maxMarks}`
                        : "Processing"}
                    </TableCell>
                    <TableCell>
                      {sub.evaluation?.uncertaintyFlag ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          <AlertTriangle className="h-3 w-3" /> Flagged
                        </span>
                      ) : (
                        <span className="text-[10px] text-emerald-700 font-medium">Clear</span>
                      )}
                    </TableCell>
                    <TableCell className="text-[#4B6375]">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/submissions/${sub.id}`}>
                        <Button
                          size="xs"
                          className={`${
                            isReviewRequired
                              ? "bg-amber-600 hover:bg-amber-700 text-white"
                              : "bg-[#0784B5] hover:bg-[#0784B5]/90 text-white"
                          } text-xs font-semibold`}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Review Score
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
