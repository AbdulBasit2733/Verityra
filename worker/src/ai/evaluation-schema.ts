import { z } from "zod"

export const scoreBandEnum = z.enum(["GOOD", "PARTIAL", "WEAK"])
export type ScoreBand = z.infer<typeof scoreBandEnum>

const normalizeOptionalText = (fallback: string) =>
  z.preprocess(
    (value) =>
      typeof value === "string" && value.trim().length > 0
        ? value.trim()
        : fallback,
    z.string()
  )

export const questionEvaluationSchema = z.object({
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
      scoreBandEnum
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

export type QuestionEvaluationResult = z.infer<typeof questionEvaluationSchema>

export const aiEvaluationResponseSchema = z.object({
  generalFeedback: z.string().min(1),
  legibilityWarning: z.boolean().default(false),
  uncertaintyFlag: z.boolean().default(false),
  questions: z.array(questionEvaluationSchema).min(1),
})

export type AiEvaluationResult = z.infer<typeof aiEvaluationResponseSchema>
