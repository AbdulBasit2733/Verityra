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

## 3. Active Roadmap & Future Milestones `[ ]`

### Phase 6: Annotation & Visual Evaluation Enhancements `[ ]`
- [ ] **Canvas-Based Digital Ink Overlay**:
  - Overlay educator margin marks, ticks, and underline callouts directly on scanned candidate PDF pages.
  - Support high-resolution zoom and page-by-page side-by-side comparison between Attempt 1 and Attempt 2.
- [ ] **Comprehensive PDF Evaluation Report Export**:
  - Generate downloadable consolidated evaluation scorecard (PDF) featuring question-wise marks, model rubric comparisons, and educator remarks.

### Phase 7: Analytics & Cohort Benchmarking `[ ]`
- [ ] **Candidate Progression Analytics**:
  - Chart attempt score trajectories across Attempts 1, 2, and 3 to visualize candidate mastery curves.
  - Dimension-level radar charts (Conceptual Depth vs. Structure vs. Policy Citations vs. Presentation).
- [ ] **Batch Test Series Archiving**:
  - Support scheduled archival of completed test series batches with permanent read-only leaderboard snapshots.

### Phase 8: Communication & Transactional Alerts `[ ]`
- [ ] **Transactional Notification Service**:
  - Automated transactional email / SMS alerts upon submission evaluation completion or administrative review escalation.
  - Attempt quota threshold reminders (e.g., "1 Attempt Remaining for UPSC GS Mock 1").

---

## 4. Verification & Quality Assurance Checklist

Every code commit and feature addition must satisfy:
- [x] `pnpm test` passes 13/13 business logic tests.
- [x] `pnpm run typecheck` reports 0 TypeScript errors.
- [x] `pnpm run build` compiles 100% of static and dynamic App Router routes with zero warnings.
- [x] Public marketing pages strictly adhere to Invariant #1 (Zero-AI Marketing).
- [x] Attempt counters are protected by database unique constraints and atomic transactions.
- [x] Client components using `useSearchParams()` are wrapped in `<React.Suspense>`.
- [x] All new UI elements are tested in both Light Mode (`#FFFFFF`) and Dark Mode (`#0B1120`).
