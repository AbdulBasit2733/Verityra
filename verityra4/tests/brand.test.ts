import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import {
  siteConfig,
  getSiteTitle,
  createSiteConfig,
} from "../config/site"
import {
  BRAND_CONFIG,
  createBrandConfig,
  getBrandTitle,
  getCopyrightText,
  getSupportMailto,
} from "../lib/brand"

export function runBrandTests() {
  const suite = new TestSuite("Module: Centralized Brand & Site Configuration")
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  suite.test(
    "Defaults: siteConfig and BRAND_CONFIG provide i ZONE identity, initials, and emails",
    () => {
      // Re-export parity
      assert.strictEqual(BRAND_CONFIG, siteConfig)

      // Primary identity
      assert.equal(siteConfig.name, "i ZONE")
      assert.equal(siteConfig.logo, "/izone-logo.png")
      assert.equal(siteConfig.shortName, "i ZONE")
      assert.equal(siteConfig.instituteName, "I Zone Coaching Classes")
      assert.equal(siteConfig.trainingAcademyName, "I Zone Training Academy")
      assert.equal(siteConfig.initials, "I")
      assert.equal(siteConfig.monogram, "IZ")
      assert.equal(siteConfig.companyName, "I Zone Coaching Classes")

      // Contact & location
      assert.equal(siteConfig.contact.phone, "+91 98604 47370")
      assert.equal(siteConfig.contact.phoneHref, "tel:+919860447370")
      assert.equal(siteConfig.contact.rating, "4.8")
      assert.ok(
        siteConfig.contact.address.includes("Chhatrapati Sambhajinagar")
      )
      assert.equal(
        siteConfig.contact.weekdayHours,
        "Mon–Sat: 3:00 PM – 9:00 PM"
      )
      assert.equal(siteConfig.contact.sundayHours, "Sun: 8:00 AM – 2:00 PM")
      assert.equal(siteConfig.links.phone, "tel:+919860447370")
      assert.equal(
        siteConfig.links.justdial,
        siteConfig.contact.justdialUrl
      )
      assert.equal(
        siteConfig.links.trainingAcademy,
        siteConfig.contact.trainingAcademyUrl
      )

      // Domains & Emails
      assert.equal(siteConfig.supportEmail, "support@izone.com")
      assert.equal(siteConfig.defaultAdminEmail, "admin@izone.com")
      assert.equal(siteConfig.defaultCandidateEmail, "candidate@izone.com")
      assert.equal(siteConfig.domain, "izone.com")
      assert.equal(siteConfig.appDomain, "izone.app")

      // Storage keys & labels
      assert.equal(siteConfig.sidebarStorageKey, "izone-sidebar-collapsed")
      assert.equal(
        siteConfig.legacySidebarStorageKey,
        "verityra-sidebar-collapsed"
      )
      assert.ok(siteConfig.securityLabel.includes("i ZONE"))
      assert.ok(siteConfig.platformLabel.includes("i ZONE"))
      assert.ok(siteConfig.evaluatorPersona.includes("i ZONE"))

      // Immutability
      assert.equal(Object.isFrozen(siteConfig.contact), true)
      assert.equal(Object.isFrozen(siteConfig.links), true)
      assert.equal(Object.isFrozen(siteConfig), true)
    }
  )

  suite.test(
    "Factory: createSiteConfig derives properties cleanly from custom brandName",
    () => {
      // Calling with no overrides returns immutable static config
      assert.strictEqual(createSiteConfig(), siteConfig)
      assert.strictEqual(createBrandConfig(), siteConfig)

      const custom = createSiteConfig({ brandName: "Acme Prep" })
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
      assert.equal(blankFallback.name, "i ZONE")
      assert.equal(blankFallback.companyName, "I Zone Coaching Classes")

      const appNameFallback = createBrandConfig({
        brandName: "   ",
        appName: "NovaTest",
      })
      assert.equal(appNameFallback.name, "NovaTest")
      assert.equal(appNameFallback.initials, "N")
      assert.equal(appNameFallback.monogram, "NO")

      const emailOverride = createBrandConfig({
        brandName: "i ZONE",
        supportEmail: " helpdesk@custom.org ",
      })
      assert.equal(emailOverride.supportEmail, "helpdesk@custom.org")
    }
  )

  suite.test("Helpers: getSiteTitle and getBrandTitle format default and page titles", () => {
    assert.equal(getSiteTitle(), siteConfig.title)
    assert.equal(getBrandTitle(), siteConfig.title)
    assert.equal(getSiteTitle("Sign In"), "Sign In | i ZONE")
    assert.equal(getBrandTitle("Sign In"), "Sign In | i ZONE")
    assert.equal(getBrandTitle("Admin Dashboard"), "Admin Dashboard | i ZONE")

    const custom = createBrandConfig({ brandName: "Acme" })
    assert.equal(getSiteTitle(undefined, custom), custom.title)
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
