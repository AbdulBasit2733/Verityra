"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
  DataTableFilterOption,
} from "@/components/ui/data-table"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  FileText,
  Plus,
  Layers,
  Award,
  Clock,
  Globe,
  EyeOff,
  ExternalLink,
  BookOpenCheck,
  Trash2,
  Loader2,
  Edit2,
  GraduationCap,
  School,
} from "lucide-react"
import {
  AdminAllSubjectTestItem,
  togglePublishSubjectTestAction,
  deleteSubjectTestAction,
} from "@/actions/test-series-actions"

export interface MasterSimpleItem {
  id: string
  name: string
  code?: string | null
  description?: string | null
}

interface AdminTestsClientProps {
  initialTests: AdminAllSubjectTestItem[]
  masterSubjects?: MasterSimpleItem[]
  masterStandards?: MasterSimpleItem[]
  masterBoards?: MasterSimpleItem[]
}

export function AdminTestsClient({
  initialTests,
  masterSubjects = [],
  masterStandards = [],
  masterBoards = [],
}: AdminTestsClientProps) {
  const router = useRouter()
  const confirm = useConfirm()
  const [tests, setTests] =
    React.useState<AdminAllSubjectTestItem[]>(initialTests)
  const [loadingId, setLoadingId] = React.useState<string | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)

  // Metrics
  const totalTests = tests.length
  const publishedCount = tests.filter((t) => t.isPublished).length
  const bundleAttachedCount = tests.filter((t) =>
    Boolean(t.testSeriesId)
  ).length
  const uniqueSubjectsCount = new Set(tests.map((t) => t.subject)).size

  // Options: Subjects (Master combined with test data)
  const subjectOptions: DataTableFilterOption[] = React.useMemo(() => {
    const names = new Set<string>()
    masterSubjects.forEach((s) => names.add(s.name))
    tests.forEach((t) => {
      if (t.subject) names.add(t.subject)
    })

    return Array.from(names)
      .sort((a, b) => a.localeCompare(b))
      .map((sub) => {
        const master = masterSubjects.find((s) => s.name === sub)
        const count = tests.filter((t) => t.subject === sub).length
        return {
          label: sub,
          value: sub,
          count,
          hint: master?.code || undefined,
        }
      })
  }, [masterSubjects, tests])

  // Options: Standards
  const standardOptions: DataTableFilterOption[] = React.useMemo(() => {
    const names = new Set<string>()
    masterStandards.forEach((s) => names.add(s.name))
    tests.forEach((t) => {
      if (t.testSeriesStandard) names.add(t.testSeriesStandard)
    })

    return Array.from(names).map((std) => {
      const count = tests.filter((t) => {
        const tStd = (t.testSeriesStandard || "").toLowerCase()
        const title = t.title.toLowerCase()
        const target = std.toLowerCase()
        return tStd.includes(target) || title.includes(target)
      }).length
      return {
        label: std.startsWith("Class") ? std : `Class ${std}`,
        value: std,
        count,
      }
    })
  }, [masterStandards, tests])

  // Options: Boards / Streams
  const boardOptions: DataTableFilterOption[] = React.useMemo(() => {
    const names = new Set<string>()
    masterBoards.forEach((b) => names.add(b.name))
    tests.forEach((t) => {
      if (t.testSeriesStream) names.add(t.testSeriesStream)
    })

    return Array.from(names).map((board) => {
      const count = tests.filter((t) => {
        const tStream = (t.testSeriesStream || "").toLowerCase()
        const title = t.title.toLowerCase()
        const target = board.toLowerCase()
        return tStream.includes(target) || title.includes(target)
      }).length
      return {
        label: board,
        value: board,
        count,
      }
    })
  }, [masterBoards, tests])

  const handleTogglePublish = async (testItem: AdminAllSubjectTestItem) => {
    const nextState = !testItem.isPublished
    setLoadingId(testItem.id)
    try {
      const res = await togglePublishSubjectTestAction(testItem.id, nextState)
      if (res.success) {
        toast.success(
          nextState
            ? `"${testItem.title}" is now published.`
            : `"${testItem.title}" is now hidden.`
        )
        setTests((prev) =>
          prev.map((t) =>
            t.id === testItem.id ? { ...t, isPublished: nextState } : t
          )
        )
        router.refresh()
      } else {
        toast.error(res.error || "Failed to update publish status.")
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.")
    } finally {
      setLoadingId(null)
    }
  }

  const handleDeleteTest = async (testItem: AdminAllSubjectTestItem) => {
    const confirmed = await confirm({
      title: `Delete "${testItem.title}"?`,
      description: `Are you sure you want to delete the ${testItem.subject} test? This action cannot be undone.`,
      confirmText: "Delete Subject Test",
      cancelText: "Cancel",
      variant: "destructive",
      badgeText: "Permanent Deletion",
    })

    if (!confirmed) return

    setDeletingId(testItem.id)
    try {
      const res = await deleteSubjectTestAction(testItem.id)
      if (res.success) {
        toast.success(res.message || "Subject test deleted successfully.")
        setTests((prev) => prev.filter((t) => t.id !== testItem.id))
        router.refresh()
      } else if (res.data?.requiresForce) {
        const forceConfirmed = await confirm({
          title: "Force Delete Subject Test?",
          description: `⚠️ WARNING: ${res.error}\n\nAre you sure you want to FORCE delete this test along with all student submissions?`,
          confirmText: "Yes, Force Delete",
          cancelText: "Cancel",
          variant: "destructive",
          badgeText: "High Risk",
        })

        if (forceConfirmed) {
          const forceRes = await deleteSubjectTestAction(testItem.id, {
            force: true,
          })
          if (forceRes.success) {
            toast.success(
              forceRes.message || "Subject test force deleted successfully."
            )
            setTests((prev) => prev.filter((t) => t.id !== testItem.id))
            router.refresh()
          } else {
            toast.error(
              forceRes.error || "Failed to force delete subject test."
            )
          }
        }
      } else {
        toast.error(res.error || "Failed to delete subject test.")
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.")
    } finally {
      setDeletingId(null)
    }
  }

  const columns: DataTableColumn<AdminAllSubjectTestItem>[] = [
    {
      id: "title",
      header: "Subject Test",
      sortable: true,
      sortAccessor: (t) => t.title,
      searchAccessor: (t) =>
        `${t.title} ${t.subject} ${t.slug || ""} ${t.testSeriesTitle || ""} ${t.testSeriesStream || ""} ${t.testSeriesStandard || ""}`,
      cell: (t) => (
        <div className="max-w-xs space-y-0.5 whitespace-normal">
          <Link
            href={`/admin/tests/${t.id}`}
            className="line-clamp-1 block text-xs font-bold text-foreground transition-colors hover:text-primary"
            title={t.title}
          >
            {t.title}
          </Link>
          {t.questionPaperUrl && (
            <a
              href={t.questionPaperUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary hover:underline"
            >
              <FileText className="h-3 w-3" /> Question Paper PDF
            </a>
          )}
        </div>
      ),
    },

    {
      id: "testSeries",
      header: "Attached Series Bundle",
      sortable: true,
      sortAccessor: (t) => t.testSeriesTitle || "",
      cell: (t) =>
        t.testSeriesTitle ? (
          <div className="max-w-xs space-y-0.5 text-wrap whitespace-normal">
            <Link
              href={`/admin/test-series/${t.testSeriesId}`}
              className="line-clamp-1 inline-flex items-center gap-1 text-xs font-semibold text-wrap text-primary hover:underline"
              title={t.testSeriesTitle}
            >
              <Layers className="h-3 w-3 shrink-0" />
              <span className="truncate">{t.testSeriesTitle}</span>
            </Link>
          </div>
        ) : (
          <span className="text-[11px] font-medium whitespace-nowrap text-muted-foreground italic">
            Standalone Test
          </span>
        ),
    },
    {
      id: "marksAndDuration",
      header: "Marks & Time",
      sortable: true,
      sortAccessor: (t) => t.maxMarks,
      cell: (t) => (
        <div className="space-y-0.5 whitespace-nowrap">
          <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
            <Award className="h-3 w-3 text-primary" /> {t.maxMarks} Marks
          </span>
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3 text-muted-foreground" />{" "}
            {t.durationMinutes} Mins
          </span>
        </div>
      ),
    },
    {
      id: "pricing",
      header: "Pricing",
      sortable: true,
      sortAccessor: (t) => t.price,
      cell: (t) => (
        <div className="space-y-0.5 whitespace-nowrap">
          {t.isStandalone ? (
            <>
              <span className="text-xs font-bold text-foreground">
                {t.price > 0 ? `₹${t.price}` : "Free"}
              </span>
              <p className="text-[9px] text-muted-foreground">Standalone</p>
            </>
          ) : (
            <Badge variant="secondary" className="text-[10px]">
              Bundle Only
            </Badge>
          )}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      sortable: true,
      sortAccessor: (t) => (t.isPublished ? "PUBLISHED" : "DRAFT"),
      cell: (t) => (
        <button
          type="button"
          disabled={loadingId === t.id}
          onClick={() => handleTogglePublish(t)}
          className="cursor-pointer"
          title="Click to toggle publish status"
        >
          {t.isPublished ? (
            <Badge className="gap-1 border-emerald-500/20 bg-emerald-500/10 text-[10px] font-bold whitespace-nowrap text-emerald-600 hover:bg-emerald-500/20">
              <Globe className="h-3 w-3" /> Live
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 text-[10px] whitespace-nowrap text-muted-foreground hover:bg-muted"
            >
              <EyeOff className="h-3 w-3" /> Draft
            </Badge>
          )}
        </button>
      ),
    },
    {
      id: "action",
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right whitespace-nowrap",
      cell: (t) => (
        <div className="flex items-center justify-end gap-1.5">
          {t.slug && (
            <Link href={`/tests/${t.slug}`} target="_blank">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                title="Preview public candidate test overview page"
              >
                <ExternalLink className="mr-1 h-3.5 w-3.5" /> View
              </Button>
            </Link>
          )}
          <Link href={`/admin/tests/${t.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-2.5 text-xs font-medium"
            >
              <Edit2 className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            disabled={deletingId === t.id}
            onClick={() => handleDeleteTest(t)}
            className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40"
            title="Delete subject test"
          >
            {deletingId === t.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ),
    },
  ]

  const filters: DataTableFilter<AdminAllSubjectTestItem>[] = [
    {
      id: "subject",
      label: "Subject",
      accessor: (t) => t.subject,
      options: subjectOptions,
      searchable: true,
      searchPlaceholder: "Search master subjects...",
      allLabel: "All Subjects",
      width: "w-64",
    },
    {
      id: "standard",
      label: "Standard",
      accessor: (t) => t.testSeriesStandard || "OTHER",
      options: standardOptions,
      searchable: true,
      searchPlaceholder: "Search standard...",
      allLabel: "All Standards",
      width: "w-56",
    },
    {
      id: "board",
      label: "Board",
      accessor: (t) => t.testSeriesStream || "CBSE",
      options: boardOptions,
      searchable: true,
      searchPlaceholder: "Search board/stream...",
      allLabel: "All Boards",
      width: "w-56",
    },
    {
      id: "format",
      label: "Format",
      accessor: (t) => (t.testSeriesId ? "BUNDLE" : "STANDALONE"),
      options: [
        { label: "All Formats", value: "ALL" },
        { label: "Bundle Attached", value: "BUNDLE" },
        { label: "Standalone Only", value: "STANDALONE" },
      ],
    },
    {
      id: "status",
      label: "Status",
      accessor: (t) => (t.isPublished ? "PUBLISHED" : "DRAFT"),
      options: [
        { label: "All Statuses", value: "ALL" },
        { label: "Live Published", value: "PUBLISHED" },
        { label: "Draft", value: "DRAFT" },
      ],
    },
  ]

  return (
    <div className="w-full space-y-5">
      <PageHeader
        icon={FileText}
        title="Subject Tests Catalog"
        subtitle="Manage all individual subject exam papers across classes and bundles (Mathematics, Science, Marathi, Urdu, etc.)."
        showRefresh
      >
        <Link href="/admin/tests/new">
          <Button
            size="sm"
            className="h-9 rounded-md bg-[#145DEB] px-3.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0F4DC7]"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create Subject Test
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <KpiStatCard
          label="Total Subject Tests"
          value={totalTests}
          icon={FileText}
          variant="blue"
        />
        <KpiStatCard
          label="Live Published"
          value={publishedCount}
          icon={Globe}
          variant="emerald"
        />
        <KpiStatCard
          label="Attached to Bundles"
          value={bundleAttachedCount}
          icon={Layers}
          variant="indigo"
        />
        <KpiStatCard
          label="Unique Subjects"
          value={uniqueSubjectsCount}
          icon={BookOpenCheck}
          variant="amber"
        />
      </div>

      {/* Unified High-Density DataTable */}
      <DataTable<AdminAllSubjectTestItem>
        data={tests}
        columns={columns}
        filters={filters}
        keyExtractor={(t) => t.id}
        searchPlaceholder="Search test title, subject, series, board..."
        defaultSortColumn="title"
        defaultSortDirection="asc"
        defaultPageSize={15}
        emptyTitle="No subject tests found"
        emptyDescription="Try adjusting your search query, master filters, or create a new subject test."
        emptyAction={
          <Link href="/admin/tests/new">
            <Button size="sm" className="h-8 text-xs font-semibold">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Create First Subject Test
            </Button>
          </Link>
        }
      />
    </div>
  )
}
