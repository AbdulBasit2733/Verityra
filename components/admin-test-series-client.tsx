"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { BookOpen, Edit, Plus } from "lucide-react"

export interface AdminTestSeriesRow {
  id: string
  title: string
  slug: string
  price: number
  status: string
  maxMarks: number
  maxAttempts: number
  registrationsCount: number
  papersCount: number
  templatesCount: number
  createdAt: string
}

export function AdminTestSeriesClient({
  testSeries,
}: {
  testSeries: AdminTestSeriesRow[]
}) {
  const publishedCount = testSeries.filter((t) => t.status === "PUBLISHED").length
  const draftCount = testSeries.filter((t) => t.status === "DRAFT").length
  const totalEnrolled = testSeries.reduce((acc, t) => acc + t.registrationsCount, 0)

  const columns: DataTableColumn<AdminTestSeriesRow>[] = [
    {
      id: "title",
      header: "Test Series Title",
      sortable: true,
      sortAccessor: (t) => t.title,
      searchAccessor: (t) => `${t.title} ${t.slug} ${t.status}`,
      cell: (t) => (
        <div className="space-y-0.5 max-w-xs whitespace-normal">
          <Link
            href={`/admin/test-series/${t.id}`}
            className="font-bold text-[#0F172A] hover:text-[#2A6AED] transition-colors block leading-snug"
          >
            {t.title}
          </Link>
          <span className="text-[11px] font-mono text-slate-400">/{t.slug}</span>
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      sortable: true,
      sortAccessor: (t) => t.price,
      cell: (t) =>
        t.price === 0 ? (
          <Badge className="bg-emerald-600 text-white font-bold text-[10px] border-0 px-2 py-0.5">
            FREE
          </Badge>
        ) : (
          <span className="font-extrabold text-[#2A6AED]">
            ₹{(t.price / 100).toLocaleString()}
          </span>
        ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (t) => t.status,
      cell: (t) => (
        <Badge
          variant="outline"
          className={
            t.status === "PUBLISHED"
              ? "border-emerald-200 text-emerald-700 bg-emerald-50 text-[11px] font-semibold"
              : "border-slate-200 text-slate-600 bg-slate-50 text-[11px] font-semibold"
          }
        >
          {t.status}
        </Badge>
      ),
    },
    {
      id: "maxMarks",
      header: "Max Marks",
      sortable: true,
      sortAccessor: (t) => t.maxMarks,
      cell: (t) => <span className="font-semibold text-[#0F172A]">{t.maxMarks} Marks</span>,
    },
    {
      id: "maxAttempts",
      header: "Attempt Limit",
      sortable: true,
      sortAccessor: (t) => t.maxAttempts,
      cell: (t) => (
        <span className="font-bold text-[#2A6AED]">{t.maxAttempts} attempts</span>
      ),
    },
    {
      id: "registrations",
      header: "Enrolled",
      sortable: true,
      sortAccessor: (t) => t.registrationsCount,
      cell: (t) => (
        <span className="text-slate-700 font-medium">
          {t.registrationsCount} candidates
        </span>
      ),
    },
    {
      id: "assets",
      header: "Assets",
      sortable: false,
      cell: (t) => (
        <span className="text-xs text-[#64748B]">
          {t.papersCount} papers · {t.templatesCount} templates
        </span>
      ),
    },
    {
      id: "createdAt",
      header: "Created",
      sortable: true,
      sortAccessor: (t) => new Date(t.createdAt),
      cell: (t) => <FormattedDate date={t.createdAt} />,
    },
    {
      id: "actions",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (t) => (
        <Link href={`/admin/test-series/${t.id}`}>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 border-slate-200 text-[#2A6AED] hover:bg-[#EFF6FF] font-semibold text-xs rounded-lg"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Configure
          </Button>
        </Link>
      ),
    },
  ]

  const filters: DataTableFilter<AdminTestSeriesRow>[] = [
    {
      id: "status",
      label: "Publication Status",
      accessor: (t) => t.status,
      options: [
        { label: "Published", value: "PUBLISHED" },
        { label: "Draft", value: "DRAFT" },
      ],
    },
    {
      id: "pricing",
      label: "Pricing Tier",
      accessor: (t) => (t.price === 0 ? "FREE" : "PAID"),
      options: [
        { label: "Free Enrollment", value: "FREE" },
        { label: "Paid Test Series", value: "PAID" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Flat Page Header — No Card Wrapper */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#2A6AED]">
            Catalog & Rubric Governance
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] tracking-tight">
            Test Series Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Create, configure, publish, and manage subjective examination papers and margin templates.
          </p>
        </div>

        <Link href="/admin/test-series/new" className="shrink-0">
          <Button className="bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-xs sm:text-sm h-10 px-4 rounded-xl">
            <Plus className="mr-1.5 h-4 w-4" />
            Create New Test Series
          </Button>
        </Link>
      </div>

      {/* Flat Divided Summary Bar */}
      <div className="grid grid-cols-3 divide-x divide-slate-200 border-y border-slate-200 bg-slate-50/40">
        <div className="py-3.5 px-4 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Total Series
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-[#0F172A]">{testSeries.length}</p>
        </div>
        <div className="py-3.5 px-4 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Published / Draft
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-[#2A6AED]">
            {publishedCount}{" "}
            <span className="text-xs font-medium text-slate-500">/ {draftCount} draft</span>
          </p>
        </div>
        <div className="py-3.5 px-4 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Candidate Enrollments
          </span>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-700">{totalEnrolled}</p>
        </div>
      </div>

      {/* Interactive DataTable */}
      <DataTable
        data={testSeries}
        columns={columns}
        keyExtractor={(t) => t.id}
        searchPlaceholder="Search test series by title or slug..."
        filters={filters}
        dateAccessor={(t) => t.createdAt}
        dateFilterLabel="Created Date"
        defaultSortColumn="createdAt"
        defaultSortDirection="desc"
        defaultPageSize={10}
        emptyTitle="No test series created yet"
        emptyDescription="Click Create New Test Series to configure your first subjective examination."
        emptyAction={
          <Link href="/admin/test-series/new">
            <Button size="sm" className="bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-semibold">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Create First Test Series
            </Button>
          </Link>
        }
      />
    </div>
  )
}
