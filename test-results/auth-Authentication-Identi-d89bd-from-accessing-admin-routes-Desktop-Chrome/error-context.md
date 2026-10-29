# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Identity >> Role-Based Access Control (RBAC) >> should block student from accessing admin routes
- Location: tests\e2e\auth.spec.ts:106:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="email"]')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e4]:
        - link "V Verityra Evaluation Cloud" [ref=e5] [cursor=pointer]:
          - /url: /
          - generic [ref=e6]: V
          - generic [ref=e7]:
            - generic [ref=e8]: Verityra
            - generic [ref=e9]: Evaluation Cloud
        - link "Back to Home" [ref=e10] [cursor=pointer]:
          - /url: /
      - generic [ref=e13]:
        - generic [ref=e14]: Standardized Subjective Evaluation
        - heading "Authentic Examination Stamina. Instant Rubric Feedback." [level=2] [ref=e19]
        - paragraph [ref=e20]: Write on official A4 margin booklets under timed exam conditions. Receive itemized question-by-question scoring and diagnostic benchmark reports across three attempts.
        - generic [ref=e21]:
          - generic [ref=e22]:
            - generic [ref=e23]: Standardized 25mm Margin Template
            - generic [ref=e29]: 100% Compliant
          - paragraph [ref=e30]: Every mock simulates real commission conditions with left (25mm) and right (20mm) margin guidelines, preventing negative marking.
        - generic [ref=e31]:
          - generic [ref=e32]: +28 Marks Gain
          - paragraph [ref=e45]: “The 3-attempt model helped me fix my pacing and structural deficiencies between baseline and benchmark.”
          - paragraph [ref=e46]: — Ananya Sharma, UPSC Civil Services Finalist
      - generic [ref=e47]:
        - generic [ref=e48]: 256-Bit Encrypted Vault
        - generic [ref=e52]: 3x Attempt Guarantee
        - generic [ref=e56]: © 2026 Verityra
    - generic [ref=e58]:
      - generic [ref=e59]:
        - heading "Sign In to Verityra" [level=1] [ref=e60]
        - paragraph [ref=e61]: Access your authenticated candidate workspace, evaluations, and mock benchmarks
      - generic [ref=e63]:
        - generic [ref=e64]:
          - generic [ref=e65]:
            - generic [ref=e66]: "Quick Demo Access:"
            - generic [ref=e67]: 1-Click Autofill
          - generic [ref=e68]:
            - button "Demo Admin" [ref=e69] [cursor=pointer]
            - button "Demo Candidate" [ref=e70] [cursor=pointer]
        - generic [ref=e71]:
          - generic [ref=e72]:
            - generic [ref=e73]: Registered Email
            - textbox "Registered Email Registered Email" [ref=e74]:
              - /placeholder: candidate@verityra.com
          - generic [ref=e75]:
            - generic [ref=e76]:
              - generic [ref=e77]: Account Password
              - link "Forgot password?" [ref=e78] [cursor=pointer]:
                - /url: /forgot-password
            - generic [ref=e79]:
              - textbox "Account Password Account Password" [ref=e80]:
                - /placeholder: ••••••••••••
              - button "Show password" [ref=e81] [cursor=pointer]
          - button "Sign In to Workspace" [ref=e85] [cursor=pointer]
        - generic [ref=e86]:
          - text: Don't have an account?
          - link "Create candidate account" [ref=e87] [cursor=pointer]:
            - /url: /signup
      - generic [ref=e88]: End-to-end encrypted session with biometric & token vaulting
  - generic [ref=e97] [cursor=pointer]:
    - button "Open Next.js Dev Tools" [ref=e98]
    - generic [ref=e102]:
      - button "Open issues overlay" [ref=e103]:
        - generic [ref=e104]:
          - generic [aria-hidden] [ref=e105]: "0"
          - generic [ref=e106]: "1"
        - generic [ref=e107]: Insight
      - button "Collapse issues badge" [ref=e108]
  - alert [ref=e111]
```

# Test source

```ts
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
  20  |       await expect(page.locator('h1, h2').filter({ hasText: /sign up|register/i })).toBeVisible()
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
> 109 |       await page.fill('input[name="email"]', 'student@verityra.com')
      |                  ^ Error: page.fill: Test timeout of 30000ms exceeded.
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
  121 |     test('should block admin from accessing student-only routes', async ({ page }) => {
  122 |       // Sign in as admin
  123 |       await page.goto('/signin')
  124 |       await page.fill('input[name="email"]', 'admin@verityra.com')
  125 |       await page.fill('input[name="password"]', 'AdminSecurePassword123!')
  126 |       await page.click('button[type="submit"]')
  127 |       await page.waitForURL(/\/admin/, { timeout: 10000 })
  128 | 
  129 |       // Attempt to access student workspace (should redirect or show error)
  130 |       await page.goto('/student/dashboard')
  131 | 
  132 |       // Should stay on admin or redirect to unauthorized
  133 |       await expect(page).toHaveURL(/\/(admin|unauthorized)/, { timeout: 5000 })
  134 |     })
  135 | 
  136 |     test('should block unauthenticated access to protected routes', async ({ page, context }) => {
  137 |       // Clear all cookies to ensure unauthenticated state
  138 |       await context.clearCookies()
  139 | 
  140 |       // Try to access admin route
  141 |       await page.goto('/admin')
  142 | 
  143 |       // Should redirect to sign-in
  144 |       await expect(page).toHaveURL(/\/signin/, { timeout: 5000 })
  145 |     })
  146 |   })
  147 | 
  148 |   test.describe('Password Reset Flow', () => {
  149 |     test('should show forgot password form', async ({ page }) => {
  150 |       await page.goto('/signin')
  151 | 
  152 |       // Click forgot password link
  153 |       await page.click('text=/forgot.*password/i')
  154 | 
  155 |       // Should navigate to forgot password page
  156 |       await expect(page).toHaveURL(/\/forgot-password/, { timeout: 5000 })
  157 |       await expect(page.locator('input[name="email"]')).toBeVisible()
  158 |     })
  159 | 
  160 |     test('should submit password reset request', async ({ page }) => {
  161 |       await page.goto('/forgot-password')
  162 | 
  163 |       await page.fill('input[name="email"]', 'student@verityra.com')
  164 |       await page.click('button[type="submit"]')
  165 | 
  166 |       // Should show success message (email sent)
  167 |       await expect(page.locator('text=/reset.*sent|check.*email/i')).toBeVisible({ timeout: 5000 })
  168 |     })
  169 |   })
  170 | 
  171 |   test.describe('Session Persistence', () => {
  172 |     test('should persist session across page reloads', async ({ page }) => {
  173 |       // Sign in as student
  174 |       await page.goto('/signin')
  175 |       await page.fill('input[name="email"]', 'student@verityra.com')
  176 |       await page.fill('input[name="password"]', 'StudentSecurePassword123!')
  177 |       await page.click('button[type="submit"]')
  178 |       await page.waitForURL(/\/student\/dashboard/, { timeout: 10000 })
  179 | 
  180 |       // Reload page
  181 |       await page.reload()
  182 | 
  183 |       // Should still be authenticated (not redirected to signin)
  184 |       await expect(page).toHaveURL(/\/student\/dashboard/)
  185 |     })
  186 |   })
  187 | })
  188 | 
```