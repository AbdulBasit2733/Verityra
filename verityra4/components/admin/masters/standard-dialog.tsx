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
import { createStandardAction, updateStandardAction } from "@/actions/master-actions"

interface StandardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  standard?: MasterItem | null
  onSuccess: (standard: MasterItem) => void
}

export function StandardDialog({ open, onOpenChange, standard, onSuccess }: StandardDialogProps) {
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [order, setOrder] = React.useState("10")
  const [description, setDescription] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (standard) {
      setName(standard.name)
      setCode(standard.code || "")
      setOrder(String(standard.order ?? 10))
      setDescription(standard.description || "")
      setIsActive(standard.isActive)
    } else {
      setName("")
      setCode("")
      setOrder("10")
      setDescription("")
      setIsActive(true)
    }
  }, [standard, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Standard / Class name is required.")
      return
    }

    setLoading(true)
    try {
      const res = standard
        ? await updateStandardAction(standard.id, {
            name: name.trim(),
            code: code.trim() || undefined,
            order: parseInt(order, 10) || 0,
            description: description.trim() || undefined,
            isActive,
          })
        : await createStandardAction({
            name: name.trim(),
            code: code.trim() || undefined,
            order: parseInt(order, 10) || 0,
            description: description.trim() || undefined,
            isActive,
          })

      if (!res.success || !res.data?.standard) {
        throw new Error(res.error || "Failed to save standard.")
      }

      toast.success(res.message || "Standard saved successfully.")
      onSuccess(res.data.standard)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving standard.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            {standard ? "Edit Standard / Class" : "Add New Standard / Class"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="std-name" className="text-xs font-semibold">
              Standard / Class Name *
            </Label>
            <Input
              id="std-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Class 10th, Class 12th, NEET-UG"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="std-code" className="text-xs font-semibold">
                Short Code (Optional)
              </Label>
              <Input
                id="std-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. 10th, NEET"
                className="h-9 text-xs uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="std-order" className="text-xs font-semibold">
                Sort Sequence
              </Label>
              <Input
                id="std-order"
                type="number"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                placeholder="e.g. 10"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="std-desc" className="text-xs font-semibold">
              Description (Optional)
            </Label>
            <Textarea
              id="std-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Academic level notes..."
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <Label htmlFor="std-active" className="text-xs font-semibold cursor-pointer">
                Active Status
              </Label>
              <p className="text-[11px] text-muted-foreground">Available for test series</p>
            </div>
            <input
              id="std-active"
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
              {standard ? "Save Changes" : "Create Standard"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
