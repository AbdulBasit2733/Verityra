# Verityra — Subjective Test Series & Evaluation Platform

**Verityra** is a high-integrity, full-stack subjective test-series platform designed for competitive examination candidates (e.g., UPSC CSE Mains, State PCS, Judicial Services).

Candidates practice under authentic examination conditions: downloading margin-aligned answer-sheet templates, writing answers exclusively by hand, uploading multi-page scans, receiving itemized question-wise feedback and rubric scores, and iteratively refining their performance across three dedicated attempts.

## Core Features

- **Public Marketing Portal**: Clean, modern responsive landing page compliant with the strict **No AI Marketing** policy.
- **Direct Server Action Architecture**: All mutations and database operations run directly on the server without client REST API calls.
- **PostgreSQL & Supabase**: Normalized schema with Prisma ORM, migrations, and Supabase private storage integration.
- **Role-Based Access Control**: Strict `STUDENT` and `ADMIN` role separation enforced server-side.
- **Two Separate Instruction Systems**: Public student instructions vs. strictly confidential private evaluation instructions.
- **Answer-Sheet Templates**: Admin-uploaded printable margin templates downloadable by enrolled candidates.
- **Strict Three-Attempt Limit**: Atomically enforced limit (maximum 3 accepted submissions per registration) with UI locking.
- **Multimodal AI Evaluation**: Google Gemini evaluation pipeline with structured Zod schema validation, score clamping, and uncertainty flagging for educator review.
- **Score Review & Audits**: Admin review portal to adjust marks, add educator notes, and log changes in `AuditLog`.
- **Razorpay Payments**: Server-created orders, digital HMAC signature verification, and idempotent webhook handling.
- **Transparent Leaderboard**: Finalized rankings with deterministic tie-breaking.

## Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS & shadcn/ui components
- **Database & ORM**: PostgreSQL (Supabase) + Prisma ORM
- **Authentication**: NextAuth.js (Credentials + Google OAuth)
- **Storage**: Private Supabase Storage / Secure Local Vault
- **Evaluation**: Google Gemini Multimodal API (`gemini-2.5-flash`)
- **Payments**: Razorpay

## Quick Start (Development)

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and configure your credentials when ready:
   ```bash
   cp .env.example .env
   ```

3. **Generate Prisma Client**:
   ```bash
   pnpm exec prisma generate
   ```

4. **Run the Development Server**:
   ```bash
   pnpm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Run Critical Tests**:
   ```bash
   pnpm test
   ```

6. **Build for Production**:
   ```bash
   pnpm run build
   ```

## Demo Credentials (Development Mode)

- **Administrator**:
  - Email: `admin@verityra.com`
  - Password: `AdminSecurePassword123!`
- **Demo Candidate**:
  - Email: `student@verityra.com`
  - Password: `StudentSecurePassword123!`

## Documentation Index

### Core Operating Documentation
- [System Architecture](Architecture.md)
- [Design System & Styling Specifications](Design.md)
- [Engineering Memory & Context Log](Memory.md)
- [Product Requirements Document (PRD)](PRD.md)
- [Engineering Rules & Invariants](Rules.md)
- [Tasks & Roadmap Ledger](Tasks.md)

### Technical Topic Guides
- [Database Schema & Migrations](docs/DATABASE.md)
- [Authentication & Access Control](docs/AUTHENTICATION.md)
- [Security & Privacy](docs/SECURITY.md)
- [AI-Assisted Evaluation](docs/AI-EVALUATION.md)
- [Razorpay Payments](docs/PAYMENTS.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing & Quality Assurance](docs/TESTING.md)
