"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/sonner"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { createTestSeriesAction } from "@/actions/test-series-actions"
import { SearchableCombobox } from "@/components/ui/searchable-combobox"
import { MasterItem } from "@/lib/mock-masters"
import {
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
} from "lucide-react"

interface AdminCreateTestSeriesBundleFormProps {
  availableStandards: MasterItem[]
  availableBoards: MasterItem[]
}

const BATCH_YEARS = [
  "2025 Batch",
  "2026 Batch",
  "2024-2025",
  "2025-2026",
  "Target 2025",
  "Target 2026",
]

const QUICK_BADGES = [
  "All-Subjects Package",
  "Complete Syllabus",
  "Board Exam Prep",
  "40% Savings Bundle",
  "Bestseller",
]

export function AdminCreateTestSeriesBundleForm({
  availableStandards,
  availableBoards,
}: AdminCreateTestSeriesBundleFormProps) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()

  const [loading, setLoading] = React.useState(false)

  // Form State
  const [title, setTitle] = React.useState("")
  const [academicYear, setAcademicYear] = React.useState("2025 Batch")
  const [standard, setStandard] = React.useState("Class 10th")
  const [stream, setStream] = React.useState("CBSE Board")
  const [type, setType] = React.useState<"BUNDLE" | "SINGLE_TEST">("BUNDLE")
  const [bundlePrice, setBundlePrice] = React.useState("299")
  const [badge, setBadge] = React.useState("All-Subjects Package")
  const [description, setDescription] = React.useState("")
  const [startDate, setStartDate] = React.useState("")
  const [endDate, setEndDate] = React.useState("")
  const [isPublished, setIsPublished] = React.useState(true)

  // Auto-suggest title when standard and stream are selected
  React.useEffect(() => {
    if (standard && stream && !title) {
      setTitle(`${standard} ${stream} Comprehensive Board Mock Series`)
    }
  }, [standard, stream, title])

  const standardOptions = React.useMemo(
    () =>
      availableStandards.map((s) => ({
        value: s.name,
        label: s.name,
        hint: s.description || (s.code ? `Code: ${s.code}` : undefined),
      })),
    [availableStandards]
  )

  const boardOptions = React.useMemo(
    () =>
      availableBoards.map((b) => ({
        value: b.name,
        label: b.name,
        hint: b.description || (b.code ? `Code: ${b.code}` : undefined),
      })),
    [availableBoards]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error("Test series bundle title is required.")
      return
    }

    if (!standard) {
      toast.error("Please select a target standard / class from the master dropdown.")
      return
    }

    if (!stream) {
      toast.error("Please select an examination board from the master dropdown.")
      return
    }

    const confirmed = await confirm({
      title: "Create Test Series Master?",
      description: `Create "${title.trim()}" for ${standard} (${stream}) ${academicYear}. Each batch bundle can only be created once. Individual subject tests (e.g. Mathematics, Science) can be linked after creation.`,
      confirmText: "Create Series Bundle",
      cancelText: "Review Details",
      badgeText: "Academic Bundle Master",
    })
    if (!confirmed) return

    setLoading(true)
    try {
      const res = await createTestSeriesAction({
        title: title.trim(),
        description: description.trim(),
        academicYear,
        standard,
        stream,
        type,
        bundlePrice: bundlePrice ? parseFloat(bundlePrice) : 0,
        price: bundlePrice ? parseFloat(bundlePrice) : 0,
        badge: badge.trim() || undefined,
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        status: isPublished ? ("PUBLISHED" as any) : ("DRAFT" as any),
      })

      if (!res.success || !res.data?.id) {
        throw new Error(res.error || "Failed to create test series.")
      }

      toast.success("Test series created successfully!", {
        description: "You can now add subject tests from the Subject Tests screen.",
      })
      router.push(`/admin/test-series/${res.data.id}`)
      router.refresh()
    } catch (err: any) {
      showError({
        title: "Creation Blocked",
        message: err?.message || "An unexpected error occurred while creating the test series.",
        code: "TEST_SERIES_CREATE_ERROR",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enterprise Non-Card Layout: Clean 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Academic Hierarchy & Master Classification (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" /> Master Classification
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Select from verified academic masters. Can only be created once per batch.
              </p>
            </div>

            {/* Standard / Class Selector using SearchableCombobox */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Standard / Class Master *
              </Label>
              <SearchableCombobox
                options={standardOptions}
                value={standard}
                onValueChange={setStandard}
                placeholder="Search standard (e.g. Class 10th)..."
                searchPlaceholder="Search Class 10th, 12th, NEET, JEE..."
              />
              <p className="text-[11px] text-muted-foreground">
                Target grade level for this bundle.
              </p>
            </div>

            {/* Board / Stream Selector using SearchableCombobox */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Examination Board / Stream *
              </Label>
              <SearchableCombobox
                options={boardOptions}
                value={stream}
                onValueChange={setStream}
                placeholder="Search board (e.g. CBSE Board)..."
                searchPlaceholder="Search CBSE, ICSE, State Board..."
              />
              <p className="text-[11px] text-muted-foreground">
                Affiliated board syllabus or competitive stream.
              </p>
            </div>

            {/* Academic Batch / Year Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground">
                Academic Batch / Year *
              </Label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="e.g. 2025 Batch"
                className="h-9 text-xs"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {BATCH_YEARS.map((y) => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => setAcademicYear(y)}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>

            {/* Batch Uniqueness Notice */}
            <div className="rounded-md border border-border/60 bg-muted/30 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <AlertCircle className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>One-Time Batch Creation</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                This entity serves as the root container. Individual tests for Mathematics,
                Science, etc., will be created from the Subject Tests screen and attached here.
              </p>
            </div>
          </div>

          {/* Pricing & Promotional Badge */}
          <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-primary" /> Bundle Pricing & Badging
              </h3>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bundle-price" className="text-xs font-semibold text-foreground">
                Bundle Package Offer Price (INR ₹) *
              </Label>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-muted-foreground">₹</span>
                <Input
                  id="bundle-price"
                  type="number"
                  min={0}
                  value={bundlePrice}
                  onChange={(e) => setBundlePrice(e.target.value)}
                  className="h-9 text-xs w-36"
                />
                <span className="text-[11px] text-muted-foreground">
                  (0 = Free bundle enrollment)
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Special combined discount price for all subjects in this bundle.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="badge" className="text-xs font-semibold text-foreground">
                Promotional Badge
              </Label>
              <Input
                id="badge"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. All-Subjects Package, Complete Syllabus"
                className="h-9 text-xs"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_BADGES.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBadge(b)}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-border hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Series Header Details & Schedule (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-lg border border-border/80 bg-card p-5 space-y-4">
            <div className="border-b border-border/60 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-primary" /> Series Container Overview
              </h3>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-bold text-foreground">
                Test Series Bundle Title *
              </Label>
              <Input
                id="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Class 10th CBSE Comprehensive Board Mock Series"
                className="h-9 text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold text-foreground">
                Curriculum Scope & Syllabus Overview
              </Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the target curriculum, examination schedule, paper distribution across subjects, and evaluation timelines..."
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="startDate" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Schedule Start (Optional)
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="endDate" className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" /> Schedule End (Optional)
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/60">
              <div>
                <Label htmlFor="publish-toggle" className="text-xs font-bold text-foreground cursor-pointer">
                  Publish to Catalog
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  When enabled, candidates can immediately view and enroll in this bundle package.
                </p>
              </div>
              <input
                id="publish-toggle"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
              />
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
            <Link href="/admin/test-series">
              <Button type="button" variant="outline" size="sm" className="h-9 text-xs font-semibold">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={loading}
              size="sm"
              className="h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Creating Series...
                </>
              ) : (
                <>
                  <BookOpen className="mr-1.5 h-3.5 w-3.5" />
                  Create Test Series Master
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
