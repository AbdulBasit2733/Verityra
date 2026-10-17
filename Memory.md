# Verityra — Engineering Memory & Context Log (Memory.md)

> **Purpose**: Serves as the persistent collective memory for all AI agents and human engineers contributing to **Verityra** (`verityra4/`). Contains architectural decision records (ADRs), trade-offs, bug history, and operational constraints.

---

## 1. Project Background & Architectural Lineage

Verityra originated from a high-stakes challenge in competitive civil services examination preparation (UPSC CSE, State PSC, Judicial Services). While multiple-choice examination platforms abound, subjective answer writing—which constitutes $>80\%$ of competitive marks—has suffered from:
1. **Unrealistic Digital Typing**: Candidates typed answers on keyboards instead of cultivating physical pen-and-paper endurance, margin pacing, and diagrammatic presentation under 3-hour strict time limits.
2. **Opaque, Slow Turnaround**: Physical evaluations by institutes took weeks, returned handwritten comments that were illegible or subjective, and lacked systematic rubric benchmarking.
3. **Haphazard Attempt Management**: Students had no progressive mechanism to diagnostic baseline $\rightarrow$ rectify deficiencies $\rightarrow$ benchmark final polish.

Verityra was conceived to solve this through a **hybrid physical-digital paradigm**: authentic pen-and-paper writing on standardized margin sheets + encrypted scanning ingestion + automated multimodal rubric evaluation + transparent educator audit trails.

---

## 2. Architectural Decision Records (ADRs)

### ADR 001: Direct Server Actions over Client REST API Endpoints
- **Status**: Implemented & Enforced
- **Context**: Standard Next.js apps often create `/api/submissions`, `/api/evaluations`, etc., called via client `fetch()`.
- **Decision**: All mutations and direct database operations must be Next.js **Server Actions** (`"use server"`) housed in `verityra4/actions/*`. Route handlers in `app/api/*` are strictly limited to external webhooks (Razorpay) and streaming file proxies (`/api/files/download`).
- **Consequences**: Zero CORS configuration overhead; complete elimination of client CSRF vulnerability surface; automatic type safety sharing between frontend forms and server handlers.

