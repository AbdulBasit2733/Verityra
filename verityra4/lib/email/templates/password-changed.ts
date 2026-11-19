import type { RenderedEmailTemplate } from "../types"
import { BRAND_CONFIG } from "../../brand"
import { escapeHtml, renderBaseEmailLayout } from "./base-layout"

export interface PasswordChangedTemplateProps {
  name?: string | null
  signInUrl: string
}

export function renderPasswordChangedEmail({
  name,
  signInUrl,
}: PasswordChangedTemplateProps): RenderedEmailTemplate {
  const safeName = name ? escapeHtml(name) : "Candidate"
  const safeBrand = escapeHtml(BRAND_CONFIG.name)
  const subject = `Security Alert: Your ${BRAND_CONFIG.name} password was changed`

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Hello <strong>${safeName}</strong>,</p>
    <p style="margin:0 0 14px 0;">
      This is an automated security confirmation that the password for your ${safeBrand} account was recently updated.
    </p>
    <div style="margin:18px 0;padding:12px 16px;border-radius:12px;background-color:#F0FDF4;border:1px solid #BBF7D0;color:#166534;font-size:13px;">
      If you made this change, no further action is needed. You can sign in using your new password.
    </div>
  `

  const html = renderBaseEmailLayout({
    preheader: `Your ${BRAND_CONFIG.name} account password was recently changed.`,
    badgeText: "Security Confirmation",
    heading: "Password updated successfully",
    bodyHtml,
    ctaLabel: `Sign In to ${BRAND_CONFIG.name}`,
    ctaUrl: signInUrl,
    footerNote:
      "If you did not authorize this password change, please reset your password immediately via the Forgot Password page.",
  })

  const text = [
    `Hello ${name || "Candidate"},`,
    "",
    `The password for your ${BRAND_CONFIG.name} account was recently changed.`,
    `Sign in here: ${signInUrl}`,
    "",
    "If you did not authorize this change, please reset your password immediately.",
  ].join("\n")

  return { subject, html, text }
}
