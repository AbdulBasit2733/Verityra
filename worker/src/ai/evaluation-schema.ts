import { z } from "zod"

export const scoreBandEnum = z.enum(["GOOD", "PARTIAL", "WEAK"])
export type ScoreBand = z.infer<typeof scoreBandEnum>

export const questionEvaluationSchema = z.object({
  questionNumber: z.string().min(1),
  maxMarks: z.number().positive(),
  marksAwarded: z.number().min(0),
  scoreBand: scoreBandEnum.default("PARTIAL"),
  scoreExplanation: z.string().min(1),
  strengths: z.string().optional(),
  feedback: z.string().min(1),
  missingConcepts: z.string().nullable().optional(),
  examinerExpectation: z.string().optional(),
  improvementAdvice: z.string().optional(),
  isLegible: z.boolean().default(true),
  isUncertain: z.boolean().default(false),
})

export type QuestionEvaluationResult = z.infer<typeof questionEvaluationSchema>

export const aiEvaluationResponseSchema = z.object({
  generalFeedback: z.string().min(1),
  legibilityWarning: z.boolean().default(false),
  uncertaintyFlag: z.boolean().default(false),
  questions: z.array(questionEvaluationSchema).min(1),
})

export type AiEvaluationResult = z.infer<typeof aiEvaluationResponseSchema>
