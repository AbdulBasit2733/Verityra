import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextRequest } from "next/server"

export const PRODUCTION_DEFAULT_ORIGIN = "https://verityra-fr.vercel.app"

export function resolveEffectiveOrigin(
  reqHost: string | null | undefined,
  reqProto: string | null | undefined,
  env: Partial<NodeJS.ProcessEnv> = process.env
): string {
  const host = reqHost?.trim()
  const proto = reqProto?.trim() || "https"

  if (host && !host.includes("localhost") && !host.includes("127.0.0.1")) {
    return `${proto}://${host}`
  }

  if (env.NEXT_PUBLIC_APP_URL && !env.NEXT_PUBLIC_APP_URL.includes("localhost")) {
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
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https")
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
