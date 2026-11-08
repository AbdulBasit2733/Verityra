"use client"

import * as React from "react"
import { Accordion } from "@/components/ui/accordion"
import { PageHeader } from "@/components/ui/page-header"
import { Download } from "lucide-react"
import { DownloadEmptyState } from "./download-empty-state"
import { DownloadFilterBar } from "./download-filter-bar"
import { DownloadResourceGroup } from "./download-resource-group"
import type { StudentDownloadGroup } from "./types"

export function StudentDownloadsClient({ groups }: { groups: StudentDownloadGroup[] }) {
  const [query, setQuery] = React.useState("")
  const filtered = React.useMemo(() => groups.map((group) => ({ ...group, resources: group.resources.filter((resource) => !query.trim() || `${resource.title} ${resource.description || ""}`.toLowerCase().includes(query.trim().toLowerCase())) })).filter((group) => group.resources.length > 0), [groups, query])
  return <div className="space-y-6"><PageHeader icon={Download} title="Downloads" subtitle="Keep your registered test papers and answer-sheet templates ready for practice." showRefresh /><DownloadFilterBar query={query} onQueryChange={setQuery} />{filtered.length ? <><div className="hidden space-y-8 md:block">{filtered.map((group) => <DownloadResourceGroup key={group.testSeriesId} group={group} />)}</div><div className="md:hidden"><Accordion className="gap-2" multiple>{filtered.map((group) => <DownloadResourceGroup key={group.testSeriesId} group={group} accordion />)}</Accordion></div></> : <DownloadEmptyState filtered={Boolean(query.trim())} />}<p className="text-xs leading-5 text-muted-foreground">Resources are limited to active registrations. Model answers, rubrics, and evaluator-only files are never included.</p></div>
}
