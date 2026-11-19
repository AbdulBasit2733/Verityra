# Izone — Online Test Series & Question Paper Platform (I Zone Coaching Classes)

This monorepo powers the official online test series and question paper platform for **[I Zone Coaching Classes](verityra4/docs/company/izone-company-profile.md)** (Chhatrapati Sambhajinagar, Maharashtra), architected as a decoupled Next.js web application and standalone background evaluation worker.

## 🏫 About I Zone Coaching Classes & Platform Scope

- **Academic Coverage:** Classroom & online test support from **Jr. KG to Class XII** (**CBSE**, **ICSE**, and **Maharashtra State Board**, including Foundation Classes VI–X), **NEET-UG**, **JEE (Main & Advanced)**, **NTSE & Olympiads**, **UGC NET**, and **English Grammar** (with Spoken English via **I Zone Training Academy**).
- **Platform Purpose:** Conduct **online free and paid test series** (pen-and-paper booklets, timed practice, handwritten upload, and structured rubric feedback) and distribute **free and paid question papers**.
- **Scope Boundary:** I Zone Coaching Classes does **not** cover government civil services or judicial examinations (no UPSC, State PCS, Judiciary, or SSC).
- **Detailed Documentation:**
  - [Company & Institute Profile](verityra4/docs/company/izone-company-profile.md)
  - [Platform & Product Overview](verityra4/docs/company/platform-overview.md)

---

## 📁 Repository Structure

```
.
├── verityra4/           # Next.js 16 Web Application (Candidate portal, Admin suite, Job Producer)
├── worker/              # Standalone TypeScript Background Worker Daemon (BullMQ, Gemini, Resend)
├── docker-compose.yml   # Local Redis & Worker container definition
└── package.json         # Root workspace orchestration
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 20+
- Redis (Local via `docker compose up -d redis` or Upstash Redis URL)
- PostgreSQL (Supabase or local instance)

### 2. Install & Generate Clients
```bash
# Install root dependencies
npm install

# Generate Prisma clients in both services
cd verityra4 && npx prisma generate
cd ../worker && npm run prisma:generate
cd ..
```

### 3. Run Web App & Worker Concurrently
```bash
# Starts both Next.js (port 3000) and Worker (health on port 8080)
npm run dev

# Or run individually:
npm run dev:web      # Next.js web application
npm run dev:worker   # Background AI evaluation worker
```

---

## ☁️ Deployment Guide

### A. Next.js Web Application (`verityra4/`)
- **Platform**: Vercel (or any Node.js / Docker host)
- **Root Directory**: `verityra4`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### B. AI Evaluation Worker (`worker/`)
- **Platform**: Render, Railway, Fly.io, or AWS ECS
- **Root Directory**: `worker`
- **Build Command**: `npm install && npx prisma generate`
- **Start Command**: `npx tsx scripts/evaluation-worker.ts` (or `npm start`)
- **Health Check Path**: `/health` (Worker exposes an HTTP server on `$PORT` / `8080` for hosting platforms)
- **Render Free Tier**: Deploy as a **Web Service** (using the port health check).
- **Render Paid Tier / Railway**: Can deploy as a **Background Worker** or **Web Service**.
- **Health Check Path**: `GET http://localhost:8080/health`
- **Required Environment Variables**:
  - `REDIS_URL` (Upstash Redis or self-hosted Redis)
  - `DATABASE_URL` / `DIRECT_URL` (Supabase PostgreSQL connection)
  - `GEMINI_API_KEY` (Google Gemini multimodal model)
  - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` (For downloading encrypted student booklets)
  - `RESEND_API_KEY` (Scorecard notification emails)
