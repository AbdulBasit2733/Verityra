# Verityra — Engineering Tasks & Roadmap Ledger (Tasks.md)

> **Status Tracking**: Master task registry, implementation history, quality assurance checkpoints, and future roadmap for **Verityra** (`verityra4/`).

---

## 1. Task Ledger Status Legend

- `[x]` **Completed & Verified**: Fully implemented, passing TypeScript typechecks, business logic tests, and production build.
- `[/]` **In Progress**: Currently active implementation or refinement.
- `[ ]` **Backlog / Planned**: Scoped for future milestones.

---

## 2. Completed Milestones & Architectural History

### Phase 1: Core Foundation, Security & Database Infrastructure `[x]`
- [x] **PostgreSQL Schema Design (`prisma/schema.prisma`)**:
  - Implemented models: `User`, `Account`, `Session`, `StudentProfile`, `TestSeries`, `Paper`, `Template`, `TestRegistration`, `Payment`, `Submission`, `Evaluation`, `QuestionScore`, `AuditLog`, `WebhookEvent`.
  - Added compound constraint `@@unique([registrationId, attemptNumber])` to physically enforce the 3-attempt limit.
  - Added unique constraint `@@unique([userId, testSeriesId])` to prevent duplicate test registrations.
- [x] **Authentication Engine (`lib/auth.ts`, `lib/auth-guard.ts`)**:
  - Configured NextAuth.js JWT session strategy with bcrypt password hashing (cost factor 12) and Google OAuth provider.
  - Built server-side role guards: `requireAuth()`, `requireStudent()`, and `requireAdmin()`.
  - Enforced that self-service registration and OAuth sign-in strictly assign `Role.STUDENT`.
- [x] **Action-Based Architecture (`actions/*`)**:
  - Built `auth-actions.ts`: Registration, password reset flow, and credential verification.
  - Built `test-series-actions.ts`: Test series CRUD, paper and template file uploads.
  - Built `registration-actions.ts`: Free test enrollment and Razorpay order management.
  - Built `submission-actions.ts`: Atomic 3-attempt upload validation.
  - Built `evaluation-actions.ts`: Administrator score reviews and audited attempt overrides.
  - Built `leaderboard-actions.ts`: Deterministic tie-breaking leaderboard computation.
- [x] **Automated Test Suite (`tests/verityra.test.ts`)**:
  - Implemented test runner validating all 13 critical domain invariants: auth entropy, attempt limits, file validation, score clamping, uncertainty escalation, HMAC security, and instruction isolation.

---

### Phase 2: Public Portal & Authentic Examination Experience `[x]`
- [x] **Landing Page (`app/page.tsx`)**:
  - Redesigned with authentic examination focus: A4 margin booklet simulation, authentic UPSC ruled sheet, 25mm margin lines, handwritten response callout, and live visual rubric panel.
  - 4-Phase Exam Routine explainer (Download Template $\rightarrow$ Handwrite $\rightarrow$ Scan & Submit $\rightarrow$ Rectify & Rank).
  - Built `shadcn/ui` Accordion FAQ addressing margin templates, handwriting mandates, and upload safety.
  - **Zero-AI Compliance**: Verified 100% elimination of AI marketing buzzwords across all public copy.
- [x] **Examination Catalog & Details (`app/tests/page.tsx`, `app/tests/[id]/page.tsx`)**:
  - Responsive catalog with filters, pricing badges, attempt counters, and syllabus instructions.
  - Printable margin-aligned answer sheet template downloads (`/api/files/download`).
- [x] **Public Leaderboard (`app/leaderboard/page.tsx`)**:
  - Live competitive leaderboard with top 3 podium visualization, percentage calculations, attempt badges, and deterministic tie-breaking.

---

### Phase 3: Portal Redesign & Global Component Architecture `[x]`
- [x] **Dedicated Portal Shell (`components/portal-shell.tsx`)**:
  - Isolated Candidate (`/student/*`) and Administrator (`/admin/*`) workspaces from public navbar/footer.
  - Responsive fixed left sidebar (`w-64`) on desktop with collapsible slide-over drawer (`w-[270px]`) on mobile.
- [x] **De-Carded Scannable Layout**:
  - Eliminated card nesting fatigue; replaced multi-layer cards with horizontal divided KPI strips (`divide-x divide-slate-200 border-y py-4 px-1`).
  - Added clean horizontal `<Separator />` dividers and `variant="line"` `<Tabs />`.
