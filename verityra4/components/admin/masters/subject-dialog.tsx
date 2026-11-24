"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { toast } from "@/components/ui/sonner"
import { MasterItem } from "@/lib/mock-masters"
import { createSubjectAction, updateSubjectAction } from "@/actions/master-actions"

interface SubjectDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject?: MasterItem | null
  onSuccess: (subject: MasterItem) => void
}

export function SubjectDialog({ open, onOpenChange, subject, onSuccess }: SubjectDialogProps) {
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (subject) {
      setName(subject.name)
      setCode(subject.code || "")
      setDescription(subject.description || "")
      setIsActive(subject.isActive)
    } else {
      setName("")
      setCode("")
      setDescription("")
      setIsActive(true)
    }
  }, [subject, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Subject name is required.")
      return
    }

    setLoading(true)
    try {
      const res = subject
        ? await updateSubjectAction(subject.id, {
            name: name.trim(),
            code: code.trim() || undefined,
            description: description.trim() || undefined,
            isActive,
          })
        : await createSubjectAction({
            name: name.trim(),
            code: code.trim() || undefined,
            description: description.trim() || undefined,
            isActive,
          })

      if (!res.success || !res.data?.subject) {
        throw new Error(res.error || "Failed to save subject.")
      }

      toast.success(res.message || "Subject saved successfully.")
      onSuccess(res.data.subject)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving subject.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            {subject ? "Edit Subject Master" : "Add New Subject"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="sub-name" className="text-xs font-semibold">
              Subject Name *
            </Label>
            <Input
              id="sub-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics, Science, Social Science"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sub-code" className="text-xs font-semibold">
              Subject Code (Optional)
            </Label>
            <Input
              id="sub-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. MATH, SCI, SST"
              className="h-9 text-xs uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sub-desc" className="text-xs font-semibold">
              Description / Curriculum Scope (Optional)
            </Label>
            <Textarea
              id="sub-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Syllabus topics, branches, or sectional notes..."
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <Label htmlFor="sub-active" className="text-xs font-semibold cursor-pointer">
                Active Status
              </Label>
              <p className="text-[11px] text-muted-foreground">Available for test creation</p>
            </div>
            <input
              id="sub-active"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              size="sm"
              className="h-9 bg-primary text-primary-foreground text-xs font-semibold"
            >
              {loading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {subject ? "Save Changes" : "Create Subject"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
