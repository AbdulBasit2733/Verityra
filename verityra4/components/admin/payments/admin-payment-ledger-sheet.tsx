"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
import { getPaymentLedgerAction, PaymentLedgerItem, AdminPaymentRow } from "@/actions/payment-actions"

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
                    <Button type="button" size="icon" variant="outline" aria-label="View payment ledger" className="border-slate-200 text-slate-600 hover:border-blue-200 hover:bg-blue-50 hover:text-[#2A6AED] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-blue-950">
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
        <DialogTrigger className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#2A6AED] dark:hover:text-blue-400 font-semibold text-xs shadow-2xs transition-colors cursor-pointer outline-none">
          <History className="h-3.5 w-3.5 mr-1" />
          Ledger
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
            <Activity className="h-5 w-5 text-[#2A6AED]" />
            Transaction Audit Trail & Gateway Ledger
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Chronological record of gateway webhooks, capture states, and administrative overrides for Order #{payment.razorpayOrderId}.
          </DialogDescription>
        </DialogHeader>

        {/* Transaction Meta Card */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 space-y-1.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-slate-400 text-[11px] block">Candidate:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {payment.candidateName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Amount:</span>
              <span className="font-extrabold text-[#2A6AED]">
                ₹{payment.amountInRupees}.00 {payment.currency}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Razorpay Payment ID:</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {payment.razorpayPaymentId || "None (In-Flight)"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Bank Reference (RRN):</span>
              <span className="font-mono text-slate-700 dark:text-slate-300">
                {payment.bankReference || "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Chronological Event Timeline */}
        <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading transaction history...
            </div>
          ) : logs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center text-xs text-slate-400">
              No historical ledger events recorded yet.
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogId === log.id
              return (
                <div
                  key={log.id}
                  className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="font-mono text-[10px] uppercase font-bold border-blue-200 dark:border-blue-900 text-[#2A6AED] bg-blue-50 dark:bg-blue-950/60"
                      >
                        {log.eventType}
                      </Badge>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1">
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

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {log.details}
                  </p>

                  {/* Raw Payload Accordion Toggle */}
                  {log.rawPayload && (
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2A6AED] hover:underline"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronDown className="h-3 w-3" /> Hide Raw Gateway JSON
                          </>
                        ) : (
                          <>
                            <ChevronRight className="h-3 w-3" /> View Raw Gateway JSON
                          </>
                        )}
                      </button>

                      {isExpanded && (
                        <pre className="mt-2 p-2.5 rounded-lg bg-slate-950 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-48 whitespace-pre-wrap leading-tight border border-slate-800">
                          {(() => {
                            try {
                              return JSON.stringify(JSON.parse(log.rawPayload), null, 2)
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
