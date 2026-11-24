"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconActionButton } from "@/components/ui/icon-action-button"
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
} from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { useGlobalError } from "@/components/providers/error-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  togglePublishTestSeriesAction,
  deleteTestSeriesAction,
} from "@/actions/test-series-actions"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  CheckCircle2,
  Edit,
  ExternalLink,
  EyeOff,
  FileText,
  Globe,
  Loader2,
  Plus,
  Trash2,
  Users,
} from "lucide-react"

export interface AdminTestSeriesRow {
  id: string
  title: string
  slug: string
  price: number
  bundlePrice?: number | null
  type?: string
  standard?: string | null
  stream?: string | null
  badge?: string | null
  status: string
  maxMarks: number
  maxAttempts: number
  registrationsCount: number
  papersCount: number
  templatesCount: number
  testsCount?: number
  subjects?: string[]
  createdAt: string
}

export interface MasterSimpleItem {
  id: string
  name: string
  code?: string | null
  description?: string | null
}

export function AdminTestSeriesClient({
  testSeries,
  masterSubjects = [],
  masterStandards = [],
  masterBoards = [],
}: {
  testSeries: AdminTestSeriesRow[]
  masterSubjects?: MasterSimpleItem[]
  masterStandards?: MasterSimpleItem[]
  masterBoards?: MasterSimpleItem[]
}) {
  const router = useRouter()
  const confirm = useConfirm()
  const { showError } = useGlobalError()
  const [toggleLoadingId, setToggleLoadingId] = React.useState<string | null>(
    null
  )
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  const publishedCount = testSeries.filter(
    (t) => t.status === "PUBLISHED"
  ).length
  const draftCount = testSeries.filter((t) => t.status === "DRAFT").length
  const totalEnrolled = testSeries.reduce(
    (acc, t) => acc + t.registrationsCount,
    0
  )

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
        toast.success(
          nextState ? "Test Series Published" : "Test Series Unpublished",
          {
            description: res.message,
          }
        )
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
        message:
          "An unexpected error occurred while toggling publication status.",
        code: "PUBLISH_TOGGLE_ERR",
      })
    } finally {
      setToggleLoadingId(null)
    }
  }

  async function handleDeleteSeries(row: AdminTestSeriesRow) {
    const confirmed = await confirm({
      title: `Delete "${row.title}"?`,
      description: `Are you sure you want to delete this test series bundle? This will permanently delete the bundle, all attached subject tests, and exam materials. This action cannot be undone.`,
      confirmText: "Delete Test Series",
      cancelText: "Cancel",
      variant: "destructive",
      badgeText: "Permanent Deletion",
    })

    if (!confirmed) return

    setDeletingId(row.id)
    try {
      const res = await deleteTestSeriesAction(row.id)
      if (res.success) {
        toast.success(res.message || "Test series deleted successfully.")
        router.refresh()
      } else if (res.data?.requiresForce) {
        // Prompt for force deletion when completed payments exist
        const forceConfirmed = await confirm({
          title: "Force Delete Test Series?",
          description: `⚠️ WARNING: ${res.error}\n\nAre you absolutely sure you want to FORCE delete this test series?`,
          confirmText: "Yes, Force Delete",
          cancelText: "Cancel",
          variant: "destructive",
          badgeText: "High Risk",
        })

        if (forceConfirmed) {
          const forceRes = await deleteTestSeriesAction(row.id, { force: true })
          if (forceRes.success) {
            toast.success(forceRes.message || "Test series force deleted successfully.")
            router.refresh()
          } else {
            toast.error(forceRes.error || "Failed to force delete test series.")
          }
        }
      } else {
        toast.error(res.error || "Failed to delete test series.")
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.")
    } finally {
      setDeletingId(null)
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
        <div className="max-w-[280px] space-y-0.5 whitespace-normal">
          <Link
            href={`/admin/test-series/${t.id}`}
            className="block text-xs sm:text-sm leading-snug font-bold text-slate-900 transition-colors hover:text-[#2A6AED] dark:text-slate-100 dark:hover:text-blue-400 line-clamp-1"
            title={t.title}
          >
            {t.title}
          </Link>
          <span className="font-mono text-[10px] text-muted-foreground block truncate">
            /{t.slug}
          </span>
        </div>
      ),
    },
    {
      id: "standard",
      header: "Standard",
      sortable: true,
      sortAccessor: (t) => t.standard || "",
      cell: (t) => (
        <Badge
          variant="secondary"
          className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold whitespace-nowrap"
        >
          {t.standard ? (t.standard.startsWith("Class") ? t.standard : `Class ${t.standard}`) : "All Classes"}
        </Badge>
      ),
    },
    {
      id: "stream",
      header: "Board / Stream",
      sortable: true,
      sortAccessor: (t) => t.stream || "",
      cell: (t) => (
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 font-semibold whitespace-nowrap"
        >
          {t.stream || "General / CBSE"}
        </Badge>
      ),
    },
    {
      id: "subjects",
      header: "Subjects",
      cell: (t) => {
        const subs = t.subjects || []
        if (subs.length === 0) {
          return (
            <span className="text-[11px] text-muted-foreground italic">
              {t.testsCount ? `${t.testsCount} Tests` : "General"}
            </span>
          )
        }
        return (
          <div className="flex items-center gap-1 max-w-[200px]" title={subs.join(", ")}>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium truncate max-w-[110px]">
              {subs[0]}
            </Badge>
            {subs.length > 1 && (
              <Badge variant="outline" className="text-[9px] px-1 py-0 text-muted-foreground font-semibold whitespace-nowrap">
                +{subs.length - 1} more
              </Badge>
            )}
          </div>
        )
      },
    },
    {
      id: "format",
      header: "Format",
      sortable: true,
      sortAccessor: (t) => t.type || "BUNDLE",
      cell: (t) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <Badge
            variant="outline"
            className={
              t.type === "BUNDLE"
                ? "text-[10px] px-1.5 py-0 border-indigo-200 bg-indigo-50/50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300 font-bold"
                : "text-[10px] px-1.5 py-0 border-purple-200 bg-purple-50/50 text-purple-700 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-300 font-bold"
            }
          >
            {t.type === "BUNDLE" ? `Bundle (${t.testsCount || 0})` : "Single Test"}
          </Badge>
          {t.badge && (
            <span className="block text-[9px] font-bold text-amber-600 dark:text-amber-400 truncate max-w-[110px]">
              {t.badge}
            </span>
          )}
        </div>
      ),
    },
    {
      id: "price",
      header: "Price",
      sortable: true,
      sortAccessor: (t) => t.price,
      cell: (t) => {
        const displayPrice = t.bundlePrice ? t.bundlePrice : t.price
        return displayPrice === 0 ? (
          <Badge className="rounded-sm border-0 bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white whitespace-nowrap">
            FREE
          </Badge>
        ) : (
          <span className="text-xs font-extrabold text-[#2A6AED] sm:text-sm dark:text-blue-400 whitespace-nowrap">
            ₹{(displayPrice / 100).toLocaleString()}
          </span>
        )
      },
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
              ? "rounded-sm border-emerald-200 bg-emerald-50 text-[10px] font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400 whitespace-nowrap"
              : "rounded-sm border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400 whitespace-nowrap"
          }
        >
          {t.status === "PUBLISHED" ? "Live" : "Draft"}
        </Badge>
      ),
    },
    {
      id: "registrations",
      header: "Enrolled",
      sortable: true,
      sortAccessor: (t) => t.registrationsCount,
      cell: (t) => (
        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
          {t.registrationsCount}
        </span>
      ),
    },
    {
      id: "action",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      cell: (t) => {
        const isPublished = t.status === "PUBLISHED"
        const isLoading = toggleLoadingId === t.id

        return (
          <div className="flex items-center justify-end gap-1">
            {/* Quick Toggle Publish */}
            <IconActionButton
              label={
                isLoading
                  ? "Updating publication status"
                  : isPublished
                    ? "Unpublish to draft"
                    : "Publish to catalog"
              }
              variant="outline"
              disabled={isLoading}
              onClick={() => handleTogglePublish(t)}
              className={cn(
                "border-slate-200 dark:border-slate-800",
                isPublished
                  ? "text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                  : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              )}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : isPublished ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Globe className="h-3.5 w-3.5" />
              )}
            </IconActionButton>

            {/* Manage Test Link */}
            <IconActionButton
              label="Manage test series"
              render={<Link href={`/admin/test-series/${t.id}`} />}
              nativeButton={false}
              variant="outline"
              className="border-slate-200 text-[#2A6AED] hover:border-blue-200 hover:bg-blue-50 dark:border-slate-800 dark:text-blue-400 dark:hover:bg-blue-950"
            >
              <Edit className="h-3.5 w-3.5" />
            </IconActionButton>

            {/* Candidate View External Link */}
            <IconActionButton
              label="Preview candidate view in new tab"
              render={<Link href={`/tests/${t.id}`} target="_blank" />}
              nativeButton={false}
              variant="ghost"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </IconActionButton>

            {/* Delete Test Series Button */}
            <IconActionButton
              label={deletingId === t.id ? "Deleting test series..." : "Delete test series"}
              variant="outline"
              disabled={deletingId === t.id || isLoading}
              onClick={() => handleDeleteSeries(t)}
              className="border-slate-200 text-rose-600 hover:border-rose-200 hover:bg-rose-50 dark:border-slate-800 dark:text-rose-400 dark:hover:bg-rose-950/40"
            >
              {deletingId === t.id ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Trash2 className="h-3.5 w-3.5" />
              )}
            </IconActionButton>
          </div>
        )
      },
    },
  ]

  const subjectOptions = React.useMemo(() => {
    const names = new Set<string>()
    masterSubjects.forEach((s) => names.add(s.name))
    testSeries.forEach((t) => {
      ;(t.subjects || []).forEach((sub) => names.add(sub))
    })

    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((sub) => {
        const count = testSeries.filter((t) => (t.subjects || []).includes(sub)).length
        const master = masterSubjects.find((s) => s.name === sub)
        return {
          label: sub,
          value: sub,
          count,
          hint: master?.code || undefined,
        }
      })
  }, [masterSubjects, testSeries])

  const standardOptions = React.useMemo(() => {
    const names = new Set<string>()
    masterStandards.forEach((s) => names.add(s.name))
    testSeries.forEach((t) => {
      if (t.standard) names.add(t.standard)
    })

    return Array.from(names).map((std) => {
      const count = testSeries.filter((t) => {
        const tStd = (t.standard || "").toLowerCase()
        const target = std.toLowerCase()
        return tStd.includes(target)
      }).length
      return {
        label: std.startsWith("Class") ? std : `Class ${std}`,
        value: std,
        count,
      }
    })
  }, [masterStandards, testSeries])

  const boardOptions = React.useMemo(() => {
    const names = new Set<string>()
    masterBoards.forEach((b) => names.add(b.name))
    testSeries.forEach((t) => {
      if (t.stream) names.add(t.stream)
    })

    return Array.from(names).map((board) => {
      const count = testSeries.filter((t) => {
        const tStream = (t.stream || "").toLowerCase()
        const target = board.toLowerCase()
        return tStream.includes(target)
      }).length
      return {
        label: board,
        value: board,
        count,
      }
    })
  }, [masterBoards, testSeries])

  const filters: DataTableFilter<AdminTestSeriesRow>[] = [
    {
      id: "subject",
      label: "Subject",
      accessor: (t) => t.subjects || [],
      options: subjectOptions,
      searchable: true,
      searchPlaceholder: "Search master subjects...",
      allLabel: "All Subjects",
      width: "w-64",
    },
    {
      id: "stream",
      label: "Board",
      accessor: (t) => t.stream || "General / CBSE",
      options: boardOptions,
      searchable: true,
      searchPlaceholder: "Search board/stream...",
      allLabel: "All Boards",
      width: "w-56",
    },
    {
      id: "standard",
      label: "Standard",
      accessor: (t) => t.standard || "OTHER",
      options: standardOptions,
      searchable: true,
      searchPlaceholder: "Search standard...",
      allLabel: "All Standards",
      width: "w-56",
    },
    {
      id: "format",
      label: "Series Format",
      accessor: (t) => t.type || "BUNDLE",
      options: [
        { label: "All Formats", value: "ALL" },
        { label: "All-Subject Bundles", value: "BUNDLE" },
        { label: "Single Subject Tests", value: "SINGLE_TEST" },
      ],
    },
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
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={BookOpen}
        title="Test Series Catalog"
        subtitle="Viewing: All Online Test Series & Evaluation Rubrics"
      >
        <Link href="/admin/test-series/new">
          <Button className="h-10 rounded-md bg-[#2A6AED] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#1E55C7] sm:text-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Create Test Series
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              className="flex flex-col justify-between gap-4 rounded-md border border-border bg-background p-4 shadow-none transition-colors hover:border-primary/40 sm:p-5"
            >
              <div className="space-y-3">
                {/* Header: SN + Status + Price */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-sm bg-slate-100 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      #{sn}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        isPublished
                          ? "rounded-sm border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-400"
                          : "rounded-sm border-slate-200 bg-slate-50 text-[10px] font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
                      }
                    >
                      {t.status}
                    </Badge>
                  </div>

                  {t.price === 0 ? (
                    <Badge className="rounded-sm border-0 bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      FREE
                    </Badge>
                  ) : (
                    <span className="text-sm font-extrabold text-[#2A6AED] dark:text-blue-400">
                      ₹{(t.price / 100).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Title & Slug */}
                <div>
                  <Link
                    href={`/admin/test-series/${t.id}`}
                    className="block text-sm leading-snug font-bold text-slate-900 transition-colors hover:text-[#2A6AED] dark:text-slate-100 dark:hover:text-blue-400"
                  >
                    {t.title}
                  </Link>
                  <span className="font-mono text-[11px] text-slate-400">
                    /{t.slug}
                  </span>
                </div>

                {/* Metrics Stats */}
                <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-2 text-center dark:border-slate-800/80">
                  <div>
                    <span className="block text-[10px] font-medium text-slate-400">
                      Marks
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.maxMarks}
                    </span>
                  </div>
                  <div className="border-x border-slate-200/60 dark:border-slate-800">
                    <span className="block text-[10px] font-medium text-slate-400">
                      Quota
                    </span>
                    <span className="text-xs font-bold text-[#2A6AED] dark:text-blue-400">
                      {t.maxAttempts} att.
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-medium text-slate-400">
                      Enrolled
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {t.registrationsCount}
                    </span>
                  </div>
                </div>

                {/* Creation Date */}
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  Created <FormattedDate date={t.createdAt} />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => handleTogglePublish(t)}
                  className={cn(
                    "h-8 flex-1 rounded-md border-slate-200 px-2 text-xs font-semibold shadow-2xs dark:border-slate-800",
                    isPublished
                      ? "text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/40"
                      : "text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isPublished ? (
                    <>
                      <EyeOff className="mr-1 h-3.5 w-3.5" />
                      Unpublish
                    </>
                  ) : (
                    <>
                      <Globe className="mr-1 h-3.5 w-3.5" />
                      Publish
                    </>
                  )}
                </Button>

                <Link href={`/admin/test-series/${t.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 rounded-md border-slate-200 px-3 text-xs font-semibold text-[#2A6AED] shadow-2xs hover:bg-blue-50 dark:border-slate-800 dark:text-blue-400 dark:hover:bg-blue-950"
                  >
                    <Edit className="mr-1 h-3.5 w-3.5" />
                    Manage
                  </Button>
                </Link>

                <Link href={`/tests/${t.id}`} target="_blank">
                  <Button
                    size="sm"
                    variant="ghost"
                    title="Preview candidate view in new tab"
                    className="h-8 w-8 rounded-md p-0 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          )
        }}
        emptyTitle="No test series found"
        emptyDescription="Create your first online test series to get started."
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
