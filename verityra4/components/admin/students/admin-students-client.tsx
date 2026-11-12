"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
} from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import dynamic from "next/dynamic"

const AdminExtraAttemptDialog = dynamic(
  () =>
    import("@/components/admin/students/admin-extra-attempt-dialog").then(
      (mod) => mod.AdminExtraAttemptDialog
    ),
  { ssr: false }
)
import { AlertTriangle, ShieldCheck, Users } from "lucide-react"

export interface AdminStudentRegistrationRow {
  id: string
  studentName: string
  studentEmail: string
  testTitle: string
  attemptsUsed: number
  maxAttempts: number
  registeredAt: string
}

export function AdminStudentsClient({
  registrations,
}: {
  registrations: AdminStudentRegistrationRow[]
}) {
  const exhaustedCount = registrations.filter(
    (r) => r.attemptsUsed >= r.maxAttempts
  ).length
  const overriddenCount = registrations.filter((r) => r.maxAttempts > 3).length

  const columns: DataTableColumn<AdminStudentRegistrationRow>[] = [
    {
      id: "candidate",
      header: "Candidate",
      sortable: true,
      sortAccessor: (r) => r.studentName,
      searchAccessor: (r) =>
        `${r.studentName} ${r.studentEmail} ${r.testTitle}`,
      cell: (r) => (
        <div>
          <span className="block font-bold text-slate-900 dark:text-slate-100">
            {r.studentName}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {r.studentEmail}
          </span>
        </div>
      ),
    },
    {
      id: "testTitle",
      header: "Enrolled Test Series",
      sortable: true,
      sortAccessor: (r) => r.testTitle,
      cell: (r) => (
        <span className="block max-w-xs truncate font-semibold text-slate-900 dark:text-slate-100">
          {r.testTitle}
        </span>
      ),
    },
    {
      id: "attemptsUsed",
      header: "Attempts Consumed",
      sortable: true,
      sortAccessor: (r) => r.attemptsUsed,
      cell: (r) => {
        const isExhausted = r.attemptsUsed >= r.maxAttempts
        return (
          <div className="w-40 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {r.attemptsUsed} / {r.maxAttempts} used
              </span>
              <Badge
                variant="outline"
                className={
                  isExhausted
                    ? "rounded-full border-red-200 bg-red-50 px-2 py-0 text-[10px] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
                    : "rounded-full border-blue-200 bg-blue-50 px-2 py-0 text-[10px] font-semibold text-[#2A6AED] dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400"
                }
              >
                {isExhausted ? "Exhausted" : "Active"}
              </Badge>
            </div>
            <Progress
              value={r.attemptsUsed}
              max={r.maxAttempts}
              indicatorClassName={isExhausted ? "bg-red-500" : "bg-[#2A6AED]"}
            />
          </div>
        )
      },
    },
    {
      id: "maxAttempts",
      header: "Allowed Maximum",
      sortable: true,
      sortAccessor: (r) => r.maxAttempts,
      cell: (r) => (
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-900 dark:text-slate-100">
            {r.maxAttempts} allowed
          </span>
          {r.maxAttempts > 3 && (
            <Badge className="rounded-full border-0 bg-amber-100 text-[10px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              Overridden
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "registeredAt",
      header: "Enrolled Date",
      sortable: true,
      sortAccessor: (r) => new Date(r.registeredAt),
      cell: (r) => <FormattedDate date={r.registeredAt} includeTime />,
    },
    {
      id: "action",
      header: "Attempt Override",
      headerClassName: "text-right",
      className: "text-right",
      cell: (r) => (
        <AdminExtraAttemptDialog
          registrationId={r.id}
          studentName={r.studentName}
          testTitle={r.testTitle}
          currentMax={r.maxAttempts}
        />
      ),
    },
  ]

  const distinctTestTitles = React.useMemo(() => {
    const set = new Set<string>()
    for (const r of registrations) {
      if (r.testTitle) set.add(r.testTitle)
    }
    return Array.from(set).sort()
  }, [registrations])

  const filters: DataTableFilter<AdminStudentRegistrationRow>[] = [
    {
      id: "status",
      label: "Quota Status",
      accessor: (r) =>
        r.attemptsUsed >= r.maxAttempts
          ? "EXHAUSTED"
          : r.maxAttempts > 3
            ? "OVERRIDDEN"
            : "ACTIVE",
      options: [
        { label: "Active Quota", value: "ACTIVE" },
        { label: "Quota Exhausted", value: "EXHAUSTED" },
        { label: "Overridden Limit", value: "OVERRIDDEN" },
      ],
    },
    ...(distinctTestTitles.length > 1
      ? [
          {
            id: "testSeries",
            label: "Test Series Paper",
            accessor: (r: AdminStudentRegistrationRow) => r.testTitle,
            options: distinctTestTitles.map((title) => ({
              label: title,
              value: title,
            })),
          },
        ]
      : []),
    {
      id: "attemptUsage",
      label: "Attempts Tier",
      accessor: (r) => {
        if (r.attemptsUsed === 0) return "NONE"
        if (r.attemptsUsed >= r.maxAttempts) return "MAX"
        return "IN_PROGRESS"
      },
      options: [
        { label: "0 Attempts Consumed", value: "NONE" },
        { label: "In Progress (1-2 Used)", value: "IN_PROGRESS" },
        { label: "Quota Reached (Max)", value: "MAX" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={Users}
        title="Candidate Directory & Attempt Overrides"
        subtitle="Viewing: All Enrolled Students & Attempt Quotas"
      />

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiStatCard
          label="Total Enrollments"
          value={registrations.length}
          subtext="Active exam candidate slots"
          icon={Users}
          variant="blue"
        />
        <KpiStatCard
          label="Quotas Exhausted"
          value={exhaustedCount}
          subtext="Candidates at maximum 3 attempts"
          icon={AlertTriangle}
          variant="rose"
        />
        <KpiStatCard
          label="Overrides Granted"
          value={overriddenCount}
          subtext="Audited exceptions (> 3 attempts)"
          icon={ShieldCheck}
          variant="amber"
        />
      </div>

      {/* Interactive DataTable */}
      <DataTable
        data={registrations}
        columns={columns}
        keyExtractor={(r) => r.id}
        searchPlaceholder="Search candidate name, email, or test series..."
        filters={filters}
        dateAccessor={(r) => r.registeredAt}
        dateFilterLabel="Enrollment Date"
        defaultSortColumn="registeredAt"
        defaultSortDirection="desc"
        defaultPageSize={10}
        showSerialNumber={true}
        renderCard={(r, idx, serialNumber) => {
          const isExhausted = r.attemptsUsed >= r.maxAttempts
          return (
            <div className="flex flex-col justify-between space-y-3 rounded-xl border border-border bg-card p-4 shadow-none sm:p-5">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[11px] font-bold text-slate-500 dark:bg-slate-800">
                      #{serialNumber}
                    </span>
                    <div>
                      <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                        {r.studentName}
                      </span>
                      <span className="block max-w-[200px] truncate text-[11px] text-slate-400">
                        {r.studentEmail}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      isExhausted
                        ? "shrink-0 border-red-200 bg-red-50 text-[10px] font-semibold text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
                        : "shrink-0 border-blue-200 bg-blue-50 text-[10px] font-semibold text-[#2A6AED] dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400"
                    }
                  >
                    {isExhausted ? "Quota Exhausted" : "Active Quota"}
                  </Badge>
                </div>

                <div className="pt-1">
                  <span className="block text-[11px] font-semibold text-slate-400">
                    Enrolled Paper:
                  </span>
                  <span className="line-clamp-1 block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {r.testTitle}
                  </span>
                </div>

                {/* Progress Strip */}
                <div className="space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {r.attemptsUsed} / {r.maxAttempts} attempts used
                    </span>
                    {r.maxAttempts > 3 && (
                      <Badge className="border-0 bg-amber-100 text-[10px] font-bold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                        Overridden Limit
                      </Badge>
                    )}
                  </div>
                  <Progress
                    value={r.attemptsUsed}
                    max={r.maxAttempts}
                    indicatorClassName={
                      isExhausted ? "bg-red-500" : "bg-[#2A6AED]"
                    }
                  />
                </div>

                <div className="text-[11px] text-slate-400">
                  Enrolled: <FormattedDate date={r.registeredAt} includeTime />
                </div>
              </div>

              <div className="flex items-center justify-end border-t border-slate-100 pt-2 dark:border-slate-800">
                <AdminExtraAttemptDialog
                  registrationId={r.id}
                  studentName={r.studentName}
                  testTitle={r.testTitle}
                  currentMax={r.maxAttempts}
                />
              </div>
            </div>
          )
        }}
        emptyTitle="No enrolled candidates found"
        emptyDescription="Adjust your search query or filters to view student enrollments."
      />
    </div>
  )
}
