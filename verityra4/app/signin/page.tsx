"use client"

import { Suspense } from "react"
import { AuthShell } from "@/components/layout/auth/auth-shell"
import { SignInFormCore } from "@/components/auth/signin-form-core"
import { Loader2 } from "lucide-react"
import { BRAND_CONFIG } from "@/lib/brand"

export default function SignInPage() {
  return (
    <AuthShell
      title={`Sign In to ${BRAND_CONFIG.name}`}
      subtitle="Access your authenticated candidate workspace, evaluations, and mock benchmarks"
      mode="signin"
    >
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-[#2A6AED]" />
          </div>
        }
      >
        <SignInFormCore />
      </Suspense>
    </AuthShell>
  )
}
