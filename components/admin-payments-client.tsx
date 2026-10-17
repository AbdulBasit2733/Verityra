"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { AdminRefundDialog } from "@/components/admin-refund-dialog"
import { AdminPaymentLedgerSheet } from "@/components/admin-payment-ledger-sheet"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  FileCheck2,
  History,
  Loader2,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import {
  AdminPaymentRow,
  reconcilePendingPaymentsAction,
} from "@/actions/payment-actions"

export function AdminPaymentsClient({
  initialPayments,
}: {
  initialPayments: AdminPaymentRow[]
}) {
  const { showError } = useGlobalError()
  const [payments, setPayments] = React.useState<AdminPaymentRow[]>(initialPayments)
  const [reconciling, setReconciling] = React.useState(false)

  // Compute KPI Metrics
  const totalRevenuePaise = payments
    .filter((p) => p.status === "COMPLETED" || p.status === "REFUNDED")
    .reduce((acc, p) => acc + p.amount, 0)
  const totalRevenue = Math.round(totalRevenuePaise / 100)

  const capturedCount = payments.filter((p) => p.status === "COMPLETED").length

  const within7DaysCount = payments.filter(
    (p) => p.status === "COMPLETED" && p.within7Days
  ).length

  const totalRefundedPaise = payments
    .filter((p) => p.status === "REFUNDED")
    .reduce((acc, p) => acc + (p.amountRefunded || p.amount), 0)
  const totalRefunded = Math.round(totalRefundedPaise / 100)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success("Copied to clipboard", {
      description: `${label}: ${text}`,
    })
  }

  const handleReconcile = async () => {
    setReconciling(true)
    try {
      const res = await reconcilePendingPaymentsAction()
      if (res.success && res.data) {
        toast.success("Reconciliation Completed", {
          description: res.data.message,
        })
      } else {
        showError({
          title: "Reconciliation Failed",
          message: res.error || "Unable to synchronize with Razorpay API.",
          code: "RECONCILE_ERR",
        })
      }
    } catch {
      showError({
        title: "Network Error",
        message: "Failed to connect to reconciliation service.",
        code: "NET_ERR",
      })
    } finally {
      setReconciling(false)
    }
  }

  const columns: DataTableColumn<AdminPaymentRow>[] = [
    {
      id: "candidate",
      header: "Candidate",
      sortable: true,
      sortAccessor: (p) => p.candidateName,
      searchAccessor: (p) =>
        `${p.candidateName} ${p.candidateEmail} ${p.razorpayOrderId} ${p.razorpayPaymentId || ""} ${p.testSeriesTitle}`,
      cell: (p) => (
        <div className="space-y-0.5">
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
            {p.candidateName}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            {p.candidateEmail}
          </span>
        </div>
      ),
    },
    {
      id: "testSeries",
      header: "Test Series",
      sortable: true,
      sortAccessor: (p) => p.testSeriesTitle,
      cell: (p) => (
        <span className="font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate block">
          {p.testSeriesTitle}
        </span>
      ),
    },
    {
      id: "amount",
      header: "Amount",
      sortable: true,
      sortAccessor: (p) => p.amount,
      cell: (p) => (
        <div className="space-y-0.5">
          <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-sm">
            ₹{p.amountInRupees}.00
          </span>
          {p.status === "REFUNDED" && (
            <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">
              -₹{p.amountRefundedInRupees}.00 refunded
            </span>
          )}
        </div>
      ),
    },
    {
      id: "gatewayRefs",
      header: "Gateway References",
      sortable: false,
      cell: (p) => (
        <div className="space-y-1 font-mono text-[11px]">
          {p.razorpayPaymentId ? (
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
              <span className="font-semibold truncate max-w-[120px]">{p.razorpayPaymentId}</span>
              <button
                type="button"
                onClick={() => copyToClipboard(p.razorpayPaymentId!, "Payment ID")}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                title="Copy Payment ID"
              >
                <Copy className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <span className="text-slate-400 italic">No Payment ID</span>
          )}
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-[10px]">
            <span className="truncate max-w-[120px]">Ord: {p.razorpayOrderId}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(p.razorpayOrderId, "Order ID")}
              className="text-slate-400 hover:text-slate-700"
              title="Copy Order ID"
            >
              <Copy className="h-2.5 w-2.5" />
            </button>
          </div>
        </div>
      ),
    },
    {
      id: "method",
      header: "Method",
      sortable: true,
      sortAccessor: (p) => p.paymentMethod || "",
      cell: (p) => (
        <Badge
          variant="outline"
          className="uppercase text-[10px] font-mono font-bold border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
        >
          {p.paymentMethod || "GATEWAY"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (p) => p.status,
      cell: (p) => {
        if (p.status === "COMPLETED") {
          return (
            <Badge
              variant="outline"
              className="border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[11px] font-semibold rounded-full"
            >
              Captured
            </Badge>
          )
        }
        if (p.status === "REFUNDED") {
          return (
            <Badge
              variant="outline"
              className="border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 text-[11px] font-semibold rounded-full"
            >
              Refunded
            </Badge>
          )
        }
        if (p.status === "FAILED") {
          return (
            <Badge
              variant="outline"
              className="border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 text-[11px] font-semibold rounded-full"
            >
              Failed
            </Badge>
          )
        }
        return (
          <Badge
            variant="outline"
            className="border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[11px] font-semibold rounded-full"
          >
            Pending
          </Badge>
        )
      },
    },
    {
      id: "policyWindow",
      header: "7-Day Return",
      sortable: true,
      sortAccessor: (p) => (p.within7Days ? 1 : 0),
      cell: (p) =>
        p.within7Days ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            {7 - p.daysElapsed}d eligible
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Expired ({p.daysElapsed}d)
          </span>
        ),
    },
    {
      id: "createdAt",
      header: "Date",
      sortable: true,
      sortAccessor: (p) => new Date(p.createdAt),
      cell: (p) => <FormattedDate date={p.createdAt} includeTime />,
    },
    {
      id: "action",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <AdminPaymentLedgerSheet payment={p} />
          <AdminRefundDialog payment={p} />
        </div>
      ),
    },
  ]

  const distinctTestTitles = React.useMemo(() => {
    const set = new Set<string>()
    for (const p of payments) {
      if (p.testSeriesTitle) set.add(p.testSeriesTitle)
    }
    return Array.from(set).sort()
  }, [payments])

  const filters: DataTableFilter<AdminPaymentRow>[] = [
    {
      id: "status",
      label: "Payment Status",
      accessor: (p) => p.status,
      options: [
        { label: "Captured / Completed", value: "COMPLETED" },
        { label: "100% Refunded", value: "REFUNDED" },
        { label: "Pending Capture", value: "PENDING" },
        { label: "Failed / Abandoned", value: "FAILED" },
      ],
    },
    ...(distinctTestTitles.length > 1
      ? [
          {
            id: "testSeries",
            label: "Test Series Paper",
            accessor: (p: AdminPaymentRow) => p.testSeriesTitle,
            options: distinctTestTitles.map((title) => ({
              label: title,
              value: title,
            })),
          },
        ]
      : []),
    {
      id: "returnWindow",
      label: "7-Day Return Window",
      accessor: (p) => (p.within7Days ? "ELIGIBLE" : "EXPIRED"),
      options: [
        { label: "Within 7-Day Window (Eligible)", value: "ELIGIBLE" },
        { label: "Expired Window (> 7 Days)", value: "EXPIRED" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={CreditCard}
        title="Student Payments & Revenue Ledger"
        subtitle="Viewing: Real-Time Razorpay Captured Orders, 7-Day Refund Queue & Transaction Logs"
      >
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReconcile}
          disabled={reconciling}
          className="h-10 px-3.5 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-2xs"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 mr-1.5 ${reconciling ? "animate-spin text-[#2A6AED]" : ""}`}
          />
          {reconciling ? "Reconciling Orders..." : "Reconcile Stale Orders"}
        </Button>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          label="Total Captured Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          subtext="Gross verified enrollments"
          icon={CreditCard}
          variant="emerald"
        />
        <KpiStatCard
          label="Successful Orders"
          value={capturedCount}
          subtext="Completed payment captures"
          icon={FileCheck2}
          variant="blue"
        />
        <KpiStatCard
          label="7-Day Refund Eligible"
          value={within7DaysCount}
          subtext="Within return policy window"
          icon={Clock}
          variant="amber"
        />
        <KpiStatCard
          label="Total Refunded Capital"
          value={`₹${totalRefunded.toLocaleString()}`}
          subtext="Returned to student accounts"
          icon={AlertTriangle}
          variant="rose"
        />
      </div>

      {/* Unified Table Master Container */}
      <DataTable
        data={payments}
        columns={columns}
        keyExtractor={(p) => p.id}
        searchPlaceholder="Search candidate name, email, order ID, payment ID, or test series..."
        filters={filters}
        dateAccessor={(p) => p.createdAt}
        dateFilterLabel="Payment Date"
        defaultSortColumn="createdAt"
        defaultSortDirection="desc"
        defaultPageSize={10}
        showSerialNumber={true}
        renderCard={(p, idx, serialNumber) => (
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 shrink-0">
                    #{serialNumber}
                  </span>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">
                      {p.candidateName}
                    </span>
                    <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">
                      {p.candidateEmail}
                    </span>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    p.status === "COMPLETED"
                      ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-semibold shrink-0"
                      : p.status === "REFUNDED"
                        ? "border-purple-200 dark:border-purple-900 text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 text-[10px] font-semibold shrink-0"
                        : p.status === "FAILED"
                          ? "border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 text-[10px] font-semibold shrink-0"
                          : "border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[10px] font-semibold shrink-0"
                  }
                >
                  {p.status === "COMPLETED" ? "Captured" : p.status}
                </Badge>
              </div>

              <div className="pt-1">
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs block line-clamp-1">
                  {p.testSeriesTitle}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Captured Amount</span>
                  <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-sm">
                    ₹{p.amountInRupees}.00
                  </span>
                  {p.status === "REFUNDED" && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold block">
                      -₹{p.amountRefundedInRupees}.00 refunded
                    </span>
                  )}
                </div>
                <div className="text-right space-y-0.5">
                  <Badge variant="outline" className="text-[10px] uppercase font-mono font-bold">
                    {p.paymentMethod || "GATEWAY"}
                  </Badge>
                  <span className="block text-[11px] text-slate-500">
                    {p.within7Days ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{7 - p.daysElapsed}d return eligible</span>
                    ) : (
                      <span className="text-slate-400">Return window expired</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Identifiers & Date */}
              <div className="space-y-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/50 p-2.5 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Order:</span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                    <span className="truncate max-w-[150px]">{p.razorpayOrderId}</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(p.razorpayOrderId, "Order ID")}
                      className="text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                {p.razorpayPaymentId && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Payment:</span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                      <span className="truncate max-w-[150px]">{p.razorpayPaymentId}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(p.razorpayPaymentId!, "Payment ID")}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/50 dark:border-slate-800/50 text-[10px] font-sans">
                  <span className="text-slate-400">Date:</span>
                  <span><FormattedDate date={p.createdAt} includeTime /></span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <AdminPaymentLedgerSheet payment={p} />
              <AdminRefundDialog payment={p} />
            </div>
          </div>
        )}
        emptyTitle="No payments recorded"
        emptyDescription="Student enrollments and Razorpay payment transactions will appear here."
      />
    </div>
  )
}
