"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import Link from "next/link"
import { toast } from "@/components/ui/sonner"
import {
  createSubjectTestAction,
  updateSubjectTestAction,
  deleteSubjectTestAction,
  togglePublishSubjectTestAction,
  assignSubjectTestToSeriesAction,
  unassignSubjectTestFromSeriesAction,
  getAvailableTestsForAssignmentAction,
  CreateSubjectTestInput,
} from "@/actions/test-series-actions"
import {
  BookOpen,
  CheckCircle2,
  Edit2,
  FileText,
  Globe,
  Loader2,
  Plus,
  Trash2,
  EyeOff,
  Clock,
  Award,
  Unlink,
  Link as LinkIcon,
} from "lucide-react"

export interface AdminSubjectTestItem {
  id: string
  title: string
  slug: string
  subject: string
  description?: string | null
  price: number // in paise
  isStandalone: boolean
  maxMarks: number
  durationMinutes: number
  maxAttempts: number
  questionPaperUrl?: string | null
  answerSheetUrl?: string | null
  modelAnswerUrl?: string | null
  studentInstructions?: string | null
  privateEvaluationInstructions?: string | null
  order: number
  status: string
  isPublished: boolean
  _count?: {
    submissions: number
    registrations: number
  }
}

const COMMON_SUBJECTS = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Social Science",
  "English",
  "General Studies",
]

