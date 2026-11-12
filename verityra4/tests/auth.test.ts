import assert from "node:assert/strict"
import { TestSuite } from "./test-utils"
import {
  registerSchema,
  loginSchema,
  studentProfileSchema,
  adminProfileSchema,
  changePasswordSchema,
} from "../lib/validations/auth"
import { Role } from "@prisma/client"
import { resolvePostLoginTarget } from "../lib/auth-routing"

export function runAuthTests() {
  const suite = new TestSuite("Module: Authentication & Identity")
  console.log(`\n==================================================`)
  console.log(`[TEST SUITE] ${suite.name}`)
  console.log(`==================================================`)

  suite.test(
    "Registration: Valid candidate registration schema passes and normalizes email",
    () => {
      const valid = {
        name: "Aarav Sharma",
        email: "Aarav.Sharma@EXAMPLE.COM",
        password: "Password123!",
        confirmPassword: "Password123!",
      }
      const result = registerSchema.safeParse(valid)
      assert.equal(result.success, true)
      if (result.success) {
        assert.equal(result.data.email, "aarav.sharma@example.com")
        assert.equal(result.data.name, "Aarav Sharma")
      }
    }
  )

  suite.test(
    "Registration: Weak passwords without number or uppercase are rejected",
    () => {
      const weak = {
        name: "Candidate",
        email: "test@example.com",
        password: "weakpassword",
        confirmPassword: "weakpassword",
      }
      const result = registerSchema.safeParse(weak)
      assert.equal(result.success, false)
    }
  )

  suite.test("Registration: Short passwords (< 8 chars) are rejected", () => {
    const short = {
      name: "Candidate",
      email: "test@example.com",
      password: "Pass1!",
      confirmPassword: "Pass1!",
    }
    const result = registerSchema.safeParse(short)
    assert.equal(result.success, false)
  })

  suite.test(
    "Registration: Mismatched password and confirmPassword are rejected",
    () => {
      const mismatch = {
        name: "Candidate",
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "DifferentPassword123!",
      }
      const result = registerSchema.safeParse(mismatch)
      assert.equal(result.success, false)
    }
  )

  suite.test(
    "Login: Valid credentials schema accepts proper email and password",
    () => {
      const validLogin = {
        email: "Candidate@Domain.Com",
        password: "Password123!",
      }
      const result = loginSchema.safeParse(validLogin)
      assert.equal(result.success, true)
      if (result.success) {
        assert.equal(result.data.email, "candidate@domain.com")
      }
    }
  )

  suite.test("Login: Invalid email format is rejected", () => {
    const invalidLogin = {
      email: "not-an-email",
      password: "Password123!",
    }
    const result = loginSchema.safeParse(invalidLogin)
    assert.equal(result.success, false)
  })

  suite.test(
    "Profile: Student profile schema validates required and optional fields",
    () => {
      const validStudent = {
        name: "Pooja Hegde",
        educationLevel: "LL.B",
        institution: "National Law University",
        targetExam: "Judicial Services",
        phoneNumber: "+91 9876543210",
        bio: "Focusing on procedural law and criminal jurisprudence.",
      }
      const sRes = studentProfileSchema.safeParse(validStudent)
      assert.equal(sRes.success, true)
      if (sRes.success) {
        assert.equal(sRes.data.educationLevel, "LL.B")
        assert.equal(sRes.data.targetExam, "Judicial Services")
      }
    }
  )

  suite.test(
    "Profile: Student profile rejects candidate name shorter than 2 characters",
    () => {
      const emptyName = {
        name: "A",
        educationLevel: "LL.B",
      }
      const sRes = studentProfileSchema.safeParse(emptyName)
      assert.equal(sRes.success, false)

      const blankName = {
        name: "",
        educationLevel: "LL.B",
      }
      const bRes = studentProfileSchema.safeParse(blankName)
      assert.equal(bRes.success, false)
    }
  )

  suite.test("Profile: Admin profile schema validates inputs properly", () => {
    const validAdmin = {
      name: "Lead Controller",
      phoneNumber: "+91 11 2345 6789",
      bio: "Lead Controller of Examinations.",
    }
    const aRes = adminProfileSchema.safeParse(validAdmin)
    assert.equal(aRes.success, true)
  })

  suite.test(
    "Security: Change password schema validates requirements and matches confirmation",
    () => {
      const validChange = {
        currentPassword: "OldPassword123!",
        newPassword: "NewSecurePassword999!",
        confirmPassword: "NewSecurePassword999!",
      }
      const validRes = changePasswordSchema.safeParse(validChange)
      assert.equal(validRes.success, true)

      const mismatchChange = {
        currentPassword: "OldPassword123!",
        newPassword: "NewSecurePassword999!",
        confirmPassword: "WrongConfirmation!",
      }
      const mismatchRes = changePasswordSchema.safeParse(mismatchChange)
      assert.equal(mismatchRes.success, false)
    }
  )

  suite.test(
    "RBAC: Role enumeration defines explicit STUDENT and ADMIN values",
    () => {
      assert.equal(Role.STUDENT, "STUDENT")
      assert.equal(Role.ADMIN, "ADMIN")
    }
  )

  suite.test(
    "RBAC: Admin login target resolution routes to /admin and rejects student panel callback",
    () => {
      const defaultAdminTarget = resolvePostLoginTarget(Role.ADMIN, null)
      assert.equal(defaultAdminTarget, "/admin")

      const studentCallbackBlocked = resolvePostLoginTarget(
        Role.ADMIN,
        "/student/dashboard"
      )
      assert.equal(studentCallbackBlocked, "/admin")

      const safeAdminTarget = resolvePostLoginTarget(
        Role.ADMIN,
        "/admin/submissions"
      )
      assert.equal(safeAdminTarget, "/admin/submissions")
    }
  )

  suite.test(
    "RBAC: Student login target resolution routes to /student/dashboard and rejects admin panel callback",
    () => {
      const defaultStudentTarget = resolvePostLoginTarget(Role.STUDENT, null)
      assert.equal(defaultStudentTarget, "/student/dashboard")

      const adminCallbackBlocked = resolvePostLoginTarget(
        Role.STUDENT,
        "/admin/students"
      )
      assert.equal(adminCallbackBlocked, "/student/dashboard")

      const safePublicTarget = resolvePostLoginTarget(
        Role.STUDENT,
        "/tests/upsc-gs-1"
      )
      assert.equal(safePublicTarget, "/tests/upsc-gs-1")
    }
  )

  suite.test(
    "RBAC: Unknown or unauthenticated role defaults to /dashboard dispatcher",
    () => {
      assert.equal(resolvePostLoginTarget(undefined, null), "/dashboard")
    }
  )

  suite.test(
    "Redirect Callback: Strips localhost URLs, keeps relative paths, and blocks protocol-relative open redirects",
    () => {
      function resolveSafeRedirect(
        url: string,
        baseUrl: string,
        isProduction: boolean
      ) {
        if (
          url.startsWith("/") &&
          !url.startsWith("//") &&
          !url.startsWith("/\\")
        ) {
          return url
        }
        try {
          const parsedUrl = new URL(url)
          if (
            isProduction &&
            (parsedUrl.hostname === "localhost" ||
              parsedUrl.hostname === "127.0.0.1")
          ) {
            const rel = `${parsedUrl.pathname}${parsedUrl.search}`
            return rel.startsWith("//") || rel.startsWith("/\\") ? "/" : rel
          }
          if (parsedUrl.origin === baseUrl) {
            return url
          }
        } catch {}
        return "/"
      }

      // Relative url remains relative
      assert.equal(
        resolveSafeRedirect("/", "https://verityra-fr.vercel.app", true),
        "/"
      )

      // Protocol-relative URLs are blocked and fallback to /
      assert.equal(
        resolveSafeRedirect(
          "//evil.com",
          "https://verityra-fr.vercel.app",
          true
        ),
        "/"
      )
      assert.equal(
        resolveSafeRedirect(
          "/\\evil.com",
          "https://verityra-fr.vercel.app",
          true
        ),
        "/"
      )
      assert.equal(
        resolveSafeRedirect(
          "http://localhost:3000//evil.com",
          "https://verityra-fr.vercel.app",
          true
        ),
        "/"
      )

      // Localhost url in production gets rewritten to relative path
      assert.equal(
        resolveSafeRedirect(
          "http://localhost:3000/",
          "https://verityra-fr.vercel.app",
          true
        ),
        "/"
      )
      assert.equal(
        resolveSafeRedirect(
          "http://localhost:3000/tests/upsc",
          "https://verityra-fr.vercel.app",
          true
        ),
        "/tests/upsc"
      )

      // Same origin in production remains intact
      assert.equal(
        resolveSafeRedirect(
          "https://verityra-fr.vercel.app/tests",
          "https://verityra-fr.vercel.app",
          true
        ),
        "https://verityra-fr.vercel.app/tests"
      )
    }
  )

  return suite.summary()
}

// Allow direct execution
if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, "/").endsWith("tests/auth.test.ts")
) {
  const result = runAuthTests()
  if (result.failed > 0) process.exit(1)
}
