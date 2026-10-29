# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin-flow.spec.ts >> Admin Workflow & Management >> Sidebar Navigation >> should toggle sidebar collapse with Ctrl+B
- Location: tests\e2e\admin-flow.spec.ts:213:5

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
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
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | /**
  4   |  * E2E Test Suite: Admin Workflow & Management
  5   |  *
  6   |  * Coverage:
  7   |  * - Admin dashboard overview
  8   |  * - Navigate to submissions
  9   |  * - Open score review editor
  10  |  * - Adjust question marks
  11  |  * - Grant extra attempt override
  12  |  * - Verify audit log creation
  13  |  * - Manage test series (create, archive)
  14  |  */
  15  | 
  16  | test.describe('Admin Workflow & Management', () => {
  17  |   test.beforeEach(async ({ page }) => {
  18  |     // Sign in as demo admin before each test
  19  |     await page.goto('/signin')
> 20  |     await page.fill('input[name="email"]', 'admin@verityra.com')
      |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  21  |     await page.fill('input[name="password"]', 'AdminSecurePassword123!')
  22  |     await page.click('button[type="submit"]')
  23  |     await page.waitForURL(/\/admin/, { timeout: 10000 })
  24  |   })
  25  | 
  26  |   test.describe('Admin Dashboard Overview', () => {
  27  |     test('should display KPI metrics strip on admin dashboard', async ({ page }) => {
  28  |       await page.goto('/admin')
  29  | 
  30  |       // Verify KPI metrics are visible (flat divided strip layout)
  31  |       await expect(page.locator('text=/total.*candidate|student|enrollment|revenue/i')).toBeVisible()
  32  | 
  33  |       // Verify numeric values are displayed
  34  |       await expect(page.locator('text=/\\d+/').first()).toBeVisible()
  35  |     })
  36  | 
  37  |     test('should navigate to test series management', async ({ page }) => {
  38  |       await page.goto('/admin')
  39  | 
  40  |       // Click on "Test Series" navigation link
  41  |       await page.click('a[href="/admin/test-series"], text="Test Series"')
  42  | 
  43  |       // Should navigate to test series page
  44  |       await expect(page).toHaveURL(/\/admin\/test-series/, { timeout: 5000 })
  45  | 
  46  |       // Verify test series list/grid is visible
  47  |       await expect(page.locator('text=/test series|create|manage/i')).toBeVisible()
  48  |     })
  49  | 
  50  |     test('should navigate to submissions management', async ({ page }) => {
  51  |       await page.goto('/admin')
  52  | 
  53  |       // Click on "Submissions" navigation link
  54  |       await page.click('a[href="/admin/submissions"], text="Submission"')
  55  | 
  56  |       // Should navigate to submissions page
  57  |       await expect(page).toHaveURL(/\/admin\/submissions/, { timeout: 5000 })
  58  | 
  59  |       // Verify submissions list is visible
  60  |       await expect(page.locator('text=/submission|pending.*review|evaluate/i')).toBeVisible()
  61  |     })
  62  |   })
  63  | 
  64  |   test.describe('Score Review & Adjustment', () => {
  65  |     test('should open score review editor from submissions list', async ({ page }) => {
  66  |       await page.goto('/admin/submissions')
  67  | 
  68  |       // Click on first submission row (if available)
  69  |       const submissionRow = page.locator('tr[data-testid*="submission"], a[href*="/admin/submissions/"]').first()
  70  | 
  71  |       if (await submissionRow.isVisible({ timeout: 3000 }).catch(() => false)) {
  72  |         await submissionRow.click()
  73  | 
  74  |         // Should navigate to score review page
  75  |         await expect(page).toHaveURL(/\/admin\/submissions\//, { timeout: 5000 })
  76  | 
  77  |         // Verify score editor is visible
  78  |         await expect(page.locator('text=/score|marks|question|feedback/i')).toBeVisible()
  79  |       }
  80  |     })
  81  | 
  82  |     test('should display question-wise score inputs in review editor', async ({ page }) => {
  83  |       // Navigate to demo submission review (if exists)
  84  |       await page.goto('/admin/submissions/demo-sub-1')
  85  | 
  86  |       // Verify question score inputs are visible
  87  |       const scoreInput = page.locator('input[type="number"], input[name*="marks"]')
  88  | 
  89  |       if (await scoreInput.first().isVisible({ timeout: 3000 }).catch(() => false)) {
  90  |         expect(await scoreInput.count()).toBeGreaterThan(0)
  91  | 
  92  |         // Verify max marks constraint is displayed
  93  |         await expect(page.locator('text=/max.*marks|out.*of/i')).toBeVisible()
  94  |       }
  95  |     })
  96  | 
  97  |     test('should allow adjusting question marks and saving', async ({ page }) => {
  98  |       await page.goto('/admin/submissions/demo-sub-1')
  99  | 
  100 |       // Find first score input
  101 |       const scoreInput = page.locator('input[type="number"][name*="marks"]').first()
  102 | 
  103 |       if (await scoreInput.isVisible({ timeout: 3000 }).catch(() => false)) {
  104 |         // Adjust the marks
  105 |         await scoreInput.fill('8')
  106 | 
  107 |         // Look for save button
  108 |         const saveBtn = page.locator('button:has-text("Save"), button:has-text("Update")')
  109 | 
  110 |         if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
  111 |           await saveBtn.click()
  112 | 
  113 |           // Wait for success notification
  114 |           await expect(page.locator('text=/saved|updated|success/i')).toBeVisible({ timeout: 5000 })
  115 |         }
  116 |       }
  117 |     })
  118 |   })
  119 | 
  120 |   test.describe('Student Management & Overrides', () => {
```