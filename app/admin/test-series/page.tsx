import Link from "next/link"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Eye, BookOpen, CheckCircle, Clock } from "lucide-react"
import { TestSeriesStatus } from "@prisma/client"

export const dynamic = "force-dynamic"

export default async function AdminTestSeriesPage() {
  const dbConnected = await isDatabaseConnected()

  let testSeriesList: any[] = []

  if (dbConnected) {
    testSeriesList = await prisma.testSeries.findMany({
      include: {
        _count: {
          select: {
            registrations: true,
            submissions: true,
            papers: true,
            templates: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B192C]">Test Series Management</h1>
          <p className="text-xs text-[#4B6375] mt-1">
            Create, configure, publish, and manage subjective examination papers and templates.
          </p>
        </div>

        <Link href="/admin/test-series/new">
          <Button className="bg-[#0784B5] hover:bg-[#0784B5]/90 text-white font-semibold text-xs">
            <Plus className="mr-1.5 h-4 w-4" />
            Create New Test Series
          </Button>
        </Link>
      </div>

      <Card className="border-[#D5E5F2] bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-[#CADEEF]/20 text-xs font-semibold text-[#0B192C]">
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Enrolled</TableHead>
              <TableHead>Papers & Templates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {testSeriesList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-[#4B6375]">
                  No test series created yet. Click &quot;Create New Test Series&quot; to begin.
                </TableCell>
              </TableRow>
            ) : (
              testSeriesList.map((test) => (
                <TableRow key={test.id} className="hover:bg-[#F2F7FA]/50">
                  <TableCell className="font-semibold text-[#0B192C] max-w-[200px] truncate">
                    {test.title}
                  </TableCell>
                  <TableCell>
                    {test.price === 0 ? (
                      <Badge className="bg-emerald-600 text-white font-semibold text-[10px] border-0">
                        FREE
                      </Badge>
                    ) : (
                      <span className="font-bold text-[#0784B5]">₹{test.price / 100}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${
                        test.status === TestSeriesStatus.PUBLISHED
                          ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                          : "border-slate-300 text-slate-700 bg-slate-50"
                      }`}
                    >
                      {test.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{test.maxMarks} marks</TableCell>
                  <TableCell className="font-semibold text-[#0784B5]">
                    {test.maxAttempts} allowed
                  </TableCell>
                  <TableCell>{test._count?.registrations || 0} students</TableCell>
                  <TableCell className="text-[#4B6375]">
                    {test._count?.papers || 0} papers · {test._count?.templates || 0} templates
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/test-series/${test.id}`}>
                      <Button size="xs" variant="outline" className="border-[#0784B5] text-[#0784B5] hover:bg-[#CADEEF]/30 text-xs">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Configure
                      </Button>
                    </Link>
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
