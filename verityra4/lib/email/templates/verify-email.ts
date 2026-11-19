import type { RenderedEmailTemplate } from "../types"
import { BRAND_CONFIG } from "../../brand"
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
  const safeBrand = escapeHtml(BRAND_CONFIG.name)
  const subject = `Verify your email address — ${BRAND_CONFIG.name}`

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Welcome to ${safeBrand}, <strong>${safeName}</strong>!</p>
    <p style="margin:0 0 14px 0;">
      Thank you for registering on the ${safeBrand} Evaluation Platform. Please confirm your email address to verify your candidate profile and receive instant scorecard notifications:
    </p>
    <div style="margin:18px 0;padding:12px 16px;border-radius:12px;background-color:#F8FAFC;border:1px solid #E2E8F0;color:#475569;font-size:13px;">
      This verification link expires in <strong>${expiresInHours} hours</strong>.
    </div>
  `

  const html = renderBaseEmailLayout({
    preheader: `Confirm your email address to complete your ${BRAND_CONFIG.name} candidate setup.`,
    badgeText: "Email Verification",
    heading: "Verify your email address",
    bodyHtml,
    ctaLabel: "Verify Email Address",
    ctaUrl: verificationUrl,
    footerNote: `If you did not create a ${BRAND_CONFIG.name} account with this email address, please disregard this message.`,
  })

  const text = [
    `Welcome to ${BRAND_CONFIG.name}, ${name || "Candidate"}!`,
    "",
    "Please verify your email address by visiting the link below:",
    verificationUrl,
    "",
    `This verification link expires in ${expiresInHours} hours.`,
  ].join("\n")

  return { subject, html, text }
}
