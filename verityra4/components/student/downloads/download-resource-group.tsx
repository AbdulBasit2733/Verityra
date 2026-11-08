import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DownloadResourceCard } from "./download-resource-card"
import type { StudentDownloadGroup } from "./types"

export function DownloadResourceGroup({ group, accordion = false }: { group: StudentDownloadGroup; accordion?: boolean }) {
  const content = <div className="grid gap-4 sm:grid-cols-2">{group.resources.map((resource) => <DownloadResourceCard key={resource.id} resource={resource} />)}</div>
  if (accordion) return <AccordionItem value={group.testSeriesId}><AccordionTrigger><span className="truncate text-left">{group.testTitle}<span className="ml-2 text-xs font-normal text-muted-foreground">{group.resources.length} files</span></span></AccordionTrigger><AccordionContent>{content}</AccordionContent></AccordionItem>
  return <section className="space-y-3"><div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-foreground">{group.testTitle}</h2><span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{group.resources.length} files</span></div>{content}</section>
}
