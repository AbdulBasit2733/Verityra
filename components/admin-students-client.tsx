"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { AdminExtraAttemptDialog } from "@/components/admin-extra-attempt-dialog"
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
          <span className="font-bold text-slate-900 dark:text-slate-100 block">
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
        <span className="font-semibold text-slate-900 dark:text-slate-100 max-w-xs truncate block">
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
                    ? "border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 text-[10px] font-semibold px-2 py-0 rounded-full"
                    : "border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[10px] font-semibold px-2 py-0 rounded-full"
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
          <span className="font-bold text-slate-900 dark:text-slate-100">{r.maxAttempts} allowed</span>
          {r.maxAttempts > 3 && (
            <Badge className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-0 text-[10px] font-bold rounded-full">
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-none space-y-3 flex flex-col justify-between">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 shrink-0">
                      #{serialNumber}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block text-sm">
                        {r.studentName}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[200px]">
                        {r.studentEmail}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      isExhausted
                        ? "border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50 text-[10px] font-semibold shrink-0"
                        : "border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[10px] font-semibold shrink-0"
                    }
                  >
                    {isExhausted ? "Quota Exhausted" : "Active Quota"}
                  </Badge>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] text-slate-400 font-semibold block">Enrolled Paper:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs block line-clamp-1">
                    {r.testTitle}
                  </span>
                </div>

                {/* Progress Strip */}
                <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {r.attemptsUsed} / {r.maxAttempts} attempts used
                    </span>
                    {r.maxAttempts > 3 && (
                      <Badge className="bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-0 text-[10px] font-bold">
                        Overridden Limit
                      </Badge>
                    )}
                  </div>
                  <Progress
                    value={r.attemptsUsed}
                    max={r.maxAttempts}
                    indicatorClassName={isExhausted ? "bg-red-500" : "bg-[#2A6AED]"}
                  />
                </div>

                <div className="text-[11px] text-slate-400">
                  Enrolled: <FormattedDate date={r.registeredAt} includeTime />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
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
