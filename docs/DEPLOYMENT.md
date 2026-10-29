# Verityra Deployment Guide

## 1. Hosting Architecture

Verityra is deployed as a Next.js App Router application connected to Supabase:
- **Application**: Vercel or Node.js server (e.g. AWS EC2, DigitalOcean, Railway).
- **Database**: PostgreSQL hosted on Supabase.
- **File Storage**: Supabase Storage (`verityra-private` bucket) with private access and signed URLs.

## 2. Environment Variables Checklist

Ensure these variables are configured in production:

```env
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secure-random-secret-at-least-32-chars"

DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

GOOGLE_CLIENT_ID="[client-id].apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="[client-secret]"

GEMINI_API_KEY="[your-gemini-api-key]"
GEMINI_MODEL="gemini-3.8-flash"

RAZORPAY_KEY_ID="rzp_live_[your-key-id]"
RAZORPAY_KEY_SECRET="[your-razorpay-secret]"
RAZORPAY_WEBHOOK_SECRET="[your-webhook-secret]"

STORAGE_PROVIDER="supabase"
SUPABASE_URL="https://[project-ref].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="[supabase-service-role-key]"
SUPABASE_STORAGE_BUCKET="verityra-private"

ADMIN_INITIAL_EMAIL="admin@yourdomain.com"
ADMIN_INITIAL_PASSWORD="[strong-admin-password]"
```

## 3. Production Deployment Commands

```bash
# Install dependencies
pnpm install --frozen-lockfile

# Generate Prisma Client
pnpm exec prisma generate

# Apply Database Migrations
pnpm exec prisma db push

# Build Next.js Application
pnpm run build

# Start Production Server
pnpm run start
```
