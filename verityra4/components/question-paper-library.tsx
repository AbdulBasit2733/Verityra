"use client"

import * as React from "react"
import Link from "next/link"
import {
  FileText,
  Search,
  SlidersHorizontal,
  Download,
  Eye,
  Award,
  Clock,
  RotateCcw,
  X,
  Layers,
  ArrowRight,
  Filter,
  CheckCircle,
  GraduationCap,
  BookOpen,
  Calendar,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GlobalPagination } from "@/components/ui/pagination"
import { AdminPdfPreviewModal } from "@/components/admin/question-papers/admin-pdf-preview-modal"
import { QuestionPaperItem, EXAMINATION_STREAMS } from "@/lib/mock-question-papers"
import {
  PopoverDropdownFilter,
  FilterOption,
} from "@/components/ui/popover-dropdown-filter"

export function QuestionPaperLibrary({ papers }: { papers: QuestionPaperItem[] }) {
  const [query, setQuery] = React.useState("")
  const [streamFilter, setStreamFilter] = React.useState("ALL")
  const [subjectFilter, setSubjectFilter] = React.useState("ALL")
  const [yearFilter, setYearFilter] = React.useState("ALL")
  const [sortBy, setSortBy] = React.useState<"NEWEST" | "MARKS_DESC" | "DURATION_DESC" | "DOWNLOADS_DESC" | "TITLE_ASC">("NEWEST")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(9)

  // Preview modal state
  const [previewPaper, setPreviewPaper] = React.useState<QuestionPaperItem | null>(null)

  // 1. Examination Stream Options (Pre-populated with authoritative streams + actual counts)
  const streamOptions: FilterOption[] = React.useMemo(() => {
    const presentStreams = new Set(papers.map((p) => p.category))
    const allKnown = Array.from(new Set([...EXAMINATION_STREAMS, ...Array.from(presentStreams)]))

    return allKnown.map((stream) => {
      const count = papers.filter((p) => p.category === stream).length
      return {
        label: stream,
        value: stream,
        count: count > 0 ? count : undefined,
      }
    })
  }, [papers])

  // 2. Subject Options
  const subjectOptions: FilterOption[] = React.useMemo(() => {
    const subjectsMap = new Map<string, number>()
    papers.forEach((p) => {
      if (p.subject) {
        subjectsMap.set(p.subject, (subjectsMap.get(p.subject) || 0) + 1)
      }
    })

    return Array.from(subjectsMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([sub, count]) => ({
        label: sub,
        value: sub,
        count,
      }))
  }, [papers])

  // 3. Year Options
  const yearOptions: FilterOption[] = React.useMemo(() => {
    const yearsMap = new Map<number, number>()
    papers.forEach((p) => {
      if (p.year) {
        yearsMap.set(p.year, (yearsMap.get(p.year) || 0) + 1)
      }
    })

    return Array.from(yearsMap.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([year, count]) => ({
        label: `${year} Examination`,
        value: String(year),
        count,
      }))
  }, [papers])

  // Filter & Sort
  const filteredPapers = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const result = papers.filter((paper) => {
      const matchesStream = streamFilter === "ALL" || paper.category === streamFilter
      const matchesSubject = subjectFilter === "ALL" || paper.subject === subjectFilter
      const matchesYear = yearFilter === "ALL" || String(paper.year) === yearFilter

      const searchable = `${paper.title} ${paper.subject || ""} ${paper.category} ${paper.year || ""} ${paper.description || ""}`.toLowerCase()
      const matchesSearch = !q || searchable.includes(q)

      return matchesStream && matchesSubject && matchesYear && matchesSearch
    })

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "MARKS_DESC":
          return (b.maxMarks || 0) - (a.maxMarks || 0)
        case "DURATION_DESC":
          return (b.durationMinutes || 0) - (a.durationMinutes || 0)
        case "DOWNLOADS_DESC":
          return (b.downloadsCount || 0) - (a.downloadsCount || 0)
        case "TITLE_ASC":
          return a.title.localeCompare(b.title)
        case "NEWEST":
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
    })

    return result
  }, [papers, query, streamFilter, subjectFilter, yearFilter, sortBy])

  // Reset page on filter changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [query, streamFilter, subjectFilter, yearFilter, sortBy])

  const hasActiveFilters =
    Boolean(query.trim()) || streamFilter !== "ALL" || subjectFilter !== "ALL" || yearFilter !== "ALL"

  const handleResetFilters = () => {
    setQuery("")
    setStreamFilter("ALL")
    setSubjectFilter("ALL")
    setYearFilter("ALL")
    setSortBy("NEWEST")
    setCurrentPage(1)
  }

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPapers.length / pageSize))
  const paginatedPapers = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredPapers.slice(start, start + pageSize)
  }, [filteredPapers, currentPage, pageSize])

  return (
    <div className="space-y-6">
      {/* 2-Column Catalog Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] items-start gap-8">
        {/* Left Sticky Filter Sidebar */}
        <aside className="space-y-5 hidden lg:block sticky top-24">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">Document Library</p>
            <h2 className="mt-1 text-lg font-bold text-[#071B3A] font-heading">Filter Catalog</h2>
          </div>

          <Card className="border-[#DCE7FA] shadow-xs bg-white">
            <CardContent className="space-y-4 p-4">
              {/* Unified Popover Filters in Sidebar */}
              <div className="space-y-1.5">
                <PopoverDropdownFilter
                  title="Examination Stream"
                  icon={GraduationCap}
                  options={streamOptions}
                  selectedValue={streamFilter}
                  onSelect={setStreamFilter}
                  searchPlaceholder="Search SSC, CBSE, NEET, JEE..."
                  allLabel="All Examination Streams"
                  className="w-full"
                />
              </div>

              {subjectOptions.length > 0 && (
                <div className="space-y-1.5">
                  <PopoverDropdownFilter
                    title="Subject / Discipline"
                    icon={BookOpen}
                    options={subjectOptions}
                    selectedValue={subjectFilter}
                    onSelect={setSubjectFilter}
                    searchPlaceholder="Search subjects..."
                    allLabel="All Subjects"
                    className="w-full"
                  />
                </div>
              )}

              {yearOptions.length > 0 && (
                <div className="space-y-1.5">
                  <PopoverDropdownFilter
                    title="Exam Year"
                    icon={Calendar}
                    options={yearOptions}
                    selectedValue={yearFilter}
                    onSelect={setYearFilter}
                    searchPlaceholder="Search year..."
                    allLabel="All Years"
                    className="w-full"
                  />
                </div>
              )}

              {/* Stream Quick Links List */}
              <div className="border-t border-[#DCE7FA] pt-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Popular Streams
                </p>
                <div className="flex flex-col gap-1">
                  {[
                    "SSC",
                    "CBSE Board",
                    "ICSE / ISC Board",
                    "NEET",
                    "JEE Main",
                    "JEE Advanced",
                    "UPSC / Civil Services",
                  ].map((stream) => {
                    const isSelected = streamFilter === stream
                    const count = papers.filter((p) => p.category === stream).length
                    return (
                      <button
                        key={stream}
                        type="button"
                        onClick={() => setStreamFilter(isSelected ? "ALL" : stream)}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-[#EFF6FF] text-[#145DEB] font-bold"
                            : "text-slate-600 hover:bg-[#F1F6FF] hover:text-[#071B3A]"
                        }`}
                      >
                        <span className="truncate">{stream}</span>
                        {count > 0 && (
                          <span className="text-[10px] text-slate-400 font-semibold">{count}</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Stats Summary */}
              <div className="border-t border-[#DCE7FA] pt-3 text-xs text-slate-500 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span>Total Papers</span>
                  <strong className="text-[#071B3A]">{papers.length}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span>Matching Results</span>
                  <strong className="text-[#145DEB]">{filteredPapers.length}</strong>
                </div>
              </div>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-[#DCE7FA] text-xs font-semibold text-slate-700"
                  onClick={handleResetFilters}
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Reset all filters
                </Button>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* Right Main Catalog Content */}
        <section className="min-w-0 space-y-6">
          {/* Search & Popover Filters Toolbar */}
          <div className="space-y-3 border-b border-[#DCE7FA] pb-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-xl">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by subject, examination, topic or year..."
                  className="h-11 border-[#DCE7FA] pl-10 pr-10 text-sm bg-white"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                  <SelectTrigger size="sm" className="h-11 w-[180px] border-[#DCE7FA] text-xs font-semibold bg-white">
                    <SlidersHorizontal className="mr-1.5 h-3.5 w-3.5 text-[#145DEB]" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEWEST">Newest first</SelectItem>
                    <SelectItem value="MARKS_DESC">Highest marks</SelectItem>
                    <SelectItem value="DURATION_DESC">Longest duration</SelectItem>
                    <SelectItem value="DOWNLOADS_DESC">Most downloaded</SelectItem>
                    <SelectItem value="TITLE_ASC">Title: A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Horizontal Popover Dropdown Filters Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <PopoverDropdownFilter
                title="Stream"
                icon={GraduationCap}
                options={streamOptions}
                selectedValue={streamFilter}
                onSelect={setStreamFilter}
                searchPlaceholder="Search SSC, CBSE, NEET, JEE..."
                allLabel="All Streams"
              />

              {subjectOptions.length > 0 && (
                <PopoverDropdownFilter
                  title="Subject"
                  icon={BookOpen}
                  options={subjectOptions}
                  selectedValue={subjectFilter}
                  onSelect={setSubjectFilter}
                  searchPlaceholder="Search subjects..."
                  allLabel="All Subjects"
                />
              )}

              {yearOptions.length > 0 && (
                <PopoverDropdownFilter
                  title="Year"
                  icon={Calendar}
                  options={yearOptions}
                  selectedValue={yearFilter}
                  onSelect={setYearFilter}
                  searchPlaceholder="Search years..."
                  allLabel="All Years"
                />
              )}

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-10 text-xs text-[#145DEB] hover:bg-[#EFF6FF] px-2.5 font-semibold"
                >
                  <RotateCcw className="mr-1 h-3.5 w-3.5" /> Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Results Summary Header */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-[#071B3A] font-heading">
                Available Question Papers
              </h3>
              <p className="text-xs text-slate-500">
                Showing {filteredPapers.length} of {papers.length} verified examination documents
              </p>
            </div>
            <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 border-[#BFD5FA] text-[#145DEB] bg-white">
              <CheckCircle className="h-3 w-3" /> Official Papers
            </Badge>
          </div>

          {/* Cards Grid */}
          {paginatedPapers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {paginatedPapers.map((paper) => (
                <Card
                  key={paper.id}
                  className="flex flex-col h-full border-[#DCE7FA] bg-white shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200"
                >
                  <CardHeader className="gap-2.5 p-5 pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <Badge className="rounded-full bg-[#F1F6FF] text-[#145DEB] border border-[#BFD5FA]/60 text-[10px] font-bold tracking-wide uppercase">
                        {paper.category}
                      </Badge>
                      {paper.year && (
                        <span className="text-xs font-bold text-slate-500 bg-slate-100 rounded-md px-2 py-0.5">
                          {paper.year}
                        </span>
                      )}
                    </div>
                    <CardTitle className="font-heading text-base font-bold leading-snug text-[#071B3A] line-clamp-2 mt-1">
                      {paper.title}
                    </CardTitle>
                    {paper.description && (
                      <p className="line-clamp-2 text-xs leading-relaxed text-[#64748B]">
                        {paper.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="px-5 py-3 mt-auto">
                    <div className="grid grid-cols-2 gap-2.5 rounded-xl bg-[#F1F6FF]/50 p-2.5 border border-[#DCE7FA]/70 text-xs text-slate-600">
                      <span className="flex items-center gap-1.5 font-semibold text-[#071B3A]">
                        <Award className="h-3.5 w-3.5 text-[#145DEB]" /> {paper.maxMarks} Marks
                      </span>
                      {paper.durationMinutes ? (
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <Clock className="h-3.5 w-3.5 text-slate-400" /> {paper.durationMinutes} Mins
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-slate-500">
                          <FileText className="h-3.5 w-3.5 text-slate-400" /> PDF Format
                        </span>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 border-t border-[#DCE7FA] p-4 bg-slate-50/40 rounded-b-xl">
                    <div className="flex w-full gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewPaper(paper)}
                        className="flex-1 rounded-xl border-[#DCE7FA] text-xs font-semibold text-[#145DEB] hover:bg-[#F1F6FF]"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" /> Preview
                      </Button>

                      <a
                        href={`${paper.fileUrl}&download=1`}
                        download
                        className="flex-1 inline-flex"
                      >
                        <Button
                          size="sm"
                          className="w-full rounded-xl bg-[#145DEB] hover:bg-[#0F4DC7] text-white text-xs font-semibold shadow-xs"
                        >
                          <Download className="mr-1.5 h-3.5 w-3.5" /> Download
                        </Button>
                      </a>
                    </div>

                    <Link
                      href={`/question-papers/${paper.id}`}
                      className="text-[11px] text-center font-medium text-slate-500 hover:text-[#145DEB] transition-colors pt-1"
                    >
                      View syllabus details &amp; instructions &rarr;
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-[#DCE7FA] rounded-2xl p-12 text-center bg-white">
              <Search className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <h3 className="font-bold text-[#071B3A] text-base">No matching question papers</h3>
              <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">
                Try searching for another subject or clear your active filters to view all papers.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 rounded-xl border-[#DCE7FA] text-xs font-semibold"
                onClick={handleResetFilters}
              >
                Reset all filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {filteredPapers.length > pageSize && (
            <div className="pt-4">
              <GlobalPagination
                totalItems={filteredPapers.length}
                totalPages={totalPages}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
                pageSizeOptions={[6, 9, 12, 24]}
              />
            </div>
          )}
        </section>
      </div>

      {/* In-Browser PDF Preview Modal */}
      {previewPaper && (
        <AdminPdfPreviewModal
          open={Boolean(previewPaper)}
          onOpenChange={(open) => !open && setPreviewPaper(null)}
          title={previewPaper.title}
          fileUrl={previewPaper.fileUrl}
        />
      )}
    </div>
  )
}
