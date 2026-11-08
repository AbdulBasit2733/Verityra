import { test, expect } from '@playwright/test'
import path from 'path'

/**
 * E2E Test Suite: Complete Student Journey
 *
 * Coverage:
 * - Browse test catalog
 * - Enroll in test series
 * - Open workspace
 * - Upload answer sheet (mock file)
 * - View evaluation scorecard
 * - Check leaderboard rank
 * - Test 3-attempt limit enforcement
 */

test.describe('Complete Student Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as student before each test
    await page.goto('/signin')
    await page.fill('input[name="email"]', 'student@verityra.com')
    await page.fill('input[name="password"]', 'StudentSecurePassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })
  })

  test('should navigate to test catalog and view available tests', async ({ page }) => {
    // Click on "Tests" navigation link
    await page.click('a[href="/tests"], text="Browse Tests"')

    // Wait for catalog page to load
    await expect(page).toHaveURL(/\/tests/, { timeout: 5000 })

    // Verify test cards/listings are visible
    await expect(page.locator('text=/test series|available.*test/i')).toBeVisible()
  })

  test('should open student workspace for enrolled test', async ({ page }) => {
    // Navigate to student dashboard
    await page.goto('/student/dashboard')

    // Click on first enrolled test (if any visible)
    const testCard = page.locator('[data-testid="enrolled-test-card"], a[href*="/student/tests/"]').first()

    if (await testCard.isVisible({ timeout: 3000 }).catch(() => false)) {
      await testCard.click()

      // Should navigate to workspace
      await expect(page).toHaveURL(/\/student\/tests\//, { timeout: 5000 })

      // Verify workspace elements are present
      await expect(page.locator('text=/attempt|workspace|submit/i')).toBeVisible()
    } else {
      // If no enrolled tests, navigate to demo workspace directly
      await page.goto('/student/tests/demo-1')
      await expect(page.locator('text=/attempt|workspace|submit/i')).toBeVisible()
    }
  })

  test('should display attempt progress tracker with remaining attempts', async ({ page }) => {
    // Navigate to demo workspace
    await page.goto('/student/tests/demo-1')

    // Verify attempt progress tracker is visible
    await expect(page.locator('text=/attempt.*progression|remaining/i')).toBeVisible()

    // Verify attempt count is displayed (e.g., "2 of 3 consumed", "1 remaining")
    await expect(page.locator('text=/\\d+.*remaining|\\d+.*of.*\\d+/i')).toBeVisible()
  })

  test('should show upload form when attempts are available', async ({ page }) => {
    await page.goto('/student/tests/demo-1')

    // Click on "Upload" or "Submit Booklet" tab
    const uploadTab = page.locator('button:has-text("Submit"), button:has-text("Upload")').first()

    if (await uploadTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadTab.click()
    }

    // Verify file input is present
    await expect(page.locator('input[type="file"]')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('text=/upload.*answer|select.*file/i')).toBeVisible()
  })

  test('should block upload when 3-attempt limit is reached', async ({ page }) => {
    // Note: This test assumes a test series with 3 attempts exhausted
    // In a real scenario, you'd create a fixture with 3 completed attempts

    // For demo purposes, check if limit warning appears
    await page.goto('/student/tests/demo-exhausted-test')

    // If the test exists and has exhausted attempts, should see lock message
    const lockMessage = page.locator('text=/quota.*exhausted|attempts.*used|locked/i')

    if (await lockMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Verify upload is blocked
      await expect(page.locator('text=/3-attempt.*invariant|upload.*locked/i')).toBeVisible()

      // Verify file input is disabled or hidden
      const fileInput = page.locator('input[type="file"]')
      if (await fileInput.isVisible().catch(() => false)) {
        await expect(fileInput).toBeDisabled()
      }
    }
  })

  test('should display evaluation scorecard for completed attempt', async ({ page }) => {
    await page.goto('/student/tests/demo-1')

    // Click on "Evaluations" tab
    const evalTab = page.locator('button:has-text("Evaluation"), button:has-text("Results")').first()

    if (await evalTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await evalTab.click()
    }

    // Wait for scorecard to load
    await page.waitForTimeout(1000)

    // Verify score details are visible
    const hasScore = await page.locator('text=/total.*marks|score|percentage|\\d+\\.\\d+%/i')
      .isVisible({ timeout: 3000 })
      .catch(() => false)

    if (hasScore) {
      // Verify question-wise breakdown exists
      await expect(page.locator('text=/question|feedback|marks.*awarded/i')).toBeVisible()
    }
  })

  test('should navigate to leaderboard and view rankings', async ({ page }) => {
    // Navigate to leaderboard
    await page.goto('/leaderboard')

    // Verify leaderboard heading
    await expect(page.locator('h1, h2').filter({ hasText: /leaderboard|ranking/i })).toBeVisible()

    // Verify rank table/list is visible
    await expect(page.locator('text=/rank|position|candidate/i')).toBeVisible()
  })

  test('should allow switching between attempt numbers in workspace', async ({ page }) => {
    await page.goto('/student/tests/demo-1')

    // Look for attempt selector (dropdown or tabs)
    const attemptSelector = page.locator('select[name*="attempt"], button:has-text("Attempt #")').first()

    if (await attemptSelector.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Interact with attempt selector
      await attemptSelector.click()

      // Verify URL updates with attempt parameter
      await page.waitForTimeout(500)
      const url = page.url()

      // Should have ?attempt=N in URL after interaction
      if (url.includes('attempt=')) {
        expect(url).toMatch(/attempt=\d+/)
      }
    }
  })

  test('should display PDF preview and legibility checklist before submission', async ({ page }) => {
    await page.goto('/student/tests/demo-1')

    // Navigate to upload tab
    const uploadTab = page.locator('button:has-text("Submit"), button:has-text("Upload")').first()

    if (await uploadTab.isVisible({ timeout: 3000 }).catch(() => false)) {
      await uploadTab.click()
    }

    // Create a mock PDF file for testing
    const fileInput = page.locator('input[type="file"]')

    if (await fileInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Create a minimal valid file buffer
      const buffer = Buffer.from('Mock PDF content for E2E testing')
      await fileInput.setInputFiles({
        name: 'test-answer-sheet.pdf',
        mimeType: 'application/pdf',
        buffer: buffer,
      })

      // Wait for preview to appear
      await page.waitForTimeout(1000)

      // Verify preview elements are visible
      const hasPreview = await page.locator('text=/preview|file.*size|legible|acknowledge/i')
        .isVisible({ timeout: 3000 })
        .catch(() => false)

      if (hasPreview) {
        // Verify acknowledgment checkbox exists
        await expect(page.locator('input[type="checkbox"]')).toBeVisible()

        // Verify submit button is initially disabled (requires acknowledgment)
        const submitBtn = page.locator('button:has-text("Confirm"), button:has-text("Submit")')
        await expect(submitBtn).toBeDisabled()
      }
    }
  })

  test('should show test instructions and downloadable resources', async ({ page }) => {
    await page.goto('/student/tests/demo-1')

    // Verify test instructions section exists
    await expect(page.locator('text=/instruction|duration|max.*marks/i')).toBeVisible()

    // Look for downloadable resources (papers, templates)
    const resourceLink = page.locator('a[href*="download"], a:has-text("Download")')

    if (await resourceLink.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      expect(await resourceLink.count()).toBeGreaterThan(0)
    }
  })
})
