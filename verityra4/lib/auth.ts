import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma, isDatabaseConnected } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { Role, UserStatus } from "@prisma/client"

const credentialsProviderFn =
  typeof CredentialsProvider === "function"
    ? CredentialsProvider
    : (CredentialsProvider as unknown as { default: typeof CredentialsProvider }).default

const googleProviderFn =
  typeof GoogleProvider === "function"
    ? GoogleProvider
    : (GoogleProvider as unknown as { default: typeof GoogleProvider }).default

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
          throw new Error("Database connection required. Please contact support if this issue persists.")
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        })

        if (!user || !user.passwordHash) {
          throw new Error("Invalid email or password.")
        }

        if (user.status === UserStatus.SUSPENDED) {
          throw new Error("Your account has been suspended. Please contact support.")
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)
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
        const dbConnected = await isDatabaseConnected()
        if (dbConnected && user.email) {
          const normalizedEmail = user.email.toLowerCase().trim()
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

          user.id = existingUser.id
          user.role = existingUser.role
          user.status = existingUser.status
        }
      }
      return true
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.status = user.status
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
  },
  secret: process.env.NEXTAUTH_SECRET,
}
