"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BookOpen, Download, FileText, Search, SlidersHorizontal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

export type QuestionPaperItem = {
  id: string
  title: string
  fileUrl: string
  maxMarks: number
  testSeriesTitle: string
  category: string
}

const categories = ["All papers", "School education", "Competitive", "Government"]

function getCategory(title: string) {
  const value = title.toLowerCase()
  if (value.includes("class") || value.includes("cbse") || value.includes("board")) return "School education"
  if (value.includes("neet") || value.includes("jee")) return "Competitive"
  return "Government"
}

export function QuestionPaperLibrary({ papers }: { papers: QuestionPaperItem[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All papers")

  const filteredPapers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return papers.filter((paper) => {
      const matchesCategory = category === "All papers" || getCategory(paper.title) === category
      const searchable = `${paper.title} ${paper.testSeriesTitle} ${paper.category}`.toLowerCase()
      return matchesCategory && (!normalizedQuery || searchable.includes(normalizedQuery))
    })
  }, [category, papers, query])

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-[#DCE7FA] bg-white/90 shadow-sm">
        <CardContent className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2" aria-hidden="true" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by subject, exam, class or year..."
              aria-label="Search question papers"
              className="h-11 border-[#DCE7FA] pl-10"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter by examination category">
            <SlidersHorizontal className="text-[#145DEB] shrink-0" aria-hidden="true" />
            {categories.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={category === item ? "default" : "outline"}
                onClick={() => setCategory(item)}
                className="shrink-0 rounded-full"
              >
                {item}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredPapers.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredPapers.map((paper) => (
            <Card key={paper.id} className="group border-[#DCE7FA] bg-white shadow-sm transition-shadow hover:shadow-md">
              <CardHeader className="gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#F1F6FF] text-[#145DEB]">
                    <FileText aria-hidden="true" />
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-[#F1F6FF] text-[#145DEB]">{getCategory(paper.title)}</Badge>
                </div>
                <CardTitle className="font-heading text-lg leading-snug text-[#071B3A]">{paper.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm text-[#64748B]">Available with {paper.testSeriesTitle}.</p>
                <div className="flex flex-wrap gap-2 text-xs text-[#64748B]">
                  <Badge variant="outline">{paper.maxMarks} marks</Badge>
                  <Badge variant="outline">PDF document</Badge>
                  <Badge variant="outline">Public access</Badge>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/question-papers/${paper.id}`}
                    className={cn(buttonVariants({ variant: "outline" }), "flex-1 rounded-xl border-[#BFD5FA] text-[#145DEB]")}
                  >
                    <BookOpen data-icon="inline-start" /> Preview
                  </Link>
                  <a
                    href={paper.fileUrl}
                    download
                    className={cn(buttonVariants(), "flex-1 rounded-xl bg-[#145DEB] hover:bg-[#0F4DC7]")}
                  >
                    <Download data-icon="inline-start" /> Download
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-[#BFD5FA] bg-white/80">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#F1F6FF] text-[#145DEB]"><FileText aria-hidden="true" /></div>
            <h2 className="font-heading text-xl font-bold text-[#071B3A]">No question papers found</h2>
            <p className="max-w-md text-sm text-[#64748B]">Try another search or category. New public documents will appear here as they are published.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
