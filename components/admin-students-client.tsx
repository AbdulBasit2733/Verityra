"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { AdminExtraAttemptDialog } from "@/components/admin-extra-attempt-dialog"

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
          <span className="font-bold text-[#0F172A] block">{r.studentName}</span>
          <span className="text-[11px] text-[#64748B]">{r.studentEmail}</span>
        </div>
      ),
    },
    {
      id: "testTitle",
      header: "Enrolled Test Series",
      sortable: true,
      sortAccessor: (r) => r.testTitle,
      cell: (r) => (
        <span className="font-semibold text-[#0F172A] max-w-xs truncate block">
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
              <span className="font-bold text-[#0F172A]">
                {r.attemptsUsed} / {r.maxAttempts} used
              </span>
              <Badge
                variant="outline"
                className={
                  isExhausted
                    ? "border-red-200 text-red-700 bg-red-50 text-[10px] font-semibold px-1.5 py-0"
                    : "border-blue-200 text-[#2A6AED] bg-[#EFF6FF] text-[10px] font-semibold px-1.5 py-0"
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
          <span className="font-bold text-[#0F172A]">{r.maxAttempts} allowed</span>
          {r.maxAttempts > 3 && (
            <Badge className="bg-amber-100 text-amber-800 border-0 text-[10px] font-bold">
              Overridden
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "registeredAt",
      header: "Registered Date",
      sortable: true,
      sortAccessor: (r) => new Date(r.registeredAt),
      cell: (r) => <FormattedDate date={r.registeredAt} />,
    },
    {
      id: "override",
      header: "Audited Override",
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

  const filters: DataTableFilter<AdminStudentRegistrationRow>[] = [
    {
      id: "quota",
      label: "Quota Status",
      accessor: (r) => (r.attemptsUsed >= r.maxAttempts ? "EXHAUSTED" : "AVAILABLE"),
      options: [
        { label: "Attempts Available", value: "AVAILABLE" },
        { label: "Quota Exhausted", value: "EXHAUSTED" },
      ],
    },
    {
      id: "allowance",
      label: "Allowance Tier",
      accessor: (r) => (r.maxAttempts > 3 ? "OVERRIDDEN" : "DEFAULT"),
      options: [
        { label: "Standard (3 Attempts)", value: "DEFAULT" },
        { label: "Audited Override (4+ Attempts)", value: "OVERRIDDEN" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Flat Page Header */}
      <div className="space-y-1">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#2A6AED]">
          3-Attempt Governance & Exceptions
        </p>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] tracking-tight">
          Candidate Registrations & Overrides
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B]">
          Review candidate enrollments, track 3-attempt consumption, and grant audited exceptional attempt allowances.
        </p>
      </div>

      {/* Flat Divided Summary Strip */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 bg-slate-50/40">
        <div className="py-3.5 px-4 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Registrations
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
            {registrations.length}
          </p>
        </div>
        <div className="py-3.5 px-4 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Quota Exhausted
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-red-600">{exhaustedCount}</p>
        </div>
        <div className="py-3.5 px-4 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Audited Overrides
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-amber-600">
            {overriddenCount}
          </p>
        </div>
      </div>

      {/* Interactive DataTable */}
      <DataTable
        data={registrations}
        columns={columns}
        keyExtractor={(r) => r.id}
        searchPlaceholder="Search candidate name, email, or enrolled test series..."
        filters={filters}
        dateAccessor={(r) => r.registeredAt}
        dateFilterLabel="Registered Date"
        defaultSortColumn="registeredAt"
        defaultSortDirection="desc"
        defaultPageSize={10}
        emptyTitle="No student registrations found"
        emptyDescription="No candidate enrollments match your current search or filter settings."
      />
    </div>
  )
}
