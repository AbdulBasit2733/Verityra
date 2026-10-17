# Verityra — Engineering Rules & Operational Manual (Rules.md)

> **PRIMARY DIRECTIVE**: This document contains the mandatory operational rules for all AI agents, automated coding assistants, and human engineers contributing to **Verityra** (`verityra4/`). Violating these rules breaks critical production invariants.

---

## 1. The Cardinal Operating Rules

1. **Working Directory Mandate**:
   - The active application root is **`verityra4/`**.
   - Always run commands, edits, and test runs from `d:\Abdul Basit\Freelance\Verityra\verityra4`.
   - Never create parallel or duplicate codebases in parent or child directories.
2. **The Verification Triad**:
   - Before submitting any task or marking work complete, you MUST execute and pass all three steps:
     ```powershell
     cd verityra4
     pnpm test           # All 42 critical business logic tests must pass across 6 domain suites
     pnpm run typecheck  # Zero TypeScript compilation errors
     pnpm run build      # Full Next.js Turbopack production build succeeds
     ```
   - Never suppress TypeScript errors with `@ts-ignore` or `any` workarounds.

---

## 2. The Seven Critical Business Invariants (DO NOT BREAK)

### Invariant 1: The Zero-AI Public Marketing Rule
> **MANDATE**: Never mention "AI", "AI-powered grading", "automated evaluation", "machine grading", or "AI checking" on the public landing page, catalog, marketing copy, or public promotional materials.
- **Rationale**: Public credibility and institutional trust. Candidates preparing for high-stakes exams (UPSC CSE, State PCS, Judiciary) demand human-level rigor and reject automated grading gimmicks.
- **Permitted Terms**: "Objective rubrics", "itemized evaluation", "standardized answer sheets", "pen-and-paper stamina", "three-attempt progression", "detailed question feedback".
- **Internal Reality**: AI is strictly an internal, audited multimodal pipeline detail.

### Invariant 2: Strict Three-Attempt Limit Enforcement
> **MANDATE**: Every registered candidate receives a strict allowance of **three accepted submissions** (`maxAttempts: 3`) per enrolled test series.
- **Enforcement Mechanism**:
  1. **Database Schema**: Enforced via `@@unique([registrationId, attemptNumber])` on `Submission`.
  2. **Atomic Verification**: `submission-actions.ts` checks existing accepted count within an acid transaction before allocating an attempt number.
  3. **UI Locking**: Upload forms lock and display "Attempt Limit Reached" upon reaching attempt 3.
- **Rules**:
  - Direct API or Action calls must physically fail if attempt count $\ge 3$.
  - Invalid files (corrupt PDFs, non-PDF formats) rejected before storage do **not** burn attempts.
  - Overrides can only be granted by an authenticated administrator through `adminGrantExtraAttemptAction`, creating an immutable `AuditLog`.

### Invariant 3: Instruction System Separation & Confidentiality
> **MANDATE**: The platform maintains two strictly isolated instruction systems:
> 1. `studentInstructions`: Public candidate guidance (syllabus scope, ballpoint pen color, margin boundaries).
> 2. `privateEvaluationInstructions`: Strictly confidential marking keys, partial-credit formulas, and model solutions.
- **Security Rule**: `privateEvaluationInstructions` must **never** be projected, serialized, or returned in student-facing queries, Server Actions, or client bundles.
- **Verification**: Covered by automated test `tests/test-series.test.ts`.

### Invariant 4: Server Action-Based Architecture (No REST Mutation Endpoints)
> **MANDATE**: Do NOT create client components that make REST API calls (`fetch('/api/...')`) for application mutations.
- **Rule**: All application mutations (enrollment, booklet submission, score adjustments, profile updates, password changes, refund triggers) MUST execute as Next.js **Server Actions** (`"use server"`) in `verityra4/actions/*`.
- **Exceptions**: Route handlers (`app/api/*`) are reserved exclusively for external webhooks (Razorpay) and authenticated file streaming proxies (`/api/files/download`).

### Invariant 5: Server-Side Role-Based Access Control (RBAC)
> **MANDATE**: Authorization must be verified on the server for all Server Actions and Server Components using `verityra4/lib/auth-guard.ts`.
- **Roles**: `Role.STUDENT` and `Role.ADMIN`.
- **Registration Rule**: Self-service signup and OAuth sign-in **always** default to `Role.STUDENT`. Never accept client-supplied role payloads.
- **Student Boundary**: Students can only access their own submissions, registrations, and private evaluations.
- **Admin Boundary**: Admin actions (`createTestSeries`, `adjustScore`, `grantExtraAttempt`, `adminTriggerRefundAction`) require `requireAdmin()`.

### Invariant 6: Hallucination-Proof Score Clamping & Code-Level Calculation
> **MANDATE**: Total scores and percentages must be computed strictly in application code—never trusted directly from model outputs.
- **Score Clamping**: Question scores are hard-clamped to $[0, \text{maxMarks}]$.
- **Percentage Formula**: $\text{Percentage} = (\sum \text{AwardedMarks} / \sum \text{MaxMarks}) \times 100$.
- **Uncertainty Escalation**: Any score marked with high uncertainty or ambiguous handwriting legibility must be assigned `status: REVIEW_REQUIRED` to force human educator review.

