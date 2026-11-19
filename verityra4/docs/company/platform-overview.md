# Izone Platform Overview — Online Test Series & Question Papers

## 1. Purpose & Business Context

This web platform is the official digital testing and assessment portal of **I Zone Coaching Classes** (Chhatrapati Sambhajinagar, Maharashtra), branded online as **Izone**.

While I Zone Coaching Classes conducts classroom instruction from **Jr. KG through Class XII (CBSE, ICSE, State Board)**, **NEET-UG**, **JEE (Main & Advanced)**, **NTSE & Olympiads**, **UGC NET**, and **English Grammar / Spoken English**, this web application allows enrolled and external students to:
1. Enroll in **online free and paid test series** (subjective pen-and-paper practice with structured rubric evaluation).
2. Browse and access **free and paid question papers** across supported school and entrance streams.

---

## 2. Core Platform Capabilities

| Capability | Description | Access / Pricing Model |
| :--- | :--- | :--- |
| **Online Test Series (`/tests`)** | Standardized exam booklets, optional margin templates, timed exam workspace, handwritten PDF/image upload, and question-wise rubric feedback across up to **3 attempts** per registration. | **Free** (`price = 0` instant enrollment) and **Paid** (Razorpay INR checkout + 7-day refund policy & audit ledger). |
| **Question Papers Library (`/question-papers`)** | Downloadable examination papers, practice worksheets, and board/entrance sets organized by stream, subject, and year. | Currently supports free public/student downloads on `/question-papers` plus paid papers bundled inside paid test series; standalone paid question-paper gating is a planned extension. |
| **Student Workspace (`/student/*`)** | Track active enrollments, download question booklets, time practice sessions, upload answer sheets, and compare scores across Attempt 1–3. | Authenticated `STUDENT` role (`maxAttempts = 3` enforced server-side). |
| **Institute Admin Suite (`/admin/*`)** | Publish free or paid test series, upload question papers and private evaluation rubrics, inspect student submissions, trigger/override evaluations, and reconcile Razorpay payments/refunds. | Authenticated `ADMIN` role (`lib/auth-guard.ts`). |
| **Public Leaderboard (`/leaderboard`)** | Showcases verified student performance milestones across active test series. | Public / ISR cached (`revalidate = 300`). |

---

## 3. Monorepo Architecture Summary

```text
.
├── verityra4/     # Next.js 16 Web Application (Public pages, Student workspace, Admin portal, Prisma ORM, Razorpay, Resend)
├── worker/        # Standalone TypeScript BullMQ Background Evaluation Worker (Gemini rubric grading, Supabase storage, Resend emails)
└── docker-compose.yml
```

Centralized identity, contact details, coaching timings, and brand configuration live in `verityra4/lib/brand.ts` (`BRAND_CONFIG`) and `worker/src/config.ts`.

---

## 4. Public Copy & Engineering Guardrails

1. **Academic Stream Integrity:** Public pages, test catalogs, question paper filters, signup copy, and placeholders must only reflect I Zone Coaching Classes tracks (**Jr. KG–XII**, **CBSE/ICSE/State Board**, **Foundation VI–X**, **NEET-UG**, **JEE Main & Advanced**, **NTSE & Olympiads**, **UGC NET**, **English Grammar**). Never reintroduce UPSC, State PCS, Judicial Services, or SSC CGL copy.
2. **Confidential Evaluator Isolation:** Public marketing pages must never expose private evaluation instructions, grading prompts, or unsupported automated-grading promises (`docs/ai/feature-boundaries.md`).
3. **Storage & Database Stability:** Internal storage buckets (`verityra-private`) and Prisma table names remain unchanged regardless of brand naming updates.
