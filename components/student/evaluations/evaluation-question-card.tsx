import { AlertTriangle, CheckCircle2, Lightbulb, Target } from "lucide-react"
import { AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { StudentEvaluationQuestion } from "./types"

export function EvaluationQuestionCard({ question, accordion = false }: { question: StudentEvaluationQuestion; accordion?: boolean }) {
  const percentage = question.maxMarks > 0 ? (question.marksAwarded / question.maxMarks) * 100 : 0
  const content = <div className="space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2"><Badge variant="secondary" className="font-mono">{question.questionNumber}</Badge><Badge variant="outline" className="capitalize">{question.scoreBand.toLowerCase()}</Badge></div><p className="font-bold tabular-nums text-foreground">{question.marksAwarded} / {question.maxMarks}</p></div><Progress value={percentage} className="h-2" /><div className="grid gap-4 sm:grid-cols-2"><FeedbackBlock icon={Target} label="Rubric feedback" text={question.feedback} /><FeedbackBlock icon={CheckCircle2} label="What worked" text={question.strengths} /><FeedbackBlock icon={Lightbulb} label="Improve next" text={question.improvementAdvice} /><FeedbackBlock icon={Target} label="Expected in the answer" text={question.examinerExpectation} /></div>{question.missingConcepts && <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"><p className="font-semibold">Missing concepts</p><p className="mt-1">{question.missingConcepts}</p></div>}{(!question.isLegible || question.isUncertain) && <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /><span>{question.isLegible ? "This question has an uncertainty note." : "Some handwriting was difficult to read for this question."}</span></div>}</div>
  if (accordion) return <AccordionItem value={question.id}><AccordionTrigger><span className="flex min-w-0 items-center gap-3"><span className="font-mono text-primary">{question.questionNumber}</span><span className="truncate text-sm">{question.marksAwarded} / {question.maxMarks} marks</span></span></AccordionTrigger><AccordionContent>{content}</AccordionContent></AccordionItem>
  return <Card><CardContent className="p-5">{content}</CardContent></Card>
}

function FeedbackBlock({ icon: Icon, label, text }: { icon: typeof Target; label: string; text: string }) {
  return <div className="space-y-1.5"><p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />{label}</p><p className="text-sm leading-6 text-foreground">{text}</p></div>
}
