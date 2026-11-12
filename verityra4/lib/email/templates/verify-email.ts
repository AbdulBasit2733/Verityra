import type { RenderedEmailTemplate } from "../types"
import { escapeHtml, renderBaseEmailLayout } from "./base-layout"

export interface VerifyEmailTemplateProps {
  name?: string | null
  verificationUrl: string
  expiresInHours?: number
}

export function renderVerifyEmail({
  name,
  verificationUrl,
  expiresInHours = 24,
}: VerifyEmailTemplateProps): RenderedEmailTemplate {
  const safeName = name ? escapeHtml(name) : "Candidate"
  const subject = "Verify your email address — Verityra"

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Welcome to Verityra, <strong>${safeName}</strong>!</p>
    <p style="margin:0 0 14px 0;">
      Thank you for registering on the Verityra Evaluation Platform. Please confirm your email address to verify your candidate profile and receive instant scorecard notifications:
    </p>
    <div style="margin:18px 0;padding:12px 16px;border-radius:12px;background-color:#F8FAFC;border:1px solid #E2E8F0;color:#475569;font-size:13px;">
      This verification link expires in <strong>${expiresInHours} hours</strong>.
    </div>
  `

  const html = renderBaseEmailLayout({
    preheader:
      "Confirm your email address to complete your Verityra candidate setup.",
    badgeText: "Email Verification",
    heading: "Verify your email address",
    bodyHtml,
    ctaLabel: "Verify Email Address",
    ctaUrl: verificationUrl,
    footerNote:
      "If you did not create a Verityra account with this email address, please disregard this message.",
  })

  const text = [
    `Welcome to Verityra, ${name || "Candidate"}!`,
    "",
    "Please verify your email address by visiting the link below:",
    verificationUrl,
    "",
    `This verification link expires in ${expiresInHours} hours.`,
  ].join("\n")

  return { subject, html, text }
}
