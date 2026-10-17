# Verityra Quality Assurance & Testing Guide

> **Work Directory**: `verityra4/`  
> **Testing Architecture**: Modular Domain Test Suites (42 Tests across 6 Modules).

---

## 1. Modular Test Suite Architecture

Verityra uses a fast, lightweight, modular testing architecture built on Node's native `assert/strict` and `tsx`. The tests are decomposed into domain-specific test suites under `verityra4/tests/`:

```
tests/
├── test-utils.ts       # Shared TestSuite runner, timing, and error aggregation
├── auth.test.ts        # Module 1: Authentication & Identity (11 tests)
├── test-series.test.ts # Module 2: Test Series Management & Security (7 tests)
├── registration.test.ts# Module 3: Test Registration & Enrollment (5 tests)
├── submissions.test.ts # Module 4: Answer Sheet Submissions & Quota (5 tests)
├── evaluation.test.ts  # Module 5: AI Evaluation Engine & Scoring (6 tests)
├── payments.test.ts    # Module 6: Razorpay Payments, 7-Day Refund & Ledger (8 tests)
├── run-all.ts          # Consolidated Master Test Runner (42 tests total)
└── verityra.test.ts    # Legacy Entrypoint (delegates to run-all.ts)
```

---

## 2. Invariants Verified by Module

### 2.1. Authentication & Identity ([`tests/auth.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/auth.test.ts)) — 11 Tests
- Candidate registration schema and email normalization.
- Rejection of weak passwords (missing uppercase, number, symbol, or $< 8$ chars).
- Password and confirmPassword equality matching.
- Login credential validation.
- Student profile input boundaries (educationLevel, targetExam, phone, bio).
- Admin profile input validation.
- Change password schema requirements.
- Role enumeration fidelity (`Role.STUDENT`, `Role.ADMIN`).

### 2.2. Test Series Management & Security ([`tests/test-series.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/test-series.test.ts)) — 7 Tests
- URL-friendly slug generation (`slugify`).
- Rupee-to-paise pricing calculation.
- Default max attempts fallback (defaults to 3).
- Required fields validation on creation.
- **Security Invariant**: Strictly isolates confidential `privateEvaluationInstructions` from candidate query projections.
- Test series status enum values (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
- Active examination window status logic (UPCOMING, OPEN, EXPIRED).

### 2.3. Test Registration & Enrollment ([`tests/registration.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/registration.test.ts)) — 5 Tests
- Free test series auto-enrollment criteria (price 0 & published).
- Paid test series payment gating.
- Attempt counter initialization (`attemptsUsed = 0`).
- Composite unique constraint (`userId_testSeriesId`) duplicate enrollment prevention.
- Access closure on cancelled registrations.
- Paid order payload formatting (paise amounts and INR currency).

### 2.4. Submissions & Quota Management ([`tests/submissions.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/submissions.test.ts)) — 5 Tests
- Allowed file MIME types (PDF, JPEG, PNG, WebP) and rejection of unsupported formats.
- 25MB file size limit enforcement.
- **Zero Attempt Burn Invariant**: Failed uploads do not increment `attemptsUsed`.
- Strict 3-attempt ceiling: permits attempts 1, 2, 3; strictly throws `ATTEMPT_LIMIT_EXCEEDED` on attempt 4.
- End-date deadline enforcement.
- `SubmissionStatus` transitions.

### 2.5. AI Evaluation Engine & Scoring ([`tests/evaluation.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/evaluation.test.ts)) — 6 Tests
- Zod schema validation for structured multimodal model responses.
- Malformed question item rejection.
- Score bounds clamping: $[0, \text{maxMarks}]$.
- 2-decimal aggregate percentage calculation.
- Human-in-the-loop review routing: `legibilityWarning` or `uncertaintyFlag` routes to `REVIEW_REQUIRED`.
- Admin score review override calculations.

### 2.6. Razorpay Payments & Financial Ledger ([`tests/payments.test.ts`](file:///d:/Abdul%20Basit/Freelance/Verityra/verityra4/tests/payments.test.ts)) — 8 Tests
- HMAC SHA-256 signature verification with gateway secret.
- Tampered signature and mismatched payload rejection.
- 7-Day return policy calculation ($\le 7\text{ days}$ eligible, $> 7\text{ days}$ expired).
- Attempt consumption forfeiture guard: blocks refund if `attemptsUsed > 0` unless confirmed.
- Idempotency key formatting and uniqueness (`idemp_ref_${paymentId}_${timestamp}`).
- Immutable `PaymentLedger` event structure and JSON payload serialization.
- Auto-reconciler 30-minute threshold check.
- `PaymentStatus` and `RefundReason` enum definitions.

---

## 3. Running Automated Tests

### 3.1. Run the Full Suite (Consolidated Report)
```bash
pnpm test
```
*Or directly:*
```bash
pnpm tsx tests/run-all.ts
```

### 3.2. Run Individual Domain Suites
```bash
# Authentication tests
pnpm tsx tests/auth.test.ts

# Test Series tests
pnpm tsx tests/test-series.test.ts

# Registration tests
pnpm tsx tests/registration.test.ts

# Submissions & attempt quota tests
pnpm tsx tests/submissions.test.ts

# Evaluation & score clamping tests
pnpm tsx tests/evaluation.test.ts

# Razorpay payments & refund policy tests
pnpm tsx tests/payments.test.ts
```

---

## 4. Verification Triad (Pre-Deployment Checklist)

Before releasing any code change, execute the three mandatory verification steps:

```bash
# 1. Run all 42 domain business logic tests
pnpm test

# 2. Strict TypeScript type check
pnpm run typecheck

# 3. Full Next.js Turbopack production build
pnpm run build
```
