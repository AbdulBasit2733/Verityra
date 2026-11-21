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
import { createBoardAction, updateBoardAction } from "@/actions/master-actions"

interface BoardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  board?: MasterItem | null
  onSuccess: (board: MasterItem) => void
}

export function BoardDialog({ open, onOpenChange, board, onSuccess }: BoardDialogProps) {
  const [name, setName] = React.useState("")
  const [code, setCode] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isActive, setIsActive] = React.useState(true)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (board) {
      setName(board.name)
      setCode(board.code || "")
      setDescription(board.description || "")
      setIsActive(board.isActive)
    } else {
      setName("")
      setCode("")
      setDescription("")
      setIsActive(true)
    }
  }, [board, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error("Board name is required.")
      return
    }

    setLoading(true)
    try {
      const res = board
        ? await updateBoardAction(board.id, {
            name: name.trim(),
            code: code.trim() || undefined,
            description: description.trim() || undefined,
            isActive,
          })
        : await createBoardAction({
            name: name.trim(),
            code: code.trim() || undefined,
            description: description.trim() || undefined,
            isActive,
          })

      if (!res.success || !res.data?.board) {
        throw new Error(res.error || "Failed to save board.")
      }

      toast.success(res.message || "Board saved successfully.")
      onSuccess(res.data.board)
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving board.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-foreground">
            {board ? "Edit Board / Stream" : "Add New Board / Stream"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="brd-name" className="text-xs font-semibold">
              Board / Stream Name *
            </Label>
            <Input
              id="brd-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. CBSE Board, ICSE, Maharashtra State Board"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brd-code" className="text-xs font-semibold">
              Board Code (Optional)
            </Label>
            <Input
              id="brd-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. CBSE, ICSE, MSBSHSE"
              className="h-9 text-xs uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="brd-desc" className="text-xs font-semibold">
              Description (Optional)
            </Label>
            <Textarea
              id="brd-desc"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Full authority name or notes..."
              className="text-xs"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div>
              <Label htmlFor="brd-active" className="text-xs font-semibold cursor-pointer">
                Active Status
              </Label>
              <p className="text-[11px] text-muted-foreground">Available for test series</p>
            </div>
            <input
              id="brd-active"
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
              {board ? "Save Changes" : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