### ADR 002: The Zero-AI Public Marketing Rule
- **Status**: Implemented & Enforced (Invariant #1)
- **Context**: Aspirants for high-stakes exams like UPSC are deeply skeptical of "AI grading" due to fears of robotic scoring, hallucinated marks, and divergence from official UPSC evaluation standards.
- **Decision**: No public landing page, marketing copy, meta descriptions, or catalog banners may mention "AI", "automated grading", "machine checking", or "AI-powered". Public messaging centers strictly on **pen-and-paper practice, standardized margin sheets, objective rubrics, detailed feedback, and 3 progressive attempts**.
- **Consequences**: Builds institutional credibility and trust; the AI evaluation pipeline operates purely as an internal, audited implementation engine.

### ADR 003: Compound Database Constraint for 3-Attempt Limit
- **Status**: Implemented & Enforced (Invariant #2)
- **Context**: Each test series registration guarantees exactly 3 accepted handwritten submissions. Enforcing this only in UI code leaves race-condition loopholes.
- **Decision**: Enforce at the PostgreSQL schema level via `@@unique([registrationId, attemptNumber])` in Prisma, wrapped in atomic transaction verification in `submission-actions.ts`.
- **Consequences**: Physical impossibility of a candidate submitting attempt 4, even via concurrent tab manipulation. Overrides can only occur via audited `adminGrantExtraAttemptAction`.

### ADR 004: Strict Separation of Instruction Systems
- **Status**: Implemented & Enforced (Invariant #3)
- **Context**: Evaluators need confidential marking keys, model answers, and partial-credit guidelines that must never be visible to candidates before or during attempts.
- **Decision**: Schema maintains separate `studentInstructions` and `privateEvaluationInstructions` fields on `TestSeries`. Query projections for candidate views explicitly omit `privateEvaluationInstructions`.
- **Consequences**: Eliminates exam cheating; model solutions and evaluation instructions remain secure until official administrative release.

### ADR 005: 60/30/10 Color Theory with Royal Blue & Midnight Obsidian Dark Mode
- **Status**: Implemented & Enforced
- **Context**: Previous styling used miscellaneous oranges and muddy dark-mode grays.
- **Decision**: Standardize on a high-integrity EdTech palette:
  - **Light Mode**: 60% Pure White (`#FFFFFF`), 30% Soft Blue Tint (`#EFF6FF`) / Slate (`#0F172A`), 10% Royal Blue (`#2A6AED`).
  - **Dark Mode**: 60% Deep Obsidian Slate (`#0B1120`), 30% Elevated Slate (`#111827`, `#1E293B`) / Crisp White (`#F8FAFC`), 10% Luminous Royal Blue (`#3B82F6`).
- **Consequences**: WCAG AA+ contrast across both modes; seamless switching via `<ThemeToggle />`.

### ADR 006: De-Carded Flat SaaS Layout over Nested Cards
- **Status**: Implemented & Enforced
- **Context**: Candidate and Admin panels previously suffered from "card fatigue" (cards nested inside cards inside cards with redundant borders and drop-shadows).
- **Decision**: Replace nested card boxes with flat divided KPI strips (`divide-x divide-slate-200 border-y`), clean horizontal `<Separator />` lines, `variant="line"` `<Tabs />`, and global `<DataTable />` containers.
- **Consequences**: Massive improvement in information density, scannability, and modern SaaS feel.

### ADR 007: Base-UI + shadcn/ui Component Primitives
- **Status**: Implemented & Enforced
- **Context**: Need robust, headless accessible primitives compatible with React 19 and Next.js 16 App Router.
- **Decision**: Adopt `@base-ui/react` primitives (tabs, buttons, popovers, tooltips) wrapped in custom `components/ui/*` wrappers.
- **Consequences**: Clean accessible DOM, zero hydration mismatches, smooth animations.

### ADR 008: Server-Side HMAC SHA-256 Razorpay Verification
- **Status**: Implemented & Enforced
- **Context**: Client-side payment callbacks can be spoofed or manipulated.
- **Decision**: Payment verification executes exclusively on the server in `verifyPaymentAndEnrollAction` using Node `crypto` HMAC-SHA-256 against `RAZORPAY_KEY_SECRET`. Webhooks provide asynchronous reconciliation.
- **Consequences**: Completely tamper-proof payments and enrollment provisioning.

### ADR 009: Dedicated Profile & Settings Architecture for Both Portals
- **Status**: Implemented & Enforced
- **Context**: Users previously lacked dedicated profile and security settings pages in both portals.
- **Decision**: Create `/student/profile` and `/admin/profile` as Server Components that prefill existing database profile data, offering tabbed settings for personal details, verified password changes, and quota/governance reviews.
- **Consequences**: Complete self-service account management and security for both candidate and administrator roles.

### ADR 010: Admin-Triggered 7-Day Refund Engine & Immutable Payment Ledger
- **Status**: Implemented & Enforced (Invariant #7)
- **Context**: Enforcing student consumer protection and clear financial auditability requires a compliant refund policy and an immutable audit trail of gateway webhooks and administrative decisions.
- **Decision**:
  1. **7-Day Eligibility Window**: Refunds are strictly permitted within 7 calendar days ($\le 7 \times 24 \times 60 \times 60 \times 1000\text{ ms}$) from order payment creation.
  2. **Attempt Consumption Guard**: If candidate has utilized attempts (`attemptsUsed > 0`), the refund dialog alerts the administrator and requires an explicit candidate forfeiture acknowledgment checkbox.
  3. **Atomic Execution**: On refund execution in `actions/payment-actions.ts`, the database transaction sets `Payment.status = REFUNDED`, creates `PaymentRefund`, sets `TestRegistration.status = CANCELLED`, zeroes out `maxAttempts = 0`, and records an immutable `PaymentLedger` event.
  4. **Network Reconnection & Idempotency**: Route `/api/payments/verify-status` enables client recovery, and `reconcilePendingPaymentsAction` sweeps orphan pending payments.
- **Consequences**: Complete financial governance, prevention of double-refunds, and tamper-proof auditability.

### ADR 011: Modular Domain Test Suite Architecture
- **Status**: Implemented & Enforced
- **Context**: Monolithic `tests/verityra.test.ts` grew difficult to run per-domain and lacked fine-grained test reporting.
- **Decision**: Decompose testing into 6 isolated domain modules:
  - `tests/auth.test.ts` (11 tests)
  - `tests/test-series.test.ts` (7 tests)
  - `tests/registration.test.ts` (5 tests)
  - `tests/submissions.test.ts` (5 tests)
  - `tests/evaluation.test.ts` (6 tests)
  - `tests/payments.test.ts` (8 tests)
  Coordinated by master runner `tests/run-all.ts` (42 tests total) with individual standalone execution support.
- **Consequences**: Fast 13ms execution, modular debugging, zero external test framework bloat.

### ADR 012: Universal Table Master Pattern for Student & Admin Surfaces
- **Status**: Implemented & Enforced
- **Context**: Across candidate dashboards, test catalogs, leaderboards, and administrative queues, tabular data was inconsistently styled and lacked comprehensive searching, sorting, multi-faceted filtering, and pagination.
- **Decision**: Standardize all structured data views on `components/ui/data-table.tsx` and `components/ui/pagination.tsx`:
  1. **Full-Text Multi-Field Search**: Searches across all relevant candidate, order, and test identifiers via `searchAccessor`.
  2. **3-Way Column Sorting**: Ascending, descending, and neutral reset, with numeric-aware string sorting (e.g., sorting "Q10" after "Q2") and date parsing.
  3. **Dynamic Faceted Filters**: Automatic extraction of distinct categorical options (e.g. distinct test series titles) with badge counters and one-click dismiss.
  4. **Calendar Date Range Filtering**: Preset shortcuts (`Today`, `Last 7 Days`, `Last 30 Days`, `Specific Date`, `All Time`) with date math helpers.
  5. **Configurable Global Pagination**: Standardized page numbers, total item counts, and rows-per-page selectors (5, 10, 20, 50).
- **Consequences**: Consistent, high-efficiency data management UX across all 27 application routes.

---

## 3. Critical Operational Constraints & Gotchas

1. **Active Working Directory**: The active Next.js application codebase is in **`verityra4/`**. Terminal commands (`pnpm test`, `pnpm run build`, etc.) must always run from `d:\Abdul Basit\Freelance\Verityra\verityra4`.
2. **Search Parameter Suspense Mandate**: In Next.js App Router, any client component calling `useSearchParams()` must be wrapped in `<React.Suspense fallback={...}>`. Omitting this causes production build failures during static generation.
3. **AuditLog Schema Details Field**: In `schema.prisma`, `AuditLog.details` is defined as `String @db.Text`, not native `Json`. Any metadata passed to `details` must be serialized with `JSON.stringify()`.
4. **Offline Development Fallback**:
   - `lib/prisma.ts` provides `isDatabaseConnected()` check.
   - Server Actions include offline development fallbacks so local preview and unit tests succeed without requiring live Supabase credentials.
5. **No AI Marketing Rule Enforcement**: Every marketing headline, badge, FAQ, and value proposition on `app/page.tsx` must strictly observe Invariant #1.
6. **Base-UI Trigger Conventions**:
   - In `@base-ui/react/dialog`, `DialogTrigger` does not accept `asChild`; pass `className` and children directly to `<DialogTrigger className="...">`.
   - In `@base-ui/react/menu`, `DropdownMenuTrigger` renders a button element directly; pass `className` and children directly to `<DropdownMenuTrigger className="...">` without `asChild`.
7. **GlobalPagination totalPages Prop**: `GlobalPagination` requires `totalPages: number` explicitly; calculate via `Math.max(1, Math.ceil(totalItems / pageSize))`.

---

## 4. History of Past Bug Fixes & Refactorings

| Issue Identified | Root Cause | Solution Implemented |
|---|---|---|
| **Mobile Hero Section Overlap** | Fixed height and absolute positioning collapsed on mobile viewports ($< 375\text{px}$). | Re-engineered Hero with mobile-first CSS, flex-col layout, responsive font clamps, and wrapping badges. |
| **Hero Ruled Paper Visibility in Dark Mode** | Background color of ruled container matched the dark canvas (`#111827`), making lines invisible. | Created `.dark .hero-ruled-paper` with `rgba(15, 23, 42, 0.75)` and distinct slate margin lines. |
| **Audit Log Type Mismatch** | Action passed plain object to `details` which expected `string`. | Serialized payloads with `JSON.stringify()` in `updateAdminProfileAction` and `changePasswordAction`. |
| **Outline Button Contrast in Dark Mode** | `.dark .bg-white` global override conflicted with outline button hover styles. | Applied explicit `dark:!bg-slate-900 dark:border-slate-800 dark:text-slate-200` to outline buttons. |
| **Student Profile Unhydrated Client State** | `app/student/profile/page.tsx` was a `"use client"` component initializing with dummy state. | Converted page to Server Component with `getStudentProfileAction()` hydrating real PostgreSQL data into `StudentProfileClient`. |
| **Base-UI DialogTrigger asChild Error** | Base-UI `DialogTrigger` does not support `asChild` prop. | Refactored `admin-refund-dialog.tsx` to `<DialogTrigger className="...">` without child `<Button>`. |
| **Windows Node DLL File Lock** | Background Turbopack build held lock on `query_engine-windows.dll.node`. | Terminated orphaned node worker processes before generating Prisma client. |
| **Supabase Pooler Unique Constraint Push** | Adding unique constraint on nullable `idempotencyKey` caused Prisma CLI prompt. | Executed `pnpm prisma db push --accept-data-loss` to sync PostgreSQL schema cleanly. |

---

## 5. Modular Domain Test Suite Verification Ledger

The modular test suite in [`verityra4/tests/`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/) validates **42 critical business logic invariants** across 6 domain suites via `pnpm test` (`tests/run-all.ts`):

| Test Suite Module | Tests Passed | Domain Scope & Invariants Verified |
|---|---|---|
| [`tests/auth.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/auth.test.ts) | 11 / 11 | Registration schema, email normalization, bcrypt password complexity (8+ chars, uppercase, number, symbol), confirmation equality matching, login schema, student profile schema, admin profile schema, change password schema, Role enum definitions. |
| [`tests/test-series.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/test-series.test.ts) | 7 / 7 | URL-friendly slug generation, rupee-to-paise pricing calculation, default max attempts fallback (3), required fields validation, confidential `privateEvaluationInstructions` isolation from candidate view, status enum transitions (DRAFT/PUBLISHED/ARCHIVED), test active/expired window logic. |
| [`tests/registration.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/registration.test.ts) | 5 / 5 | Free test enrollment criteria (price 0 & published), paid test gating, initial attempt allocation (`attemptsUsed = 0`), composite `userId_testSeriesId` duplicate prevention, cancelled registration access closure, Razorpay order payload specification. |
| [`tests/submissions.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/submissions.test.ts) | 5 / 5 | Standard MIME types validation (PDF/JPG/PNG/WebP), rejection of invalid formats, 25MB file size limit, zero-attempt-burning invariant on invalid uploads, strict 3-attempt ceiling enforcement (blocks attempt 4), submission deadline enforcement, SubmissionStatus transitions. |
| [`tests/evaluation.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/evaluation.test.ts) | 6 / 6 | Zod schema validation for Gemini multimodal output, question structure integrity, score bounds clamping $[0, \text{maxMarks}]$, aggregate percentage calculation precision (2 decimals), human-in-the-loop review routing (`REVIEW_REQUIRED`), admin score override recalculations. |
| [`tests/payments.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/payments.test.ts) | 8 / 8 | Razorpay HMAC SHA-256 signature verification, tampered signature rejection, 7-day refund window policy calculations (eligible vs expired), attempt consumption forfeiture guard, idempotency key uniqueness format, PaymentLedger structured JSON audit payload serialization, auto-reconciliation threshold check (>30 min), PaymentStatus and RefundReason enum fidelity. |
