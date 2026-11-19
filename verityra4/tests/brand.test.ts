import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import {
  BRAND_CONFIG,
  createBrandConfig,
  getBrandTitle,
  getCopyrightText,
  getSupportMailto,
} from "../lib/brand"

export function runBrandTests() {
  const suite = new TestSuite("Module: Centralized Brand Configuration")
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  suite.test(
    "Defaults: BRAND_CONFIG provides Izone identity, initials, and emails",
    () => {
      assert.equal(BRAND_CONFIG.name, "Izone")
      assert.equal(BRAND_CONFIG.shortName, "Izone")
      assert.equal(BRAND_CONFIG.instituteName, "I Zone Coaching Classes")
      assert.equal(BRAND_CONFIG.trainingAcademyName, "I Zone Training Academy")
      assert.equal(BRAND_CONFIG.initials, "I")
      assert.equal(BRAND_CONFIG.monogram, "IZ")
      assert.equal(BRAND_CONFIG.companyName, "I Zone Coaching Classes")
      assert.equal(BRAND_CONFIG.supportEmail, "support@izone.com")
      assert.equal(BRAND_CONFIG.defaultAdminEmail, "admin@izone.com")
      assert.equal(BRAND_CONFIG.defaultCandidateEmail, "candidate@izone.com")
      assert.equal(BRAND_CONFIG.domain, "izone.com")
      assert.equal(BRAND_CONFIG.appDomain, "izone.app")
      assert.equal(
        BRAND_CONFIG.sidebarStorageKey,
        "izone-sidebar-collapsed"
      )
      assert.equal(
        BRAND_CONFIG.legacySidebarStorageKey,
        "verityra-sidebar-collapsed"
      )
      assert.ok(BRAND_CONFIG.securityLabel.includes("Izone"))
      assert.ok(BRAND_CONFIG.platformLabel.includes("Izone"))
      assert.ok(BRAND_CONFIG.evaluatorPersona.includes("Izone"))
      assert.equal(BRAND_CONFIG.contact.phone, "+91 98604 47370")
      assert.equal(BRAND_CONFIG.contact.phoneHref, "tel:+919860447370")
      assert.equal(BRAND_CONFIG.contact.rating, "4.8")
      assert.ok(
        BRAND_CONFIG.contact.address.includes("Chhatrapati Sambhajinagar")
      )
      assert.equal(
        BRAND_CONFIG.contact.weekdayHours,
        "Mon–Sat: 3:00 PM – 9:00 PM"
      )
      assert.equal(BRAND_CONFIG.contact.sundayHours, "Sun: 8:00 AM – 2:00 PM")
      assert.equal(Object.isFrozen(BRAND_CONFIG.contact), true)
      assert.equal(Object.isFrozen(BRAND_CONFIG), true)
    }
  )

  suite.test(
    "Factory: createBrandConfig derives properties cleanly from custom brandName",
    () => {
      const custom = createBrandConfig({ brandName: "Acme Prep" })
      assert.equal(custom.name, "Acme Prep")
      assert.equal(custom.shortName, "Acme Prep")
      assert.equal(custom.initials, "A")
      assert.equal(custom.monogram, "AC")
      assert.equal(custom.companyName, "Acme Prep Technologies")
      assert.equal(custom.domain, "acmeprep.com")
      assert.equal(custom.appDomain, "acmeprep.app")
      assert.equal(custom.supportEmail, "support@acmeprep.com")
      assert.equal(custom.defaultAdminEmail, "admin@acmeprep.com")
      assert.equal(custom.defaultCandidateEmail, "candidate@acmeprep.com")
      assert.equal(custom.sidebarStorageKey, "acmeprep-sidebar-collapsed")
      assert.equal(
        custom.legacySidebarStorageKey,
        "verityra-sidebar-collapsed"
      )
      assert.equal(Object.isFrozen(custom), true)
    }
  )

  suite.test(
    "Factory: createBrandConfig handles whitespace, appName fallback, and supportEmail override",
    () => {
      const blankFallback = createBrandConfig({
        brandName: "   ",
        appName: "  ",
      })
      assert.equal(blankFallback.name, "Izone")

      const appNameFallback = createBrandConfig({
        brandName: "   ",
        appName: "NovaTest",
      })
      assert.equal(appNameFallback.name, "NovaTest")
      assert.equal(appNameFallback.initials, "N")
      assert.equal(appNameFallback.monogram, "NO")

      const emailOverride = createBrandConfig({
        brandName: "Izone",
        supportEmail: " helpdesk@custom.org ",
      })
      assert.equal(emailOverride.supportEmail, "helpdesk@custom.org")
    }
  )

  suite.test("Helpers: getBrandTitle formats default and page titles", () => {
    assert.equal(getBrandTitle(), BRAND_CONFIG.title)
    assert.equal(getBrandTitle("Sign In"), "Sign In | Izone")
    assert.equal(getBrandTitle("Admin Dashboard"), "Admin Dashboard | Izone")

    const custom = createBrandConfig({ brandName: "Acme" })
    assert.equal(getBrandTitle(undefined, custom), custom.title)
    assert.equal(getBrandTitle("Overview", custom), "Overview | Acme")
  })

  suite.test(
    "Helpers: getCopyrightText and getSupportMailto format strings properly",
    () => {
      const currentYear = new Date().getFullYear()
      assert.equal(
        getCopyrightText(),
        `© ${currentYear} I Zone Coaching Classes. All rights reserved.`
      )
      assert.equal(
        getCopyrightText(2025),
        "© 2025 I Zone Coaching Classes. All rights reserved."
      )
      assert.equal(getSupportMailto(), "mailto:support@izone.com")

      const custom = createBrandConfig({
        brandName: "Acme",
        supportEmail: "care@acme.io",
      })
      assert.equal(
        getCopyrightText(2026, custom),
        "© 2026 Acme Technologies. All rights reserved."
      )
      assert.equal(getSupportMailto(custom), "mailto:care@acme.io")
    }
  )

  return suite.summary()
}

if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("tests/brand.test.ts")
) {
  const result = runBrandTests()
  if (result.failed > 0) process.exit(1)
}
