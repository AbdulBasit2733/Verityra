"use client"

import * as React from "react"
import { Accordion } from "@/components/ui/accordion"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { Download, FileText, BookOpen, Layers } from "lucide-react"
import { DownloadEmptyState } from "./download-empty-state"
import { DownloadFilterBar } from "./download-filter-bar"
import { DownloadResourceGroup } from "./download-resource-group"
import type { StudentDownloadGroup } from "./types"

export function StudentDownloadsClient({
  groups,
}: {
  groups: StudentDownloadGroup[]
}) {
  const [query, setQuery] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<
    "ALL" | "REGISTERED" | "LIBRARY"
  >("ALL")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()

    return groups
      .filter((group) => {
        if (activeTab === "REGISTERED") return !group.isQuestionPaperLibrary
        if (activeTab === "LIBRARY") return group.isQuestionPaperLibrary
        return true
      })
      .map((group) => ({
        ...group,
        resources: group.resources.filter(
          (resource) =>
            !q ||
            `${resource.title} ${resource.description || ""} ${resource.category || ""}`
              .toLowerCase()
              .includes(q)
        ),
      }))
      .filter((group) => group.resources.length > 0)
  }, [groups, query, activeTab])

  const totalRegisteredFiles = groups
    .filter((g) => !g.isQuestionPaperLibrary)
    .reduce((sum, g) => sum + g.resources.length, 0)

  const totalLibraryFiles = groups
    .filter((g) => g.isQuestionPaperLibrary)
    .reduce((sum, g) => sum + g.resources.length, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Download}
        title="Downloads Hub"
        subtitle="Keep your registered test papers, margin answer sheets, and practice question papers ready for offline practice."
        showRefresh
      />

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#DCE7FA] pb-3">
        <Button
          type="button"
          size="sm"
          variant={activeTab === "ALL" ? "default" : "outline"}
          onClick={() => setActiveTab("ALL")}
          className={`rounded-md text-xs font-semibold ${
            activeTab === "ALL"
              ? "bg-[#145DEB] text-white"
              : "border-[#DCE7FA] text-slate-700 hover:bg-[#F1F6FF]"
          }`}
        >
          <Layers className="mr-1.5 h-3.5 w-3.5" /> All Resources (
          {totalRegisteredFiles + totalLibraryFiles})
        </Button>

        <Button
          type="button"
          size="sm"
          variant={activeTab === "REGISTERED" ? "default" : "outline"}
          onClick={() => setActiveTab("REGISTERED")}
          className={`rounded-md text-xs font-semibold ${
            activeTab === "REGISTERED"
              ? "bg-[#145DEB] text-white"
              : "border-[#DCE7FA] text-slate-700 hover:bg-[#F1F6FF]"
          }`}
        >
          <BookOpen className="mr-1.5 h-3.5 w-3.5" /> Enrolled Tests (
          {totalRegisteredFiles})
        </Button>

        <Button
          type="button"
          size="sm"
          variant={activeTab === "LIBRARY" ? "default" : "outline"}
          onClick={() => setActiveTab("LIBRARY")}
          className={`rounded-md text-xs font-semibold ${
            activeTab === "LIBRARY"
              ? "bg-[#145DEB] text-white"
              : "border-[#DCE7FA] text-slate-700 hover:bg-[#F1F6FF]"
          }`}
        >
          <FileText className="mr-1.5 h-3.5 w-3.5" /> Question Papers Library (
          {totalLibraryFiles})
        </Button>
      </div>

      <DownloadFilterBar query={query} onQueryChange={setQuery} />

      {filtered.length ? (
        <>
          <div className="hidden space-y-8 md:block">
            {filtered.map((group) => (
              <DownloadResourceGroup key={group.testSeriesId} group={group} />
            ))}
          </div>
          <div className="md:hidden">
            <Accordion className="gap-2" multiple>
              {filtered.map((group) => (
                <DownloadResourceGroup
                  key={group.testSeriesId}
                  group={group}
                  accordion
                />
              ))}
            </Accordion>
          </div>
        </>
      ) : (
        <DownloadEmptyState filtered={Boolean(query.trim())} />
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        All official materials and practice question papers are available for
        authenticated offline preparation. Model answers and private evaluator
        criteria are strictly confidential.
      </p>
    </div>
  )
}
