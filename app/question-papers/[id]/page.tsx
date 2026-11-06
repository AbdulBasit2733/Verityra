import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Download, FileText } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma, isDatabaseConnected } from "@/lib/prisma"

export const revalidate = 300

export default async function QuestionPaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!(await isDatabaseConnected())) notFound()

  const paper = await prisma.testPaper.findFirst({
    where: { id, testSeries: { isPublished: true } },
    select: {
      title: true,
      fileUrl: true,
      maxMarks: true,
      rubricContent: true,
      testSeries: { select: { title: true, description: true, durationMinutes: true } },
    },
  })

  if (!paper) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-[#F1F6FF]">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-10 sm:px-6 lg:py-16">
        <Button asChild variant="ghost" className="w-fit text-[#145DEB]"><Link href="/question-papers"><ArrowLeft data-icon="inline-start" /> Back to question papers</Link></Button>
        <Card className="border-[#DCE7FA] bg-white shadow-sm">
          <CardHeader className="gap-4 border-b border-[#DCE7FA]">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-[#F1F6FF] text-[#145DEB]"><FileText aria-hidden="true" /></div>
            <Badge className="w-fit rounded-full bg-[#F1F6FF] text-[#145DEB]">Public question paper</Badge>
            <CardTitle className="font-heading text-3xl text-[#071B3A]">{paper.title}</CardTitle>
            <p className="text-[#64748B]">{paper.testSeries.title} · {paper.maxMarks} marks · {paper.testSeries.durationMinutes} minutes</p>
          </CardHeader>
          <CardContent className="flex flex-col gap-6 p-6 sm:p-8">
            <p className="leading-7 text-[#64748B]">{paper.testSeries.description}</p>
            {paper.rubricContent && <div className="rounded-2xl bg-[#F1F6FF] p-5"><h2 className="font-semibold text-[#071B3A]">Document information</h2><p className="mt-2 text-sm leading-6 text-[#64748B]">{paper.rubricContent}</p></div>}
            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-xl bg-[#145DEB] hover:bg-[#0F4DC7]"><a href={paper.fileUrl} download><Download data-icon="inline-start" /> Download PDF</a></Button>
              <Button asChild variant="outline" className="rounded-xl border-[#BFD5FA] text-[#145DEB]"><a href={paper.fileUrl} target="_blank" rel="noreferrer">Open document preview</a></Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
