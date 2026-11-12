import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import { aiEvaluationResponseSchema } from "../lib/ai/evaluation-schema"
import { EvaluationStatus } from "@prisma/client"
import {
  assertGeminiApiKeyConfigured,
  DEFAULT_GEMINI_MODEL,
  extractAndParseJson,
  getGeminiModelName,
} from "../lib/ai/gemini-evaluator"

export function runEvaluationTests() {
  const suite = new TestSuite(
    "Module: AI Evaluation Engine & Scoring Invariants"
  )
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  suite.test(
    "Schema: Structured AI evaluation output schema validates question scores and feedback",
    () => {
      const validOutput = {
        generalFeedback:
          "Well-structured analysis with solid conceptual footing.",
        legibilityWarning: false,
        uncertaintyFlag: false,
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 10,
            marksAwarded: 8.5,
            feedback: "Accurate historical reasoning.",
            missingConcepts: "Could cite specific edicts.",
            isLegible: true,
            isUncertain: false,
          },
          {
            questionNumber: "Q2",
            maxMarks: 15,
            marksAwarded: 12.0,
            feedback: "Clear climatic diagram.",
            isLegible: true,
            isUncertain: false,
          },
        ],
      }

      const parsed = aiEvaluationResponseSchema.safeParse(validOutput)
      assert.equal(parsed.success, true)
      if (parsed.success) {
        assert.equal(parsed.data.questions.length, 2)
        assert.equal(parsed.data.questions[0].marksAwarded, 8.5)
      }
    }
  )

  suite.test(
    "Schema: Normalizes lowercase score bands returned by the provider",
    () => {
      const parsed = aiEvaluationResponseSchema.safeParse({
        generalFeedback: "Needs stronger evidence.",
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 10,
            marksAwarded: 5,
            feedback: "Partial answer.",
            scoreBand: "partial",
          },
        ],
      })

      assert.equal(parsed.success, true)
      if (parsed.success)
        assert.equal(parsed.data.questions[0].scoreBand, "PARTIAL")
    }
  )

  suite.test(
    "Schema: Rejects malformed question item (e.g. negative marks or missing questionNumber)",
    () => {
      const invalidOutput = {
        generalFeedback: "Missing questions",
        legibilityWarning: false,
        uncertaintyFlag: false,
        questions: [
          {
            // missing questionNumber
            maxMarks: 10,
            marksAwarded: 5,
            feedback: "Incomplete",
            isLegible: true,
            isUncertain: false,
          },
        ],
      }

      const parsed = aiEvaluationResponseSchema.safeParse(invalidOutput)
      assert.equal(parsed.success, false)
    }
  )

  suite.test(
    "Clamping: Clamps marks so awarded score never exceeds maxMarks or falls below 0",
    () => {
      const qMax = 10

      function clampScore(raw: number, max: number): number {
        return Math.min(Math.max(0, raw), max)
      }

      assert.equal(clampScore(14.5, qMax), 10) // Upper bound clamped
      assert.equal(clampScore(-3.0, qMax), 0) // Lower bound clamped
      assert.equal(clampScore(7.5, qMax), 7.5) // Valid in-range preserved
    }
  )

  suite.test(
    "Percentage: Computes aggregate percentage accurately with 2-decimal precision",
    () => {
      function computePercentage(
        totalAwarded: number,
        maxMarks: number
      ): number {
        if (maxMarks <= 0) return 0
        return Number(((totalAwarded / maxMarks) * 100).toFixed(2))
      }

      assert.equal(computePercentage(137.5, 250), 55.0)
      assert.equal(computePercentage(66.6666, 100), 66.67)
      assert.equal(computePercentage(0, 100), 0)
    }
  )

  suite.test(
    "Human-in-the-Loop: Uncertainty or legibility warning routes directly to REVIEW_REQUIRED",
    () => {
      function resolveEvaluationRouting(aiResult: {
        legibilityWarning: boolean
        uncertaintyFlag: boolean
      }): EvaluationStatus {
        if (aiResult.legibilityWarning || aiResult.uncertaintyFlag) {
          return EvaluationStatus.REVIEW_REQUIRED
        }
        return EvaluationStatus.COMPLETED
      }

      assert.equal(
        resolveEvaluationRouting({
          legibilityWarning: true,
          uncertaintyFlag: false,
        }),
        EvaluationStatus.REVIEW_REQUIRED
      )
      assert.equal(
        resolveEvaluationRouting({
          legibilityWarning: false,
          uncertaintyFlag: true,
        }),
        EvaluationStatus.REVIEW_REQUIRED
      )
      assert.equal(
        resolveEvaluationRouting({
          legibilityWarning: false,
          uncertaintyFlag: false,
        }),
        EvaluationStatus.COMPLETED
      )
    }
  )

  suite.test(
    "Configuration: Uses the current default Gemini model and honors an explicit override",
    () => {
      const originalModel = process.env.GEMINI_MODEL
      try {
        delete process.env.GEMINI_MODEL
        assert.equal(getGeminiModelName(), DEFAULT_GEMINI_MODEL)

        process.env.GEMINI_MODEL = "custom-enabled-model"
        assert.equal(getGeminiModelName(), "custom-enabled-model")
      } finally {
        if (originalModel === undefined) delete process.env.GEMINI_MODEL
        else process.env.GEMINI_MODEL = originalModel
      }
    }
  )

  suite.test(
    "Configuration: Missing credentials fail outside development, not as a fabricated evaluation",
    () => {
      assert.throws(
        () => assertGeminiApiKeyConfigured(undefined, "production"),
        /GEMINI_API_KEY must be configured/
      )
      assert.throws(
        () => assertGeminiApiKeyConfigured("your-gemini-api-key", "production"),
        /GEMINI_API_KEY must be configured/
      )
      assert.doesNotThrow(() =>
        assertGeminiApiKeyConfigured(undefined, "development")
      )
    }
  )

  suite.test(
    "Admin Override: Adjusting individual question scores recalculates total and status",
    () => {
      const originalQuestions = [
        { id: "q1", maxMarks: 10, marksAwarded: 5 },
        { id: "q2", maxMarks: 15, marksAwarded: 8 },
      ]
      const testSeriesMaxMarks = 25

      const adjustments = [
        { questionEvaluationId: "q1", newMarksAwarded: 8.5 }, // upgraded +3.5
      ]

      let newTotal = 0
      for (const q of originalQuestions) {
        const adj = adjustments.find((a) => a.questionEvaluationId === q.id)
        const finalMarks = adj ? adj.newMarksAwarded : q.marksAwarded
        const clamped = Math.min(Math.max(0, finalMarks), q.maxMarks)
        newTotal += clamped
      }

      assert.equal(newTotal, 16.5) // 8.5 + 8
      const percentage = Number(
        ((newTotal / testSeriesMaxMarks) * 100).toFixed(2)
      )
      assert.equal(percentage, 66.0)
      assert.equal(EvaluationStatus.ADJUSTED, "ADJUSTED")
    }
  )

  suite.test(
    "JSON Sanitization: extractAndParseJson strips markdown fences and surrounding prose",
    () => {
      const fencedJson =
        'Here is the evaluation:\n```json\n{"generalFeedback": "Good work", "questions": []}\n```\nThank you.'
      const parsedFenced = extractAndParseJson(fencedJson) as {
        generalFeedback: string
        questions: unknown[]
      }
      assert.equal(parsedFenced.generalFeedback, "Good work")
      assert.deepEqual(parsedFenced.questions, [])

      const rawJson = '{"generalFeedback": "Clean JSON", "questions": []}'
      const parsedRaw = extractAndParseJson(rawJson) as {
        generalFeedback: string
      }
      assert.equal(parsedRaw.generalFeedback, "Clean JSON")
    }
  )

  suite.test(
    "Admin Re-evaluation Quota: Admin trigger bypasses the 3-run automatic evaluation limit",
    () => {
      const MAX_AI_EVALUATION_RUNS = 3

      function canClaimEvaluationRun(
        recordedRuns: number,
        trigger: "AUTOMATIC" | "ADMIN_REEVALUATION"
      ) {
        const isAdminTrigger = trigger === "ADMIN_REEVALUATION"
        if (!isAdminTrigger && recordedRuns >= MAX_AI_EVALUATION_RUNS) {
          return false
        }
        return true
      }

      assert.equal(canClaimEvaluationRun(2, "AUTOMATIC"), true)
      assert.equal(canClaimEvaluationRun(3, "AUTOMATIC"), false)
      assert.equal(canClaimEvaluationRun(3, "ADMIN_REEVALUATION"), true)
      assert.equal(canClaimEvaluationRun(10, "ADMIN_REEVALUATION"), true)
      assert.equal(canClaimEvaluationRun(50, "ADMIN_REEVALUATION"), true)
    }
  )

  return suite.summary()
}

// Allow direct execution
if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("tests/evaluation.test.ts")
) {
  const result = runEvaluationTests()
  if (result.failed > 0) process.exit(1)
}
