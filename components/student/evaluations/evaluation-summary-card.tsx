import Link from "next/link"
import { ArrowRight, BookOpen, CalendarDays, FileCheck2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { FormattedDate } from "@/components/ui/date-picker"
import { EvaluationStatusBadge } from "./evaluation-status-badge"
import type { StudentEvaluationRow } from "./types"

export function EvaluationSummaryCard({ evaluation }: { evaluation: StudentEvaluationRow }) {
  const hasScore = evaluation.score !== null && evaluation.maxMarks !== null && evaluation.percentage !== null
  return (
    <Card className="h-full transition-shadow hover:shadow-card-hover">
      <CardHeader className="gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"><FileCheck2 className="h-5 w-5" aria-hidden="true" /></span>
            <div className="min-w-0"><p className="truncate font-bold text-foreground">{evaluation.testTitle}</p><p className="mt-1 text-xs text-muted-foreground">Attempt {evaluation.attemptNumber}</p></div>
          </div>
          <EvaluationStatusBadge status={evaluation.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end justify-between gap-4 rounded-xl bg-muted/60 p-4">
          <div><p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Result</p><p className="mt-1 text-2xl font-extrabold tabular-nums text-primary">{hasScore ? `${evaluation.score} / ${evaluation.maxMarks}` : "—"}</p></div>
          {hasScore && <Badge variant="secondary" className="tabular-nums">{evaluation.percentage?.toFixed(1)}%</Badge>}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" aria-hidden="true" /><FormattedDate date={evaluation.submittedAt} /></span><span className="inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" aria-hidden="true" />{evaluation.questionCount} questions</span></div>
        {(evaluation.legibilityWarning || evaluation.uncertaintyFlag) && <p className="text-xs font-medium text-amber-700 dark:text-amber-300">Your report includes a review note. Open the evaluation for details.</p>}
      </CardContent>
      <CardFooter className="border-t border-border"><Button render={<Link href={`/student/evaluations/${evaluation.submissionId}`} />} className="h-11 w-full gap-2">View evaluation<ArrowRight className="h-4 w-4" aria-hidden="true" /></Button></CardFooter>
    </Card>
  )
}
