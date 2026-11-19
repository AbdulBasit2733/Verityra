"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { Loader2, PlusCircle, ShieldAlert } from "lucide-react"
import { adminGrantExtraAttemptAction } from "@/actions/evaluation-actions"

export function AdminExtraAttemptDialog({
  registrationId,
  studentName,
  testTitle,
  currentMax,
}: {
  registrationId: string
  studentName: string
  testTitle: string
  currentMax: number
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault()
    if (!reason.trim()) return

    const confirmed = await confirm({
      title: `Confirm Attempt Override for ${studentName}?`,
      description: `This will increase maximum allowed attempts from ${currentMax} to ${
        currentMax + 1
      } on "${testTitle}" and record "${reason.trim()}" in the permanent audit log.`,
      confirmText: "Grant Extra Attempt",
      cancelText: "Cancel",
      variant: "warning",
      badgeText: "3-Attempt Invariant Override",
    })
    if (!confirmed) return

    setLoading(true)

    try {
      const res = await adminGrantExtraAttemptAction(registrationId, reason)
      if (!res.success) {
        showError({
          title: "Attempt Override Failed",
          message: res.error || "Failed to grant extra attempt.",
          code: "OVERRIDE_ERR",
        })
        setLoading(false)
        return
      }

      toast.success("Audited extra attempt granted", {
        description: `${studentName} now has ${currentMax + 1} allowable attempts for ${testTitle}.`,
      })
      setLoading(false)
      setOpen(false)
      setReason("")
      router.refresh()
    } catch {
      showError({
        title: "Unexpected Server Error",
        message:
          "An unexpected server error occurred while granting the attempt override.",
        code: "SYS_ERR",
      })
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-amber-300 bg-white px-3 text-xs font-semibold text-amber-800 transition-colors outline-none hover:bg-amber-50">
        <PlusCircle className="mr-1 h-3.5 w-3.5" />
        Override Limit
      </DialogTrigger>
      <DialogContent className="rounded-md border-slate-200 bg-white p-6 shadow-sm sm:max-w-md">
        <form onSubmit={handleGrant}>
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#0F172A]">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Audited Attempt Limit Override
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-[#64748B] sm:text-sm">
              Granting an additional attempt increases the maximum allowable
              submissions for{" "}
              <strong className="text-[#0F172A]">{studentName}</strong> on{" "}
              <strong className="text-[#0F172A]">{testTitle}</strong> from{" "}
              {currentMax} to {currentMax + 1}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-5">
            <Label
              htmlFor="auditReason"
              className="text-xs font-bold text-[#0F172A]"
            >
              Mandatory Audit Justification
            </Label>
            <Input
              id="auditReason"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Approved re-submission due to verified scanner blur on attempt 2"
              className="h-10 rounded-md border-slate-200 bg-white text-xs sm:text-sm"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-9 rounded-md border-slate-200 px-4 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || !reason.trim()}
              className="h-9 rounded-md bg-amber-600 px-4 font-semibold text-white hover:bg-amber-700"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Confirm & Grant Override
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
