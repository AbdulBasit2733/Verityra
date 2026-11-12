import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import {
  prisma,
  isDatabaseConnected,
  resetDatabaseConnectionCache,
} from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role, UserStatus } from "@prisma/client"

const credentialsProviderFn =
  typeof CredentialsProvider === "function"
    ? CredentialsProvider
    : (
        CredentialsProvider as unknown as {
          default: typeof CredentialsProvider
        }
      ).default

const googleProviderFn =
  typeof GoogleProvider === "function"
    ? GoogleProvider
    : (GoogleProvider as unknown as { default: typeof GoogleProvider }).default

const PRODUCTION_FALLBACK_URL = "https://verityra-fr.vercel.app"

if (
  (process.env.NODE_ENV === "production" || process.env.VERCEL) &&
  (!process.env.NEXTAUTH_URL ||
    process.env.NEXTAUTH_URL.includes("localhost") ||
    process.env.NEXTAUTH_URL.includes("127.0.0.1"))
) {
  process.env.NEXTAUTH_URL =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : PRODUCTION_FALLBACK_URL)
  process.env.AUTH_TRUST_HOST = "true"
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          googleProviderFn({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: false,
          }),
        ]
      : []),
    credentialsProviderFn({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email and password.")
        }

        const normalizedEmail = credentials.email.toLowerCase().trim()
        const dbConnected = await isDatabaseConnected()

        if (!dbConnected) {
          throw new Error(
            "Database connection required. Please contact support if this issue persists."
          )
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password.")
        }

        if (user.status === UserStatus.SUSPENDED) {
          throw new Error(
            "Your account has been suspended. Please contact support."
          )
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )
        if (!isValid) {
          throw new Error("Invalid email or password.")
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) {
          console.error("[NextAuth] Google sign-in rejected: missing email")
          return false
        }

        const normalizedEmail = user.email.toLowerCase().trim()
        let dbConnected = await isDatabaseConnected()
        if (!dbConnected) {
          resetDatabaseConnectionCache()
          dbConnected = await isDatabaseConnected()
        }

        if (!dbConnected) {
          console.error(
            "[NextAuth] Google sign-in rejected: database connection unavailable"
          )
          return false
        }

        try {
          let existingUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
          })

          if (!existingUser) {
            // New Google registration: MUST ALWAYS BE STUDENT ROLE ONLY
            existingUser = await prisma.user.create({
              data: {
                email: normalizedEmail,
                name: user.name ?? "Google User",
                image: user.image,
                role: Role.STUDENT,
                status: UserStatus.ACTIVE,
                emailVerified: new Date(),
                profile: {
                  create: {},
                },
              },
            })
          }

          if (existingUser.status === UserStatus.SUSPENDED) {
            return false
          }

          if (account.providerAccountId) {
            await prisma.account
              .upsert({
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                  },
                },
                update: {},
                create: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state
                    ? String(account.session_state)
                    : null,
                },
              })
              .catch((err) =>
                console.warn("[NextAuth] Account linking notice:", err?.message)
              )
          }

          user.id = existingUser.id
          user.role = existingUser.role
          user.status = existingUser.status
        } catch (dbErr) {
          console.error("[NextAuth] Google sign-in database error:", dbErr)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
      }

      // If signing in via OAuth (e.g. Google) or if token.id is missing or contains provider sub:
      // Resolve the true persisted database cuid from email to ensure foreign key integrity
      if (
        account?.provider === "google" ||
        (token.email &&
          (!token.id || token.id.length > 30 || /^\d+$/.test(String(token.id))))
      ) {
        if (token.email) {
          const normalizedEmail = token.email.toLowerCase().trim()
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: normalizedEmail },
              select: { id: true, role: true, status: true },
            })
            if (dbUser) {
              token.id = dbUser.id
              token.role = dbUser.role
              token.status = dbUser.status
            }
          } catch (jwtErr) {
            console.warn("[NextAuth] JWT database resolution error:", jwtErr)
          }
        }
      }

      if (trigger === "update" && session?.name) {
        token.name = session.name
      }

      return token
    },
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as Role
        session.user.status = token.status as UserStatus
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // 1. If relative URL, ensure it is strictly a single-slash path (prevent protocol-relative // or /\ open redirect)
      if (
        url.startsWith("/") &&
        !url.startsWith("//") &&
        !url.startsWith("/\\")
      ) {
        return url
      }

      // 2. Parse absolute URL
      try {
        const parsedUrl = new URL(url)
        // If the URL points to localhost but in production or if baseUrl is not localhost, rewrite to safe relative path
        if (
          (process.env.NODE_ENV === "production" || process.env.VERCEL) &&
          (parsedUrl.hostname === "localhost" ||
            parsedUrl.hostname === "127.0.0.1")
        ) {
          const rel = `${parsedUrl.pathname}${parsedUrl.search}`
          return rel.startsWith("//") || rel.startsWith("/\\") ? "/" : rel
        }

        // Allow same origin
        if (
          parsedUrl.origin === baseUrl ||
          parsedUrl.origin === PRODUCTION_FALLBACK_URL
        ) {
          return url
        }
      } catch {}

      return "/"
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
