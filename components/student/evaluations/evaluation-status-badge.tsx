import { CheckCircle2, Clock3, Info, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
  COMPLETED: { label: "Evaluated", icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300" },
  ADJUSTED: { label: "Reviewed", icon: CheckCircle2, className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300" },
  PENDING: { label: "In review", icon: Clock3, className: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300" },
  PROCESSING: { label: "Processing", icon: Clock3, className: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-300" },
  FAILED: { label: "Needs attention", icon: XCircle, className: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300" },
}

export function EvaluationStatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { label: status.replaceAll("_", " "), icon: Info, className: "border-border bg-muted text-muted-foreground" }
  const Icon = config.icon
  return <Badge variant="outline" className={`gap-1.5 rounded-full text-[11px] font-semibold capitalize ${config.className}`}><Icon className="h-3.5 w-3.5" aria-hidden="true" />{config.label}</Badge>
}
