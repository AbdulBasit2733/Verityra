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
import { Alert, AlertDescription } from "@/components/ui/alert"
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
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGrant(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await adminGrantExtraAttemptAction(registrationId, reason)
      if (!res.success) {
        setError(res.error || "Failed to grant extra attempt.")
        setLoading(false)
        return
      }

      setLoading(false)
      setOpen(false)
      setReason("")
      router.refresh()
    } catch {
      setError("An unexpected server error occurred.")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<button type="button" className="outline-none" />}>
        <Button size="xs" variant="outline" className="border-amber-400 text-amber-700 hover:bg-amber-50 text-xs">
          <PlusCircle className="h-3 w-3 mr-1" />
          Override Attempt Limit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white border-[#D5E5F2]">
        <form onSubmit={handleGrant}>
          <DialogHeader>
            <DialogTitle className="text-base text-[#0B192C] flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-amber-600" />
              Audited Attempt Limit Override
            </DialogTitle>
            <DialogDescription className="text-xs text-[#4B6375]">
              Granting an additional attempt increases the maximum allowable submissions for{" "}
              <strong className="text-[#0B192C]">{studentName}</strong> on{" "}
              <strong className="text-[#0B192C]">{testTitle}</strong> from {currentMax} to{" "}
              {currentMax + 1}.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive" className="my-3 py-2 text-xs">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="py-4 space-y-3">
            <div>
              <Label htmlFor="auditReason" className="text-xs font-semibold text-[#0B192C]">
                Mandatory Audit Justification
              </Label>
              <Input
                id="auditReason"
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Approved re-submission due to verified scanner blur on attempt 2"
                className="mt-1 border-[#D5E5F2] text-xs h-9"
              />
              <p className="text-[10px] text-[#4B6375] mt-1">
                This reason is permanently stamped in the platform AuditLog.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              className="text-xs h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || reason.trim().length < 5}
              className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-8"
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : null}
              Authorize Extra Attempt
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
