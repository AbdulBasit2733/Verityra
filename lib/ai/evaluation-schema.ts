import { z } from "zod"

export const questionScoreSchema = z.object({
  questionNumber: z.string(),
  maxMarks: z.number().min(0),
  marksAwarded: z.number().min(0),
  feedback: z.string(),
  missingConcepts: z.string().optional().default(""),
  isLegible: z.boolean().default(true),
  isUncertain: z.boolean().default(false),
})

export const aiEvaluationResponseSchema = z.object({
  generalFeedback: z.string(),
  legibilityWarning: z.boolean().default(false),
  uncertaintyFlag: z.boolean().default(false),
  questions: z.array(questionScoreSchema),
})

export type AiEvaluationResult = z.infer<typeof aiEvaluationResponseSchema>
export type QuestionScore = z.infer<typeof questionScoreSchema>
