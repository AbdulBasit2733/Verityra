import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

export const PRODUCTION_DEFAULT_ORIGIN = "https://verityra-fr.vercel.app"

export function isTrustedHost(
  host: string,
  env: Partial<NodeJS.ProcessEnv> = process.env
): boolean {
  if (!host || /[@/\\?#\s]/.test(host)) return false
  const cleanHost = host.toLowerCase().split(":")[0]

  // Localhost is trusted only outside production
  if (cleanHost === "localhost" || cleanHost === "127.0.0.1") {
    return env.NODE_ENV !== "production"
  }

  // Configured trusted origins
  const trustedOrigins = [
    env.NEXT_PUBLIC_APP_URL,
    env.VERCEL_PROJECT_PRODUCTION_URL,
    env.VERCEL_URL,
    PRODUCTION_DEFAULT_ORIGIN,
  ].filter(Boolean)

  for (const origin of trustedOrigins) {
    try {
      const url = origin?.startsWith("http")
        ? new URL(origin!)
        : new URL(`https://${origin}`)
      if (url.hostname.toLowerCase() === cleanHost) return true
    } catch {}
  }

  // Allow production domain and Vercel preview deployment domains
  if (
    cleanHost === "verityra-fr.vercel.app" ||
    cleanHost === "verityra.com" ||
    cleanHost.endsWith(".verityra.com") ||
    /^[a-z0-9-]+(\.verityra)?\.vercel\.app$/.test(cleanHost)
  ) {
    return true
  }

  return false
}

export function resolveEffectiveOrigin(
  reqHost: string | null | undefined,
  reqProto: string | null | undefined,
  env: Partial<NodeJS.ProcessEnv> = process.env
): string {
  const host = reqHost?.trim()
  const isLoopback = Boolean(
    host && (host.includes("localhost") || host.includes("127.0.0.1"))
  )
  const proto = reqProto?.trim() || (isLoopback ? "http" : "https")

  if (host && isTrustedHost(host, env)) {
    return `${proto}://${host}`
  }

  if (
    env.NEXT_PUBLIC_APP_URL &&
    !env.NEXT_PUBLIC_APP_URL.includes("localhost")
  ) {
    return env.NEXT_PUBLIC_APP_URL.replace(/\/+$/, "")
  }

  if (env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/+$/, "")}`
  }

  if (env.VERCEL_URL && !env.VERCEL_URL.includes("localhost")) {
    return `https://${env.VERCEL_URL.replace(/\/+$/, "")}`
  }

  if (env.NODE_ENV === "production" || env.VERCEL) {
    return PRODUCTION_DEFAULT_ORIGIN
  }

  return env.NEXTAUTH_URL || "http://localhost:3000"
}

export function ensureProductionNextAuthUrl(req: NextRequest) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host")
  const isLoopback = Boolean(
    host && (host.includes("localhost") || host.includes("127.0.0.1"))
  )
  const proto =
    req.headers.get("x-forwarded-proto") || (isLoopback ? "http" : "https")
  const effectiveOrigin = resolveEffectiveOrigin(host, proto, process.env)

  // In production or when the incoming host is non-localhost, update NEXTAUTH_URL
  if (
    !process.env.NEXTAUTH_URL ||
    process.env.NEXTAUTH_URL.includes("localhost") ||
    process.env.NEXTAUTH_URL.includes("127.0.0.1")
  ) {
    process.env.NEXTAUTH_URL = effectiveOrigin
  }

  process.env.AUTH_TRUST_HOST = "true"
}

const nextAuthFn =
  typeof NextAuth === "function"
    ? NextAuth
    : (NextAuth as unknown as { default: typeof NextAuth }).default

const authHandler = nextAuthFn(authOptions)

export async function GET(req: NextRequest, ctx: any) {
  ensureProductionNextAuthUrl(req)
  return authHandler(req, ctx)
}

export async function POST(req: NextRequest, ctx: any) {
  ensureProductionNextAuthUrl(req)
  return authHandler(req, ctx)
}