- [x] **Global DataTable System (`components/ui/data-table.tsx`)**:
  - Integrated live multi-column search input with prefix icon.
  - Added tri-state column sorting (`asc` $\rightarrow$ `desc` $\rightarrow$ `reset`) with visual sort indicators.
  - Built faceted `<DropdownMenu />` radio filters for category, status, and allowance tiers.
  - Built interactive `<DateFilterPicker />` with presets (`Today`, `Last 7 Days`, `Last 30 Days`) and full calendar grid.
  - Integrated `<GlobalPagination />` with dynamic rows-per-page selector (`5 / 10 / 20 / 50`) and summary display.
- [x] **Modal & Feedback Providers**:
  - Created `ConfirmDialogProvider` (`useConfirm()`) for promise-based confirmation modals with `default`, `warning`, and `destructive` variants.
  - Created `ErrorDialogProvider` (`useGlobalError()`) with error code badges, diagnostic copy buttons, and synchronized Sonner toasts.
  - Mounted theme-aware `<Toaster />` in root layout for transient toast notifications.
- [x] **Administrative Review & Override Tools**:
  - Built question-wise score review editor (`/admin/submissions/[id]`) with live score clamping $[0, \text{maxMarks}]$, percentage recalculation, and mandatory audit logging.
  - Built candidate management console (`/admin/students`) with audited extra attempt override dialog.

---

### Phase 4: 60/30/10 Color Theory & Universal Dark Mode `[x]`
- [x] **CSS-First Design Tokens (`app/globals.css`)**:
  - Implemented 60/30/10 EdTech color system in `:root`: Pure White `#FFFFFF` (60%), Soft Blue `#EFF6FF` / Slate `#0F172A` (30%), Royal Blue `#2A6AED` (10%).
  - Implemented Dark Mode in `.dark`: Deep Obsidian Slate `#0B1120` (60%), Elevated Slate `#111827` / `#1E293B` (30%), Luminous Royal Blue `#3B82F6` (10%).
  - Added global `.dark` utility harmony classes to automatically adapt hardcoded utility classes across all pages and components.
- [x] **Universal Theme Toggle (`components/theme-toggle.tsx`)**:
  - Built `variant="icon"` with animated `<Sun />` / `<Moon />` dropdown (Light, Dark, System) for desktop topbars.
  - Built `variant="inline"` 3-button segmented pill bar (`Light | Dark | Auto`) for mobile drawers.
  - Added `d` keyboard shortcut to toggle themes instantly.
- [x] **Hero Section Dark Mode Contrast Refinement**:
  - Styled hero container with `dark:!bg-[#0b1120]` and subtle radial blue spotlight (`rgba(59, 130, 246, 0.22)`).
  - Built `.dark .hero-ruled-paper` with `rgba(15, 23, 42, 0.75)` and distinct slate margin rules.
  - Refined outline button with `dark:!bg-slate-900 dark:border-slate-800 dark:text-slate-200`.

---

### Phase 5: Dedicated Profile & Settings Governance `[x]`
- [x] **Student Profile & Settings (`app/student/profile/page.tsx`, `components/student-profile-client.tsx`)**:
  - Converted to Server Component with `requireStudent("/student/profile")` and `getStudentProfileAction()` pre-hydrating real PostgreSQL data.
  - Added tabbed interface:
    - **Academic & Target Focus**: Candidate display name, target exam, education level, institution, phone, bio.
    - **Security & Password**: Secure password update form with live criteria indicators (8+ chars, uppercase, number, symbol), verified via `changePasswordAction()`.
    - **Three-Attempt Guarantee**: Comprehensive breakdown of Attempt 1 (Diagnostic), Attempt 2 (Rectification), and Attempt 3 (Final Benchmark), plus upload protection guarantee.
- [x] **Administrator Profile & Settings (`app/admin/profile/page.tsx`, `components/admin-profile-client.tsx`)**:
  - Created Server Component with `requireAdmin("/admin/profile")` and `getAdminProfileAction()`.
  - Added tabbed interface:
    - **Administrator Profile**: Admin display name, read-only official email, system role, escalation contact, and office designation.
    - **Security & Password**: Administrator credential change with verified bcrypt re-hashing and security audit logging.
    - **Platform Invariants & Governance**: Reference cards for the 4 core platform invariants with quick navigation to Test Series, Submissions Queue, and Audit Trail.
- [x] **Portal Shell Navigation Integration (`components/portal-shell.tsx`)**:
  - Added `Profile & Settings` (`User` icon) to both `adminNavItems` (`/admin/profile`) and `studentNavItems` (`/student/profile`).
  - Made the bottom user account identity row in both desktop sidebar and mobile drawer a direct clickable link to the user's profile settings page.

