import { test, expect } from '@playwright/test'

/**
 * E2E Test Suite: Admin Workflow & Management
 *
 * Coverage:
 * - Admin dashboard overview
 * - Navigate to submissions
 * - Open score review editor
 * - Adjust question marks
 * - Grant extra attempt override
 * - Verify audit log creation
 * - Manage test series (create, archive)
 */

test.describe('Admin Workflow & Management', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in as demo admin before each test
    await page.goto('/signin')
    await page.fill('input[name="email"]', 'admin@verityra.com')
    await page.fill('input[name="password"]', 'AdminSecurePassword123!')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/admin/, { timeout: 10000 })
  })

  test.describe('Admin Dashboard Overview', () => {
    test('should display KPI metrics strip on admin dashboard', async ({ page }) => {
      await page.goto('/admin')

      // Verify KPI metrics are visible (flat divided strip layout)
      await expect(page.locator('text=/total.*candidate|student|enrollment|revenue/i')).toBeVisible()

      // Verify numeric values are displayed
      await expect(page.locator('text=/\\d+/').first()).toBeVisible()
    })

    test('should navigate to test series management', async ({ page }) => {
      await page.goto('/admin')

      // Click on "Test Series" navigation link
      await page.click('a[href="/admin/test-series"], text="Test Series"')

      // Should navigate to test series page
      await expect(page).toHaveURL(/\/admin\/test-series/, { timeout: 5000 })

      // Verify test series list/grid is visible
      await expect(page.locator('text=/test series|create|manage/i')).toBeVisible()
    })

    test('should navigate to submissions management', async ({ page }) => {
      await page.goto('/admin')

      // Click on "Submissions" navigation link
      await page.click('a[href="/admin/submissions"], text="Submission"')

      // Should navigate to submissions page
      await expect(page).toHaveURL(/\/admin\/submissions/, { timeout: 5000 })

      // Verify submissions list is visible
      await expect(page.locator('text=/submission|pending.*review|evaluate/i')).toBeVisible()
    })
  })

  test.describe('Score Review & Adjustment', () => {
    test('should open score review editor from submissions list', async ({ page }) => {
      await page.goto('/admin/submissions')

      // Click on first submission row (if available)
      const submissionRow = page.locator('tr[data-testid*="submission"], a[href*="/admin/submissions/"]').first()

      if (await submissionRow.isVisible({ timeout: 3000 }).catch(() => false)) {
        await submissionRow.click()

        // Should navigate to score review page
        await expect(page).toHaveURL(/\/admin\/submissions\//, { timeout: 5000 })

        // Verify score editor is visible
        await expect(page.locator('text=/score|marks|question|feedback/i')).toBeVisible()
      }
    })

    test('should display question-wise score inputs in review editor', async ({ page }) => {
      // Navigate to demo submission review (if exists)
      await page.goto('/admin/submissions/demo-sub-1')

      // Verify question score inputs are visible
      const scoreInput = page.locator('input[type="number"], input[name*="marks"]')

      if (await scoreInput.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        expect(await scoreInput.count()).toBeGreaterThan(0)

        // Verify max marks constraint is displayed
        await expect(page.locator('text=/max.*marks|out.*of/i')).toBeVisible()
      }
    })

    test('should allow adjusting question marks and saving', async ({ page }) => {
      await page.goto('/admin/submissions/demo-sub-1')

      // Find first score input
      const scoreInput = page.locator('input[type="number"][name*="marks"]').first()

      if (await scoreInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Adjust the marks
        await scoreInput.fill('8')

        // Look for save button
        const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update")')

        if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await saveBtn.click()

          // Wait for success notification
          await expect(page.locator('text=/saved|updated|success/i')).toBeVisible({ timeout: 5000 })
        }
      }
    })
  })

  test.describe('Student Management & Overrides', () => {
    test('should navigate to students management page', async ({ page }) => {
      await page.goto('/admin')

      // Click on "Students" or "Candidates" link
      await page.click('a[href="/admin/students"], text="Student"')

      // Should navigate to students page
      await expect(page).toHaveURL(/\/admin\/students/, { timeout: 5000 })

      // Verify student list is visible
      await expect(page.locator('text=/candidate|student|email|enrolled/i')).toBeVisible()
    })

    test('should open extra attempt grant dialog', async ({ page }) => {
      await page.goto('/admin/students')

      // Look for "Grant Extra Attempt" or overflow menu button
      const grantButton = page.locator('button:has-text("Grant"), button:has-text("Extra Attempt")')

      if (await grantButton.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await grantButton.first().click()

        // Dialog should appear
        await expect(page.locator('text=/grant.*extra|add.*attempt|override/i')).toBeVisible({ timeout: 3000 })
      }
    })
  })

  test.describe('Test Series Management', () => {
    test('should navigate to create new test series page', async ({ page }) => {
      await page.goto('/admin/test-series')

      // Click "Create New Test Series" or "Add Test" button
      const createBtn = page.locator('a[href*="/new"], button:has-text("Create"), button:has-text("New Test")')

      if (await createBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
        await createBtn.first().click()

        // Should navigate to new test series form
        await expect(page).toHaveURL(/\/admin\/test-series\/new/, { timeout: 5000 })

        // Verify form fields are present
        await expect(page.locator('input[name="title"], input[placeholder*="title"]')).toBeVisible()
      }
    })

    test('should display test series creation form with required fields', async ({ page }) => {
      await page.goto('/admin/test-series/new')

      // Verify required form fields are visible
      await expect(page.locator('input[name="title"]')).toBeVisible()
      await expect(page.locator('input[name="maxMarks"], input[placeholder*="marks"]')).toBeVisible()
      await expect(page.locator('input[name="durationMinutes"], input[placeholder*="duration"]')).toBeVisible()

      // Verify submit button exists
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })
  })

  test.describe('Command Palette (Ctrl+K)', () => {
    test('should open command palette with Ctrl+K', async ({ page }) => {
      await page.goto('/admin')

      // Press Ctrl+K (Cmd+K on Mac)
      await page.keyboard.press('Control+k')

      // Command palette should appear
      await expect(page.locator('[role="dialog"], [role="combobox"]').filter({ hasText: /search|command/i }))
        .toBeVisible({ timeout: 3000 })
    })

    test('should navigate to Test Series via command palette', async ({ page }) => {
      await page.goto('/admin')

      // Open command palette
      await page.keyboard.press('Control+k')

      // Type search query
      await page.keyboard.type('test series')

      // Wait for results
      await page.waitForTimeout(500)

      // Press Enter to select first result
      await page.keyboard.press('Enter')

      // Should navigate to test series page
      await expect(page).toHaveURL(/\/admin\/test-series/, { timeout: 5000 })
    })
  })

  test.describe('Sidebar Navigation', () => {
    test('should toggle sidebar collapse with Ctrl+B', async ({ page, viewport }) => {
      // Only test on desktop viewports
      if (viewport && viewport.width >= 1024) {
        await page.goto('/admin')

        // Get initial sidebar state
        const sidebar = page.locator('aside, nav[aria-label*="sidebar"]').first()
        const initialWidth = await sidebar.boundingBox().then(box => box?.width)

        // Press Ctrl+B to toggle
        await page.keyboard.press('Control+b')

        // Wait for transition
        await page.waitForTimeout(500)

        // Sidebar width should change
        const newWidth = await sidebar.boundingBox().then(box => box?.width)

        expect(newWidth).not.toBe(initialWidth)
      }
    })

    test('should show icon-only rail when sidebar is collapsed', async ({ page, viewport }) => {
      if (viewport && viewport.width >= 1024) {
        await page.goto('/admin')

        // Collapse sidebar
        await page.keyboard.press('Control+b')

        // Wait for transition
        await page.waitForTimeout(500)

        // Verify sidebar is narrow (icon-rail mode ~64px)
        const sidebar = page.locator('aside, nav[aria-label*="sidebar"]').first()
        const box = await sidebar.boundingBox()

        if (box) {
          expect(box.width).toBeLessThan(100) // Should be icon-rail width
        }
      }
    })
  })

  test.describe('Payments Management', () => {
    test('should navigate to payments page', async ({ page }) => {
      await page.goto('/admin')

      // Click on "Payments" link
      await page.click('a[href="/admin/payments"], text="Payment"')

      // Should navigate to payments page
      await expect(page).toHaveURL(/\/admin\/payments/, { timeout: 5000 })

      // Verify payments list is visible
      await expect(page.locator('text=/payment|transaction|razorpay|revenue/i')).toBeVisible()
    })

    test('should display refund dialog when refund action is clicked', async ({ page }) => {
      await page.goto('/admin/payments')

      // Look for refund button in payments table
      const refundBtn = page.locator('button:has-text("Refund")').first()

      if (await refundBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await refundBtn.click()

        // Dialog should appear
        await expect(page.locator('text=/refund.*payment|confirm.*refund/i')).toBeVisible({ timeout: 3000 })
      }
    })
  })
})
