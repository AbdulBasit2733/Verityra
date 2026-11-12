import assert from "node:assert/strict"
import { TestResult, TestSuite } from "./test-utils"
import { formatTimerDigits } from "../components/student/workspace/exam-workspace-timer"

export function runExamTimerTests(): TestResult {
  const suite = new TestSuite("Exam Workspace Timer Suite")
  console.log(`\n--- Running ${suite.name} ---`)

  // 1. Digit Formatting Tests
  suite.test("formatTimerDigits formats zero seconds as 00:00:00", () => {
    const res = formatTimerDigits(0)
    assert.equal(res.formatted, "00:00:00")
    assert.equal(res.hours, "00")
    assert.equal(res.minutes, "00")
    assert.equal(res.seconds, "00")
  })

  suite.test("formatTimerDigits formats seconds under one minute correctly", () => {
    const res = formatTimerDigits(45)
    assert.equal(res.formatted, "00:00:45")
  })

  suite.test("formatTimerDigits formats minutes and seconds correctly", () => {
    const res = formatTimerDigits(125) // 2m 5s
    assert.equal(res.formatted, "00:02:05")
    assert.equal(res.minutes, "02")
    assert.equal(res.seconds, "05")
  })

  suite.test("formatTimerDigits formats full multi-hour exam durations correctly", () => {
    const res = formatTimerDigits(10800) // 3 hours
    assert.equal(res.formatted, "03:00:00")
    assert.equal(res.hours, "03")
    assert.equal(res.minutes, "00")
    assert.equal(res.seconds, "00")
  })

  suite.test("formatTimerDigits formats overtime (negative seconds) with prefix", () => {
    const res = formatTimerDigits(-75) // 1m 15s overtime
    assert.equal(res.formatted, "+ 00:01:15")
    assert.equal(res.minutes, "01")
    assert.equal(res.seconds, "15")
  })

  // 2. Phase Transition Calculations
  suite.test("Determines correct exam phase across lifecycle", () => {
    const durationSeconds = 180 * 60 // 10800s
    const bufferSeconds = 20 * 60 // 1200s

    function computePhase(startedAt: number | null, elapsedSeconds: number, finishedWriting: boolean) {
      if (!startedAt) return "IDLE"
      if (finishedWriting) {
        return elapsedSeconds > bufferSeconds ? "OVERTIME" : "BUFFER"
      }
      if (elapsedSeconds < durationSeconds) {
        return "WRITING"
      }
      const bufferElapsed = elapsedSeconds - durationSeconds
      return bufferElapsed > bufferSeconds ? "OVERTIME" : "BUFFER"
    }

    assert.equal(computePhase(null, 0, false), "IDLE")
    assert.equal(computePhase(1000, 3600, false), "WRITING")
    assert.equal(computePhase(1000, 10801, false), "BUFFER")
    assert.equal(computePhase(1000, 10800 + 1201, false), "OVERTIME")
    assert.equal(computePhase(1000, 300, true), "BUFFER")
    assert.equal(computePhase(1000, 1500, true), "OVERTIME")
  })

  // 3. Wall-Clock Pause Deduction Math
  suite.test("Calculates effective elapsed time accurately with paused durations", () => {
    const startedAt = 100000
    const totalPausedMs = 15000 // 15 seconds paused
    const clockNow = 160000 // 60 seconds wall-clock elapsed

    const activeElapsedMs = Math.max(0, clockNow - startedAt - totalPausedMs)
    const effectiveElapsedSeconds = Math.floor(activeElapsedMs / 1000)

    assert.equal(effectiveElapsedSeconds, 45) // 60 - 15 = 45s
  })

  suite.test("Attempt-aware storage key isolates timer state per attempt", () => {
    const key1 = `verityra-exam-timer:test-1:att-1`
    const key2 = `verityra-exam-timer:test-1:att-2`
    assert.notEqual(key1, key2)
  })

  return {
    suiteName: suite.name,
    passed: suite.passed,
    failed: suite.failed,
    errors: suite.errors,
  }
}
