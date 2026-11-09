"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  FileText,
  Plus,
  Search,
  Download,
  Eye,
  Trash2,
  Globe,
  EyeOff,
  CheckCircle2,
  Clock,
  Award,
  Layers,
  GraduationCap,
} from "lucide-react"
import {
  deleteQuestionPaperAction,
  togglePublishQuestionPaperAction,
  QuestionPaperData,
} from "@/actions/question-paper-actions"
import { QuestionPaperItem, EXAMINATION_STREAMS } from "@/lib/mock-question-papers"
import {
  PopoverDropdownFilter,
  FilterOption,
} from "@/components/ui/popover-dropdown-filter"
import { AdminAddQuestionPaperModal } from "./admin-add-question-paper-modal"
import { AdminPdfPreviewModal } from "./admin-pdf-preview-modal"

interface AdminQuestionPapersClientProps {
  initialPapers: QuestionPaperItem[]
}

export function AdminQuestionPapersClient({
  initialPapers,
}: AdminQuestionPapersClientProps) {
  const router = useRouter()
  const confirm = useConfirm()
  const [papers, setPapers] = React.useState<QuestionPaperItem[]>(initialPapers)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [streamFilter, setStreamFilter] = React.useState("ALL")
  const [statusFilter, setStatusFilter] = React.useState("ALL")
  const [addModalOpen, setAddModalOpen] = React.useState(false)

  // Preview state
  const [previewPaper, setPreviewPaper] = React.useState<QuestionPaperItem | null>(null)

  // Actions loading state
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null)

  // Metrics
  const totalPapers = papers.length
  const publishedCount = papers.filter((p) => p.isPublished).length
  const totalDownloads = papers.reduce((sum, p) => sum + (p.downloadsCount || 0), 0)
  const uniqueCategories = new Set(papers.map((p) => p.category)).size

  // Category Options for Popover Filter
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

  const statusOptions: FilterOption[] = [
    { label: "Published (Live)", value: "PUBLISHED", count: publishedCount, icon: Globe },
    { label: "Draft (Hidden)", value: "DRAFT", count: totalPapers - publishedCount, icon: EyeOff },
  ]

  // Filtering
  const filteredPapers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return papers.filter((paper) => {
      const matchesSearch =
        !q ||
        paper.title.toLowerCase().includes(q) ||
        (paper.subject && paper.subject.toLowerCase().includes(q)) ||
        paper.category.toLowerCase().includes(q) ||
        (paper.year && paper.year.toString().includes(q))

      const matchesStream =
        streamFilter === "ALL" || paper.category === streamFilter

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PUBLISHED" && paper.isPublished) ||
        (statusFilter === "DRAFT" && !paper.isPublished)

      return matchesSearch && matchesStream && matchesStatus
    })
  }, [papers, searchQuery, streamFilter, statusFilter])

  const handlePaperAdded = (newPaper: QuestionPaperData) => {
    setPapers((prev) => [newPaper as unknown as QuestionPaperItem, ...prev])
    router.refresh()
  }

  const handleDelete = async (paper: QuestionPaperItem) => {
    const confirmed = await confirm({
      title: `Delete "${paper.title}"?`,
      description: "This question paper will be permanently removed from the library and will no longer be downloadable by students.",
      confirmText: "Delete Paper",
      cancelText: "Cancel",
      variant: "destructive",
      badgeText: "Question Paper Library",
    })

    if (!confirmed) return

    setActionLoadingId(paper.id)
    try {
      const res = await deleteQuestionPaperAction(paper.id)
      if (res.success) {
        toast.success("Question Paper Deleted", { description: res.message })
        setPapers((prev) => prev.filter((p) => p.id !== paper.id))
        router.refresh()
      } else {
        toast.error("Delete failed", { description: res.error || "Unable to delete question paper." })
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message || "Failed to delete question paper." })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleTogglePublish = async (paper: QuestionPaperItem) => {
    const nextState = !paper.isPublished
    setActionLoadingId(paper.id)
    try {
      const res = await togglePublishQuestionPaperAction(paper.id, nextState)
      if (res.success) {
        toast.success(nextState ? "Question Paper Published" : "Question Paper Hidden", {
          description: nextState
            ? `"${paper.title}" is now visible to students at /question-papers.`
            : `"${paper.title}" is now hidden from the public library.`,
        })
        setPapers((prev) =>
          prev.map((p) => (p.id === paper.id ? { ...p, isPublished: nextState } : p))
        )
        router.refresh()
      } else {
        toast.error("Status update failed", { description: res.error })
      }
    } catch (err: any) {
      toast.error("Error", { description: err?.message || "Failed to update publication status." })
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <PageHeader
        icon={FileText}
        title="Question Papers Library"
        subtitle="Manage standalone question papers, board examinations, and competitive practice papers."
        showRefresh
      >
        <Button
          onClick={() => setAddModalOpen(true)}
          className="h-10 rounded-xl bg-[#145DEB] hover:bg-[#0F4DC7] text-white text-xs font-semibold px-4 shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" /> Add Question Paper
        </Button>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiStatCard
          label="Total Papers"
          value={totalPapers}
          icon={FileText}
          variant="blue"
        />
        <KpiStatCard
          label="Live Published"
          value={publishedCount}
          icon={Globe}
          variant="emerald"
        />
        <KpiStatCard
          label="Total Downloads"
          value={totalDownloads}
          icon={Download}
          variant="indigo"
        />
        <KpiStatCard
          label="Categories"
          value={uniqueCategories}
          icon={Layers}
          variant="amber"
        />
      </div>

      {/* Filter and Search Bar using PopoverDropdownFilter */}
      <div className="flex flex-col gap-3 rounded-2xl border border-[#DCE7FA] bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, subject, year, or category..."
            className="h-10 border-[#DCE7FA] pl-10 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Reusable Popover Dropdown Filter: Stream */}
          <PopoverDropdownFilter
            title="Stream"
            icon={GraduationCap}
            options={streamOptions}
            selectedValue={streamFilter}
            onSelect={setStreamFilter}
            searchPlaceholder="Search SSC, CBSE, NEET, JEE..."
            allLabel="All Streams"
          />

          {/* Reusable Popover Dropdown Filter: Status */}
          <PopoverDropdownFilter
            title="Status"
            icon={Globe}
            options={statusOptions}
            selectedValue={statusFilter}
            onSelect={setStatusFilter}
            searchPlaceholder="Search status..."
            allLabel="All Statuses"
            width="w-56"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-hidden rounded-2xl border border-[#DCE7FA] bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-[#DCE7FA] bg-[#F1F6FF]/70 text-slate-600 font-semibold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Question Paper</th>
                <th className="py-3.5 px-3">Examination Stream</th>
                <th className="py-3.5 px-3">Details</th>
                <th className="py-3.5 px-3">Status</th>
                <th className="py-3.5 px-3">Downloads</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE7FA]/70">
              {filteredPapers.length > 0 ? (
                filteredPapers.map((paper) => (
                  <tr key={paper.id} className="hover:bg-[#F1F6FF]/30 transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#F1F6FF] text-[#145DEB] border border-[#BFD5FA]/60">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-[#071B3A] line-clamp-1">{paper.title}</p>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            {paper.subject || "General"} {paper.year ? `· ${paper.year}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <Badge variant="secondary" className="rounded-full bg-[#F1F6FF] text-[#145DEB] border border-[#BFD5FA]/50 text-[11px] font-semibold">
                        {paper.category}
                      </Badge>
                    </td>

                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-0.5 text-xs text-[#64748B]">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Award className="h-3 w-3 text-[#145DEB]" /> {paper.maxMarks} Marks
                        </span>
                        {paper.durationMinutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3 text-slate-400" /> {paper.durationMinutes} Mins
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <button
                        onClick={() => handleTogglePublish(paper)}
                        disabled={actionLoadingId === paper.id}
                        className="inline-flex items-center gap-1.5 cursor-pointer"
                        title="Click to toggle publish status"
                      >
                        {paper.isPublished ? (
                          <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold gap-1 hover:bg-emerald-100">
                            <Globe className="h-3 w-3" /> Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-500 border-slate-300 text-[10px] font-bold gap-1 hover:bg-slate-50">
                            <EyeOff className="h-3 w-3" /> Draft
                          </Badge>
                        )}
                      </button>
                    </td>

                    <td className="py-4 px-3">
                      <span className="font-bold text-slate-800 text-xs">
                        {paper.downloadsCount || 0}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPreviewPaper(paper)}
                          title="Preview Document"
                          className="h-8 w-8 p-0 text-[#145DEB] hover:bg-[#F1F6FF]"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <a href={`${paper.fileUrl}&download=1`} download>
                          <Button
                            size="sm"
                            variant="ghost"
                            title="Download PDF"
                            className="h-8 w-8 p-0 text-slate-600 hover:text-[#145DEB] hover:bg-[#F1F6FF]"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(paper)}
                          disabled={actionLoadingId === paper.id}
                          title="Delete Paper"
                          className="h-8 w-8 p-0 text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FileText className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700 text-sm">No question papers found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchQuery || streamFilter !== "ALL" || statusFilter !== "ALL"
                        ? "Try adjusting your search query or filters."
                        : "Click 'Add Question Paper' to upload your first paper."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AdminAddQuestionPaperModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handlePaperAdded}
      />

      {/* PDF Preview Modal */}
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
