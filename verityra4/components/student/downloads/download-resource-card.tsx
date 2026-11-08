import { Download, FileText, PenLine } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { StudentDownloadResource } from "./types"

export function DownloadResourceCard({ resource }: { resource: StudentDownloadResource }) {
  const isTemplate = resource.type === "template"
  return <Card className="h-full"><CardHeader className="gap-3"><div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-primary">{isTemplate ? <PenLine className="h-5 w-5" aria-hidden="true" /> : <FileText className="h-5 w-5" aria-hidden="true" />}</span><Badge variant="outline" className="rounded-full capitalize">{resource.type}</Badge></div><div><p className="font-bold leading-6 text-foreground">{resource.title}</p>{resource.description && <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">{resource.description}</p>}</div></CardHeader><CardContent className="text-xs text-muted-foreground">Version {resource.version} · PDF resource</CardContent><CardFooter className="border-t border-border"><Button render={<a href={resource.fileUrl} download />} className="h-11 w-full gap-2"><Download className="h-4 w-4" aria-hidden="true" />Download PDF</Button></CardFooter></Card>
}
