# Verityra System Architecture

## 1. High-Level Overview

Verityra is a high-integrity, modular monolith built on **Next.js App Router (React 19)**, **PostgreSQL (Supabase)**, and **Prisma ORM**. It enables candidates preparing for competitive subjective examinations to practice authentic handwritten answer writing, receive detailed question-by-question evaluations, and benchmark their progress on a transparent leaderboard.

```
                    ┌───────────────────────────────┐
                    │       Client (Browser)        │
                    │  Landing, Student & Admin UI  │
                    └───────────────┬───────────────┘
                                    │
                                    │ Server Actions (Mutations)
                                    │ Server Components (RSC Query)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Verityra Full-Stack Application                      │
│                                                                        │
│  ┌───────────────────┐  ┌────────────────────┐  ┌───────────────────┐  │
│  │  Auth & Session   │  │   Test Series &    │  │    Submission     │  │
│  │ (NextAuth / JWT)  │  │    Instructions    │  │ Attempt Limiter   │  │
│  └─────────┬─────────┘  └─────────┬──────────┘  └─────────┬─────────┘  │
│            │                      │                       │            │
│            ▼                      ▼                       ▼            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Prisma Data Access Layer                     │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
│   PostgreSQL    │        │  Supabase File  │        │  Google Gemini  │
│ (Supabase Pool) │        │ Storage (Vault) │        │ Multimodal API  │
└─────────────────┘        └─────────────────┘        └─────────────────┘
```

## 2. Server Action Architecture

In accordance with direct server-to-database architectural principles:
- **No Client REST API Fetches**: Client components do not invoke intermediate REST API endpoints for user actions.
- **Direct Server Actions (`actions/*`)**:
  - `actions/auth-actions.ts`: Registration, profile updates, password resets.
  - `actions/test-series-actions.ts`: Admin test creation, instruction management, document uploads, publication toggles.
  - `actions/registration-actions.ts`: Free test enrollment, Razorpay order generation, signature verification.
  - `actions/submission-actions.ts`: Atomic 3-attempt reservation, secure file vault upload, evaluation invocation.
  - `actions/evaluation-actions.ts`: Admin score inspection, question mark overrides, audited extra attempts.
  - `actions/leaderboard-actions.ts`: Deterministic ranking calculation for eligible published tests.

## 3. Strict Boundary Separation

### Instruction Systems
1. **Student Instructions**: Publicly accessible guidelines explaining answer writing parameters, question numbering, time limits, and margins.
2. **Private Evaluator Instructions**: Strictly confidential marking criteria, partial credit allowances, and uncertainty guidelines. These are never returned in student RSC queries, client bundles, or public projections.

### Attempt Enforcement
1. Database-enforced unique constraint `(registrationId, attemptNumber)`.
2. Atomic check and reservation inside transactions prevents concurrent bypass.
3. Locked UI states when `attemptsUsed >= maxAttempts`.
