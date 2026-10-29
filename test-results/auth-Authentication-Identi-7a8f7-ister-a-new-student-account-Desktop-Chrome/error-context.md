# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Identity >> Student Sign-Up >> should successfully register a new student account
- Location: tests\e2e\auth.spec.ts:16:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('h1, h2').filter({ hasText: /sign up|register/i })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('h1, h2').filter({ hasText: /sign up|register/i }) with timeout 5000ms
  - waiting for locator('h1, h2').filter({ hasText: /sign up|register/i })

```

```yaml
- link "V Verityra Evaluation Cloud":
  - /url: /
- link "Back to Home":
  - /url: /
- text: Standardized Subjective Evaluation
- heading "Authentic Examination Stamina. Instant Rubric Feedback." [level=2]
- paragraph: Write on official A4 margin booklets under timed exam conditions. Receive itemized question-by-question scoring and diagnostic benchmark reports across three attempts.
- text: Standardized 25mm Margin Template 100% Compliant
- paragraph: Every mock simulates real commission conditions with left (25mm) and right (20mm) margin guidelines, preventing negative marking.
- text: +28 Marks Gain
- paragraph: “The 3-attempt model helped me fix my pacing and structural deficiencies between baseline and benchmark.”
- paragraph: — Ananya Sharma, UPSC Civil Services Finalist
- text: 256-Bit Encrypted Vault 3x Attempt Guarantee © 2026 Verityra
- heading "Create Candidate Account" [level=1]
- paragraph: Join thousands of civil services & judicial aspirants testing with authentic physical booklets
- text: Full Candidate Name
- textbox "Full Candidate Name Full Candidate Name":
  - /placeholder: e.g. Ananya Sharma
- text: Official Email Address
- textbox "Official Email Address Official Email Address":
  - /placeholder: candidate@verityra.com
- text: Password
- textbox "Password Password":
  - /placeholder: ••••••••••••
- button "Show password"
- text: Confirm Password
- textbox "Confirm Password Confirm Password":
  - /placeholder: ••••••••••••
- button "Create Candidate Account"
- text: Already registered?
- link "Sign in here":
  - /url: /signin
