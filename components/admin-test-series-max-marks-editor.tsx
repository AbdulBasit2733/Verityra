"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { Loader2, FileText } from "lucide-react"
import { updateTestSeriesAction } from "@/actions/test-series-actions"

export function AdminTestSeriesMaxMarksEditor({
  testSeriesId,
  initialMaxMarks,
  compact = false,
}: {
  testSeriesId: string
  initialMaxMarks: number
  compact?: boolean
}) {
  const router = useRouter()
  const { showError } = useGlobalError()
  const [editing, setEditing] = useState(false)
  const [maxMarks, setMaxMarks] = useState(String(initialMaxMarks))
  const [loading, setLoading] = useState(false)

  async function save() {
    const parsed = Number(maxMarks)
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 10000) {
      showError({
        title: "Invalid Maximum Marks",
        message: "Maximum marks must be between 1 and 10,000.",
        code: "MAX_MARKS_VALIDATION_ERR",
      })
      return
    }

    setLoading(true)
    const result = await updateTestSeriesAction(testSeriesId, { maxMarks: parsed })
    setLoading(false)
    if (!result.success) {
      showError({
        title: "Maximum Marks Update Failed",
        message: result.error || "Unable to update maximum marks.",
        code: "MAX_MARKS_UPDATE_ERR",
      })
      return
    }

    toast.success("Maximum marks updated", { description: `New total: ${parsed} marks.` })
    setEditing(false)
    router.refresh()
  }

  if (!editing) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={compact ? "h-8 rounded-lg px-2.5 text-xs" : "h-9 rounded-lg px-3 text-xs"}
        onClick={() => setEditing(true)}
      >
        <FileText className="mr-1.5 h-3.5 w-3.5" />
        Edit max marks
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <Label htmlFor={`max-marks-${testSeriesId}`} className="sr-only">Maximum marks</Label>
      <Input
        id={`max-marks-${testSeriesId}`}
        type="number"
        min={1}
        max={10000}
        value={maxMarks}
        onChange={(event) => setMaxMarks(event.target.value)}
        className="h-8 w-24 rounded-lg text-xs"
        disabled={loading}
      />
      <Button type="button" size="sm" className="h-8 rounded-lg px-2.5 text-xs" onClick={save} disabled={loading}>
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Save"}
      </Button>
      <Button type="button" size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => setEditing(false)} disabled={loading}>
        Cancel
      </Button>
    </div>
  )
}
