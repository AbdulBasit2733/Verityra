"use client"

import { AuthShell } from "@/components/layout/auth/auth-shell"
import { SignUpFormCore } from "@/components/auth/signup-form-core"

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create Student Account"
      subtitle="Enroll in free & paid test series and access question papers for School Boards (Jr. KG–XII), NEET-UG, JEE, Olympiads & English Grammar"
      mode="signup"
    >
      <SignUpFormCore />
    </AuthShell>
  )
}
