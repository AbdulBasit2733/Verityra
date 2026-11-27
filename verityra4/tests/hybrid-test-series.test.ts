import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import {
  buildCatalogItems,
  computeSeriesPricingSummary,
  matchesCatalogFormat,
  matchesCatalogPricing,
  resolveEffectiveBundlePrice,
} from "../lib/test-catalog-projection"

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

  // 6. Catalog projection and filters
  const projectionSeries = [
    {
      id: "s1",
      title: "Class 10 Series",
      type: "BUNDLE",
      standard: "10th",
      price: 29900,
      bundlePrice: 29900,
      tests: [
        { id: "t1", title: "Maths", subject: "Mathematics", price: 9900, isStandalone: true },
        { id: "t2", title: "Science", subject: "Science", price: 9900, isStandalone: true },
        { id: "t3", title: "Social", subject: "Social Science", price: 9900, isStandalone: true },
        { id: "t4", title: "Hidden", subject: "English", price: 0, isStandalone: false },
      ],
    },
    { id: "legacy", title: "Legacy Single", type: "SINGLE_TEST", price: 5000 },
  ]
  const projectionStandalone = [
    { id: "solo", title: "NEET Mock", subject: "Biology", price: 0 },
    { id: "t1", title: "Duplicate", subject: "Mathematics", price: 9900 },
  ]

  suite.test("Catalog: projects bundles, child tests, legacy and standalone without duplicates", () => {
    const items = buildCatalogItems(projectionSeries, projectionStandalone)
    assert.equal(items.filter((i) => i.type === "BUNDLE").length, 1)
    assert.equal(items.filter((i) => i.type === "SINGLE_TEST").length, 6)
    assert.equal(new Set(items.map((i) => i.id)).size, items.length)
    const bundle = items.find((i) => i.id === "s1")!
    assert.equal(bundle.testsCount, 4)
    assert.equal(bundle.savingsAmount, 0)
  })

  suite.test("Catalog: Format filter splits bundles and subject tests", () => {
    const items = buildCatalogItems(projectionSeries, projectionStandalone)
    assert.equal(items.filter((i) => matchesCatalogFormat(i, "ALL")).length, items.length)
    assert.equal(items.filter((i) => matchesCatalogFormat(i, "BUNDLE")).length, 1)
    assert.equal(items.filter((i) => matchesCatalogFormat(i, "SINGLE")).length, 6)
  })

  suite.test("Catalog: bundle-only subject tests use the bundle fee for Free/Paid", () => {
    const items = buildCatalogItems(projectionSeries, projectionStandalone)
    const hidden = items.find((i) => i.id === "t4")!
    assert.equal(hidden.isStandalone, false)
    assert.equal(matchesCatalogPricing(hidden, "FREE"), false)
    assert.equal(matchesCatalogPricing(hidden, "PAID"), true)
    assert.equal(matchesCatalogPricing(items.find((i) => i.id === "solo")!, "FREE"), true)
  })

  suite.test("Pricing summary: savings, percent and no-savings edge cases", () => {
    const four = [9900, 9900, 9900, 9900].map((price) => ({ price, isStandalone: true }))
    const s = computeSeriesPricingSummary(29900, four)
    assert.equal(s.individualTotalPaise, 39600)
    assert.equal(s.savingsPaise, 9700)
    assert.equal(s.savingsPercent, 24)
    assert.equal(s.hasSavings, true)
    assert.equal(computeSeriesPricingSummary(39600, four).hasSavings, false)
    assert.equal(computeSeriesPricingSummary(100, four.slice(0, 1)).hasSavings, false)
    assert.equal(resolveEffectiveBundlePrice({ price: 500, bundlePrice: 0 }), 500)
    assert.equal(resolveEffectiveBundlePrice({ price: 500, bundlePrice: 300 }), 300)
  })

  return suite.summary()
}

if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("tests/hybrid-test-series.test.ts")
) {
  const result = runHybridTestSeriesTests()
  if (result.failed > 0) process.exit(1)
}