---

### Phase 6: Admin Payments & Financials Subsystem & 7-Day Return Engine `[x]`
- [x] **Sidebar Navigation & Active Indicator**:
  - Added `Payments & Financials` (`CreditCard` icon) to `adminNavItems` in `components/portal-shell.tsx` with active primary blue pill styling.
- [x] **Admin Payments Dashboard (`app/admin/payments/page.tsx`, `components/admin-payments-client.tsx`)**:
  - Built page with `PageHeader`, 4 `KpiStatCard` metrics (`Net Collected Revenue`, `Completed Transactions`, `7-Day Refund Claims`, `Pending Inquiries`).
  - Integrated `DataTable` with multi-tier filtering (full-text search, status dropdown, 7-day refund eligibility filter, interactive DateFilterPicker).
  - Implemented sequential `Sr.` row numbering, copyable monospace Razorpay order/payment badges, and global pagination.
- [x] **7-Day Return Policy & Attempt Forfeiture Engine**:
  - Implemented `AdminRefundDialog` enforcing strict 7-day refund window.
  - Built attempt consumption warning when `attemptsUsed > 0` requiring explicit forfeiture acknowledgement before unlocking refund.
  - Built `adminTriggerRefundAction` in `actions/payment-actions.ts` executing atomic database updates (`Payment.status = REFUNDED`, `PaymentRefund` record, `TestRegistration.status = CANCELLED`, `maxAttempts = 0`).
- [x] **Immutable Transaction Audit Ledger (`components/admin-payment-ledger-sheet.tsx`)**:
  - Built slide-over drawer displaying chronological gateway webhooks, actor attribution, and formatted raw JSON payloads.
- [x] **Fault-Tolerance & Auto-Reconciler**:
  - Enhanced webhook handler (`app/api/webhooks/razorpay/route.ts`) with idempotency and failed event logging.
  - Built client recovery endpoint (`app/api/payments/verify-status/route.ts`).
  - Built background reconciliation action (`reconcilePendingPaymentsAction`).
- [x] **Live Supabase PostgreSQL Database Sync**:
  - Pushed updated schema with `PaymentRefund`, `PaymentLedger`, and `RefundReason` via `pnpm prisma db push --accept-data-loss`.

---

### Phase 7: Modular Domain Testing Architecture `[x]`
- [x] **Domain Test Suites Decomposition (`tests/*`)**:
  - Built `tests/test-utils.ts`: Shared `TestSuite` runner with assertion tracking and formatted summary.
  - Built `tests/auth.test.ts`: 11 tests for registration schema, entropy, passwords, profile updates, and RBAC.
  - Built `tests/test-series.test.ts`: 7 tests for slugification, pricing, attempt defaults, instruction isolation, and test windows.
  - Built `tests/registration.test.ts`: 5 tests for free/paid enrollment criteria, attempt initialization, duplicate prevention, and order payloads.
  - Built `tests/submissions.test.ts`: 5 tests for MIME types, file sizes, zero-attempt penalty on upload failure, strict 3-attempt ceiling, and deadline enforcement.
  - Built `tests/evaluation.test.ts`: 6 tests for Gemini structured output schema, mark clamping, percentage calculation precision, and human-in-the-loop review routing.
  - Built `tests/payments.test.ts`: 8 tests for HMAC SHA-256 signature verification, 7-day refund policy boundaries, attempt forfeiture guard, idempotency keys, and audit ledger integrity.
- [x] **Master Test Orchestrator (`tests/run-all.ts`)**:
  - Built unified test runner executing all 42 tests across 6 domain suites with execution timings and consolidated status dashboard.
  - Configured `package.json` `"test": "tsx tests/run-all.ts"`.

### Phase 8: Interactive Data Actions & Master Table Ecosystem `[x]`
- [x] **Universal Table Master Standard (`components/ui/data-table.tsx`)**:
  - Implemented full-text client search across multi-field accessors (`searchAccessor`, `sortAccessor`).
  - Implemented 3-way column sorting (ascending, descending, neutral) with numeric-aware and date-aware comparators.
  - Implemented faceted dropdown filters with dynamic option sets and active filter badges with one-click dismiss.
  - Implemented date range filtering with preset shortcuts (`Today`, `Last 7 Days`, `Last 30 Days`, `Specific Date`, `All Time`).
  - Implemented serial numbering column (`#`), column visibility toggling, and global pagination with configurable page sizes (5, 10, 20, 50).
