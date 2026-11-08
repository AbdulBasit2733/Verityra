import assert from "node:assert/strict"

export interface TestResult {
  suiteName: string
  passed: number
  failed: number
  errors: Array<{ testName: string; error: string }>
}

export class TestSuite {
  name: string
  passed = 0
  failed = 0
  errors: Array<{ testName: string; error: string }> = []

  constructor(name: string) {
    this.name = name
  }

  test(testName: string, fn: () => void | Promise<void>) {
    try {
      const res = fn()
      if (res instanceof Promise) {
        throw new Error(`Asynchronous test "${testName}" should be awaited or handled synchronously in unit tests`)
      }
      this.passed++
      console.log(`  ✓ ${testName}`)
    } catch (err: any) {
      this.failed++
      const msg = err?.message || String(err)
      console.error(`  ✗ ${testName}`)
      console.error(`    Error: ${msg}`)
      this.errors.push({ testName, error: msg })
    }
  }

  async testAsync(testName: string, fn: () => Promise<void>) {
    try {
      await fn()
      this.passed++
      console.log(`  ✓ ${testName}`)
    } catch (err: any) {
      this.failed++
      const msg = err?.message || String(err)
      console.error(`  ✗ ${testName}`)
      console.error(`    Error: ${msg}`)
      this.errors.push({ testName, error: msg })
    }
  }

  summary(): TestResult {
    console.log(`\n  Suite Result: ${this.passed} passed, ${this.failed} failed\n`)
    return {
      suiteName: this.name,
      passed: this.passed,
      failed: this.failed,
      errors: this.errors,
    }
  }
}