export function AdminSubjectTestsManager({
  testSeriesId,
  tests = [],
}: {
  testSeriesId: string
  tests: AdminSubjectTestItem[]
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()

  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [editingTest, setEditingTest] = React.useState<AdminSubjectTestItem | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [actionLoadingId, setActionLoadingId] = React.useState<string | null>(null)

  // Assign Existing Test state
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false)
  const [availableTests, setAvailableTests] = React.useState<
    Array<{
      id: string
      title: string
      subject: string
      maxMarks: number
      durationMinutes: number
      currentSeriesTitle?: string | null
    }>
  >([])
  const [loadingAvailable, setLoadingAvailable] = React.useState(false)
  const [selectedAssignId, setSelectedAssignId] = React.useState<string>("")
  const [assigningLoading, setAssigningLoading] = React.useState(false)

  // Form state
  const [subject, setSubject] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [priceInInr, setPriceInInr] = React.useState(99)
  const [isStandalone, setIsStandalone] = React.useState(true)
  const [maxMarks, setMaxMarks] = React.useState(100)
  const [durationMinutes, setDurationMinutes] = React.useState(180)
  const [maxAttempts, setMaxAttempts] = React.useState(3)
  const [questionPaperUrl, setQuestionPaperUrl] = React.useState("")
  const [studentInstructions, setStudentInstructions] = React.useState("")

  const openCreateDialog = () => {
    setEditingTest(null)
    setSubject("")
    setTitle("")
    setDescription("")
    setPriceInInr(99)
    setIsStandalone(true)
    setMaxMarks(100)
    setDurationMinutes(180)
    setMaxAttempts(3)
    setQuestionPaperUrl("")
    setStudentInstructions("")
    setDialogOpen(true)
  }

  const openEditDialog = (test: AdminSubjectTestItem) => {
    setEditingTest(test)
    setSubject(test.subject)
    setTitle(test.title)
    setDescription(test.description || "")
    setPriceInInr(Math.round(test.price / 100))
    setIsStandalone(test.isStandalone)
    setMaxMarks(test.maxMarks)
    setDurationMinutes(test.durationMinutes)
    setMaxAttempts(test.maxAttempts)
    setQuestionPaperUrl(test.questionPaperUrl || "")
    setStudentInstructions(test.studentInstructions || "")
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !title.trim()) {
      toast.error("Subject and Test Title are required.")
      return
    }

    setIsSubmitting(true)
    try {
      if (editingTest) {
        const res = await updateSubjectTestAction(editingTest.id, {
          title,
          subject,
          description,
          price: isStandalone ? priceInInr : 0,
          isStandalone,
          maxMarks,
          durationMinutes,
          maxAttempts,
          questionPaperUrl: questionPaperUrl.trim() || undefined,
          studentInstructions: studentInstructions.trim() || undefined,
        })
        if (!res.success) throw new Error(res.error)
        toast.success("Subject test updated successfully")
      } else {
        const res = await createSubjectTestAction({
          testSeriesId,
          title,
          subject,
          description,
          price: isStandalone ? priceInInr : 0,
          isStandalone,
          maxMarks,
          durationMinutes,
          maxAttempts,
          questionPaperUrl: questionPaperUrl.trim() || undefined,
          studentInstructions: studentInstructions.trim() || undefined,
          isPublished: true,
        })
        if (!res.success) throw new Error(res.error)
        toast.success("Subject test created and added to bundle")
      }
      setDialogOpen(false)
      router.refresh()
    } catch (err: any) {
      showError({
        title: "Could not save subject test",
        message: err?.message || "An unexpected error occurred.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTogglePublish = async (test: AdminSubjectTestItem) => {
    const nextState = !test.isPublished
    setActionLoadingId(test.id)
    try {
      const res = await togglePublishSubjectTestAction(test.id, nextState)
      if (!res.success) throw new Error(res.error)
      toast.success(nextState ? "Subject test published" : "Subject test unpublished")
      router.refresh()
    } catch (err: any) {
      showError({
        title: "Could not toggle visibility",
        message: err?.message || "Failed to update publish state.",
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleDelete = async (test: AdminSubjectTestItem) => {
    const confirmed = await confirm({
      title: `Delete "${test.title}"?`,
      description: `Are you sure you want to delete the ${test.subject} test? This action cannot be undone.`,
      confirmText: "Delete Subject Test",
      cancelText: "Cancel",
      variant: "destructive",
      badgeText: "Permanent Deletion",
    })
    if (!confirmed) return

    setActionLoadingId(test.id)
    try {
      const res = await deleteSubjectTestAction(test.id)
      if (res.success) {
        toast.success("Subject test removed")
        router.refresh()
      } else if (res.data?.requiresForce) {
        const forceConfirmed = await confirm({
          title: "Force Delete Subject Test?",
          description: `⚠️ WARNING: ${res.error}\n\nAre you sure you want to FORCE delete this test along with all student submissions?`,
          confirmText: "Yes, Force Delete",
          cancelText: "Cancel",
          variant: "destructive",
          badgeText: "High Risk",
        })

        if (forceConfirmed) {
          const forceRes = await deleteSubjectTestAction(test.id, { force: true })
          if (forceRes.success) {
            toast.success("Subject test force deleted")
            router.refresh()
          } else {
            showError({
              title: "Cannot delete test",
              message: forceRes.error || "Failed to force delete test.",
            })
          }
        }
      } else {
        showError({
          title: "Cannot delete test",
          message: res.error || "Failed to delete test.",
        })
      }
    } catch (err: any) {
      showError({
        title: "Cannot delete test",
        message: err?.message || "Failed to delete test.",
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleUnassign = async (test: AdminSubjectTestItem) => {
    const confirmed = await confirm({
      title: `Remove "${test.title}" from Series?`,
      description: `This subject test will be detached from this bundle and converted into an independent standalone test. All questions, student submissions, and registrations will be preserved.`,
      confirmText: "Remove from Series",
      cancelText: "Cancel",
      badgeText: "Unassign Test",
    })
    if (!confirmed) return

    setActionLoadingId(test.id)
    try {
      const res = await unassignSubjectTestFromSeriesAction(test.id)
      if (res.success) {
        toast.success(res.message || "Subject test removed from series.")
        router.refresh()
      } else {
        showError({
          title: "Failed to Unassign",
          message: res.error || "Unable to remove test from series.",
        })
      }
    } catch (err: any) {
      showError({
        title: "Failed to Unassign",
        message: err?.message || "An unexpected error occurred.",
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleOpenAssignDialog = async () => {
    setAssignDialogOpen(true)
    setLoadingAvailable(true)
    try {
      const res = await getAvailableTestsForAssignmentAction(testSeriesId)
      if (res.success && res.data) {
        setAvailableTests(res.data.tests)
      }
    } catch {
      // fallback
    } finally {
      setLoadingAvailable(false)
    }
  }

  const handleConfirmAssign = async () => {
    if (!selectedAssignId) {
      toast.error("Please select a test to assign.")
      return
    }
    setAssigningLoading(true)
    try {
      const res = await assignSubjectTestToSeriesAction(selectedAssignId, testSeriesId)
      if (res.success) {
        toast.success(res.message || "Test assigned to series successfully.")
        setAssignDialogOpen(false)
        setSelectedAssignId("")
        router.refresh()
      } else {
        showError({
          title: "Assignment Failed",
          message: res.error || "Unable to assign test to this series.",
        })
      }
    } catch (err: any) {
      showError({
        title: "Assignment Failed",
        message: err?.message || "An unexpected error occurred.",
      })
    } finally {
      setAssigningLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Subject Tests in this Series ({tests.length})
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Add or assign subject tests (e.g. Mathematics, Science) that students can access via this bundle package.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleOpenAssignDialog}
            className="h-9 gap-1.5 text-xs font-semibold"
          >
            <LinkIcon className="h-3.5 w-3.5 text-primary" /> Assign Existing Test
          </Button>
          <Link href={`/admin/tests/new?seriesId=${testSeriesId}`}>
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5 bg-[#2A6AED] hover:bg-[#2055c0] text-xs font-semibold text-white shadow-sm"
            >
              <Plus className="h-4 w-4" /> Add Subject Test
            </Button>
          </Link>
        </div>
      </div>

      {tests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-slate-50/50 dark:bg-slate-900/30">
          <BookOpen className="h-10 w-10 text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No subject tests added yet
          </p>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            Build your bundle by adding individual subject tests. Students will be able to buy them individually or purchase the complete package.
          </p>
          <Button
            type="button"
            onClick={openCreateDialog}
            variant="outline"
            size="sm"
            className="mt-4 text-xs font-semibold"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Add First Subject Test
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {tests.map((test) => {
            const isLoading = actionLoadingId === test.id
            const priceInRupees = Math.round(test.price / 100)

            return (
              <div
                key={test.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:border-slate-300 transition-colors"
              >
                <div className="space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800 text-[11px] font-bold"
                    >
                      {test.subject}
                    </Badge>
                    <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {test.title}
                    </span>
                    {test.isPublished ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-[10px]">
                        Live
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-slate-500">
                        Draft
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Award className="h-3 w-3 text-slate-400" />
                      {test.maxMarks} Marks
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-400" />
                      {test.durationMinutes} Mins
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {test.isStandalone ? (
                        priceInRupees === 0 ? (
                          <span className="text-emerald-600 font-bold">Free Standalone</span>
                        ) : (
                          <span className="text-blue-600 font-bold">₹{priceInRupees} Standalone</span>
                        )
                      ) : (
                        <span className="text-slate-400">Bundle Only</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleTogglePublish(test)}
                    className="h-8 px-2 text-xs"
                    title={test.isPublished ? "Unpublish Test" : "Publish Test"}
                  >
                    {test.isPublished ? (
                      <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                    ) : (
                      <Globe className="h-3.5 w-3.5 text-emerald-600" />
                    )}
                  </Button>
                  <Link href={`/admin/tests/${test.id}`}>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-medium"
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleUnassign(test)}
                    className="h-8 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                    title="Remove from series (Keep as Standalone Test)"
                  >
                    <Unlink className="h-3.5 w-3.5 mr-1" /> Remove
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isLoading}
                    onClick={() => handleDelete(test)}
                    className="h-8 px-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                    title="Delete Subject Test"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTest ? "Edit Subject Test" : "Add Subject Test to Bundle"}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Define the subject parameters, standalone pricing, and exam timing for this paper.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Subject Name *
              </Label>
              <Input
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Mathematics, Science, Social Science"
                className="h-9 text-xs"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_SUBJECTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSubject(s)}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Test Title *
              </Label>
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Mathematics - Term 2 Full Mock 1"
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Short Description / Syllabus Scope
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Algebra, Trigonometry, and Geometry chapters covered..."
                rows={2}
                className="text-xs"
              />
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Standalone Purchase
                  </Label>
                  <p className="text-[11px] text-slate-500">
                    Allow students to buy only this subject test without buying the full bundle.
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="standalone-toggle"
                  checked={isStandalone}
                  onChange={(e) => setIsStandalone(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {isStandalone && (
                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Individual Test Price (INR ₹)
                  </Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">₹</span>
                    <Input
                      type="number"
                      min={0}
                      step={1}
                      value={priceInInr}
                      onChange={(e) => setPriceInInr(Number(e.target.value))}
                      className="h-9 text-xs w-32"
                    />
                    <span className="text-[11px] text-slate-500">
                      (0 = Free for all students)
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Max Marks
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={1000}
                  value={maxMarks}
                  onChange={(e) => setMaxMarks(Number(e.target.value))}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Duration (Mins)
                </Label>
                <Input
                  type="number"
                  min={10}
                  max={600}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Max Attempts
                </Label>
                <Input
                  type="number"
                  min={1}
                  max={3}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Question Paper URL (Optional)
              </Label>
              <Input
                value={questionPaperUrl}
                onChange={(e) => setQuestionPaperUrl(e.target.value)}
                placeholder="https://... or upload in documents tab"
                className="h-9 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting}
                className="bg-[#2A6AED] hover:bg-[#2055c0] text-xs font-semibold text-white"
              >
                {isSubmitting && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                {editingTest ? "Update Subject Test" : "Add to Bundle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Existing Test Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
              <LinkIcon className="h-4 w-4 text-primary" /> Assign Existing Test to Series
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select any existing subject test to attach into this test series bundle.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 space-y-3">
            {loadingAvailable ? (
              <div className="py-8 flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span>Loading available tests...</span>
              </div>
            ) : availableTests.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground border border-dashed rounded-md p-4">
                No unassigned tests available to attach. Create a new test using the &quot;Add Subject Test&quot; button.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {availableTests.map((t) => (
                  <label
                    key={t.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors ${
                      selectedAssignId === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="assignTest"
                      value={t.id}
                      checked={selectedAssignId === t.id}
                      onChange={() => setSelectedAssignId(t.id)}
                      className="mt-0.5 text-primary focus:ring-primary h-4 w-4"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-bold">
                          {t.subject}
                        </Badge>
                        <span className="text-xs font-semibold text-foreground truncate">
                          {t.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span>{t.maxMarks} Marks</span>
                        <span>•</span>
                        <span>{t.durationMinutes} Mins</span>
                        {t.currentSeriesTitle && (
                          <>
                            <span>•</span>
                            <span className="text-amber-600 font-medium truncate">
                              Currently in: {t.currentSeriesTitle}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setAssignDialogOpen(false)
                setSelectedAssignId("")
              }}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!selectedAssignId || assigningLoading}
              onClick={handleConfirmAssign}
              className="text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {assigningLoading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign to Series"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