- [x] **Student Panel Actions (`app/student/*`)**:
  - `StudentDashboardClient`: Search enrolled papers, sort by completion/attempts/marks/duration, filter by completion status, marks weightage (Full Mock vs Sectional), and score tiers (High, Average, Needs Improvement, Pending).
  - `StudentWorkspaceClient`: Tabbed workspace with numeric-aware sorted question scoring table, score band filters, legibility filters, attempt switcher, and downloadable PDF/margin sheet resources.
  - `StudentProfileClient`: Tabbed candidate profile settings, credential update with security audit, and academic examination target management.
- [x] **Admin Panel Actions (`app/admin/*`)**:
  - `AdminOverviewClient`: Multi-tab data tables for candidate submissions and immutable administrative audit logs with dynamic test title and action type filters.
  - `AdminPaymentsClient`: Search candidate name/email/order/payment IDs, filter by captured/refunded/failed status, dynamic test series paper, and 7-day refund window eligibility; trigger audited refund dialog with attempt forfeiture guard; slide-over audit ledger.
  - `AdminStudentsClient`: Search candidate directory, sort by attempts used and enrolled date, filter by active/exhausted/overridden quotas, dynamic test paper filter, and attempt consumption tiers; trigger attempt override dialog.
  - `AdminSubmissionsClient`: Filter submissions by review status, confidence flags, dynamic test paper, attempt number, and score tiers; quick download booklet and inspect action.
  - `AdminTestSeriesClient`: Quick publish/unpublish action toggle with `useConfirm()`, preview candidate view, edit/manage, filter by publication status, pricing tiers, and marks weightage.
  - `AdminProfileClient`: Tabbed administrative profile settings, credential update, and audit log history.
- [x] **Public & Student Test Catalog & Leaderboard**:
  - `TestCatalogClient`: Search catalog, filter by pricing (All, Free, Paid) and exam stream (UPSC, State PCS, Judiciary), sort by newest/price/marks/duration, grid vs table view toggle, and synchronized pagination.
  - `LeaderboardClient`: Top 3 podium cards (🥇, 🥈, 🥉), candidate search, dynamic test paper filter, attempt number filter, score brackets (≥ 75%, 60-74%, 50-59%, < 50%), and date accessor.

---

## 3. Active Roadmap & Future Milestones `[ ]`

### Phase 9: Annotation & Visual Evaluation Enhancements `[ ]`
- [ ] **Canvas-Based Digital Ink Overlay**:
  - Overlay educator margin marks, ticks, and underline callouts directly on scanned candidate PDF pages.
  - Support high-resolution zoom and page-by-page side-by-side comparison between Attempt 1 and Attempt 2.
- [ ] **Comprehensive PDF Evaluation Report Export**:
  - Generate downloadable consolidated evaluation scorecard (PDF) featuring question-wise marks, model rubric comparisons, and educator remarks.

### Phase 9: Analytics & Cohort Benchmarking `[ ]`
- [ ] **Candidate Progression Analytics**:
  - Chart attempt score trajectories across Attempts 1, 2, and 3 to visualize candidate mastery curves.
  - Dimension-level radar charts (Conceptual Depth vs. Structure vs. Policy Citations vs. Presentation).
- [ ] **Batch Test Series Archiving**:
  - Support scheduled archival of completed test series batches with permanent read-only leaderboard snapshots.

### Phase 10: Communication & Transactional Alerts `[ ]`
- [ ] **Transactional Notification Service**:
  - Automated transactional email / SMS alerts upon submission evaluation completion or administrative review escalation.
  - Attempt quota threshold reminders (e.g., "1 Attempt Remaining for UPSC GS Mock 1").

---

## 4. Verification & Quality Assurance Checklist

Every code commit and feature addition must satisfy:
- [x] `pnpm test` passes all 42 critical business logic tests across 6 domain suites.
- [x] `pnpm run typecheck` reports 0 TypeScript errors.
- [x] `pnpm run build` compiles 100% of static and dynamic App Router routes with zero warnings.
- [x] Public marketing pages strictly adhere to Invariant #1 (Zero-AI Marketing).
- [x] Attempt counters are protected by database unique constraints and atomic transactions.
- [x] Client components using `useSearchParams()` are wrapped in `<React.Suspense>`.
- [x] All new UI elements are tested in both Light Mode (`#FFFFFF`) and Dark Mode (`#0B1120`).
- [x] 7-day refund policy, attempt forfeiture guards, and immutable audit ledgers verified in financial tests.
- [x] Zero duplicate `.md` files across the codebase.
