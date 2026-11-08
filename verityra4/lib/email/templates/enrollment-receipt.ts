import type { RenderedEmailTemplate } from "../types"
import { escapeHtml, renderBaseEmailLayout } from "./base-layout"

export interface EnrollmentReceiptTemplateProps {
  name?: string | null
  testTitle: string
  amountPaise: number
  maxAttempts: number
  orderId?: string | null
  workspaceUrl: string
}

export function renderEnrollmentReceiptEmail({
  name,
  testTitle,
  amountPaise,
  maxAttempts,
  orderId,
  workspaceUrl,
}: EnrollmentReceiptTemplateProps): RenderedEmailTemplate {
  const safeName = name ? escapeHtml(name) : "Candidate"
  const safeTitle = escapeHtml(testTitle)
  const formattedAmount = amountPaise > 0 ? `₹${(amountPaise / 100).toFixed(2)}` : "Free Enrollment"
  const subject = `Enrollment Confirmed: ${testTitle}`

  const orderRow = orderId
    ? `<tr>
        <td style="padding:6px 0;font-size:13px;color:#64748B;">Order Reference</td>
        <td align="right" style="padding:6px 0;font-size:13px;font-family:monospace;font-weight:600;color:#0F172A;">${escapeHtml(orderId)}</td>
      </tr>`
    : ""

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Hello <strong>${safeName}</strong>,</p>
    <p style="margin:0 0 14px 0;">
      Your enrollment in <strong>${safeTitle}</strong> is confirmed and active. You can now download the question paper, answer sheet template, and upload your handwritten attempts for AI evaluation.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:16px;">
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748B;">Test Series</td>
        <td align="right" style="padding:6px 0;font-size:13px;font-weight:700;color:#0F172A;">${safeTitle}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748B;">Amount Paid</td>
        <td align="right" style="padding:6px 0;font-size:13px;font-weight:700;color:#16A34A;">${formattedAmount}</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-size:13px;color:#64748B;">Evaluation Attempts Included</td>
        <td align="right" style="padding:6px 0;font-size:13px;font-weight:700;color:#0F172A;">${maxAttempts} Attempts</td>
      </tr>
      ${orderRow}
    </table>
  `

  const html = renderBaseEmailLayout({
    preheader: `You are now enrolled in ${testTitle}. Access your question paper and workspace.`,
    badgeText: "Enrollment Confirmed",
    heading: "You are enrolled and ready to begin",
    bodyHtml,
    ctaLabel: "Open Test Workspace",
    ctaUrl: workspaceUrl,
  })

  const text = [
    `Hello ${name || "Candidate"},`,
    "",
    `Your enrollment in ${testTitle} is confirmed.`,
    `Amount Paid: ${formattedAmount}`,
    `Attempts Included: ${maxAttempts}`,
    ...(orderId ? [`Order Reference: ${orderId}`] : []),
    "",
    `Open your test workspace: ${workspaceUrl}`,
  ].join("\n")

  return { subject, html, text }
}
