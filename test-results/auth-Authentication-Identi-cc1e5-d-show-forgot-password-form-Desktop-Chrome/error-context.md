# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Identity >> Password Reset Flow >> should show forgot password form
- Location: tests\e2e\auth.spec.ts:149:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('input[name="email"]')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('input[name="email"]') with timeout 5000ms
  - waiting for locator('input[name="email"]')

```

```yaml
- alert
- link "V Verityra":
  - /url: /
- heading "Reset your password" [level=2]
- paragraph:
  - text: Remember your password?
  - link "Sign in here":
    - /url: /signin
- text: Forgot Password Enter your registered email address to receive password reset instructions Email Address
- textbox "Email Address":
  - /placeholder: candidate@example.com
- button "Send Password Reset Instructions"
- link "Back to Sign In":
  - /url: /signin
```

# Test source

```ts
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
> 157 |       await expect(page.locator('input[name="email"]')).toBeVisible()
      |                                                         ^ Error: expect(locator).toBeVisible() failed
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