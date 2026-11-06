import type { RenderedEmailTemplate } from "../types"
import { escapeHtml, renderBaseEmailLayout } from "./base-layout"

export interface PasswordResetTemplateProps {
  name?: string | null
  resetUrl: string
  expiresInMinutes?: number
}

export function renderPasswordResetEmail({
  name,
  resetUrl,
  expiresInMinutes = 60,
}: PasswordResetTemplateProps): RenderedEmailTemplate {
  const safeName = name ? escapeHtml(name) : "Candidate"
  const subject = "Reset your Verityra password"

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Hello <strong>${safeName}</strong>,</p>
    <p style="margin:0 0 14px 0;">
      We received a request to reset the password for your Verityra candidate account. Click the button below to choose a new password:
    </p>
    <div style="margin:18px 0;padding:12px 16px;border-radius:12px;background-color:#FFFBEB;border:1px solid #FDE68A;color:#92400E;font-size:13px;">
      <strong>Security Notice:</strong> This password reset link is valid for <strong>${expiresInMinutes} minutes</strong> and can only be used once.
    </div>
  `

  const html = renderBaseEmailLayout({
    preheader: `Reset your Verityra password (valid for ${expiresInMinutes} minutes).`,
    badgeText: "Account Security",
    heading: "Reset your password",
    bodyHtml,
    ctaLabel: "Reset Password",
    ctaUrl: resetUrl,
    footerNote:
      "If you did not request a password reset, you can safely ignore this email. Your existing password will remain unchanged.",
  })

  const text = [
    `Hello ${name || "Candidate"},`,
    "",
    "We received a request to reset the password for your Verityra account.",
    `Reset your password using the link below (valid for ${expiresInMinutes} minutes):`,
    resetUrl,
    "",
    "If you did not request a password reset, you can safely ignore this email.",
  ].join("\n")

  return { subject, html, text }
}
