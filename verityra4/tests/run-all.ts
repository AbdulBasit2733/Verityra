import { runAuthTests } from "./auth.test"
import { runTestSeriesTests } from "./test-series.test"
import { runRegistrationTests } from "./registration.test"
import { runSubmissionTests } from "./submissions.test"
import { runEvaluationTests } from "./evaluation.test"
import { runPaymentTests } from "./payments.test"
import { runFileStorageTests } from "./file-storage.test"
import { runEmailTests } from "./email.test"
import { runQuestionPaperTests } from "./question-papers.test"
import { runStudentTests } from "./student-tests.test"
import { runExamTimerTests } from "./exam-timer.test"
import { runBrandTests } from "./brand.test"
import { runHybridTestSeriesTests } from "./hybrid-test-series.test"
import { runQuestionPaperSeriesAttachmentTests } from "./question-paper-series-attachment.test"
import { runMastersAndTestArchitectureTests } from "./masters-and-test-architecture.test"
import { runDeletionAndCurriculumTests } from "./deletion-and-cbse-curriculum.test"
import { BRAND_CONFIG } from "../lib/brand"
import { TestResult } from "./test-utils"

console.log(
  "================================================================================"
)
console.log(
  `                    ${BRAND_CONFIG.name.toUpperCase()} MODULAR TEST RUNNER`
)
console.log(
  "================================================================================"
)

const startTime = Date.now()
const results: TestResult[] = []

try {
  results.push(runAuthTests())
  results.push(runTestSeriesTests())
  results.push(runRegistrationTests())
  results.push(runSubmissionTests())
  results.push(runEvaluationTests())
  results.push(runPaymentTests())
  results.push(runFileStorageTests())
  results.push(runEmailTests())
  results.push(runQuestionPaperTests())
  results.push(runStudentTests())
  results.push(runExamTimerTests())
  results.push(runBrandTests())
  results.push(runHybridTestSeriesTests())
  results.push(runQuestionPaperSeriesAttachmentTests())
  results.push(runMastersAndTestArchitectureTests())
  results.push(runDeletionAndCurriculumTests())
} catch (err: any) {
  console.error("FATAL ERROR IN TEST SUITE RUNNER:", err)
  process.exit(1)
}

const elapsedMs = Date.now() - startTime

console.log(
  "\n================================================================================"
)
console.log("                           FINAL TEST EXECUTION SUMMARY")
console.log(
  "================================================================================"
)

let totalPassed = 0
let totalFailed = 0

for (const res of results) {
  totalPassed += res.passed
  totalFailed += res.failed
  const statusIcon = res.failed === 0 ? "✓ PASS" : "✗ FAIL"
  console.log(
    `[${statusIcon}] ${res.suiteName.padEnd(55)}: ${res.passed} passed, ${res.failed} failed`
  )
}

console.log(
  "--------------------------------------------------------------------------------"
)
console.log(
  `TOTAL TESTS: ${totalPassed + totalFailed} | PASSED: ${totalPassed} | FAILED: ${totalFailed} | DURATION: ${elapsedMs}ms`
)
console.log(
  "================================================================================"
)

if (totalFailed > 0) {
  console.error(`\nFAILED SUITES REPORT (${totalFailed} failures):`)
  for (const res of results) {
    if (res.failed > 0) {
      console.error(`\nSuite: ${res.suiteName}`)
      for (const err of res.errors) {
        console.error(`  - [${err.testName}]: ${err.error}`)
      }
    }
  }
  process.exit(1)
} else {
  console.log("\nAll modular test suites passed successfully!")
  process.exit(0)
}
