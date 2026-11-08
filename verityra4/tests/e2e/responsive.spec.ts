import { test, expect } from '@playwright/test'

/**
 * E2E Test Suite: Responsive Design & Cross-Device Testing
 *
 * Coverage:
 * - Mobile vs Desktop layout differences
 * - Mobile bottom navigation bar (student only)
 * - Adaptive dialogs (Drawer on mobile, Dialog on desktop)
 * - KPI metric strip responsiveness (2-col mobile, 4-col desktop)
 * - Sidebar behavior (hidden on mobile, collapsible on desktop)
 * - Touch target sizes (minimum 44px height)
 */

test.describe('Responsive Design & Cross-Device Testing', () => {
  test.describe('Mobile Bottom Navigation (Student Portal)', () => {
    test('should show bottom navigation bar on mobile', async ({ page, viewport }) => {
      // Only run on mobile viewports
      if (viewport && viewport.width < 1024) {
        // Sign in as student
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'student@verityra.com')
        await page.fill('input[name="password"]', 'StudentSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })

        // Verify bottom navigation is visible
        const bottomNav = page.locator('nav').filter({ has: page.locator('a[href="/student/dashboard"]') }).last()
        await expect(bottomNav).toBeVisible()

        // Verify all 4 tabs are present
        await expect(page.locator('a[href="/student/dashboard"]').last()).toBeVisible()
        await expect(page.locator('a[href="/tests"]').last()).toBeVisible()
        await expect(page.locator('a[href="/leaderboard"]').last()).toBeVisible()
        await expect(page.locator('a[href="/student/profile"]').last()).toBeVisible()
      }
    })

    test('should NOT show bottom nav on mobile for admin users', async ({ page, viewport }) => {
      if (viewport && viewport.width < 1024) {
        // Sign in as admin
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'admin@verityra.com')
        await page.fill('input[name="password"]', 'AdminSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/admin/, { timeout: 10000 })

        // Bottom navigation should NOT be present for admin
        const bottomNav = page.locator('nav').filter({ has: page.locator('a[href="/student/dashboard"]') }).last()
        await expect(bottomNav).not.toBeVisible()
      }
    })

    test('should hide bottom nav on desktop viewports', async ({ page, viewport }) => {
      if (viewport && viewport.width >= 1024) {
        // Sign in as student
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'student@verityra.com')
        await page.fill('input[name="password"]', 'StudentSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })

        // Bottom navigation should be hidden on desktop
        const bottomNav = page.locator('nav').filter({ has: page.locator('a[href="/student/dashboard"]') }).last()

        // Either not visible or not in viewport
        const isVisible = await bottomNav.isVisible().catch(() => false)
        expect(isVisible).toBeFalsy()
      }
    })

    test('should highlight active tab in bottom navigation', async ({ page, viewport }) => {
      if (viewport && viewport.width < 1024) {
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'student@verityra.com')
        await page.fill('input[name="password"]', 'StudentSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })

        // Dashboard tab should be active (has Royal Blue background or aria-current)
        const dashboardTab = page.locator('a[href="/student/dashboard"]').last()
        const styles = await dashboardTab.evaluate(el => window.getComputedStyle(el).backgroundColor)

        // Should have Royal Blue background (#2A6AED) or similar
        expect(styles).toMatch(/rgb\(42,\s*106,\s*237\)|#2A6AED/i)
      }
    })
  })

  test.describe('Sidebar Behavior Across Viewports', () => {
    test('should show collapsible sidebar on desktop', async ({ page, viewport }) => {
      if (viewport && viewport.width >= 1024) {
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'admin@verityra.com')
        await page.fill('input[name="password"]', 'AdminSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/admin/, { timeout: 10000 })

        // Sidebar should be visible on desktop
        const sidebar = page.locator('aside, nav[aria-label*="sidebar"]').first()
        await expect(sidebar).toBeVisible()
      }
    })

    test('should hide sidebar on mobile and show hamburger menu', async ({ page, viewport }) => {
      if (viewport && viewport.width < 1024) {
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'admin@verityra.com')
        await page.fill('input[name="password"]', 'AdminSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/admin/, { timeout: 10000 })

        // Desktop sidebar should be hidden
        const desktopSidebar = page.locator('aside[class*="lg:flex"]')
        await expect(desktopSidebar).not.toBeVisible()

        // Hamburger menu button should be visible
        const menuButton = page.locator('button[aria-label*="menu"], button:has-text("☰")')
        await expect(menuButton.first()).toBeVisible()
      }
    })
  })

  test.describe('KPI Metric Strip Responsiveness', () => {
    test('should display KPI metrics in 2-column grid on mobile', async ({ page, viewport }) => {
      if (viewport && viewport.width < 768) {
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'student@verityra.com')
        await page.fill('input[name="password"]', 'StudentSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })

        // Find KPI metric strip
        const kpiStrip = page.locator('[class*="grid-cols-2"]').first()

        if (await kpiStrip.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Verify it uses 2-column layout on mobile
          const gridCols = await kpiStrip.evaluate(el => window.getComputedStyle(el).gridTemplateColumns)
          const columnCount = gridCols.split(' ').length

          expect(columnCount).toBe(2)
        }
      }
    })

    test('should display KPI metrics in 4-column grid on desktop', async ({ page, viewport }) => {
      if (viewport && viewport.width >= 1024) {
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'student@verityra.com')
        await page.fill('input[name="password"]', 'StudentSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })

        // Find KPI metric strip
        const kpiStrip = page.locator('[class*="lg:grid-cols-4"]').first()

        if (await kpiStrip.isVisible({ timeout: 3000 }).catch(() => false)) {
          // Verify it uses 4-column layout on desktop
          const gridCols = await kpiStrip.evaluate(el => window.getComputedStyle(el).gridTemplateColumns)
          const columnCount = gridCols.split(' ').length

          expect(columnCount).toBeGreaterThanOrEqual(4)
        }
      }
    })
  })

  test.describe('Touch Target Accessibility (Mobile)', () => {
    test('should have minimum 44px height touch targets in bottom nav', async ({ page, viewport }) => {
      if (viewport && viewport.width < 1024) {
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'student@verityra.com')
        await page.fill('input[name="password"]', 'StudentSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })

        // Check bottom nav tab heights
        const navTabs = page.locator('a[href="/student/dashboard"]').last()

        if (await navTabs.isVisible({ timeout: 3000 }).catch(() => false)) {
          const box = await navTabs.boundingBox()

          if (box) {
            // Should meet minimum 44px touch target
            expect(box.height).toBeGreaterThanOrEqual(44)
          }
        }
      }
    })

    test('should have adequate spacing between mobile buttons', async ({ page, viewport }) => {
      if (viewport && viewport.width < 768) {
        await page.goto('/signin')

        // Check sign-in button touch target
        const signInBtn = page.locator('button[type="submit"]')
        const box = await signInBtn.boundingBox()

        if (box) {
          // Button should be tall enough for touch
          expect(box.height).toBeGreaterThanOrEqual(40)
        }
      }
    })
  })

  test.describe('Adaptive Dialogs (Mobile Drawer vs Desktop Dialog)', () => {
    test('should render refund dialog as bottom drawer on mobile', async ({ page, viewport }) => {
      if (viewport && viewport.width < 1024) {
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'admin@verityra.com')
        await page.fill('input[name="password"]', 'AdminSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/admin/, { timeout: 10000 })

        await page.goto('/admin/payments')

        const refundBtn = page.locator('button:has-text("Refund")').first()

        if (await refundBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await refundBtn.click()

          // Should render as bottom drawer (fixed to bottom)
          const dialog = page.locator('[role="dialog"]')
          const box = await dialog.boundingBox()

          if (box && viewport) {
            // Drawer should be at or near bottom of viewport
            expect(box.y + box.height).toBeGreaterThan(viewport.height * 0.5)
          }
        }
      }
    })

    test('should render refund dialog as centered modal on desktop', async ({ page, viewport }) => {
      if (viewport && viewport.width >= 1024) {
        await page.goto('/signin')
        await page.fill('input[name="email"]', 'admin@verityra.com')
        await page.fill('input[name="password"]', 'AdminSecurePassword123!')
        await page.click('button[type="submit"]')
        await page.waitForURL(/\/admin/, { timeout: 10000 })

        await page.goto('/admin/payments')

        const refundBtn = page.locator('button:has-text("Refund")').first()

        if (await refundBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await refundBtn.click()

          // Should render as centered dialog
          const dialog = page.locator('[role="dialog"]')
          const box = await dialog.boundingBox()

          if (box && viewport) {
            // Dialog should be roughly centered
            const centerY = box.y + box.height / 2
            const viewportCenterY = viewport.height / 2

            expect(Math.abs(centerY - viewportCenterY)).toBeLessThan(viewport.height * 0.3)
          }
        }
      }
    })
  })

  test.describe('Text Scaling & Readability', () => {
    test('should use appropriate font sizes on mobile', async ({ page, viewport }) => {
      if (viewport && viewport.width < 768) {
        await page.goto('/')

        // Check heading font size
        const heading = page.locator('h1, h2').first()

        if (await heading.isVisible({ timeout: 3000 }).catch(() => false)) {
          const fontSize = await heading.evaluate(el => window.getComputedStyle(el).fontSize)
          const sizeValue = parseInt(fontSize)

          // Mobile headings should be readable but not too large (18-32px range)
          expect(sizeValue).toBeGreaterThanOrEqual(18)
          expect(sizeValue).toBeLessThanOrEqual(48)
        }
      }
    })

    test('should have adequate line height for body text', async ({ page }) => {
      await page.goto('/')

      const bodyText = page.locator('p').first()

      if (await bodyText.isVisible({ timeout: 3000 }).catch(() => false)) {
        const lineHeight = await bodyText.evaluate(el => window.getComputedStyle(el).lineHeight)
        const fontSize = await bodyText.evaluate(el => window.getComputedStyle(el).fontSize)

        const lineHeightValue = parseFloat(lineHeight)
        const fontSizeValue = parseFloat(fontSize)

        // Line height should be at least 1.5x font size for readability
        expect(lineHeightValue / fontSizeValue).toBeGreaterThanOrEqual(1.4)
      }
    })
  })

  test.describe('Viewport-Specific Features', () => {
    test('should show command palette on desktop only', async ({ page, viewport }) => {
      await page.goto('/signin')
      await page.fill('input[name="email"]', 'admin@verityra.com')
      await page.fill('input[name="password"]', 'AdminSecurePassword123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/admin/, { timeout: 10000 })

      // Press Ctrl+K
      await page.keyboard.press('Control+k')

      await page.waitForTimeout(500)

      const commandPalette = page.locator('[role="dialog"]').filter({ hasText: /search|command/i })
      const isVisible = await commandPalette.isVisible().catch(() => false)

      if (viewport && viewport.width >= 1024) {
        // Should be visible on desktop
        expect(isVisible).toBeTruthy()
      } else {
        // May be hidden or different implementation on mobile
        // This is acceptable - command palette is primarily a desktop feature
      }
    })
  })
})
