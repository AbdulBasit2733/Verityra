# Verityra Database Design & Migration Guide

## 1. Schema Overview

The database uses PostgreSQL managed via Prisma ORM.

### Models & Key Fields

| Table | Purpose | Critical Constraints & Indexes |
|---|---|---|
| `User` | Authentication identity & role | `@unique([email])`, indexes on `email`, `role` |
| `Account` | OAuth account mapping (Google) | `@unique([provider, providerAccountId])` |
| `Session` | NextAuth session storage | `@unique([sessionToken])` |
| `VerificationToken` | Email verification state | `@unique([identifier, token])` |
| `PasswordResetToken` | Secure hashed reset tokens | `@unique([tokenHash])`, expires in 1 hour |
| `StudentProfile` | Candidate bio, exam, university | `@unique([userId])` |
| `TestSeries` | Subjective test definition | `@unique([slug])`, indexes on `status`, `isPublished` |
| `TestPaper` | Question paper file & rubric | Indexed on `testSeriesId` |
| `AnswerSheetTemplate` | Printable blank PDF booklet | Indexed on `testSeriesId` |
| `TestRegistration` | Student access grant | `@unique([userId, testSeriesId])` |
| `Payment` | Razorpay order & verification | `@unique([razorpayOrderId])`, `@unique([razorpayPaymentId])` |
| `Submission` | Student handwritten response | `@unique([registrationId, attemptNumber])` (STRICT LIMIT) |
| `Evaluation` | Overall awarded score & review | `@unique([submissionId])`, indexed on `status` |
| `QuestionEvaluation` | Question-level mark breakdown | Foreign key to `Evaluation` |
| `WebhookEvent` | Razorpay webhook idempotency | `@unique([eventId])` |
| `AuditLog` | Admin overrides & changes | Indexed on `adminId`, `[targetType, targetId]` |

## 2. Supabase PostgreSQL Connection

Configure your Supabase PostgreSQL connection string in `.env`:

```env
# Supabase Transaction Pooler (port 6543) or Direct Connection (port 5432)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

## 3. Running Migrations

To apply the schema migrations to your Supabase PostgreSQL instance:

```bash
# Push schema directly to Supabase
pnpm exec prisma db push

# Or apply version-controlled migration files
pnpm exec prisma migrate deploy
```

## 4. Seeding Initial Data

Run the seed script to provision the default administrator and demo student:

```bash
pnpm exec prisma db seed
```
