import { test, expect } from '@playwright/test'

/**
 * E2E Test Suite: Authentication & Identity
 *
 * Coverage:
 * - Student sign-up flow
 * - Student/Admin sign-in
 * - Role-based access control (RBAC)
 * - Password reset flow
 * - Unauthorized access blocking
 */

test.describe('Authentication & Identity', () => {
  test.describe('Student Sign-Up', () => {
    test('should successfully register a new student account', async ({ page }) => {
      await page.goto('/signup')

      // Verify page loaded
      await expect(page.locator('h1, h2').filter({ hasText: /sign up|register/i })).toBeVisible()

      // Fill registration form
      const timestamp = Date.now()
      await page.fill('input[name="name"]', `Test Student ${timestamp}`)
      await page.fill('input[name="email"]', `student${timestamp}@test.verityra.com`)
      await page.fill('input[name="password"]', 'SecurePassword123!')
      await page.fill('input[name="confirmPassword"]', 'SecurePassword123!')

      // Submit form
      await page.click('button[type="submit"]')

      // Wait for success message or redirect
      await expect(page).toHaveURL(/\/(signin|student)/, { timeout: 10000 })
    })

    test('should reject weak password without numbers', async ({ page }) => {
      await page.goto('/signup')

      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'WeakPassword') // No number
      await page.fill('input[name="confirmPassword"]', 'WeakPassword')

      await page.click('button[type="submit"]')

      // Should show validation error (not redirect)
      await expect(page.locator('text=/password.*number|at least.*digit/i')).toBeVisible({ timeout: 5000 })
    })

    test('should reject mismatched password confirmation', async ({ page }) => {
      await page.goto('/signup')

      await page.fill('input[name="name"]', 'Test User')
      await page.fill('input[name="email"]', 'test@example.com')
      await page.fill('input[name="password"]', 'SecurePass123!')
      await page.fill('input[name="confirmPassword"]', 'DifferentPass123!')

      await page.click('button[type="submit"]')

      // Should show mismatch error
      await expect(page.locator('text=/password.*match|do not match/i')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Sign-In Flows', () => {
    test('should sign in with demo student credentials', async ({ page }) => {
      await page.goto('/signin')

      // Use demo student credentials (development mode)
      await page.fill('input[name="email"]', 'student@verityra.com')
      await page.fill('input[name="password"]', 'StudentSecurePassword123!')

      await page.click('button[type="submit"]')

      // Should redirect to student dashboard
      await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 10000 })
    })

    test('should sign in with demo admin credentials', async ({ page }) => {
      await page.goto('/signin')

      // Use demo admin credentials (development mode)
      await page.fill('input[name="email"]', 'admin@verityra.com')
      await page.fill('input[name="password"]', 'AdminSecurePassword123!')

      await page.click('button[type="submit"]')

      // Should redirect to admin dashboard
      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
    })

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto('/signin')

      await page.fill('input[name="email"]', 'nonexistent@verityra.com')
      await page.fill('input[name="password"]', 'WrongPassword123!')

      await page.click('button[type="submit"]')

      // Should show error message (not redirect)
      await expect(page.locator('text=/invalid.*email.*password|incorrect/i')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Role-Based Access Control (RBAC)', () => {
    test('should block student from accessing admin routes', async ({ page, context }) => {
      // Sign in as student
      await page.goto('/signin')
      await page.fill('input[name="email"]', 'student@verityra.com')
      await page.fill('input[name="password"]', 'StudentSecurePassword123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })

      // Attempt to access admin route directly
      await page.goto('/admin/test-series')

      // Should redirect to unauthorized or student dashboard
      await expect(page).toHaveURL(/\/(unauthorized|student)/, { timeout: 5000 })
    })

    test('should block admin from accessing student-only routes', async ({ page }) => {
      // Sign in as admin
      await page.goto('/signin')
      await page.fill('input[name="email"]', 'admin@verityra.com')
      await page.fill('input[name="password"]', 'AdminSecurePassword123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/admin/, { timeout: 10000 })

      // Attempt to access student workspace (should redirect or show error)
      await page.goto('/student/dashboard')

      // Should stay on admin or redirect to unauthorized
      await expect(page).toHaveURL(/\/(admin|unauthorized)/, { timeout: 5000 })
    })

    test('should block unauthenticated access to protected routes', async ({ page, context }) => {
      // Clear all cookies to ensure unauthenticated state
      await context.clearCookies()

      // Try to access admin route
      await page.goto('/admin')

      // Should redirect to sign-in
      await expect(page).toHaveURL(/\/signin/, { timeout: 5000 })
    })
  })

  test.describe('Password Reset Flow', () => {
    test('should show forgot password form', async ({ page }) => {
      await page.goto('/signin')

      // Click forgot password link
      await page.click('text=/forgot.*password/i')

      // Should navigate to forgot password page
      await expect(page).toHaveURL(/\/forgot-password/, { timeout: 5000 })
      await expect(page.locator('input[name="email"]')).toBeVisible()
    })

    test('should submit password reset request', async ({ page }) => {
      await page.goto('/forgot-password')

      await page.fill('input[name="email"]', 'student@verityra.com')
      await page.click('button[type="submit"]')

      // Should show success message (email sent)
      await expect(page.locator('text=/reset.*sent|check.*email/i')).toBeVisible({ timeout: 5000 })
    })
  })

  test.describe('Session Persistence', () => {
    test('should persist session across page reloads', async ({ page }) => {
      // Sign in as student
      await page.goto('/signin')
      await page.fill('input[name="email"]', 'student@verityra.com')
      await page.fill('input[name="password"]', 'StudentSecurePassword123!')
      await page.click('button[type="submit"]')
      await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })

      // Reload page
      await page.reload()

      // Should still be authenticated (not redirected to signin)
      await expect(page).toHaveURL(/\/student\/dashboard/)
    })
  })
})
