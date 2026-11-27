import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import { SubmissionStatus } from "@prisma/client"
import {
  createPrivateSignedUploadUrl,
  isSafeStorageObjectPath,
} from "../lib/supabase"
import {
  flattenRegistrationsToSubjectTests,
  resolveSubjectAndSeriesDisplay,
} from "../lib/student-test-display"

export function runSubmissionTests() {
  const suite = new TestSuite(
    "Module: Answer Sheet Submissions & Quota Management"
  )
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  const ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
  ]
  const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

  suite.test("File Validation: Allows standard PDF and image formats", () => {
    function validateFile(mimeType: string, sizeBytes: number) {
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return { valid: false, error: "UNSUPPORTED_MIME_TYPE" }
      }
      if (sizeBytes <= 0 || sizeBytes > MAX_FILE_SIZE_BYTES) {
        return { valid: false, error: "FILE_TOO_LARGE" }
      }
      return { valid: true }
    }

    assert.equal(validateFile("application/pdf", 5 * 1024 * 1024).valid, true)
    assert.equal(validateFile("image/jpeg", 2 * 1024 * 1024).valid, true)
    assert.equal(validateFile("image/png", 1 * 1024 * 1024).valid, true)
    assert.equal(validateFile("image/webp", 800 * 1024).valid, true)

    assert.equal(validateFile("application/x-msdownload", 1000).valid, false)
    assert.equal(validateFile("application/zip", 1000).valid, false)
    assert.equal(validateFile("text/javascript", 1000).valid, false)
    assert.equal(validateFile("application/pdf", 11 * 1024 * 1024).valid, false)
  })

  suite.test(
    "Quota Invariant: Failed file validation does not burn student attempts",
    () => {
      let attemptsUsed = 1
      const maxAttempts = 3

      function attemptSubmission(mimeType: string, size: number) {
        if (
          !ALLOWED_MIME_TYPES.includes(mimeType) ||
          size > MAX_FILE_SIZE_BYTES
        ) {
          return { success: false, error: "INVALID_FILE" }
        }
        if (attemptsUsed >= maxAttempts) {
          return { success: false, error: "LIMIT_EXCEEDED" }
        }
        attemptsUsed++
        return { success: true, attemptNumber: attemptsUsed }
      }

      // Invalid upload attempt
      const failedAttempt = attemptSubmission("video/mp4", 1000)
      assert.equal(failedAttempt.success, false)
      assert.equal(attemptsUsed, 1) // Crucial invariant: count remains 1

      // Valid upload attempt
      const successAttempt = attemptSubmission("application/pdf", 1000)
      assert.equal(successAttempt.success, true)
      assert.equal(attemptsUsed, 2)
    }
  )

  suite.test(
    "Three-Attempt Ceiling: Exactly allows 3 attempts and strictly rejects attempt 4",
    () => {
      const maxAttempts = 3
      let attemptsUsed = 0

      function submitSheet() {
        if (attemptsUsed >= maxAttempts) {
          throw new Error("ATTEMPT_LIMIT_EXCEEDED")
        }
        attemptsUsed++
        return attemptsUsed
      }

      assert.equal(submitSheet(), 1)
      assert.equal(submitSheet(), 2)
      assert.equal(submitSheet(), 3)
      assert.throws(() => submitSheet(), /ATTEMPT_LIMIT_EXCEEDED/)
      assert.equal(attemptsUsed, 3)
    }
  )

  suite.test(
    "Deadline Enforcement: Submissions past the end deadline are blocked",
    () => {
      const deadline = new Date("2026-10-15T23:59:59Z")

      function canSubmit(now: Date, endDate: Date | null) {
        if (endDate && now > endDate) {
          return false
        }
        return true
      }

      const beforeDeadline = new Date("2026-10-14T10:00:00Z")
      assert.equal(canSubmit(beforeDeadline, deadline), true)

      const afterDeadline = new Date("2026-10-16T00:00:01Z")
      assert.equal(canSubmit(afterDeadline, deadline), false)
    }
  )

  suite.test(
    "Status Transitions: Submission status adheres to Prisma enum definitions",
    () => {
      assert.equal(SubmissionStatus.PENDING, "PENDING")
      assert.equal(SubmissionStatus.PROCESSING, "PROCESSING")
      assert.equal(SubmissionStatus.COMPLETED, "COMPLETED")
      assert.equal(SubmissionStatus.REVIEW_REQUIRED, "REVIEW_REQUIRED")
      assert.equal(SubmissionStatus.FAILED, "FAILED")
    }
  )

  suite.test(
    "Attempt Compensation: Terminal failure during evaluation claim restores attempt and frees slot",
    () => {
      let attemptsUsed = 1
      const storedSubmissions: Array<{ id: string; attemptNumber: number }> = [
        { id: "sub-1", attemptNumber: 1 },
      ]

      function simulateSubmissionWithClaimFailure(shouldClaimSucceed: boolean) {
        // Step 1: Transaction increments attemptsUsed and creates submission
        const nextAttempt = attemptsUsed + 1
        const newSub = { id: `sub-${nextAttempt}`, attemptNumber: nextAttempt }
        attemptsUsed = nextAttempt
        storedSubmissions.push(newSub)

        // Step 2: Evaluation claim setup
        if (!shouldClaimSucceed) {
          // Compensate: rollback attemptsUsed and delete orphaned submission
          const idx = storedSubmissions.findIndex((s) => s.id === newSub.id)
          if (idx !== -1) storedSubmissions.splice(idx, 1)
          attemptsUsed -= 1
          return {
            success: false,
            error: "Evaluation setup failed. Attempt restored.",
          }
        }

        return { success: true, submissionId: newSub.id }
      }

      const failedRun = simulateSubmissionWithClaimFailure(false)
      assert.equal(failedRun.success, false)
      assert.equal(attemptsUsed, 1, "Attempt must be compensated back to 1")
      assert.equal(
        storedSubmissions.length,
        1,
        "Orphaned submission must be removed"
      )

      // Verify retry succeeds and uses attempt 2 without collision
      const retryRun = simulateSubmissionWithClaimFailure(true)
      assert.equal(retryRun.success, true)
      assert.equal(attemptsUsed, 2)
      assert.equal(storedSubmissions.length, 2)
      assert.equal(storedSubmissions[1].attemptNumber, 2)
    }
  )

  suite.test(
    "Subject Test Linkage: Child Test ID resolves parent testSeriesId and preserves testId",
    () => {
      function resolveSubmissionTargets(
        routeId: string,
        childTest: { id: string; testSeriesId: string | null } | null
      ) {
        if (childTest && !childTest.testSeriesId) {
          return {
            ok: false as const,
            error: "Subject test is not linked to an active test series.",
          }
        }
        return {
          ok: true as const,
          testSeriesId: childTest?.testSeriesId || routeId,
          testId: childTest?.id ?? null,
        }
      }

      assert.deepEqual(resolveSubmissionTargets("series-1", null), {
        ok: true,
        testSeriesId: "series-1",
        testId: null,
      })

      assert.deepEqual(
        resolveSubmissionTargets("test-1", {
          id: "test-1",
          testSeriesId: "series-1",
        }),
        {
          ok: true,
          testSeriesId: "series-1",
          testId: "test-1",
        }
      )

      const unlinked = resolveSubmissionTargets("test-orphan", {
        id: "test-orphan",
        testSeriesId: null,
      })
      assert.equal(unlinked.ok, false)
    }
  )

  suite.test(
    "Per-Subject Attempt Isolation: Submitting 3 attempts in Maths does not exhaust Science attempts in the same bundle",
    () => {
      const subjectQuotas = new Map<
        string,
        { attemptsUsed: number; maxAttempts: number }
      >()

      function reserveSubjectAttempt(testId: string, maxAttempts = 3) {
        const reg = subjectQuotas.get(testId) || {
          attemptsUsed: 0,
          maxAttempts,
        }
        if (reg.attemptsUsed >= reg.maxAttempts) {
          return { ok: false as const, error: "ATTEMPT_LIMIT_EXCEEDED" }
        }
        reg.attemptsUsed += 1
        subjectQuotas.set(testId, reg)
        return { ok: true as const, attemptNumber: reg.attemptsUsed }
      }

      assert.equal(reserveSubjectAttempt("test-maths").ok, true)
      assert.equal(reserveSubjectAttempt("test-maths").ok, true)
      assert.equal(reserveSubjectAttempt("test-maths").ok, true)
      assert.equal(reserveSubjectAttempt("test-maths").ok, false)

      const scienceAttempt = reserveSubjectAttempt("test-science")
      assert.deepEqual(scienceAttempt, { ok: true, attemptNumber: 1 })
    }
  )

  suite.test(
    "Signed Upload Security: Rejects path traversal and cross-user paths while exposing signed upload helper",
    () => {
      assert.equal(
        isSafeStorageObjectPath(
          "submissions/series-1/user-1/attempt_1_test.pdf",
          "submissions/series-1/user-1/"
        ),
        true
      )
      assert.equal(
        isSafeStorageObjectPath(
          "submissions/series-1/user-2/attempt_1_test.pdf",
          "submissions/series-1/user-1/"
        ),
        false
      )
      assert.equal(
        isSafeStorageObjectPath(
          "submissions/series-1/user-1/../user-2/attempt_1_test.pdf",
          "submissions/series-1/user-1/"
        ),
        false
      )
      assert.equal(
        isSafeStorageObjectPath(
          "/submissions/series-1/user-1/attempt_1_test.pdf",
          "submissions/series-1/user-1/"
        ),
        false
      )
      assert.equal(
        isSafeStorageObjectPath(
          "papers/test-123/question.pdf",
          "papers/test-123/"
        ),
        true
      )
      assert.equal(typeof createPrivateSignedUploadUrl, "function")
    }
  )

  suite.test(
    "Student Display Labels: Renders Subject Test title first, parent Test Series subtitle second, and promotes single-test series",
    () => {
      const explicitSubject = resolveSubjectAndSeriesDisplay({
        test: {
          id: "test-phys-1",
          title: "Physics Full Mock 1",
          subject: "Physics",
          maxMarks: 70,
        },
        testSeries: {
          id: "series-cbse-12",
          title: "CBSE Class 12 Science All-India Series",
          maxMarks: 350,
        },
      })
      assert.equal(explicitSubject.subjectTestTitle, "Physics Full Mock 1")
      assert.equal(
        explicitSubject.seriesTitle,
        "CBSE Class 12 Science All-India Series"
      )
      assert.equal(explicitSubject.targetWorkspaceId, "test-phys-1")
      assert.equal(explicitSubject.effectiveMaxMarks, 70)

      const singleChildSeries = resolveSubjectAndSeriesDisplay({
        test: null,
        testSeries: {
          id: "series-maths-only",
          title: "Class 10 Maths Booster",
          maxMarks: 80,
          tests: [
            {
              id: "test-maths-mock-1",
              title: "Mathematics Standard Mock Paper 1",
              subject: "Mathematics",
              maxMarks: 80,
            },
          ],
        },
      })
      assert.equal(
        singleChildSeries.subjectTestTitle,
        "Mathematics Standard Mock Paper 1"
      )
      assert.equal(singleChildSeries.seriesTitle, "Class 10 Maths Booster")
      assert.equal(
        singleChildSeries.targetWorkspaceId,
        "test-maths-mock-1"
      )

      const multiBundle = resolveSubjectAndSeriesDisplay({
        test: null,
        testSeries: {
          id: "series-bundle-1",
          title: "CBSE Class 10 Complete Bundle",
          maxMarks: 400,
          tests: [
            { id: "t1", title: "Maths Mock", subject: "Maths" },
            { id: "t2", title: "Science Mock", subject: "Science" },
          ],
        },
      })
      assert.equal(multiBundle.isMultiSubjectBundle, true)
      assert.equal(
        multiBundle.subjectTestTitle,
        "CBSE Class 10 Complete Bundle"
      )
      assert.ok(multiBundle.seriesTitle?.includes("choose a subject test"))
    }
  )

  suite.test(
    "Student Subject-Test Flattening & Marks: Expands bundles into deduplicated Subject Tests with latest evaluated marks",
    () => {
      const flattened = flattenRegistrationsToSubjectTests([
        // Direct per-subject registration created after Attempt 1 & Attempt 2 on Maths
        {
          id: "reg-direct-maths",
          testId: "test-maths",
          testSeriesId: null,
          attemptsUsed: 2,
          maxAttempts: 3,
          registeredAt: "2026-11-26T10:00:00Z",
          hasCompletedPayment: false,
          test: {
            id: "test-maths",
            title:
              "Class 10th Urdu Medium Pre-Board Mock Exam Series 2026 — Mathematics Mock 1",
            subject: "Mathematics",
            price: 0,
            maxMarks: 40,
            durationMinutes: 120,
            testSeries: {
              id: "series-urdu-10",
              title: "Class 10th Urdu Medium Pre-Board Mock Exam Series 2026",
              standard: "10th",
            },
          },
          submissions: [
            {
              id: "sub-m-2",
              testId: "test-maths",
              attemptNumber: 2,
              status: "PROCESSING",
              evaluation: null,
            },
            {
              id: "sub-m-1",
              testId: "test-maths",
              attemptNumber: 1,
              status: "COMPLETED",
              evaluation: {
                totalMarksAwarded: 34,
                maxMarks: 40,
                percentage: 85,
              },
            },
          ],
        },
        // Parent bundle registration covering both Maths and Marathi
        {
          id: "reg-bundle-urdu",
          testId: null,
          testSeriesId: "series-urdu-10",
          attemptsUsed: 1,
          maxAttempts: 3,
          registeredAt: "2026-11-25T10:00:00Z",
          hasCompletedPayment: true,
          testSeries: {
            id: "series-urdu-10",
            title: "Class 10th Urdu Medium Pre-Board Mock Exam Series 2026",
            bundlePrice: 29900,
            standard: "10th",
            maxMarks: 80,
            durationMinutes: 180,
            tests: [
              {
                id: "test-maths",
                title:
                  "Class 10th Urdu Medium Pre-Board Mock Exam Series 2026 — Mathematics Mock 1",
                subject: "Mathematics",
                maxMarks: 40,
                durationMinutes: 120,
              },
              {
                id: "test-marathi",
                title: "Class 10th Urdu Medium 1st Term Marathi Question Paper",
                subject: "Marathi",
                maxMarks: 80,
                durationMinutes: 180,
              },
            ],
          },
          submissions: [],
        },
      ])

      // Must produce exactly 2 individual Subject Test rows (deduplicated Maths + Marathi), zero bundle rows
      assert.equal(flattened.length, 2)
      assert.equal(flattened[0].testId, "test-maths")
      // Leading Test Series prefix stripped cleanly
      assert.equal(flattened[0].testTitle, "Mathematics Mock 1")
      assert.equal(flattened[0].attemptsUsed, 2)
      // Picks latest EVALUATED submission (Attempt 1 = 34/40) even while Attempt 2 is still PROCESSING
      assert.equal(flattened[0].latestMarksAwarded, 34)
      assert.equal(flattened[0].latestPercentage, 85)

      assert.equal(flattened[1].testId, "test-marathi")
      assert.equal(
        flattened[1].testTitle,
        "Class 10th Urdu Medium 1st Term Marathi Question Paper"
      )
      assert.equal(flattened[1].latestMarksAwarded, null)
      assert.equal(flattened[1].maxMarks, 80)
    }
  )

  return suite.summary()
}

// Allow direct execution
if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("tests/submissions.test.ts")
) {
  const result = runSubmissionTests()
  if (result.failed > 0) process.exit(1)
}
