"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import { togglePublishTestSeriesAction } from "@/actions/test-series-actions"
import { AdminTestSeriesMaxMarksEditor } from "@/components/admin-test-series-max-marks-editor"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  CheckCircle2,
  Edit,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Loader2,
  Plus,
  Users,
} from "lucide-react"

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
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()
  const [toggleLoadingId, setToggleLoadingId] = React.useState<string | null>(null)

  const publishedCount = testSeries.filter((t) => t.status === "PUBLISHED").length
  const draftCount = testSeries.filter((t) => t.status === "DRAFT").length
  const totalEnrolled = testSeries.reduce((acc, t) => acc + t.registrationsCount, 0)

  async function handleTogglePublish(row: AdminTestSeriesRow) {
    const isCurrentlyPublished = row.status === "PUBLISHED"
    const nextState = !isCurrentlyPublished

    const confirmed = await confirm({
      title: nextState
        ? `Publish "${row.title}" to Public Catalog?`
        : `Unpublish "${row.title}" from Catalog?`,
      description: nextState
        ? "Candidates will immediately be able to view and register for this test series."
        : "New registrations will be paused. Enrolled candidates will retain access.",
      confirmText: nextState ? "Publish to Catalog" : "Unpublish to Draft",
      cancelText: "Cancel",
      variant: nextState ? "default" : "warning",
      badgeText: "Catalog Visibility",
    })

    if (!confirmed) return

    setToggleLoadingId(row.id)
    try {
      const res = await togglePublishTestSeriesAction(row.id, nextState)
      if (res.success) {
        toast.success(nextState ? "Test Series Published" : "Test Series Unpublished", {
          description: res.message,
        })
        router.refresh()
      } else {
        showError({
          title: "Publication Status Error",
          message: res.error || "Unable to update publication state.",
          code: "PUBLISH_TOGGLE_ERR",
        })
      }
    } catch {
      showError({
        title: "Publication Error",
        message: "An unexpected error occurred while toggling publication status.",
        code: "PUBLISH_TOGGLE_ERR",
      })
    } finally {
      setToggleLoadingId(null)
    }
  }

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
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#2A6AED] dark:hover:text-blue-400 transition-colors block leading-snug"
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
          <Badge className="bg-emerald-600 text-white font-bold text-[10px] border-0 px-2 py-0.5 rounded-full">
            FREE
          </Badge>
        ) : (
          <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-xs sm:text-sm">
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
              ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[11px] font-semibold rounded-full"
              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 text-[11px] font-semibold rounded-full"
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
      cell: (t) => <span className="font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{t.maxMarks} Marks</span>,
    },
    {
      id: "maxAttempts",
      header: "Attempt Limit",
      sortable: true,
      sortAccessor: (t) => t.maxAttempts,
      cell: (t) => (
        <span className="font-bold text-[#2A6AED] dark:text-blue-400 text-xs sm:text-sm">{t.maxAttempts} attempts</span>
      ),
    },
    {
      id: "registrations",
      header: "Enrolled",
      sortable: true,
      sortAccessor: (t) => t.registrationsCount,
      cell: (t) => (
        <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">{t.registrationsCount} candidates</span>
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
      id: "action",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      cell: (t) => {
        const isPublished = t.status === "PUBLISHED"
        const isLoading = toggleLoadingId === t.id

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Quick Toggle Publish */}
            <Button
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => handleTogglePublish(t)}
              title={isPublished ? "Unpublish to Draft" : "Publish to Catalog"}
              className={cn(
                "h-8 px-2.5 text-xs font-semibold rounded-lg shadow-2xs border-slate-200 dark:border-slate-800",
                isPublished
                  ? "hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                  : "hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isPublished ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1" />
                  Unpublish
                </>
              ) : (
                <>
                  <Globe className="h-3.5 w-3.5 mr-1" />
                  Publish
                </>
              )}
            </Button>

            {/* Manage Test Link */}
            <Link href={`/admin/test-series/${t.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="h-8 px-2.5 border-slate-200 dark:border-slate-800 text-[#2A6AED] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold text-xs rounded-lg shadow-2xs"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Manage
              </Button>
            </Link>

            <AdminTestSeriesMaxMarksEditor
              testSeriesId={t.id}
              initialMaxMarks={t.maxMarks}
              compact
            />

            {/* Candidate View External Link */}
            <Link href={`/tests/${t.id}`} target="_blank">
              <Button
                size="sm"
                variant="ghost"
                title="Preview candidate view in new tab"
                className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        )
      },
    },
  ]

  const filters: DataTableFilter<AdminTestSeriesRow>[] = [
    {
      id: "status",
      label: "Publication Status",
      accessor: (t) => t.status,
      options: [
        { label: "Published Tests", value: "PUBLISHED" },
        { label: "Draft Tests", value: "DRAFT" },
      ],
    },
    {
      id: "pricing",
      label: "Pricing Type",
      accessor: (t) => (t.price === 0 ? "FREE" : "PAID"),
      options: [
        { label: "Free Tests", value: "FREE" },
        { label: "Paid Tests", value: "PAID" },
      ],
    },
    {
      id: "maxMarks",
      label: "Marks Weightage",
      accessor: (t) => (t.maxMarks >= 250 ? "FULL_MOCK" : "SECTIONAL"),
      options: [
        { label: "Full Mock (≥ 250 Marks)", value: "FULL_MOCK" },
        { label: "Sectional / Essay (< 250 Marks)", value: "SECTIONAL" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={BookOpen}
        title="Test Series Catalog"
        subtitle="Viewing: All UPSC Mains GS Papers & Rubrics"
      >
        <Link href="/admin/test-series/new">
          <Button className="h-10 px-4 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs sm:text-sm font-semibold shadow-xs">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Test Series
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          label="Total Test Series"
          value={testSeries.length}
          subtext="Configured evaluation papers"
          icon={BookOpen}
          variant="blue"
        />
        <KpiStatCard
          label="Published Tests"
          value={publishedCount}
          subtext="Available for enrollment"
          icon={CheckCircle2}
          variant="emerald"
        />
        <KpiStatCard
          label="Draft Tests"
          value={draftCount}
          subtext="Pending publication"
          icon={FileText}
          variant="slate"
        />
        <KpiStatCard
          label="Total Aspirants"
          value={totalEnrolled}
          subtext="Enrolled across all tests"
          icon={Users}
          variant="indigo"
        />
      </div>

      {/* Interactive DataTable */}
      <DataTable
        data={testSeries}
        columns={columns}
        keyExtractor={(t) => t.id}
        searchPlaceholder="Search test title, slug, or status..."
        filters={filters}
        dateAccessor={(t) => t.createdAt}
        dateFilterLabel="Creation Date"
        defaultSortColumn="createdAt"
        defaultSortDirection="desc"
        defaultPageSize={10}
        showSerialNumber={true}
        defaultViewMode="auto"
        gridClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        renderCard={(t, _index, sn) => {
          const isPublished = t.status === "PUBLISHED"
          const isLoading = toggleLoadingId === t.id

          return (
            <div
              key={t.id}
              className="rounded-xl border border-border bg-card p-4 sm:p-5 shadow-none hover:border-primary/40 transition-colors flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                {/* Header: SN + Status + Price */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                      #{sn}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        isPublished
                          ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-semibold rounded-full"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 text-[10px] font-semibold rounded-full"
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>

                  {t.price === 0 ? (
                    <Badge className="bg-emerald-600 text-white font-bold text-[10px] border-0 px-2 py-0.5 rounded-full">
                      FREE
                    </Badge>
                  ) : (
                    <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-sm">
                      ₹{(t.price / 100).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Title & Slug */}
                <div>
                  <Link
                    href={`/admin/test-series/${t.id}`}
                    className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#2A6AED] dark:hover:text-blue-400 transition-colors block text-sm leading-snug"
                  >
                    {t.title}
                  </Link>
                  <span className="text-[11px] font-mono text-slate-400">/{t.slug}</span>
                </div>

                {/* Metrics Stats */}
                <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/80 text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Marks</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.maxMarks}</span>
                  </div>
                  <div className="border-x border-slate-200/60 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Quota</span>
                    <span className="text-xs font-bold text-[#2A6AED] dark:text-blue-400">{t.maxAttempts} att.</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Enrolled</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{t.registrationsCount}</span>
                  </div>
                </div>

                {/* Creation Date */}
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  Created <FormattedDate date={t.createdAt} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => handleTogglePublish(t)}
                  className={cn(
                    "flex-1 h-8 px-2 text-xs font-semibold rounded-lg shadow-2xs border-slate-200 dark:border-slate-800",
                    isPublished
                      ? "hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                      : "hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isPublished ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 mr-1" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Globe className="h-3.5 w-3.5 mr-1" />
                      Publish
                    </>
                  )}
                </Button>

                <Link href={`/admin/test-series/${t.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 border-slate-200 dark:border-slate-800 text-[#2A6AED] dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-semibold text-xs rounded-lg shadow-2xs"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" />
                    Manage
                  </Button>
                </Link>

                <Link href={`/tests/${t.id}`} target="_blank">
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Preview candidate view in new tab"
                    className="h-8 w-8 p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )
        }}
        emptyTitle="No test series found"
        emptyDescription="Create your first UPSC test series to get started."
        emptyAction={
          <Link href="/admin/test-series/new">
            <Button size="sm" className="bg-[#2A6AED] text-white">
              Create New Test Series
            </Button>
          </Link>
        }
      />
    </div>
  )
}
