import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import { aiEvaluationResponseSchema } from "../lib/ai/evaluation-schema"
import { EvaluationStatus } from "@prisma/client"
import {
  assertGeminiApiKeyConfigured,
  buildBlueprintCachePath,
  compareQuestionNumbers,
  DEFAULT_GEMINI_MODEL,
  extractAndParseJson,
  getGeminiModelName,
  INLINE_DOC_THRESHOLD_BYTES,
  isRetryableGeminiStatus,
  normalizeEvaluationOutput,
  reconcileWithBlueprint,
  shouldUseFilesApi,
} from "../lib/ai/gemini-evaluator"
import {
  evaluateStaleJobDecision,
  isFinalBullMqAttempt,
  resolveEvaluationTargetMeta,
} from "../lib/queue/evaluation-queue"
import {
  buildQuestionBreakdownTree,
  parseHierarchicalQuestionNumber,
} from "../lib/ai/question-breakdown"

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

  suite.test(
    "Gemini Retry Eligibility: Transient statuses 404/429/500/502/503/504 are retried; client 400/401 are not",
    () => {
      for (const code of [404, 429, 500, 502, 503, 504]) {
        assert.equal(isRetryableGeminiStatus(code), true)
      }
      for (const code of [400, 401, 403, 422, undefined]) {
        assert.equal(isRetryableGeminiStatus(code), false)
      }
    }
  )

  suite.test(
    "Queue Retry Lifecycle: isFinalBullMqAttempt honors custom attempts option and default 3",
    () => {
      assert.equal(isFinalBullMqAttempt(0, undefined), false)
      assert.equal(isFinalBullMqAttempt(1, 3), false)
      assert.equal(isFinalBullMqAttempt(2, 3), true)
      assert.equal(isFinalBullMqAttempt(0, 1), true)
    }
  )

  suite.test(
    "Subject Test Routing: Child Test metadata overrides parent TestSeries title, maxMarks, and instructions",
    () => {
      const parentOnly = resolveEvaluationTargetMeta({
        testSeries: {
          title: "Mock Series",
          maxMarks: 250,
          privateEvaluationInstructions: "Series rubric",
        },
        test: null,
      })
      assert.equal(parentOnly.title, "Mock Series")
      assert.equal(parentOnly.maxMarks, 250)
      assert.equal(parentOnly.privateEvaluationInstructions, "Series rubric")

      const withChildTest = resolveEvaluationTargetMeta({
        testSeries: {
          title: "Mock Series",
          maxMarks: 250,
          privateEvaluationInstructions: "Series rubric",
        },
        test: {
          title: "Class 10th Science Test",
          maxMarks: 80,
          privateEvaluationInstructions: "Science step marking",
        },
      })
      assert.equal(withChildTest.title, "Class 10th Science Test")
      assert.equal(withChildTest.maxMarks, 80)
      assert.equal(
        withChildTest.privateEvaluationInstructions,
        "Science step marking"
      )
    }
  )

  suite.test(
    "Stale Job Reconciliation: Flags orphaned or timed-out PROCESSING/QUEUED jobs while sparing fresh active jobs",
    () => {
      // Active PROCESSING job within 10 minutes should NOT be failed
      assert.deepEqual(
        evaluateStaleJobDecision({
          status: "PROCESSING",
          ageMs: 5 * 60 * 1000,
          queueJobState: "active",
        }),
        { shouldFail: false, shouldWake: false }
      )

      // Orphaned PROCESSING job (e.g. stalled out of Redis) after 13 min -> fail
      assert.deepEqual(
        evaluateStaleJobDecision({
          status: "PROCESSING",
          ageMs: 13 * 60 * 1000,
          queueJobState: "failed",
        }),
        { shouldFail: true, shouldWake: false }
      )

      // Hard-timed-out PROCESSING job after 26 min even if Redis still says active -> fail
      assert.deepEqual(
        evaluateStaleJobDecision({
          status: "PROCESSING",
          ageMs: 26 * 60 * 1000,
          queueJobState: "active",
        }),
        { shouldFail: true, shouldWake: false }
      )

      // Sleeping worker wakeup when QUEUED in Redis for 5 min
      assert.deepEqual(
        evaluateStaleJobDecision({
          status: "QUEUED",
          ageMs: 5 * 60 * 1000,
          queueJobState: "waiting",
        }),
        { shouldFail: false, shouldWake: true }
      )

      // Stuck QUEUED job past hard timeout (50 min) -> fail
      assert.deepEqual(
        evaluateStaleJobDecision({
          status: "QUEUED",
          ageMs: 50 * 60 * 1000,
          queueJobState: "waiting",
        }),
        { shouldFail: true, shouldWake: false }
      )
    }
  )

  suite.test(
    "Legacy Unlinked Submission Self-Healing: Single Subject Test in TestSeries resolves 40 maxMarks, questionPaperUrl, and modelAnswerUrl",
    () => {
      const resolved = resolveEvaluationTargetMeta({
        testSeries: {
          title: "Class 10th CBSE Board Comprehensive Mock Series",
          standard: "10th",
          maxMarks: 100,
          privateEvaluationInstructions: "Generic series instructions",
          tests: [
            {
              id: "cmwrju52a001p45sc7fhk3lva",
              title: "Mathematics Half-Syllabus Test",
              subject: "Mathematics",
              maxMarks: 40,
              privateEvaluationInstructions: "Award step marks",
              questionPaperUrl: "papers/cmwrju52a001p45sc7fhk3lva.pdf",
              modelAnswerUrl: "model-answers/cmwrju52a001p45sc7fhk3lva.pdf",
            },
          ],
        },
        test: null,
        registration: { test: null },
      })

      assert.equal(resolved.inferredTestId, "cmwrju52a001p45sc7fhk3lva")
      assert.equal(resolved.maxMarks, 40)
      assert.equal(resolved.title, "Mathematics Half-Syllabus Test")
      assert.equal(resolved.subject, "Mathematics")
      assert.equal(
        resolved.questionPaperUrl,
        "papers/cmwrju52a001p45sc7fhk3lva.pdf"
      )
      assert.equal(
        resolved.modelAnswerUrl,
        "model-answers/cmwrju52a001p45sc7fhk3lva.pdf"
      )
    }
  )

  suite.test(
    "Post-AI Normalization: Sorts Q1..Q10 naturally, clamps marks, and flags maxMarks mismatch for review",
    () => {
      const parsed = aiEvaluationResponseSchema.parse({
        generalFeedback: "Checked against 40-mark paper.",
        legibilityWarning: false,
        uncertaintyFlag: false,
        questions: [
          {
            questionNumber: "Q10",
            maxMarks: 25,
            marksAwarded: 30, // exceeds question max -> clamped to 25
            feedback: "Detailed derivation.",
            missingConcepts: null, // null coerced cleanly to ""
            scoreExplanation: "", // empty coerced cleanly to default
          },
          {
            questionNumber: "Q2",
            maxMarks: 25,
            marksAwarded: 20,
            feedback: "Good work.",
          },
        ],
      })

      const normalized = normalizeEvaluationOutput(parsed, 40)
      assert.deepEqual(
        normalized.questions.map((q) => q.questionNumber),
        ["Q2", "Q10"]
      )
      assert.equal(normalized.questions[1].marksAwarded, 25)
      // Sum of question maxMarks (50) != configured 40 -> uncertaintyFlag must be true
      assert.equal(normalized.uncertaintyFlag, true)
      assert.equal(compareQuestionNumbers("Q2", "Q10") < 0, true)
    }
  )

  suite.test(
    "Option C Blueprint Gate: Fills skipped blueprint questions, locks maxMarks to 40, and flags fallback runs",
    () => {
      const blueprint = {
        totalMarks: 40,
        questions: [
          {
            questionNumber: "Q1",
            maxMarks: 10,
            topic: "Quadratics",
            questionSummary: "Solve discriminant problem",
            hasInternalChoice: false,
            markingCriteria: "Correct formula + roots",
          },
          {
            questionNumber: "Q2",
            maxMarks: 15,
            topic: "Triangles",
            questionSummary: "Prove BPT",
            hasInternalChoice: true,
            markingCriteria: "Diagram + proof steps",
          },
          {
            questionNumber: "Q3",
            maxMarks: 15,
            topic: "Trigonometry",
            questionSummary: "Heights and distances",
            hasInternalChoice: false,
            markingCriteria: "Diagram + trigonometric ratio",
          },
        ],
      }

      // Simulate AI accidentally giving wrong maxMarks (50) and skipping unattempted Q3
      const partialAi = aiEvaluationResponseSchema.parse({
        generalFeedback: "Partial check.",
        legibilityWarning: false,
        uncertaintyFlag: false,
        questions: [
          {
            questionNumber: "1",
            maxMarks: 50,
            marksAwarded: 8,
            feedback: "Correct method.",
          },
          {
            questionNumber: "Q2",
            maxMarks: 15,
            marksAwarded: 12,
            feedback: "Proof is sound.",
          },
        ],
      })

      const reconciled = reconcileWithBlueprint(partialAi, blueprint, 40, {
        fallbackUsed: true,
      })

      assert.equal(reconciled.questions.length, 3)
      assert.deepEqual(
        reconciled.questions.map((q) => q.maxMarks),
        [10, 15, 15]
      )
      assert.equal(reconciled.questions[2].questionNumber, "Q3")
      assert.equal(reconciled.questions[2].marksAwarded, 0)
      assert.equal(reconciled.uncertaintyFlag, true)
      assert.ok(
        reconciled.generalFeedback.includes("Fallback Model Notice")
      )
    }
  )

  suite.test(
    "Option C Infrastructure Helpers: Selects Files API above 4MB and derives stable blueprint cache paths",
    () => {
      assert.equal(
        shouldUseFilesApi(Buffer.alloc(INLINE_DOC_THRESHOLD_BYTES)),
        false
      )
      assert.equal(
        shouldUseFilesApi(Buffer.alloc(INLINE_DOC_THRESHOLD_BYTES + 1)),
        true
      )

      const pathA = buildBlueprintCachePath("papers/test-1.pdf", 40)
      const pathB = buildBlueprintCachePath("papers/test-1.pdf", 80)
      const pathA2 = buildBlueprintCachePath("papers/test-1.pdf", 40)
      assert.equal(pathA, pathA2)
      assert.notEqual(pathA, pathB)
      assert.ok(pathA.startsWith("blueprints/bp-"))
    }
  )

  suite.test(
    "Hierarchical Breakdown: Sorts Q1.A.1..Q1.B.10, groups Section A (3) & Section B (2) cleanly, and reconciles Q1(a)(1)",
    () => {
      const unordered = [
        "Q1.B.2",
        "Q1.A.10",
        "Q2",
        "Q1.A.2",
        "Q1.B.1",
        "Q1.A.1",
        "Q10",
      ]
      const sorted = [...unordered].sort(compareQuestionNumbers)
      assert.deepEqual(sorted, [
        "Q1.A.1",
        "Q1.A.2",
        "Q1.A.10",
        "Q1.B.1",
        "Q1.B.2",
        "Q2",
        "Q10",
      ])

      const parsed = parseHierarchicalQuestionNumber("Q1(a)(2)")
      assert.equal(parsed.canonicalNumber, "Q1.A.2")
      assert.equal(parsed.parentKey, "Q1")
      assert.equal(parsed.sectionKey, "A")

      const groups = buildQuestionBreakdownTree([
        {
          id: "b2",
          questionNumber: "Q1.B.2",
          maxMarks: 4,
          marksAwarded: 0,
          feedback: "Wrong Answer — Incorrect boundary condition used.",
          missingConcepts: "Newton cooling boundary equation.",
          scoreExplanation: "Formula mismatch; zero marks awarded.",
          isLegible: true,
        },
        {
          id: "a1",
          questionNumber: "Q1.A.1",
          maxMarks: 2,
          marksAwarded: 2,
          feedback: "Well-Justified — Accurate definition and units.",
          missingConcepts: null,
          scoreBand: "GOOD",
          isLegible: true,
        },
        {
          id: "a2",
          questionNumber: "Q1.A.2",
          maxMarks: 2,
          marksAwarded: 1,
          feedback: "Insufficient Depth for Marks — Only one line written.",
          missingConcepts: "Derivation steps.",
          scoreBand: "PARTIAL",
          isLegible: true,
        },
        {
          id: "a3",
          questionNumber: "Q1.A.3",
          maxMarks: 2,
          marksAwarded: 0,
          feedback: "Not Attempted — Left blank.",
          missingConcepts: "Full derivation.",
          isLegible: true,
        },
        {
          id: "b1",
          questionNumber: "Q1.B.1",
          maxMarks: 4,
          marksAwarded: 3,
          feedback: "Partially Correct — Good steps, minor sign error.",
          missingConcepts: "Sign check.",
          scoreBand: "GOOD",
          isLegible: true,
        },
        {
          id: "q2",
          questionNumber: "Q2",
          maxMarks: 6,
          marksAwarded: 5,
          feedback: "Strong proof.",
          missingConcepts: null,
          scoreBand: "GOOD",
          isLegible: true,
        },
      ])

      assert.equal(groups.length, 2)
      assert.equal(groups[0].parentKey, "Q1")
      assert.equal(groups[0].hasSections, true)
      assert.equal(groups[0].questionCount, 5)
      assert.equal(groups[0].awarded, 6)
      assert.equal(groups[0].max, 14)

      assert.equal(groups[0].sections[0].sectionLabel, "Section A")
      assert.equal(groups[0].sections[0].items.length, 3)
      assert.equal(groups[0].sections[0].items[2].verdict.label, "Not Attempted")

      assert.equal(groups[0].sections[1].sectionLabel, "Section B")
      assert.equal(groups[0].sections[1].items.length, 2)
      assert.equal(groups[0].sections[1].items[1].verdict.label, "Wrong Answer")

      // Flat parent Q2 has no section header
      assert.equal(groups[1].parentKey, "Q2")
      assert.equal(groups[1].hasSections, false)

      // Blueprint reconciliation matches Q1(a)(1) -> Q1.A.1 and fills missing Q1.B.1
      const blueprint = {
        totalMarks: 6,
        questions: [
          {
            questionNumber: "Q1.A.1",
            maxMarks: 2,
            topic: "Thermodynamics",
            questionSummary: "First law statement",
            hasInternalChoice: false,
            markingCriteria: "State equation and sign convention",
          },
          {
            questionNumber: "Q1.B.1",
            maxMarks: 4,
            topic: "Radiation",
            questionSummary: "Stefan Boltzmann law",
            hasInternalChoice: false,
            markingCriteria: "Formula + derivation",
          },
        ],
      }
      const aiResponse = aiEvaluationResponseSchema.parse({
        generalFeedback: "Check.",
        questions: [
          {
            questionNumber: "Q1(a)(1)",
            maxMarks: 2,
            marksAwarded: 2,
            feedback: "Well-Justified — Clear law stated.",
          },
        ],
      })
      const reconciled = reconcileWithBlueprint(aiResponse, blueprint, 6)
      assert.equal(reconciled.questions.length, 2)
      assert.equal(reconciled.questions[0].questionNumber, "Q1.A.1")
      assert.equal(reconciled.questions[0].marksAwarded, 2)
      assert.equal(reconciled.questions[1].questionNumber, "Q1.B.1")
      assert.equal(reconciled.questions[1].marksAwarded, 0)
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
