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

---

## 3. Critical Operational Constraints & Gotchas

1. **Active Working Directory**: The active Next.js application codebase is in **`verityra4/`**. Terminal commands (`pnpm test`, `pnpm run build`, etc.) must always run from `d:\Abdul Basit\Freelance\Verityra\verityra4`.
2. **Search Parameter Suspense Mandate**: In Next.js App Router, any client component calling `useSearchParams()` must be wrapped in `<React.Suspense fallback={...}>`. Omitting this causes production build failures during static generation.
3. **AuditLog Schema Details Field**: In `schema.prisma`, `AuditLog.details` is defined as `String @db.Text`, not native `Json`. Any metadata passed to `details` must be serialized with `JSON.stringify()`.
4. **Offline Development Fallback**:
   - `lib/prisma.ts` provides `isDatabaseConnected()` check.
   - Server Actions include offline development fallbacks so local preview and unit tests succeed without requiring live Supabase credentials.
5. **No AI Marketing Rule Enforcement**: Every marketing headline, badge, FAQ, and value proposition on `app/page.tsx` must strictly observe Invariant #1.

---

## 4. History of Past Bug Fixes & Refactorings

| Issue Identified | Root Cause | Solution Implemented |
|---|---|---|
| **Mobile Hero Section Overlap** | Fixed height and absolute positioning collapsed on mobile viewports ($< 375\text{px}$). | Re-engineered Hero with mobile-first CSS, flex-col layout, responsive font clamps, and wrapping badges. |
| **Hero Ruled Paper Visibility in Dark Mode** | Background color of ruled container matched the dark canvas (`#111827`), making lines invisible. | Created `.dark .hero-ruled-paper` with `rgba(15, 23, 42, 0.75)` and distinct slate margin lines. |
| **Audit Log Type Mismatch** | Action passed plain object to `details` which expected `string`. | Serialized payloads with `JSON.stringify()` in `updateAdminProfileAction` and `changePasswordAction`. |
| **Outline Button Contrast in Dark Mode** | `.dark .bg-white` global override conflicted with outline button hover styles. | Applied explicit `dark:!bg-slate-900 dark:border-slate-800 dark:text-slate-200` to outline buttons. |
| **Student Profile Unhydrated Client State** | `app/student/profile/page.tsx` was a `"use client"` component initializing with dummy state. | Converted page to Server Component with `getStudentProfileAction()` hydrating real PostgreSQL data into `StudentProfileClient`. |

---

## 5. Test Suite Verification Ledger

The automated test suite in [`verityra4/tests/verityra.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/verityra.test.ts) validates 13 critical business logic invariants on every release:

| Test Name | Domain Verified |
|---|---|
| `Auth: Valid candidate registration schema passes` | Normalized email parsing, bcrypt password policy |
| `Auth: Weak passwords without number or uppercase are rejected` | Entropy enforcement (8+ chars, uppercase, number, symbol) |
| `Auth: Mismatched password and confirmPassword are rejected` | Registration schema refinement |
| `Auth: Student and Admin profile schemas validate inputs properly` | Profile field boundaries and sanitation |
| `Auth: Change password schema validates requirements and matches confirmation` | Credential update confirmation validation |
| `Attempts: Three-attempt limit logic strictly accepts 1, 2, 3 and blocks attempt 4` | Core 3-attempt quota enforcement |
| `Attempts: Invalid uploads before acceptance do not burn attempts` | Atomic submission safety |
| `AI Evaluator: Structured JSON schema validates question scores and feedback` | Zod schema validation for model outputs |
| `AI Evaluator: Clamps marks so awarded score never exceeds maxMarks` | Score clamping algorithm: $[0, \text{maxMarks}]$ |
| `AI Evaluator: Flagging uncertainty routes to review status` | Review queue escalation routing |
| `Payments: Server-side HMAC SHA-256 signature verification succeeds with correct secret` | Razorpay payment security |
| `Payments: Tampered signature is strictly rejected` | Anti-tamper verification |
| `Security: Private evaluation instructions are isolated from student query projections` | Confidential rubric isolation |
