import { redirect } from "next/navigation"
import { requireStudent } from "@/lib/auth-guard"
import { prisma } from "@/lib/prisma"
import {
  StudentWorkspaceClient,
  WorkspaceSubmissionItem,
} from "@/components/student/workspace/student-workspace-client"
import { normalizePrivateFileUrl } from "@/lib/supabase"

export const dynamic = "force-dynamic"

export default async function StudentTestWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await requireStudent(`/student/tests/${id}`)

  let registration: any = null
  let testSeries: any = null

  try {
    registration = await prisma.testRegistration.findFirst({
      where: {
        userId: user.id,
        OR: [{ testSeriesId: id }, { testSeries: { slug: id } }],
      },
      select: {
        id: true,
        attemptsUsed: true,
        maxAttempts: true,
        testSeries: {
          select: {
            id: true,
            title: true,
            maxMarks: true,
            durationMinutes: true,
            studentInstructions: true,
            papers: {
              select: {
                id: true,
                title: true,
                fileUrl: true,
              },
            },
            templates: {
              select: {
                id: true,
                title: true,
                fileUrl: true,
              },
            },
          },
        },
        submissions: {
          select: {
            id: true,
            attemptNumber: true,
            status: true,
            fileUrl: true,
            submittedAt: true,
            evaluation: {
              select: {
                id: true,
                totalMarksAwarded: true,
                maxMarks: true,
                percentage: true,
                generalFeedback: true,
                legibilityWarning: true,
                uncertaintyFlag: true,
                questions: {
                  orderBy: { questionNumber: "asc" },
                  select: {
                    id: true,
                    questionNumber: true,
                    maxMarks: true,
                    marksAwarded: true,
                    feedback: true,
                    missingConcepts: true,
                    scoreBand: true,
                    scoreExplanation: true,
                    strengths: true,
                    examinerExpectation: true,
                    improvementAdvice: true,
                    isLegible: true,
                  },
                },
              },
            },
            evaluationRuns: {
              orderBy: { runNumber: "asc" },
              select: {
                id: true,
                runNumber: true,
                trigger: true,
                status: true,
                totalMarksAwarded: true,
                maxMarks: true,
                questions: {
                  orderBy: { questionNumber: "asc" },
                  select: {
                    id: true,
                    questionNumber: true,
                    maxMarks: true,
                    marksAwarded: true,
                    scoreExplanation: true,
                    missingConcepts: true,
                    strengths: true,
                    examinerExpectation: true,
                    improvementAdvice: true,
                    isLegible: true,
                  },
                },
              },
            },
          },
          orderBy: { attemptNumber: "desc" },
        },
      },
    })

    if (registration) {
      testSeries = registration.testSeries
    }
  } catch (error) {
    console.error("[StudentTestWorkspacePage] Database query error:", error)
  }

  // Fallback demo mock if DB is offline
  if (!registration) {
    if (id.startsWith("demo-") || id.startsWith("upsc-") || id === "test-1") {
      testSeries = {
        id,
        title: "UPSC Civil Services General Studies Paper I Mock",
        maxMarks: 250,
        durationMinutes: 180,
        maxAttempts: 3,
        studentInstructions: `1. Solve all 20 questions sequentially.
2. Use printable answer sheet with official margins.
3. Keep handwriting clean and legible.`,
        papers: [
          {
            id: "paper-1",
            title: "UPSC GS Paper I Official Mock Paper (PDF)",
            fileUrl: "/api/files/download?file=papers/upsc-paper.pdf",
            maxMarks: 250,
          },
        ],
        templates: [
          {
            id: "tpl-1",
            title: "Standard Margin Answer Sheet Template (24 Pages)",
            fileUrl: "/api/files/download?file=templates/upsc-template.pdf",
            templateRequired: true,
          },
        ],
      }

      registration = {
        id: "demo-reg-1",
        attemptsUsed: 1,
        maxAttempts: 3,
        submissions: [
          {
            id: "demo-sub-1",
            attemptNumber: 1,
            status: "COMPLETED",
            fileUrl:
              "/api/files/download?file=submissions/demo/sample-attempt.pdf",
            submittedAt: new Date(Date.now() - 3600000 * 5),
            evaluation: {
              id: "eval-1",
              totalMarksAwarded: 184.5,
              maxMarks: 250,
              percentage: 73.8,
              generalFeedback:
                "Commendable conceptual clarity. Excellent structure with introductory definitions and tabular comparisons in Question 2. Improve conclusion depth in Question 3.",
              legibilityWarning: false,
              uncertaintyFlag: false,
              questions: [
                {
                  id: "q-1",
                  questionNumber: "Q1",
                  maxMarks: 10,
                  marksAwarded: 7.5,
                  feedback:
                    "Strong historical framing and accurate chronology.",
                  missingConcepts:
                    "Could cite the specific rock edict inscriptions.",
                  isLegible: true,
                },
                {
                  id: "q-2",
                  questionNumber: "Q2",
                  maxMarks: 15,
                  marksAwarded: 11.0,
                  feedback:
                    "Clear geographical analysis with neat climatic flow diagram.",
                  missingConcepts:
                    "Omitted microclimatic impact on coastal plains.",
                  isLegible: true,
                },
                {
                  id: "q-3",
                  questionNumber: "Q3",
                  maxMarks: 15,
                  marksAwarded: 10.5,
                  feedback:
                    "Well-structured arguments regarding urban demographic pressures.",
                  missingConcepts:
                    "Could propose actionable civic governance interventions.",
                  isLegible: true,
                },
              ],
            },
          },
        ],
      }
    } else {
      redirect(`/tests/${id}`)
    }
  }

  const serializedSubmissions: WorkspaceSubmissionItem[] = (
    registration.submissions || []
  ).map((sub: any) => ({
    id: sub.id,
    attemptNumber: sub.attemptNumber,
    status: sub.status,
    fileUrl: normalizePrivateFileUrl(sub.fileUrl),
    submittedAt: new Date(sub.submittedAt).toISOString(),
    evaluation: sub.evaluation
      ? {
          id: sub.evaluation.id,
          totalMarksAwarded: sub.evaluation.totalMarksAwarded,
          maxMarks: sub.evaluation.maxMarks,
          percentage: sub.evaluation.percentage,
          generalFeedback: sub.evaluation.generalFeedback,
          legibilityWarning: Boolean(sub.evaluation.legibilityWarning),
          uncertaintyFlag: Boolean(sub.evaluation.uncertaintyFlag),
          questions: (sub.evaluation.questions || []).map((q: any) => ({
            id: q.id,
            questionNumber: q.questionNumber,
            maxMarks: q.maxMarks,
            marksAwarded: q.marksAwarded,
            feedback: q.feedback,
            missingConcepts: q.missingConcepts || null,
            isLegible: q.isLegible !== false,
            scoreBand: q.scoreBand,
            scoreExplanation: q.scoreExplanation,
            strengths: q.strengths,
            examinerExpectation: q.examinerExpectation,
            improvementAdvice: q.improvementAdvice,
          })),
        }
      : null,
    evaluationRuns: sub.evaluation
      ? (sub.evaluationRuns || []).map((run: any) => ({
          id: run.id,
          runNumber: run.runNumber,
          trigger: run.trigger,
          status: run.status,
          totalMarksAwarded: run.totalMarksAwarded,
          maxMarks: run.maxMarks,
          questions: (run.questions || []).map((q: any) => ({
            id: q.id,
            questionNumber: q.questionNumber,
            maxMarks: q.maxMarks,
            marksAwarded: q.marksAwarded,
            feedback: q.scoreExplanation,
            missingConcepts: q.missingConcepts || null,
            strengths: q.strengths,
            examinerExpectation: q.examinerExpectation,
            improvementAdvice: q.improvementAdvice,
            isLegible: q.isLegible !== false,
          })),
        }))
      : [],
  }))

  // Note: Only studentInstructions are passed — privateEvaluationInstructions are never projected to student views.
  return (
    <StudentWorkspaceClient
      testSeriesId={testSeries.id}
      title={testSeries.title}
      maxMarks={testSeries.maxMarks || 250}
      durationMinutes={testSeries.durationMinutes || 180}
      studentInstructions={
        testSeries.studentInstructions ||
        "1. Number all responses clearly inside the left margin.\n2. Scan all pages upright into a single clear PDF before uploading."
      }
      attemptsUsed={registration.attemptsUsed}
      maxAttempts={registration.maxAttempts}
      papers={(testSeries.papers || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        fileUrl: normalizePrivateFileUrl(p.fileUrl) || "",
      }))}
      templates={(testSeries.templates || []).map((t: any) => ({
        id: t.id,
        title: t.title,
        fileUrl: normalizePrivateFileUrl(t.fileUrl) || "",
      }))}
      submissions={serializedSubmissions}
    />
  )
}
