"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  AlertTriangle,
  Clock,
  CreditCard,
  Loader2,
  RotateCcw,
  ShieldAlert,
} from "lucide-react"
import { adminTriggerRefundAction, AdminPaymentRow } from "@/actions/payment-actions"
import { RefundReason } from "@prisma/client"

export function AdminRefundDialog({
  payment,
}: {
  payment: AdminPaymentRow
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()

  const [open, setOpen] = React.useState(false)
  const [reason, setReason] = React.useState<RefundReason>(
    payment.within7Days
      ? RefundReason.STUDENT_REQUEST_7DAY_WINDOW
      : RefundReason.ADMIN_GOODWILL_OVERRIDE
  )
  const [adminNotes, setAdminNotes] = React.useState("")
  const [confirmForfeiture, setConfirmForfeiture] = React.useState(false)
  const [override7Day, setOverride7Day] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const isEligibleWindow = payment.within7Days
  const hasUsedAttempts = payment.attemptsUsed > 0

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminNotes.trim()) {
      showError({
        title: "Administrative Notes Required",
        message: "Please enter detailed notes explaining why this refund is being executed for audit compliance.",
        code: "NOTES_REQUIRED",
      })
      return
    }

    if (hasUsedAttempts && !confirmForfeiture) {
      showError({
        title: "Evaluation Forfeiture Unconfirmed",
        message: "You must check the acknowledgment confirming that evaluation costs are forfeited and student access will be revoked.",
        code: "FORFEITURE_UNCONFIRMED",
      })
      return
    }

    if (!isEligibleWindow && !override7Day) {
      showError({
        title: "7-Day Return Window Expired",
        message: `This payment was captured ${payment.daysElapsed} days ago. To bypass the 7-day policy limit, select 'Superadmin Policy Override'.`,
        code: "POLICY_EXPIRED",
      })
      return
    }

    const confirmed = await confirm({
      title: `Process 100% Refund (₹${payment.amountInRupees})?`,
      description: `This will immediately initiate an automated reverse transaction via Razorpay for candidate ${payment.candidateName} (${payment.candidateEmail}) and cancel test enrollment. This action is irreversible.`,
      confirmText: `Issue ₹${payment.amountInRupees} Refund`,
      cancelText: "Cancel",
      variant: "destructive",
      badgeText: "Gateway Refund Audit",
    })

    if (!confirmed) return

    setLoading(true)

    try {
      const res = await adminTriggerRefundAction({
        paymentId: payment.id,
        reason,
        adminNotes,
        confirmEvaluationForfeiture: confirmForfeiture,
        override7DayPolicy: override7Day,
      })

      if (!res.success) {
        showError({
          title: "Refund Execution Failed",
          message: res.error || "Failed to process refund with Razorpay gateway.",
          code: "REFUND_FAILED",
        })
        setLoading(false)
        return
      }

      toast.success("Refund Processed Successfully", {
        description: res.message || `₹${payment.amountInRupees} returned to student's original payment method.`,
      })

      setOpen(false)
      router.refresh()
    } catch {
      showError({
        title: "System Error",
        message: "An unexpected error occurred during refund processing.",
        code: "SYS_ERR",
      })
    } finally {
      setLoading(false)
    }
  }

  // Already refunded
  if (payment.status === "REFUNDED") {
    return (
      <Badge
        variant="outline"
        className="border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 text-[11px] font-semibold px-2 py-0.5 rounded-full"
      >
        Refunded (₹{payment.amountRefundedInRupees})
      </Badge>
    )
  }

  // Only completed payments can be refunded
  if (payment.status !== "COMPLETED") {
    return (
      <span className="text-xs text-slate-400 dark:text-slate-500 italic">
        Ineligible ({payment.status})
      </span>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-amber-200/80 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100/70 dark:hover:bg-amber-900/50 font-semibold text-xs shadow-2xs transition-colors cursor-pointer outline-none">
        <RotateCcw className="h-3.5 w-3.5 mr-1" />
        Refund
        {isEligibleWindow ? (
          <span className="ml-1 text-[10px] opacity-75">
            ({7 - payment.daysElapsed}d left)
          </span>
        ) : (
          <span className="ml-1 text-[10px] text-red-600 dark:text-red-400 font-bold">
            (Expired)
          </span>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            <CreditCard className="h-5 w-5 text-[#2A6AED]" />
            Initiate 7-Day Policy Refund
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Review candidate attempt usage, verify return policy eligibility, and execute an audited reverse transaction via Razorpay.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRefund} className="space-y-4 py-2">
          {/* Summary Box */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Candidate:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {payment.candidateName} ({payment.candidateEmail})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Enrolled Series:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[240px]">
                {payment.testSeriesTitle}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Payment Amount:</span>
              <span className="font-extrabold text-[#2A6AED] text-sm">
                ₹{payment.amountInRupees}.00
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-2">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Return Policy Status:
              </span>
              {isEligibleWindow ? (
                <Badge className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-0 text-[10px] font-bold">
                  Eligible ({payment.daysElapsed} of 7 days elapsed)
                </Badge>
              ) : (
                <Badge className="bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-0 text-[10px] font-bold">
                  Expired ({payment.daysElapsed} days elapsed)
                </Badge>
              )}
            </div>
          </div>

          {/* Attempt Warning Alert */}
          {hasUsedAttempts && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/70 dark:bg-amber-950/40 p-3.5 space-y-2 text-xs text-amber-900 dark:text-amber-300">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    Notice: Candidate has consumed {payment.attemptsUsed} evaluation attempt(s)!
                  </p>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                    Evaluator time and infrastructure have already processed handwritten answer sheets. Cancelling this registration will forfeit remaining attempts ({payment.maxAttempts - payment.attemptsUsed} left).
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={confirmForfeiture}
                  onChange={(e) => setConfirmForfeiture(e.target.checked)}
                  className="rounded text-[#2A6AED] focus:ring-[#2A6AED]"
                />
                <span className="text-[11px]">
                  I acknowledge evaluation costs are forfeited and confirm access revocation.
                </span>
              </label>
            </div>
          )}

          {/* Expired Policy Override Alert */}
          {!isEligibleWindow && (
            <div className="rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/40 p-3.5 space-y-2 text-xs text-rose-900 dark:text-rose-300">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    Policy Notice: Outside the standard 7-day return window.
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    The transaction date exceeds the standard 168-hour refund limit. A superadmin override will be registered in the immutable audit log.
                  </p>
                </div>
              </div>
              <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={override7Day}
                  onChange={(e) => setOverride7Day(e.target.checked)}
                  className="rounded text-rose-600 focus:ring-rose-500"
                />
                <span className="text-[11px]">
                  Authorize Superadmin 7-Day Return Policy Override
                </span>
              </label>
            </div>
          )}

          {/* Reason Selection */}
          <div className="space-y-1.5">
            <Label htmlFor="reason" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Refund Reason (Audit Tag)
            </Label>
            <Select
              value={reason}
              onValueChange={(val) => setReason(val as RefundReason)}
            >
              <SelectTrigger id="reason" className="h-10 text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <SelectValue placeholder="Select refund category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RefundReason.STUDENT_REQUEST_7DAY_WINDOW} className="text-xs">
                  Student Request (7-Day Return Window)
                </SelectItem>
                <SelectItem value={RefundReason.DUPLICATE_ORDER} className="text-xs">
                  Accidental Duplicate Order
                </SelectItem>
                <SelectItem value={RefundReason.TECHNICAL_SUBMISSION_ISSUE} className="text-xs">
                  Technical Submission / Platform Issue
                </SelectItem>
                <SelectItem value={RefundReason.FRAUDULENT_TRANSACTION} className="text-xs">
                  Fraudulent / Unauthorized Transaction
                </SelectItem>
                <SelectItem value={RefundReason.ADMIN_GOODWILL_OVERRIDE} className="text-xs">
                  Administrative Goodwill Exception
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Admin Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="adminNotes" className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Administrative Explanation & Verification Notes
            </Label>
            <Textarea
              id="adminNotes"
              rows={3}
              required
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="e.g. Student submitted written ticket #892 within 4 days of enrollment. Bank verification confirmed."
              className="text-xs rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              disabled={loading}
              className="h-9 px-4 rounded-xl text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Executing Refund...
                </>
              ) : (
                `Execute 100% Refund (₹${payment.amountInRupees})`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
