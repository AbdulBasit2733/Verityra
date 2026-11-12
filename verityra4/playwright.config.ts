import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright E2E Test Configuration - Verityra Platform
 *
 * Test Targets:
 * - Desktop Chrome (1280×800) - Primary desktop experience
 * - Mobile iPhone SE (375×667) - Smallest modern mobile viewport
 * - Mobile iPhone 14 (390×844) - Current-gen standard mobile
 *
 * Features:
 * - Parallel execution in development, sequential in CI
 * - Automatic dev server startup
 * - HTML reporter with screenshots/traces on failure
 * - Retries: 2 in CI, 0 locally for fast feedback
 */

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: "Mobile iPhone SE",
      use: {
        ...devices["iPhone SE"],
        viewport: { width: 375, height: 667 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: "Mobile iPhone 14",
      use: {
        ...devices["iPhone 14"],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],

  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
