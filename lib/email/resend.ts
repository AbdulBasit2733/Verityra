import { Resend } from "resend"
import type { EmailPayload, EmailDispatchResult } from "./types"

const globalForResend = globalThis as unknown as {
  resendClient: Resend | null | undefined
  resendApiKey: string | undefined
}

/**
 * Resolve the base application URL for email action links
 */
export function getAppBaseUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  return configured.replace(/\/+$/, "")
}

/**
 * Check whether a real Resend API key is configured
 */
export function isResendConfigured(apiKey?: string): boolean {
  const resolved = arguments.length === 0 ? process.env.RESEND_API_KEY : apiKey
  const trimmed = resolved?.trim()
  if (!trimmed) return false
  if (trimmed === "re_your_resend_api_key" || trimmed === "your-resend-api-key") {
    return false
  }
  return trimmed.startsWith("re_")
}

/**
 * Singleton Resend client instance
 */
export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!isResendConfigured(apiKey)) {
    return null
  }

  if (globalForResend.resendClient && globalForResend.resendApiKey === apiKey) {
    return globalForResend.resendClient
  }

  const client = new Resend(apiKey)
  globalForResend.resendClient = client
  globalForResend.resendApiKey = apiKey
  return client
}

/**
 * Dispatch an email via Resend, or gracefully simulate delivery in dev/CI when RESEND_API_KEY is absent.
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailDispatchResult> {
  const resend = getResendClient()
  const fromEmail =
    payload.from ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "Verityra <onboarding@resend.dev>"

  if (!resend) {
    const recipient = Array.isArray(payload.to) ? payload.to.join(", ") : payload.to
    console.log(`[Email:Simulation] To: ${recipient} | Subject: ${payload.subject}`)
    if (payload.previewUrl) {
      console.log(`[Email:Simulation] Action URL: ${payload.previewUrl}`)
    }
    return {
      success: true,
      simulated: true,
      id: `sim_${Date.now()}`,
    }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
      tags: payload.tags,
    })

    if (error) {
      console.error("[Email:ResendError]", error)
      return {
        success: false,
        error: error.message || "Resend provider rejected email dispatch.",
      }
    }

    return {
      success: true,
      simulated: false,
      id: data?.id,
    }
  } catch (err: any) {
    console.error("[Email:UnexpectedError]", err)
    return {
      success: false,
      error: err?.message || "Failed to send email.",
    }
  }
}
