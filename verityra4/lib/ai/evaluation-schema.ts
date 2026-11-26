import { z } from "zod"

const normalizeOptionalText = (fallback: string) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length > 0
        ? value.trim()
        : fallback,
    z.string()
  )

export const questionScoreSchema = z.object({
  questionNumber: z.string().min(1),
  maxMarks: z.number().min(0),
  marksAwarded: z.number().min(0),
  feedback: z.string().min(1),
  missingConcepts: z
    .preprocess(
      (value) => (typeof value === "string" ? value.trim() : ""),
      z.string()
    )
    .default(""),
  // Gemini may return the same enum value in lowercase or synonyms. Normalize it
  // at the trust boundary instead of burning an evaluation run on formatting.
  scoreBand: z
    .preprocess(
      (value) => {
        if (typeof value !== "string") return "PARTIAL"
        const normalized = value
          .trim()
          .toUpperCase()
          .replace(/[\s_-]+/g, "")
        if (["GOOD", "STRONG", "CORRECT", "EXCELLENT"].includes(normalized))
          return "GOOD"
        if (["WEAK", "POOR", "BAD", "INCORRECT"].includes(normalized))
          return "WEAK"
        if (
          ["PARTIAL", "PARTIALLYCORRECT", "AVERAGE", "MODERATE"].includes(
            normalized
          )
        )
          return "PARTIAL"
        return "PARTIAL"
      },
      z.enum(["GOOD", "PARTIAL", "WEAK"])
    )
    .default("PARTIAL"),
  scoreExplanation: normalizeOptionalText(
    "Score based on correctness, completeness, step-wise reasoning, and presentation."
  ),
  strengths: normalizeOptionalText("No specific strengths recorded."),
  examinerExpectation: normalizeOptionalText(
    "Address the core concepts, working steps, and evidence required by the question."
  ),
  improvementAdvice: normalizeOptionalText(
    "Review the missing concepts and strengthen step-by-step explanation."
  ),
  isLegible: z.boolean().default(true),
  isUncertain: z.boolean().default(false),
})

export const aiEvaluationResponseSchema = z.object({
  generalFeedback: z.string().min(1),
  legibilityWarning: z.boolean().default(false),
  uncertaintyFlag: z.boolean().default(false),
  questions: z.array(questionScoreSchema).min(1),
})

export type AiEvaluationResult = z.infer<typeof aiEvaluationResponseSchema>
export type QuestionScore = z.infer<typeof questionScoreSchema>
