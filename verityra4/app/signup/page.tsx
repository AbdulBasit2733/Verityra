"use client"

import { AuthShell } from "@/components/layout/auth/auth-shell"
import { SignUpFormCore } from "@/components/auth/signup-form-core"

export default function SignUpPage() {
  return (
    <AuthShell
      title="Create Candidate Account"
      subtitle="Join thousands of civil services & judicial aspirants testing with authentic physical booklets"
      mode="signup"
    >
      <SignUpFormCore />
    </AuthShell>
  )
}
