"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, CreditCard, ExternalLink, IndianRupee, RotateCcw, WalletCards } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"

export interface StudentPurchaseRow {
  id: string
  testSeriesId: string
  testTitle: string
  amount: number
  amountRefunded: number
  currency: string
  status: string
  paymentMethod: string | null
  razorpayOrderId: string
  razorpayPaymentId: string | null
  createdAt: string
  hasAccess: boolean
}

function statusClass(status: string) {
  if (status === "COMPLETED") return "border-chart-3/30 bg-chart-3/10 text-chart-3"
  if (status === "REFUNDED" || status === "FAILED") return "border-destructive/30 bg-destructive/10 text-destructive"
  return "border-score-accent/30 bg-score-accent/10 text-score-accent"
}

export function StudentPurchasesClient({ purchases }: { purchases: StudentPurchaseRow[] }) {
  const columns: DataTableColumn<StudentPurchaseRow>[] = React.useMemo(
    () => [
      {
        id: "testTitle",
        header: "Purchase",
        sortable: true,
        sortAccessor: (row) => row.testTitle,
        searchAccessor: (row) => `${row.testTitle} ${row.razorpayOrderId} ${row.razorpayPaymentId || ""}`,
        cell: (row) => (
          <div className="space-y-1 whitespace-normal">
            <p className="font-semibold text-foreground">{row.testTitle}</p>
            <p className="text-xs text-muted-foreground">Order {row.razorpayOrderId}</p>
          </div>
        ),
      },
      {
        id: "amount",
        header: "Amount",
        sortable: true,
        sortAccessor: (row) => row.amount,
        cell: (row) => (
          <div className="space-y-1">
            <span className="font-semibold">
              {row.currency} {(row.amount / 100).toFixed(2)}
            </span>
            {row.amountRefunded > 0 && (
              <span className="block text-xs text-muted-foreground">Refunded {(row.amountRefunded / 100).toFixed(2)}</span>
            )}
          </div>
        ),
      },
      {
        id: "status",
        header: "Payment status",
        sortable: true,
        sortAccessor: (row) => row.status,
        cell: (row) => (
          <Badge variant="outline" className={statusClass(row.status)}>
            {row.status}
          </Badge>
        ),
      },
      {
        id: "method",
        header: "Method",
        sortable: true,
        sortAccessor: (row) => row.paymentMethod || "—",
        cell: (row) => <span className="text-sm capitalize text-muted-foreground">{row.paymentMethod || "—"}</span>,
      },
      {
        id: "createdAt",
        header: "Date",
        sortable: true,
        sortAccessor: (row) => new Date(row.createdAt).getTime(),
        cell: (row) => <FormattedDate date={row.createdAt} includeTime />,
      },
      {
        id: "action",
        header: "Action",
        className: "text-right",
        headerClassName: "text-right",
        cell: (row) =>
          row.hasAccess ? (
            <Link href={`/student/tests/${row.testSeriesId}`}>
              <Button size="sm" className="gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Open access
              </Button>
            </Link>
          ) : (
            <Link href={`/tests/${row.testSeriesId}`}>
              <Button size="sm" variant="outline" className="gap-1.5">
                <ArrowRight className="h-3.5 w-3.5" />
                View payment
              </Button>
            </Link>
          ),
      },
    ],
    []
  )

  const filters: DataTableFilter<StudentPurchaseRow>[] = React.useMemo(() => {
    const paymentMethods = Array.from(new Set(purchases.map((row) => row.paymentMethod || "UNKNOWN"))).sort()
    return [
      {
        id: "status",
        label: "Payment Status",
        accessor: (row) => row.status,
        options: ["COMPLETED", "PENDING", "FAILED", "REFUND_PENDING", "REFUNDED"].map((status) => ({
          label: status.replaceAll("_", " "),
          value: status,
        })),
      },
      {
        id: "method",
        label: "Payment Method",
        accessor: (row) => row.paymentMethod || "UNKNOWN",
        options: paymentMethods.map((method) => ({
          label: method.replaceAll("_", " "),
          value: method,
        })),
      },
    ]
  }, [purchases])

  const { completed, refunded, totalPaid } = React.useMemo(() => {
    const comp = purchases.filter((row) => row.status === "COMPLETED")
    const ref = purchases.filter((row) => row.amountRefunded > 0)
    const paid = comp.reduce((total, row) => total + row.amount, 0)
    return { completed: comp, refunded: ref, totalPaid: paid }
  }, [purchases])

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CreditCard}
        title="Purchases"
        subtitle="Payment history, gateway references, refunds, and access status."
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiStatCard
          label="Completed Payments"
          value={completed.length}
          subtext="Successful paid orders"
          icon={WalletCards}
          variant="emerald"
        />
        <KpiStatCard
          label="Total Paid"
          value={`₹${(totalPaid / 100).toFixed(2)}`}
          subtext="Completed purchase value"
          icon={IndianRupee}
          variant="blue"
        />
        <KpiStatCard
          label="Refund Activity"
          value={refunded.length}
          subtext="Payments with refund records"
          icon={RotateCcw}
          variant="amber"
        />
      </div>
      <DataTable
        data={purchases}
        columns={columns}
        keyExtractor={(row) => row.id}
        searchPlaceholder="Search purchases, order IDs, or payment IDs..."
        filters={filters}
        defaultSortColumn="createdAt"
        defaultSortDirection="desc"
        defaultPageSize={10}
        showSerialNumber
        emptyTitle="No purchase records"
        emptyDescription="Completed and in-progress paid test purchases will appear here."
        emptyAction={
          <Link href="/tests">
            <Button size="sm">Browse paid tests</Button>
          </Link>
        }
        renderCard={(row) => (
          <div className="space-y-3 border-b border-border px-1 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">{row.testTitle}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.currency} {(row.amount / 100).toFixed(2)} · {row.paymentMethod || "Payment gateway"}
                </p>
              </div>
              <Badge variant="outline" className={statusClass(row.status)}>
                {row.status}
              </Badge>
            </div>
            <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
              <span>Order: {row.razorpayOrderId}</span>
              {row.razorpayPaymentId && <span>Payment: {row.razorpayPaymentId}</span>}
              <FormattedDate date={row.createdAt} includeTime />
            </div>
            {row.hasAccess ? (
              <Link href={`/student/tests/${row.testSeriesId}`} className="block">
                <Button className="w-full gap-2">
                  Open access <ExternalLink className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Link href={`/tests/${row.testSeriesId}`} className="block">
                <Button variant="outline" className="w-full">
                  View payment
                </Button>
              </Link>
            )}
          </div>
        )}
      />
    </div>
  )
}
