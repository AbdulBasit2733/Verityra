import { Download, FileText, PenLine, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import type { StudentDownloadResource } from "./types"

export function DownloadResourceCard({ resource }: { resource: StudentDownloadResource }) {
  const isTemplate = resource.type === "template"
  const isQuestionPaper = resource.type === "question-paper"

  const typeLabel = isTemplate
    ? "Template"
    : isQuestionPaper
    ? resource.category || "Question Paper"
    : "Paper"

  const downloadUrl = `${resource.fileUrl}${resource.fileUrl.includes("?") ? "&" : "?"}download=1`

  return (
    <Card className="flex flex-col h-full border-[#DCE7FA] bg-white shadow-xs hover:shadow-md transition-shadow">
      <CardHeader className="gap-3 p-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F6FF] text-[#145DEB] border border-[#BFD5FA]/50">
            {isTemplate ? (
              <PenLine className="h-5 w-5" aria-hidden="true" />
            ) : (
              <FileText className="h-5 w-5" aria-hidden="true" />
            )}
          </span>
          <Badge
            variant={isQuestionPaper ? "secondary" : "outline"}
            className="rounded-full text-[11px] font-bold capitalize bg-[#F1F6FF] text-[#145DEB] border-[#BFD5FA]/60"
          >
            {typeLabel}
          </Badge>
        </div>
        <div>
          <p className="font-bold leading-snug text-[#071B3A] line-clamp-2">{resource.title}</p>
          {resource.description && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#64748B]">
              {resource.description}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-5 py-2 mt-auto text-xs text-[#64748B]">
        {isQuestionPaper ? "Verified PDF Question Paper" : `Version ${resource.version} · PDF resource`}
      </CardContent>

      <CardFooter className="flex gap-2 border-t border-[#DCE7FA] p-4 bg-slate-50/50">
        <a href={resource.fileUrl} target="_blank" rel="noreferrer" className="flex-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full h-10 rounded-xl border-[#DCE7FA] text-xs font-semibold text-[#145DEB] hover:bg-[#F1F6FF]"
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Preview
          </Button>
        </a>

        <a href={downloadUrl} download className="flex-1">
          <Button
            size="sm"
            className="w-full h-10 rounded-xl bg-[#145DEB] hover:bg-[#0F4DC7] text-white text-xs font-semibold shadow-xs"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" /> Download
          </Button>
        </a>
      </CardFooter>
    </Card>
  )
}