### Invariant 7: 7-Day Refund Policy & Attempt Forfeiture Guard
> **MANDATE**: Refunds on paid test series are strictly governed by a 7 calendar-day window and an attempt-forfeiture protocol.
- **7-Day Eligibility Boundary**: Payments created $> 7\text{ days}$ ago ($\Delta t > 7 \times 24 \times 60 \times 60 \times 1000\text{ ms}$) are strictly non-refundable through standard actions.
- **Attempt Forfeiture Protocol**: If a candidate has already consumed attempts (`attemptsUsed > 0`), the refund CANNOT be processed without explicit candidate/admin confirmation of quota forfeiture.
- **Atomic State Transitions**: Triggering a refund in `actions/payment-actions.ts` must atomically set `Payment.status = REFUNDED`, insert a `PaymentRefund` record, update `TestRegistration.status = CANCELLED`, zero out `maxAttempts = 0`, and log an immutable entry into `PaymentLedger`.
- **Security & Idempotency**: Double refunds and race conditions are prevented by unique gateway refund references and unique idempotency keys (`idemp_ref_${paymentId}_${timestamp}`).

---

## 3. Coding Standards & Architectural Conventions

### 3.1. Server Components vs. Client Components
- **Default to Server Components**: All pages in `app/*` should be Server Components (`async function Page()`) that fetch data directly from Prisma or Server Actions and pass props to client presentation components.
- **`"use client"` Restrictions**: Apply `"use client"` only to leaf interactive components that require React hooks (`useState`, `useEffect`, `useActionState`, `useConfirm`).
- **Suspense Boundary Requirement**: Any client component that invokes `useSearchParams()` MUST be wrapped in a `<React.Suspense fallback={...}>` boundary in its parent layout or page to prevent de-opting static route compilation.

### 3.2. Error Handling & User Feedback
1. **Destructive or Irreversible Actions**: Must trigger a promise-based confirmation dialog via `useConfirm()` from `ConfirmDialogProvider` before firing server mutations.
2. **System & Validation Errors**: Must invoke `useGlobalError().showError()` with an error title, message, and diagnostic error code (e.g. `ERR_ATTEMPT_LIMIT`).
3. **Transient Success Feedback**: Use `toast.success(...)` or `toast.info(...)` from `sonner` (`@/components/ui/sonner`).

### 3.3. Database & Prisma Conventions
- Wrap related multi-table updates in `prisma.$transaction([])`.
- Never execute raw SQL queries without explicit justification.
- When creating `AuditLog` entries, serialize the metadata payload into a JSON string:
  ```ts
  await prisma.auditLog.create({
    data: {
      adminId: user.id,
      action: "SCORE_OVERRIDE",
      targetType: "Submission",
      targetId: submissionId,
      details: JSON.stringify({ previousScore, newScore, reason }),
    },
  })
  ```

---

## 4. UI/UX & Styling Standards

1. **60/30/10 Color Harmony**:
   - Strictly adhere to Pure White `#FFFFFF` / Deep Obsidian `#0B1120` (60%), Slate Muted `#64748B` / `#94A3B8` (30%), and Royal Blue `#2A6AED` / `#3B82F6` (10%).
2. **No Card Clutter**:
   - Do NOT wrap sections in nested cards with heavy borders and shadows.
   - Use flat divided KPI strips (`divide-x divide-slate-200 border-y py-4 px-1`).
   - Use `shadcn/ui` `<Tabs variant="line" />` with subtle underline active indicators.
3. **Dark Mode Fidelity**:
   - Every new component or page must be verified in both Light Mode and Dark Mode.
   - Never use hardcoded light classes (`bg-white`, `text-slate-900`) without ensuring appropriate dark mode harmony via CSS variables or `dark:` utilities.
4. **Button & Form Control Sizing**:
   - Default buttons: `h-11 px-5 rounded-xl text-sm font-semibold`.
   - Small buttons: `h-9 px-4 rounded-lg text-xs font-semibold`.
   - Form inputs: `h-10 sm:h-11 px-3.5 rounded-lg border-slate-200 text-xs sm:text-sm`.
   - Focus outline: Accessible ring with `focus-visible:ring-3 focus-visible:ring-ring/25`.

---

## 5. Testing & Quality Assurance Mandate

1. **Automated Test Integrity**:
   - The test file [`verityra4/tests/verityra.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/verityra.test.ts) is the authoritative ground truth for business invariants.
   - Never delete, disable, or weaken existing assertions to make a failing test pass.
   - If adding new domain invariants, write a corresponding unit test in `verityra.test.ts`.
2. **Zero-Regression Policy**:
   - All 13/13 critical business logic tests must report `✓ PASS`.
   - `tsc --noEmit` must report 0 errors.
   - `next build` must compile 100% of static and dynamic routes.
