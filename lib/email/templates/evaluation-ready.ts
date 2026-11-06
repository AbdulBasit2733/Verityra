import type { RenderedEmailTemplate } from "../types"
import { escapeHtml, renderBaseEmailLayout } from "./base-layout"

export interface EvaluationReadyTemplateProps {
  name?: string | null
  testTitle: string
  attemptNumber: number
  totalMarksAwarded: number
  maxMarks: number
  percentage: number
  requiresReview?: boolean
  scorecardUrl: string
}

export function renderEvaluationReadyEmail({
  name,
  testTitle,
  attemptNumber,
  totalMarksAwarded,
  maxMarks,
  percentage,
  requiresReview = false,
  scorecardUrl,
}: EvaluationReadyTemplateProps): RenderedEmailTemplate {
  const safeName = name ? escapeHtml(name) : "Candidate"
  const safeTitle = escapeHtml(testTitle)
  const subject = requiresReview
    ? `Evaluation Update: ${testTitle} (Attempt #${attemptNumber})`
    : `Scorecard Ready: ${testTitle} — ${totalMarksAwarded}/${maxMarks} (${percentage}%)`

  const statusNote = requiresReview
    ? `<p style="margin:0 0 14px 0;">Your submission has been processed and flagged for moderator quality review. Provisional question-by-question feedback is now available in your workspace.</p>`
    : `<p style="margin:0 0 14px 0;">Your answer booklet for <strong>${safeTitle}</strong> (Attempt #${attemptNumber}) has been evaluated. Your full question-by-question rubric breakdown is now ready.</p>`

  const bodyHtml = `
    <p style="margin:0 0 14px 0;">Hello <strong>${safeName}</strong>,</p>
    ${statusNote}
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:20px 0;background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:14px;padding:16px;">
      <tr>
        <td style="padding:4px 8px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748B;">Marks Awarded</div>
          <div style="font-size:20px;font-weight:800;color:#0F172A;margin-top:4px;">${totalMarksAwarded} <span style="font-size:14px;font-weight:600;color:#64748B;">/ ${maxMarks}</span></div>
        </td>
        <td style="padding:4px 8px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:#64748B;">Score Percentage</div>
          <div style="font-size:20px;font-weight:800;color:#2A6AED;margin-top:4px;">${percentage}%</div>
        </td>
      </tr>
    </table>
  `

  const html = renderBaseEmailLayout({
    preheader: `Your evaluation for ${testTitle} (Attempt #${attemptNumber}) is ready.`,
    badgeText: requiresReview ? "Under Moderator Review" : "Scorecard Ready",
    heading: `${safeTitle} — Attempt #${attemptNumber}`,
    bodyHtml,
    ctaLabel: "View Full Scorecard & Feedback",
    ctaUrl: scorecardUrl,
  })

  const text = [
    `Hello ${name || "Candidate"},`,
    "",
    `Your evaluation for ${testTitle} (Attempt #${attemptNumber}) is ready.`,
    `Score: ${totalMarksAwarded} / ${maxMarks} (${percentage}%)`,
    "",
    `View your full scorecard and question-by-question feedback: ${scorecardUrl}`,
  ].join("\n")

  return { subject, html, text }
}
