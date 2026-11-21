"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import { useConfirm } from "@/components/providers/confirm-dialog-provider"
import { toast } from "@/components/ui/sonner"
import {
  FileText,
  Plus,
  Search,
  Layers,
  Award,
  Clock,
  Globe,
  EyeOff,
  ExternalLink,
  BookOpenCheck,
} from "lucide-react"
import {
  AdminAllSubjectTestItem,
  togglePublishSubjectTestAction,
} from "@/actions/test-series-actions"

interface AdminTestsClientProps {
  initialTests: AdminAllSubjectTestItem[]
}

export function AdminTestsClient({ initialTests }: AdminTestsClientProps) {
  const router = useRouter()
  const [tests, setTests] = React.useState<AdminAllSubjectTestItem[]>(initialTests)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [subjectFilter, setSubjectFilter] = React.useState("ALL")
  const [loadingId, setLoadingId] = React.useState<string | null>(null)

  // Metrics
  const totalTests = tests.length
  const publishedCount = tests.filter((t) => t.isPublished).length
  const bundleAttachedCount = tests.filter((t) => Boolean(t.testSeriesId)).length
  const uniqueSubjectsCount = new Set(tests.map((t) => t.subject)).size

  // Subjects for quick filter
  const subjectsList = React.useMemo(() => {
    return Array.from(new Set(tests.map((t) => t.subject).filter(Boolean)))
  }, [tests])

  // Filtering
  const q = searchQuery.trim().toLowerCase()
  const filteredTests = React.useMemo(() => {
    return tests.filter((t) => {
      const matchesSearch =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        (t.testSeriesTitle && t.testSeriesTitle.toLowerCase().includes(q))
      const matchesSubject = subjectFilter === "ALL" || t.subject === subjectFilter
      return matchesSearch && matchesSubject
    })
  }, [tests, q, subjectFilter])

  const handleTogglePublish = async (testItem: AdminAllSubjectTestItem) => {
    const nextState = !testItem.isPublished
    setLoadingId(testItem.id)
    try {
      const res = await togglePublishSubjectTestAction(testItem.id, nextState)
      if (res.success) {
        toast.success(
          nextState ? `"${testItem.title}" is now published.` : `"${testItem.title}" is now hidden.`
        )
        setTests((prev) =>
          prev.map((t) => (t.id === testItem.id ? { ...t, isPublished: nextState } : t))
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

  return (
    <div className="w-full space-y-6">
      <PageHeader
        icon={FileText}
        title="Subject Tests Catalog"
        subtitle="Manage all individual subject exam papers across classes and bundles (Mathematics, Science, Physics, etc.)."
        showRefresh
      >
        <Link href="/admin/tests/new">
          <Button
            size="sm"
            className="h-10 rounded-md bg-[#145DEB] px-4 text-xs font-semibold text-white shadow-xs hover:bg-[#0F4DC7]"
          >
            <Plus className="mr-1.5 h-4 w-4" /> Create Subject Test
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setSubjectFilter("ALL")}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              subjectFilter === "ALL"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            All Subjects
          </button>
          {subjectsList.map((sub) => (
            <button
              key={sub}
              type="button"
              onClick={() => setSubjectFilter(sub)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                subjectFilter === sub
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search test title, subject, series..."
            className="h-9 pl-8 text-xs bg-card"
          />
        </div>
      </div>

      {/* High-density Non-Card Table */}
      <div className="rounded-lg border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
              <tr>
                <th className="px-5 py-3.5">Subject Test</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Attached Test Series Bundle</th>
                <th className="px-4 py-3.5">Marks & Duration</th>
                <th className="px-4 py-3.5">Pricing</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTests.length > 0 ? (
                filteredTests.map((t) => (
                  <tr key={t.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 font-bold text-foreground max-w-xs">
                      <div className="space-y-0.5">
                        <p className="line-clamp-1">{t.title}</p>
                        {t.questionPaperUrl && (
                          <a
                            href={t.questionPaperUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-semibold"
                          >
                            <FileText className="h-3 w-3" /> View Question Paper PDF
                          </a>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant="outline" className="text-[11px] font-semibold bg-muted/30">
                        {t.subject}
                      </Badge>
                    </td>

                    <td className="px-4 py-4 max-w-xs">
                      {t.testSeriesTitle ? (
                        <Link
                          href={`/admin/test-series/${t.testSeriesId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline truncate"
                        >
                          <Layers className="h-3 w-3 shrink-0" />
                          <span className="truncate">{t.testSeriesTitle}</span>
                        </Link>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-medium">
                          Standalone Test (No Bundle)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="space-y-0.5">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Award className="h-3 w-3 text-primary" /> {t.maxMarks} Marks
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground text-[11px]">
                          <Clock className="h-3 w-3 text-muted-foreground" /> {t.durationMinutes} Mins
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      {t.isStandalone ? (
                        <div className="space-y-0.5">
                          <span className="font-bold text-foreground">
                            {t.price > 0 ? `₹${t.price}` : "Free"}
                          </span>
                          <p className="text-[10px] text-muted-foreground">Standalone purchase</p>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">
                          Bundle Only
                        </Badge>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        type="button"
                        disabled={loadingId === t.id}
                        onClick={() => handleTogglePublish(t)}
                        className="cursor-pointer"
                        title="Click to toggle publish status"
                      >
                        {t.isPublished ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] font-bold gap-1 hover:bg-emerald-500/20">
                            <Globe className="h-3 w-3" /> Published
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-[10px] gap-1 hover:bg-muted">
                            <EyeOff className="h-3 w-3" /> Draft
                          </Badge>
                        )}
                      </button>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {t.testSeriesId && (
                        <Link href={`/admin/test-series/${t.testSeriesId}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-primary hover:bg-primary/10"
                          >
                            <ExternalLink className="h-3.5 w-3.5 mr-1" /> View Series
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    No subject tests found. Click &quot;Create Subject Test&quot; to add one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
