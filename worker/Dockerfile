# Multi-stage Dockerfile for Verityra AI Evaluation Worker Daemon

FROM node:20-alpine AS builder

WORKDIR /app

# Copy worker package definitions
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy Prisma schema from web app context
COPY ../verityra4/prisma ./prisma

# Generate Prisma client
RUN npx prisma generate --schema=./prisma/schema.prisma

# Copy source code and build
COPY . .
RUN npm run build

# -------------------------------------------------------------
# Production Runtime Stage
# -------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install OpenSSL for Prisma engines
RUN apk add --no-cache openssl libc6-compat

# Create unprivileged application user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 workeruser

# Copy package definitions and install production-only dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy generated Prisma engine and client artifacts
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/dist ./dist

USER workeruser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

CMD ["node", "dist/index.js"]
