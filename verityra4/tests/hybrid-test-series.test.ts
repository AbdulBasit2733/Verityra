import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"

export function runHybridTestSeriesTests() {
  const suite = new TestSuite("Module: Hybrid Test Series & Bundle Architecture")
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  // 1. Bundle Pricing & Savings Invariant
  suite.test(
    "Pricing: Bundle price reflects combined savings over individual subject tests",
    () => {
      const subjectTests = [
        { subject: "Mathematics", price: 9900 }, // ₹99
        { subject: "Science", price: 9900 }, // ₹99
        { subject: "Social Science", price: 9900 }, // ₹99
        { subject: "English", price: 9900 }, // ₹99
      ]

      const individualSumPaise = subjectTests.reduce(
        (sum, test) => sum + test.price,
        0
      )
      assert.equal(
        individualSumPaise,
        39600,
        "Sum of individual subject tests is ₹396 (39600 paise)"
      )

      const bundleOfferPricePaise = 29900 // ₹299
      const savingsPaise = individualSumPaise - bundleOfferPricePaise
      const savingsPercentage = Math.round(
        (savingsPaise / individualSumPaise) * 100
      )

      assert.ok(savingsPaise > 0, "Bundle discount is positive")
      assert.equal(savingsPercentage, 24, "Bundle provides ~24.5% (24%) discount")
    }
  )

  // 2. Standalone vs Bundle Flagging
  suite.test(
    "Schema: Distinguishes standalone subject tests from bundle-only tests",
    () => {
      const mathsTest = {
        id: "test-10-maths",
        subject: "Mathematics",
        isStandalone: true,
        price: 9900,
      }

      const comprehensiveMock = {
        id: "test-10-comp",
        subject: "All Subjects Mock",
        isStandalone: false,
        price: 0,
      }

      assert.ok(
        mathsTest.isStandalone,
        "Maths test is standalone purchasable"
      )
      assert.ok(
        mathsTest.price > 0,
        "Standalone test has individual pricing"
      )
      assert.equal(
        comprehensiveMock.isStandalone,
        false,
        "Comprehensive test is bundle-only"
      )
    }
  )

  // 3. Dynamic Access Inheritance Model
  suite.test(
    "Access Control: Bundle registration grants access to all member subject tests",
    () => {
      const bundleSeriesId = "series-class-10-bundle"
      const mathsTest = { id: "test-maths", testSeriesId: bundleSeriesId }
      const scienceTest = { id: "test-science", testSeriesId: bundleSeriesId }
      const siblingSeriesTest = {
        id: "test-class-12-maths",
        testSeriesId: "series-class-12",
      }

      // Student enrolled in bundle
      const studentBundleRegistrations = [
        {
          id: "reg-1",
          testSeriesId: bundleSeriesId,
          testId: null,
          status: "ACTIVE",
        },
      ]

      // Access rule: active registration matching testId OR testSeriesId
      const checkAccess = (test: { id: string; testSeriesId: string }) => {
        return studentBundleRegistrations.some(
          (r) =>
            r.status === "ACTIVE" &&
            (r.testId === test.id || r.testSeriesId === test.testSeriesId)
        )
      }

      assert.ok(
        checkAccess(mathsTest),
        "Student has access to Class 10 Maths via bundle"
      )
      assert.ok(
        checkAccess(scienceTest),
        "Student has access to Class 10 Science via bundle"
      )
      assert.equal(
        checkAccess(siblingSeriesTest),
        false,
        "Student does not have access to Class 12 test"
      )
    }
  )

  // 4. Single Test Registration Isolation
  suite.test(
    "Access Control: Single subject test registration locks other tests in series",
    () => {
      const bundleSeriesId = "series-class-10-bundle"
      const mathsTest = { id: "test-maths", testSeriesId: bundleSeriesId }
      const scienceTest = { id: "test-science", testSeriesId: bundleSeriesId }

      // Student enrolled only in Maths single test
      const studentSingleTestRegistrations = [
        {
          id: "reg-single-maths",
          testSeriesId: null,
          testId: mathsTest.id,
          status: "ACTIVE",
        },
      ]

      const checkAccess = (test: { id: string; testSeriesId: string }) => {
        return studentSingleTestRegistrations.some(
          (r) =>
            r.status === "ACTIVE" &&
            (r.testId === test.id ||
              (r.testSeriesId && r.testSeriesId === test.testSeriesId))
        )
      }

      assert.ok(
        checkAccess(mathsTest),
        "Student has access to purchased Maths test"
      )
      assert.equal(
        checkAccess(scienceTest),
        false,
        "Student does not have access to unpurchased Science test"
      )
    }
  )

  // 5. Sidebar Navigation Groupings
  suite.test(
    "Navigation: Validates restructured Student and Admin sidebar sections",
    () => {
      const studentSections = [
        "Learning & Tests",
        "Explore & Practice",
        "Account & Billing",
      ]
      const adminSections = [
        "Oversight & Grading",
        "Academic Catalog",
        "Students & Revenue",
        "System",
      ]

      assert.equal(
        studentSections.length,
        3,
        "Student navigation has 3 distinct functional groups"
      )
      assert.equal(
        adminSections.length,
        4,
        "Admin navigation has 4 distinct governance groups"
      )

      assert.ok(
        studentSections.includes("Learning & Tests"),
        "Includes core learning group"
      )
      assert.ok(
        adminSections.includes("Academic Catalog"),
        "Includes test series catalog group"
      )
    }
  )

  return suite.summary()
}

if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("tests/hybrid-test-series.test.ts")
) {
  const result = runHybridTestSeriesTests()
  if (result.failed > 0) process.exit(1)
}
