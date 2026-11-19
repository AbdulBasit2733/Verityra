# Centralized Brand Configuration (Izone) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a single centralized brand configuration module (`BRAND_CONFIG`) in `verityra4/lib/brand.ts` and migrate all hardcoded brand occurrences from "Verityra" to "Izone" across public landing pages, authentication flows, email templates, admin suite, and student portal.

**Architecture:** A lightweight, client-and-server-safe TypeScript configuration object (`BRAND_CONFIG`) exported from `lib/brand.ts` with optional environment variable overrides (`NEXT_PUBLIC_BRAND_NAME`, `NEXT_PUBLIC_SUPPORT_EMAIL`), typed helper utilities (`getBrandTitle`, `getCopyrightText`), and systematic propagation into UI layouts, navigation, auth screens, portals, and notifications.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript 5, Tailwind CSS v4, Lucide React, Resend, Node Test Runner (`tsx tests/run-all.ts`).

---

## Global Constraints

- **Brand Primary Name:** `"Izone"`
- **Logo Mark / Initials:** `"I"` (or `"IZ"` for 2-letter badge fallback)
- **Support Email:** `process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@izone.com"`
- **Storage & Invariant Safety:** Internal storage bucket name (`"verityra-private"`) and database table structures must remain intact to prevent broken PDF downloads, upload failures, or schema migrations.
- **Client/Server Boundary:** `lib/brand.ts` must contain zero server-only dependencies so it can be imported safely inside `"use client"` and server components alike.
- **Zero-Downtime Host Security:** Allowed NextAuth redirection origins must support both new `izone` domains and existing `verityra` domains.

---

## Proposed Changes

```
verityra4/
├── lib/
│   └── [NEW] brand.ts                         # Central brand configuration & helpers
├── app/
│   ├── layout.tsx                             # Root metadata & page title
│   ├── leaderboard/page.tsx                   # Leaderboard subtitle
│   ├── signin/page.tsx                        # Sign-in title
│   ├── forgot-password/page.tsx               # Logo initial & brand name
│   ├── reset-password/page.tsx                # Logo initial & brand name
│   ├── verify-email/page.tsx                  # Logo initial & brand name
│   ├── suspended/page.tsx                     # Support email
│   ├── admin/profile/page.tsx                 # Fallback admin email
│   └── student/profile/page.tsx               # Fallback candidate email
├── components/
│   ├── common/
│   │   ├── navbar.tsx                         # Header logo, brand name, aria-label
│   │   └── footer.tsx                         # Footer logo, brand name, support email, copyright
│   ├── layout/auth/
│   │   ├── auth-page-layout.tsx               # Auth page layout branding, security footnote
│   │   ├── desktop/auth-desktop-layout.tsx    # Desktop auth shell branding
│   │   └── mobile/auth-mobile-layout.tsx      # Mobile auth shell branding
│   ├── auth/
│   │   ├── signin-form-core.tsx               # Candidate email placeholder
│   │   └── signup-form-core.tsx               # Candidate email placeholder
│   ├── portal/
│   │   ├── portal-shell.tsx                   # Fallback portal email
│   │   ├── desktop/portal-desktop-layout.tsx  # Desktop sidebar logo, brand text, collapsed title
│   │   ├── desktop/desktop-command-palette.tsx# Command palette brand title
│   │   └── mobile/portal-mobile-layout.tsx    # Mobile header & drawer branding
│   ├── admin/profile/
│   │   └── admin-profile-client.tsx           # Admin governance text & fallback email
│   ├── student/profile/
│   │   └── student-profile-client.tsx         # Candidate fallback email
│   ├── hero-cockpit-preview.tsx               # Window chrome domain preview (izone.app)
│   ├── interactive-rubric-showcase.tsx        # Rubric disclaimer copy
│   └── test-registration-button.tsx           # Razorpay checkout merchant name
├── lib/
│   ├── email/
│   │   ├── resend.ts                          # Default sender name ("Izone <...>")
│   │   └── templates/
│   │       ├── base-layout.ts                 # Email HTML logo initial, header & copyright
│   │       ├── password-changed.ts            # Security alert subject & copy
│   │       ├── password-reset.ts              # Password reset subject & copy
│   │       └── verify-email.ts                # Email verification subject & copy
│   └── ai/
│       └── gemini-evaluator.ts                # Academic evaluator prompt persona
└── tests/
    ├── [NEW] brand.test.ts                    # Unit tests for brand configuration
    └── email.test.ts                          # Email template test assertion updates
```

---

## Detailed Tasks

### Task 1: Create Central Brand Configuration Module (`lib/brand.ts`) and Unit Tests
- Create `lib/brand.ts` with `BRAND_CONFIG`, `BrandConfig`, `getBrandTitle`, `getCopyrightText`, and `getSupportMailto`.
- Create `tests/brand.test.ts` and add it to `tests/run-all.ts`.

### Task 2: Migrate Landing & Public Shell Components
- Update `app/layout.tsx` metadata.
- Update `components/common/navbar.tsx` and `components/common/footer.tsx`.
- Update `app/leaderboard/page.tsx`, `components/hero-cockpit-preview.tsx`, `components/interactive-rubric-showcase.tsx`, and `components/test-registration-button.tsx`.

### Task 3: Migrate Authentication Layouts & Auth Pages
- Update `components/layout/auth/auth-page-layout.tsx`, `desktop/auth-desktop-layout.tsx`, and `mobile/auth-mobile-layout.tsx`.
- Update `app/signin/page.tsx`, `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`, `app/verify-email/page.tsx`, and `app/suspended/page.tsx`.
- Update email placeholders in `signin-form-core.tsx` and `signup-form-core.tsx`.

### Task 4: Migrate Portal Shells, Admin & Student Panels
- Update `components/portal/desktop/portal-desktop-layout.tsx` (sidebar brand mark, brand text, collapsed title, initials, and backward-compatible localStorage keys).
- Update `components/portal/mobile/portal-mobile-layout.tsx` (topbar & drawer brand marks).
- Update `components/portal/portal-shell.tsx` and `components/portal/desktop/desktop-command-palette.tsx`.
- Update `components/admin/profile/admin-profile-client.tsx`, `components/student/profile/student-profile-client.tsx`, `app/admin/profile/page.tsx`, and `app/student/profile/page.tsx`.

### Task 5: Migrate Email System & Evaluator Prompts
- Update `lib/email/resend.ts` default sender name.
- Update email templates (`base-layout.ts`, `password-changed.ts`, `password-reset.ts`, `verify-email.ts`).
- Update `lib/ai/gemini-evaluator.ts` system instruction persona.
- Update `tests/email.test.ts` assertions.

### Task 6: Comprehensive Verification
- Run `pnpm run typecheck`.
- Run `pnpm test`.
- Run `pnpm run build`.
