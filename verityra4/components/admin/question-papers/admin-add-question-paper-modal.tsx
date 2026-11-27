"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/sonner"
import {
  uploadQuestionPaperAction,
  QuestionPaperData,
} from "@/actions/question-paper-actions"
import { EXAMINATION_STREAMS } from "@/lib/mock-question-papers"
import { UploadCloud, FileText, Loader2, CheckCircle2 } from "lucide-react"

interface AdminAddQuestionPaperModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (paper: QuestionPaperData) => void
}

export function AdminAddQuestionPaperModal({
  open,
  onOpenChange,
  onSuccess,
}: AdminAddQuestionPaperModalProps) {
  const [loading, setLoading] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState<string>("CBSE Board")
  const [subject, setSubject] = React.useState("")
  const [year, setYear] = React.useState(new Date().getFullYear().toString())
  const [maxMarks, setMaxMarks] = React.useState("100")
  const [durationMinutes, setDurationMinutes] = React.useState("180")
  const [description, setDescription] = React.useState("")
  const [isPublished, setIsPublished] = React.useState(true)
  const [file, setFile] = React.useState<File | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)

  const resetForm = () => {
    setTitle("")
    setCategory("CBSE Board")
    setSubject("")
    setYear(new Date().getFullYear().toString())
    setMaxMarks("100")
    setDurationMinutes("180")
    setDescription("")
    setIsPublished(true)
    setFile(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.type !== "application/pdf") {
        toast.error("Invalid file format", {
          description: "Please select a PDF document.",
        })
        return
      }
      if (selected.size === 0 || selected.size > 5 * 1024 * 1024) {
        toast.error("File size exceeded", {
          description: `Selected file (${(selected.size / (1024 * 1024)).toFixed(2)} MB) must be non-empty and 5 MB or smaller.`,
        })
        e.target.value = ""
        return
      }
      setFile(selected)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files?.[0]
    if (dropped) {
      if (dropped.type !== "application/pdf") {
        toast.error("Invalid file format", {
          description: "Please upload a PDF document.",
        })
        return
      }
      if (dropped.size === 0 || dropped.size > 5 * 1024 * 1024) {
        toast.error("File size exceeded", {
          description: `Selected file (${(dropped.size / (1024 * 1024)).toFixed(2)} MB) must be non-empty and 5 MB or smaller.`,
        })
        return
      }
      setFile(dropped)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Title required", {
        description: "Please enter the question paper title.",
      })
      return
    }
    if (!file) {
      toast.error("File required", {
        description: "Please select a PDF file to upload.",
      })
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("title", title.trim())
      formData.append("category", category)
      if (subject.trim()) formData.append("subject", subject.trim())
      if (year) formData.append("year", year)
      formData.append("maxMarks", maxMarks || "100")
      formData.append("durationMinutes", durationMinutes || "180")
      if (description.trim()) formData.append("description", description.trim())
      formData.append("isPublished", String(isPublished))
      formData.append("paperFile", file)

      const res = await uploadQuestionPaperAction(formData)
      if (res.success && res.data?.paper) {
        toast.success("Question Paper Added", {
          description: `"${title}" has been successfully added to the library.`,
        })
        onSuccess(res.data.paper)
        resetForm()
        onOpenChange(false)
      } else {
        toast.error("Upload failed", {
          description: res.error || "Unable to upload question paper.",
        })
      }
    } catch (err: any) {
      toast.error("Error", {
        description:
          err?.message || "An unexpected error occurred during upload.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border-[#DCE7FA] bg-white">
        <DialogHeader className="border-b border-[#DCE7FA] pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm border border-[#BFD5FA] bg-[#F1F6FF] text-[#145DEB]">
              <UploadCloud className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-heading text-xl font-bold text-[#071B3A]">
                Upload Question Paper
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-[#64748B]">
                Add a standalone question paper accessible at
                http://localhost:3001/question-papers.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="qp-title"
              className="text-xs font-semibold text-[#071B3A]"
            >
              Question Paper Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="qp-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. CBSE Class 10 Mathematics Board Paper 2026"
              className="h-10 border-[#DCE7FA] text-sm"
              required
            />
          </div>

          {/* Category & Subject */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#071B3A]">
                Examination Stream / Category{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(val) => setCategory(val || "General")}
              >
                <SelectTrigger className="h-10 border-[#DCE7FA] text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {EXAMINATION_STREAMS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="qp-subject"
                className="text-xs font-semibold text-[#071B3A]"
              >
                Subject / Discipline
              </Label>
              <Input
                id="qp-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics, Physics, Biology, Reasoning"
                className="h-10 border-[#DCE7FA] text-sm"
              />
            </div>
          </div>

          {/* Year, Max Marks, Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label
                htmlFor="qp-year"
                className="text-xs font-semibold text-[#071B3A]"
              >
                Exam Year
              </Label>
              <Input
                id="qp-year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="2025"
                className="h-10 border-[#DCE7FA] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="qp-marks"
                className="text-xs font-semibold text-[#071B3A]"
              >
                Max Marks
              </Label>
              <Input
                id="qp-marks"
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                placeholder="100"
                className="h-10 border-[#DCE7FA] text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="qp-duration"
                className="text-xs font-semibold text-[#071B3A]"
              >
                Duration (Mins)
              </Label>
              <Input
                id="qp-duration"
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
                placeholder="180"
                className="h-10 border-[#DCE7FA] text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="qp-desc"
              className="text-xs font-semibold text-[#071B3A]"
            >
              Description / Examination Instructions (Optional)
            </Label>
            <Textarea
              id="qp-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief summary of sections, marking scheme, or syllabus topics covered..."
              rows={2}
              className="resize-none border-[#DCE7FA] text-sm"
            />
          </div>

          {/* PDF File Dropzone */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-[#071B3A]">
              Question Paper Document (PDF){" "}
              <span className="text-red-500">*</span>
            </Label>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`cursor-pointer rounded-md border-2 border-dashed p-5 text-center transition-colors ${
                isDragging
                  ? "border-[#145DEB] bg-[#F1F6FF]"
                  : file
                    ? "border-emerald-300 bg-emerald-50/40"
                    : "border-[#DCE7FA] bg-[#F1F6FF]/30 hover:border-[#BFD5FA]"
              }`}
              onClick={() =>
                document.getElementById("pdf-upload-input")?.click()
              }
            >
              <input
                id="pdf-upload-input"
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <p className="max-w-xs truncate text-sm font-bold text-slate-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB · Ready to
                      upload
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <UploadCloud className="mx-auto h-8 w-8 text-[#145DEB]" />
                  <p className="text-sm font-semibold text-[#071B3A]">
                    Click to browse or drag and drop PDF
                  </p>
                  <p className="text-xs text-[#64748B]">
                    Maximum file size: 25 MB (PDF format only)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Published Toggle */}
          <div className="flex items-center justify-between border-t border-slate-200/80 pt-3.5">
            <div>
              <p className="text-sm font-bold text-[#071B3A]">
                Publish to Public Library
              </p>
              <p className="text-xs text-[#64748B]">
                Immediately visible to students on /question-papers and
                downloads
              </p>
            </div>
            <input
              type="checkbox"
              id="qp-published"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-[#145DEB] focus:ring-[#145DEB]"
            />
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="border-[#DCE7FA]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !title.trim() || !file}
              className="bg-[#145DEB] font-semibold text-white hover:bg-[#0F4DC7]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading
                  Paper...
                </>
              ) : (
                <>
                  <UploadCloud className="mr-2 h-4 w-4" /> Upload &amp; Save
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
