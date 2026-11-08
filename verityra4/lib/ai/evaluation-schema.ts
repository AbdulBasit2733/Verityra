import { z } from "zod"

export const questionScoreSchema = z.object({
  questionNumber: z.string(),
  maxMarks: z.number().min(0),
  marksAwarded: z.number().min(0),
  feedback: z.string(),
  missingConcepts: z.string().optional().default(""),
  // Gemini may return the same enum value in lowercase. Normalize it at the
  // trust boundary instead of burning a logical evaluation run on formatting.
  scoreBand: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value
      const normalized = value.trim().toUpperCase().replace(/[\s_-]+/g, "")
      if (["GOOD", "STRONG", "CORRECT", "EXCELLENT"].includes(normalized)) return "GOOD"
      if (["WEAK", "POOR", "BAD", "INCORRECT"].includes(normalized)) return "WEAK"
      if (["PARTIAL", "PARTIALLYCORRECT", "AVERAGE", "MODERATE"].includes(normalized)) return "PARTIAL"
      // Provider formatting must not turn a valid score into a failed run.
      return "PARTIAL"
    },
    z.enum(["GOOD", "PARTIAL", "WEAK"])
  ).optional().default("PARTIAL"),
  scoreExplanation: z.string().optional().default("Score based on correctness, completeness, reasoning, and presentation."),
  strengths: z.string().optional().default("No specific strengths recorded."),
  examinerExpectation: z.string().optional().default("Address the core concepts, reasoning, and evidence required by the question."),
  improvementAdvice: z.string().optional().default("Review the missing concepts and strengthen the explanation."),
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
