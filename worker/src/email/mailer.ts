import { Resend } from "resend"
import { config } from "../config.js"

let resendInstance: Resend | null = null

function getResend(): Resend | null {
  if (!config.resendApiKey || config.resendApiKey === "your-resend-api-key") {
    return null
  }
  if (!resendInstance) {
    resendInstance = new Resend(config.resendApiKey)
  }
  return resendInstance
}

export interface EvaluationEmailPayload {
  to: string
  name?: string | null
  testSeriesId: string
  testTitle: string
  attemptNumber: number
  totalMarksAwarded: number
  maxMarks: number
  percentage: number
  requiresReview?: boolean
}

export async function sendEvaluationReadyEmail(
  payload: EvaluationEmailPayload
): Promise<boolean> {
  const resend = getResend()
  if (!resend) {
    console.log(
      `[Worker:Email] RESEND_API_KEY not configured. Skipping email to ${payload.to}`
    )
    return false
  }

  const scorecardUrl = `${config.appBaseUrl}/student/tests/${payload.testSeriesId}?attempt=${payload.attemptNumber}`
  const candidateName = payload.name || "Candidate"

  try {
    const { error } = await resend.emails.send({
      from: config.resendFromEmail,
      to: payload.to,
      subject: `Your Evaluation is Ready — ${payload.testTitle} (Attempt #${payload.attemptNumber})`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #0F172A;">
          <div style="background-color: #2A6AED; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 700;">Verityra AI Examination Suite</h1>
          </div>
          <div style="border: 1px solid #E2E8F0; border-top: none; padding: 24px; border-radius: 0 0 12px 12px; background-color: #ffffff;">
            <h2 style="font-size: 18px; margin-top: 0; color: #0F172A;">Hello ${candidateName},</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Your handwritten response booklet for <strong>${payload.testTitle}</strong> (Attempt #${payload.attemptNumber}) has been graded against the official rubric.
            </p>
            <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center;">
              <span style="font-size: 12px; text-transform: uppercase; color: #64748B; font-weight: 700; letter-spacing: 0.05em;">Final Awarded Score</span>
              <div style="font-size: 32px; font-weight: 900; color: #2A6AED; margin-top: 4px;">
                ${payload.totalMarksAwarded} <span style="font-size: 16px; color: #64748B; font-weight: 600;">/ ${payload.maxMarks}</span>
              </div>
              <div style="font-size: 14px; font-weight: 700; color: #059669; margin-top: 4px;">${payload.percentage}% Marks</div>
            </div>
            ${payload.requiresReview ? '<p style="font-size: 12px; color: #D97706; background-color: #FFFBEB; padding: 10px; border-radius: 6px; border: 1px solid #FDE68A;">Notice: Portions of your script were flagged for moderator verification.</p>' : ""}
            <div style="text-align: center; margin: 28px 0 16px;">
              <a href="${scorecardUrl}" style="background-color: #2A6AED; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">View Detailed Scorecard</a>
            </div>
            <p style="font-size: 12px; color: #94A3B8; text-align: center; margin-top: 24px;">Verityra AI Examination Vault · Encrypted Academic Grading</p>
          </div>
        </div>
      `,
    })

    if (error) {
      console.error("[Worker:Email] Resend delivery error:", error)
      return false
    }

    console.log(
      `[Worker:Email] Evaluation scorecard email sent to ${payload.to}`
    )
    return true
  } catch (err) {
    console.error("[Worker:Email] Failed to send email:", err)
    return false
  }
}
