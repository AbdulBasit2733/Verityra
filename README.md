# Verityra — Autonomous AI Examination & Evaluation Platform

This monorepo contains the complete Verityra platform, architected as a decoupled web application and standalone background evaluation worker.

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
- **Platform**: Railway, Render, Fly.io, or AWS ECS
- **Root Directory**: `worker`
- **Start Command**: `npm start` (or use the provided `worker/Dockerfile`)
- **Health Check Path**: `GET http://localhost:8080/health`
- **Required Environment Variables**:
  - `REDIS_URL` (Upstash Redis or self-hosted Redis)
  - `DATABASE_URL` / `DIRECT_URL` (Supabase PostgreSQL connection)
  - `GEMINI_API_KEY` (Google Gemini multimodal model)
  - `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY` (For downloading encrypted student booklets)
  - `RESEND_API_KEY` (Scorecard notification emails)