- text: End-to-end encrypted session with biometric & token vaulting
- alert
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | /**
  4   |  * E2E Test Suite: Authentication & Identity
  5   |  *
  6   |  * Coverage:
  7   |  * - Student sign-up flow
  8   |  * - Student/Admin sign-in
  9   |  * - Role-based access control (RBAC)
  10  |  * - Password reset flow
  11  |  * - Unauthorized access blocking
  12  |  */
  13  | 
  14  | test.describe('Authentication & Identity', () => {
  15  |   test.describe('Student Sign-Up', () => {
  16  |     test('should successfully register a new student account', async ({ page }) => {
  17  |       await page.goto('/signup')
  18  | 
  19  |       // Verify page loaded
> 20  |       await expect(page.locator('h1, h2').filter({ hasText: /sign up|register/i })).toBeVisible()
      |                                                                                     ^ Error: expect(locator).toBeVisible() failed
  21  | 
  22  |       // Fill registration form
  23  |       const timestamp = Date.now()
  24  |       await page.fill('input[name="name"]', `Test Student ${timestamp}`)
  25  |       await page.fill('input[name="email"]', `student${timestamp}@test.verityra.com`)
  26  |       await page.fill('input[name="password"]', 'SecurePassword123!')
  27  |       await page.fill('input[name="confirmPassword"]', 'SecurePassword123!')
  28  | 
  29  |       // Submit form
  30  |       await page.click('button[type="submit"]')
  31  | 
  32  |       // Wait for success message or redirect
  33  |       await expect(page).toHaveURL(/\/(signin|student)/, { timeout: 10000 })
  34  |     })
  35  | 
  36  |     test('should reject weak password without numbers', async ({ page }) => {
  37  |       await page.goto('/signup')
  38  | 
  39  |       await page.fill('input[name="name"]', 'Test User')
  40  |       await page.fill('input[name="email"]', 'test@example.com')
  41  |       await page.fill('input[name="password"]', 'WeakPassword') // No number
  42  |       await page.fill('input[name="confirmPassword"]', 'WeakPassword')
  43  | 
  44  |       await page.click('button[type="submit"]')
  45  | 
  46  |       // Should show validation error (not redirect)
  47  |       await expect(page.locator('text=/password.*number|at least.*digit/i')).toBeVisible({ timeout: 5000 })
  48  |     })
  49  | 
  50  |     test('should reject mismatched password confirmation', async ({ page }) => {
  51  |       await page.goto('/signup')
  52  | 
  53  |       await page.fill('input[name="name"]', 'Test User')
  54  |       await page.fill('input[name="email"]', 'test@example.com')
  55  |       await page.fill('input[name="password"]', 'SecurePass123!')
  56  |       await page.fill('input[name="confirmPassword"]', 'DifferentPass123!')
  57  | 
  58  |       await page.click('button[type="submit"]')
  59  | 
  60  |       // Should show mismatch error
  61  |       await expect(page.locator('text=/password.*match|do not match/i')).toBeVisible({ timeout: 5000 })
  62  |     })
  63  |   })
  64  | 
  65  |   test.describe('Sign-In Flows', () => {
  66  |     test('should sign in with demo student credentials', async ({ page }) => {
  67  |       await page.goto('/signin')
  68  | 
  69  |       // Use demo student credentials (development mode)
  70  |       await page.fill('input[name="email"]', 'student@verityra.com')
  71  |       await page.fill('input[name="password"]', 'StudentSecurePassword123!')
  72  | 
  73  |       await page.click('button[type="submit"]')
  74  | 
  75  |       // Should redirect to student dashboard
  76  |       await expect(page).toHaveURL(/\/student\/dashboard/, { timeout: 10000 })
  77  |     })
  78  | 
  79  |     test('should sign in with demo admin credentials', async ({ page }) => {
  80  |       await page.goto('/signin')
  81  | 
  82  |       // Use demo admin credentials (development mode)
  83  |       await page.fill('input[name="email"]', 'admin@verityra.com')
  84  |       await page.fill('input[name="password"]', 'AdminSecurePassword123!')
  85  | 
  86  |       await page.click('button[type="submit"]')
  87  | 
  88  |       // Should redirect to admin dashboard
  89  |       await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
  90  |     })
  91  | 
  92  |     test('should reject invalid credentials', async ({ page }) => {
  93  |       await page.goto('/signin')
  94  | 
  95  |       await page.fill('input[name="email"]', 'nonexistent@verityra.com')
  96  |       await page.fill('input[name="password"]', 'WrongPassword123!')
  97  | 
  98  |       await page.click('button[type="submit"]')
  99  | 
  100 |       // Should show error message (not redirect)
  101 |       await expect(page.locator('text=/invalid.*email.*password|incorrect/i')).toBeVisible({ timeout: 5000 })
  102 |     })
  103 |   })
  104 | 
  105 |   test.describe('Role-Based Access Control (RBAC)', () => {
  106 |     test('should block student from accessing admin routes', async ({ page, context }) => {
  107 |       // Sign in as student
  108 |       await page.goto('/signin')
  109 |       await page.fill('input[name="email"]', 'student@verityra.com')
  110 |       await page.fill('input[name="password"]', 'StudentSecurePassword123!')
  111 |       await page.click('button[type="submit"]')
  112 |       await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })
  113 | 
  114 |       // Attempt to access admin route directly
  115 |       await page.goto('/admin/test-series')
  116 | 
  117 |       // Should redirect to unauthorized or student dashboard
  118 |       await expect(page).toHaveURL(/\/(unauthorized|student)/, { timeout: 5000 })
  119 |     })
  120 | 
```