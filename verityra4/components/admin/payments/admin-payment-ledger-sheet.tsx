"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { FormattedDate } from "@/components/ui/date-picker"
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FileText,
  History,
  Loader2,
  Server,
  ShieldCheck,
  User,
} from "lucide-react"
import {
  getPaymentLedgerAction,
  PaymentLedgerItem,
  AdminPaymentRow,
} from "@/actions/payment-actions"

export function AdminPaymentLedgerSheet({
  payment,
  iconOnly = false,
}: {
  payment: AdminPaymentRow
  iconOnly?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [logs, setLogs] = React.useState<PaymentLedgerItem[]>([])
  const [loading, setLoading] = React.useState(false)
  const [expandedLogId, setExpandedLogId] = React.useState<string | null>(null)

  const fetchLedger = async () => {
    setLoading(true)
    try {
      const res = await getPaymentLedgerAction(payment.id)
      if (res.success && res.data) {
        setLogs(res.data.logs)
      }
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (open) {
      fetchLedger()
    }
  }, [open, payment.id])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {iconOnly ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <DialogTrigger
                  render={
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      aria-label="View payment ledger"
                      className="border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#2A6AED] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-blue-950"
                    >
                      <History className="h-3.5 w-3.5" />
                    </Button>
                  }
                />
              }
            />
            <TooltipContent>View payment ledger</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : (
        <DialogTrigger className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 shadow-2xs transition-colors outline-none hover:text-[#2A6AED] dark:border-slate-800 dark:text-slate-300 dark:hover:text-blue-400">
          <History className="mr-1 h-3.5 w-3.5" />
          Ledger
        </DialogTrigger>
      )}
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100">
            <Activity className="h-5 w-5 text-[#2A6AED]" />
            Transaction Audit Trail & Gateway Ledger
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Chronological record of gateway webhooks, capture states, and
            administrative overrides for Order #{payment.razorpayOrderId}.
          </DialogDescription>
        </DialogHeader>

        {/* Transaction Meta Card */}
        <div className="space-y-1.5 rounded-md border border-slate-200 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-950/60">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="block text-[11px] text-slate-400">
                Candidate:
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {payment.candidateName}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">Amount:</span>
              <span className="font-extrabold text-[#2A6AED]">
                ₹{payment.amountInRupees}.00 {payment.currency}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">
                Razorpay Payment ID:
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {payment.razorpayPaymentId || "None (In-Flight)"}
              </span>
            </div>
            <div>
              <span className="block text-[11px] text-slate-400">
                Bank Reference (RRN):
              </span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {payment.bankReference || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Chronological Event Timeline */}
        <div className="flex-1 space-y-3 overflow-y-auto py-2 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-xs text-slate-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Loading transaction history...
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
              No historical ledger events recorded yet.
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogId === log.id
              return (
                <div
                  key={log.id}
                  className="space-y-2 rounded-md border border-slate-200/80 bg-white p-3.5 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-blue-200 bg-blue-50 font-mono text-[10px] font-bold text-[#2A6AED] uppercase dark:border-blue-900 dark:bg-blue-950/60"
                      >
                        {log.eventType}
                      </Badge>
                      <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {log.actorType === "ADMIN_USER" ? (
                          <User className="h-3 w-3 text-purple-500" />
                        ) : log.actorType === "GATEWAY_WEBHOOK" ? (
                          <Server className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Activity className="h-3 w-3 text-slate-400" />
                        )}
                        {log.actorName}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      <FormattedDate date={log.createdAt} includeTime />
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed font-medium text-slate-700 dark:text-slate-300">
                    {log.details}
                  </p>

                  {/* Raw Payload Accordion Toggle */}
                  {log.rawPayload && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedLogId(isExpanded ? null : log.id)
                        }
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2A6AED] hover:underline"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="h-3 w-3" /> Hide Raw Gateway
                            JSON
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-3 w-3" /> View Raw
                            Gateway JSON
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 max-h-48 overflow-x-auto rounded-md border border-slate-800 bg-slate-950 p-2.5 font-mono text-[11px] leading-tight whitespace-pre-wrap text-slate-200">
                          {(() => {
                            try {
                              return JSON.stringify(
                                JSON.parse(log.rawPayload),
                                null,
                                2
                              )
                            } catch {
                              return log.rawPayload
                            }
                          })()}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
