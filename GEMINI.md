# Verityra — AI Contributor Guide (GEMINI.md)

Welcome, AI Engineer (Antigravity, Gemini, Claude, Copilot, or Cursor). This document contains the architectural invariants, domain rules, operational commands, and coding standards required to contribute fast, safely, and efficiently to the **Verityra** codebase.

---

## 1. Project Mission & Identity

**Verityra** is a premier, production-minded test-series platform designed for competitive subjective examination candidates (e.g., UPSC Civil Services Mains, State PCS, Judicial Services).

The platform simulates real examination conditions:
- Candidates download standardized printable margin-aligned answer-sheet templates.
- Candidates write answers exclusively by hand with pen and paper.
- Scanned PDF/image booklets are submitted through an encrypted upload vault.
- Responses receive question-by-question scoring and rubric feedback via an internal multimodal evaluation pipeline.
- Educators/administrators review flagged evaluations, adjust scores with audit logs, and publish finalized results to a transparent leaderboard.
- Each registered candidate is granted a strict default allowance of **three accepted submissions** per registered test.

### Brand Identity & Styling Standards
- **Wordmark**: Always write **Verityra** with an uppercase "V" and lowercase "erityra".
- **Color Palette (EdTech Theme — Reference: #2A6AED & nit-school-basic.vercel.app)**:
  | Token | Hex | Role |
  |---|---|---|
  | **Pure White** | `#FFFFFF` | Main backgrounds, clean surface contrast |
  | **Soft Blue Tint** | `#EFF6FF` | Supporting backgrounds, pill containers, badges |
  | **Light Border Blue** | `#DBEAFE` | Subtle borders, light interactive accents |
  | **Brand Royal Blue** | `#2A6AED` | Primary brand color, hero buttons, key links |
  | **Deep Royal Blue** | `#1E55C7` | Hover states, active buttons, solid contrast |
  | **Slate Dark** | `#0F172A` | Primary typography, headers, high contrast |
  | **Slate Muted** | `#64748B` | Secondary body text, captions, subtitle copy |
- **Component Sizing & Spacing Standards**:
  - **Buttons**: Default `h-11 px-5 rounded-xl text-sm font-semibold`, large `h-13 px-8 rounded-2xl text-base font-bold`, small `h-9 px-4 rounded-lg`.
  - **Inputs & Form Controls**: `h-12 px-4 rounded-xl text-sm` with shadow-xs and focus ring `ring-[#2A6AED]/20`.
  - **Cards & Containers**: `rounded-3xl p-8 sm:p-10 shadow-card hover:shadow-card-hover border-slate-200/80` with generous breathing room.
  - **Badges**: `min-h-7 px-3 py-1 rounded-lg text-xs font-semibold`.
  - **Tables**: Cells `px-6 py-4.5 text-sm`, header `h-13 px-6 uppercase text-xs`.
- **Visual Design**: 60/30/10 rule. Accessible contrast, generous whitespace, legible typography (`Inter`), clean modern EdTech SaaS aesthetic. Avoid decorative clutter.

---

## 2. Critical Business Invariants (DO NOT BREAK)

Any contribution must strictly uphold these six core invariants:

### Rule 1: The Zero-AI Public Marketing Rule
> **CRITICAL**: Never mention "AI", "AI-powered grading", "automated evaluation", "machine grading", or "AI checking" on the public landing page, catalog, marketing copy, or public promotional materials.
> Public messaging must center on **structured practice, handwritten stamina, standardized answer sheets, objective rubrics, and detailed feedback**. AI is solely an internal evaluation implementation detail.

### Rule 2: Strict Three-Attempt Enforcement
> Every student registration defaults to a maximum of **three accepted submissions** (`maxAttempts: 3`).
> - Attempt 1, 2, and 3 are accepted and evaluated.
> - Attempt 4 is strictly rejected by the database and UI.
> - Enforced via atomic database transactions and a unique constraint on `(registrationId, attemptNumber)`.
> - Direct API/Action calls cannot bypass this.
> - Invalid uploads (rejected before storage) do **not** burn attempts.
> - Extra attempts can only be granted via audited administrative override (`adminGrantExtraAttemptAction`).

### Rule 3: Separate Instruction Systems
> The platform maintains two strictly isolated instruction systems:
> 1. `studentInstructions`: Publicly visible to candidates on test pages and workspaces.
> 2. `privateEvaluationInstructions`: Strictly confidential marking rubrics, partial-credit formulas, and uncertainty thresholds.
> **Security Mandate**: Never leak, project, or serialize `privateEvaluationInstructions` or confidential model answers to student-facing queries, APIs, or client bundles.

### Rule 4: Action-Based Architecture (No REST Client Fetches)
> Do **not** create client components that make REST API calls (`fetch('/api/...')`) for application actions.
> All application mutations must be direct Next.js **Server Actions** (`"use server"`) in `actions/*`. Route handlers (`app/api/*`) are reserved only for external webhooks (e.g. Razorpay) and file streaming downloads.

### Rule 5: Server-Side Role-Based Access Control
> Authorization is enforced on the server for all Server Actions and Server Components using `lib/auth-guard.ts`.
> - Roles: `STUDENT` and `ADMIN`.
> - Public registration and Google OAuth **always** create users with `Role.STUDENT`. Never accept client-supplied role payloads.
> - Students can only access their own profile, submissions, registrations, and private results.

### Rule 6: Hallucination-Proof Score Clamping
> The evaluation engine (`lib/ai/gemini-evaluator.ts`) validates model outputs using Zod schemas. Total marks and percentages are calculated **strictly in application code**, never taken directly from model outputs. Question scores are hard-clamped to `[0, maxMarks]`.

---

## 3. Technology Stack

| Layer | Technology | Version / Configuration |
|---|---|---|
| **Framework** | Next.js App Router (Turbopack) | `16.4.0` |
| **Runtime / Language** | Node.js + TypeScript (strict) | Node `v22+`, TS `v5` |
| **Frontend UI** | React 19 + Tailwind CSS v4 + shadcn/ui | `@base-ui/react`, Lucide icons |
| **Database** | PostgreSQL (Supabase) | Prisma ORM `6.19.3` |
| **Authentication** | NextAuth.js | `4.24.15` (JWT strategy, Credentials + Google) |
| **Storage Vault** | Supabase Storage / Protected Local Vault | `verityra-private` bucket |
| **AI Evaluation** | Google Gemini Multimodal API | `@google/genai` (`gemini-2.5-flash`) |
| **Payments** | Razorpay | `razorpay` 2.9.8 (HMAC SHA-256 verification) |
| **Package Manager** | `pnpm` | `10.x` |

---

## 4. Directory Structure Map

```
verityra4/
├── actions/                         # Server Actions (Mutations & Direct DB Ops)
│   ├── auth-actions.ts              # Registration, profile updates, password resets
│   ├── test-series-actions.ts       # Test series CRUD, paper & template uploads
│   ├── registration-actions.ts      # Free enrollment & Razorpay payment verification
│   ├── submission-actions.ts        # Atomic 3-attempt upload & AI evaluation trigger
│   ├── evaluation-actions.ts        # Admin score adjustments & audited extra attempts
│   └── leaderboard-actions.ts       # Deterministic ranking calculation
├── app/                             # Next.js App Router (Pages & Route Handlers)
│   ├── (auth)/                      # signin, signup, forgot-password, reset-password
│   ├── admin/                       # Admin Portal (dashboard, test-series, submissions, students)
│   ├── student/                     # Candidate Portal (dashboard, profile, test workspace)
│   ├── tests/                       # Public Test Series catalog & details
│   ├── leaderboard/                 # Public live leaderboard
│   ├── api/                         # NextAuth handler, file download, Razorpay webhook
│   ├── layout.tsx                   # Root layout with AuthProvider & ThemeProvider
│   └── page.tsx                     # Public marketing landing page (No AI mentions)
├── components/                      # React Components
│   ├── ui/                          # shadcn/ui primitives (@base-ui/react)
│   ├── navbar.tsx                   # Responsive header with role-based menu
│   ├── footer.tsx                   # Standard platform footer
│   ├── submission-upload-form.tsx   # Answer sheet upload form with 3-attempt locking
│   ├── admin-score-review-editor.tsx# Question-wise score adjuster with live recalculation
│   └── admin-extra-attempt-dialog.tsx# Audited attempt override modal
├── lib/                             # Core Services & Utilities
│   ├── prisma.ts                    # Prisma client singleton with offline fallback
│   ├── supabase.ts                  # Supabase client & private signed URL generator
│   ├── auth.ts                      # NextAuth configuration (Credentials & Google)
│   ├── auth-guard.ts                # Server-side role & session guards
│   ├── ai/                          # Gemini evaluation engine & Zod validation schema
│   └── validations/                 # Zod validation schemas (auth, forms)
├── prisma/                          # Database
│   ├── schema.prisma                # Full PostgreSQL schema with constraints & indexes
│   ├── migrations/                  # Version-controlled SQL migrations
│   └── seed.ts                      # Admin, demo student & mock test seeder
├── docs/                            # In-depth architectural & operational documentation
│   ├── ARCHITECTURE.md              # System architecture & action flow
│   ├── DATABASE.md                  # Database schema, relations, and Supabase pooling
│   ├── AUTHENTICATION.md            # NextAuth & Google OAuth setup
│   ├── SECURITY.md                  # Privacy, prompt injection & attempt defense
│   ├── AI-EVALUATION.md             # Multimodal grading engine & fallback mode
│   ├── PAYMENTS.md                  # Razorpay order & signature verification
│   ├── DEPLOYMENT.md                # Production configuration & hosting checklist
│   └── TESTING.md                   # QA verification guide
└── tests/
    └── verityra.test.ts             # Automated test suite for critical business rules
```

---

## 5. Development & Verification Workflow

Always run commands inside the `verityra4/` directory:

```powershell
# 1. Install dependencies
pnpm install

# 2. Run automated test suite (verifies auth, 3-attempt limit, AI guardrails, payments)
pnpm test

# 3. Type check the entire codebase
pnpm run typecheck

# 4. Run full production build
pnpm run build

# 5. Start local development server (port 3000)
pnpm run dev
```

### Database Operations (Supabase PostgreSQL)
```powershell
# Generate Prisma Client
pnpm exec prisma generate

# Synchronize schema directly to Supabase
pnpm exec prisma db push

# Apply migrations
pnpm exec prisma migrate deploy

# Seed database with initial Admin & mock tests
pnpm exec prisma db seed
```

---

## 6. How-To Guide for Common AI Tasks

### Adding a New Mutation / Action
1. Create or open the relevant file in `actions/*.ts`.
2. Ensure the top of the file declares `"use server"`.
3. Check authorization using `await getCurrentUser()`, `await requireAdmin()`, or `await requireStudent()`.
4. Validate inputs using Zod.
5. Perform database operations via `prisma`. Wrap concurrent or multi-table updates in `prisma.$transaction()`.
6. Call `revalidatePath('/relevant-path')` before returning `{ success: true, ... }`.

### Adding a New Page or View
1. Default to **Server Components** (`export default async function Page()`).
2. Fetch data directly via `prisma` inside the Server Component.
3. If client interactivity (state, hooks) is needed, extract the interactive portion into a Client Component (`"use client"`) in `components/`.
4. **Important**: Any client component using `useSearchParams()` must be wrapped in a `<Suspense>` boundary to prevent static prerender build errors.

### Modifying the Database Schema
1. Edit `prisma/schema.prisma`.
2. Add appropriate constraints (`@unique`, foreign keys, indexes).
3. If working with Supabase, remember `DATABASE_URL` uses port `6543` (transaction pooler) and `DIRECT_URL` uses port `5432` (direct).
4. Run `pnpm exec prisma generate`.
5. Run `pnpm run typecheck` to verify all TypeScript typings match.

### Modifying the Evaluation Engine
1. Update `lib/ai/evaluation-schema.ts` if structured output fields change.
2. Ensure `lib/ai/gemini-evaluator.ts` keeps the prompt injection defenses intact.
3. Maintain the fallback simulation function so offline/local testing continues to work without requiring live Gemini API credits.

---

## 7. AI Code Review Checklist (Verify Before Submitting)

Before declaring any task complete:
- [ ] Did I run `pnpm test` and verify all tests pass?
- [ ] Did I run `pnpm run typecheck` with zero TypeScript errors?
- [ ] Did I run `pnpm run build` and ensure all static and dynamic routes compile successfully?
- [ ] Is there **zero** mention of "AI", "AI grading", or "automated grading" in public marketing copy?
- [ ] Is the 3-attempt limit preserved and guarded against race conditions?
- [ ] Are `privateEvaluationInstructions` kept strictly confidential from student views?
- [ ] Did I maintain documentation integrity without deleting unrelated comments or functions?
