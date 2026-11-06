import { getAppBaseUrl, isResendConfigured, sendEmail } from "./resend"
import type { EmailDispatchResult } from "./types"
import { renderPasswordResetEmail } from "./templates/password-reset"
import { renderVerifyEmail } from "./templates/verify-email"
import { renderPasswordChangedEmail } from "./templates/password-changed"
import { renderEvaluationReadyEmail } from "./templates/evaluation-ready"
import { renderEnrollmentReceiptEmail } from "./templates/enrollment-receipt"

export {
  getAppBaseUrl,
  isResendConfigured,
  sendEmail,
  renderPasswordResetEmail,
  renderVerifyEmail,
  renderPasswordChangedEmail,
  renderEvaluationReadyEmail,
  renderEnrollmentReceiptEmail,
}

export async function sendPasswordResetEmail(params: {
  to: string
  name?: string | null
  rawToken: string
  expiresInMinutes?: number
}): Promise<EmailDispatchResult & { resetUrl: string }> {
  const baseUrl = getAppBaseUrl()
  const resetUrl = `${baseUrl}/reset-password?token=${encodeURIComponent(params.rawToken)}`
  const rendered = renderPasswordResetEmail({
    name: params.name,
    resetUrl,
    expiresInMinutes: params.expiresInMinutes,
  })

  const result = await sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    previewUrl: resetUrl,
    tags: [{ name: "category", value: "password_reset" }],
  })

  return { ...result, resetUrl }
}

export async function sendVerificationEmail(params: {
  to: string
  name?: string | null
  rawToken: string
  expiresInHours?: number
}): Promise<EmailDispatchResult & { verificationUrl: string }> {
  const baseUrl = getAppBaseUrl()
  const normalizedEmail = params.to.toLowerCase().trim()
  const verificationUrl = `${baseUrl}/verify-email?token=${encodeURIComponent(params.rawToken)}&email=${encodeURIComponent(normalizedEmail)}`
  const rendered = renderVerifyEmail({
    name: params.name,
    verificationUrl,
    expiresInHours: params.expiresInHours,
  })

  const result = await sendEmail({
    to: normalizedEmail,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    previewUrl: verificationUrl,
    tags: [{ name: "category", value: "email_verification" }],
  })

  return { ...result, verificationUrl }
}

export async function sendPasswordChangedEmail(params: {
  to: string
  name?: string | null
}): Promise<EmailDispatchResult> {
  const baseUrl = getAppBaseUrl()
  const signInUrl = `${baseUrl}/signin`
  const rendered = renderPasswordChangedEmail({
    name: params.name,
    signInUrl,
  })

  return sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    previewUrl: signInUrl,
    tags: [{ name: "category", value: "security_alert" }],
  })
}

export async function sendEvaluationReadyEmail(params: {
  to: string
  name?: string | null
  testSeriesId: string
  testTitle: string
  attemptNumber: number
  totalMarksAwarded: number
  maxMarks: number
  percentage: number
  requiresReview?: boolean
}): Promise<EmailDispatchResult> {
  const baseUrl = getAppBaseUrl()
  const scorecardUrl = `${baseUrl}/student/tests/${encodeURIComponent(params.testSeriesId)}`
  const rendered = renderEvaluationReadyEmail({
    name: params.name,
    testTitle: params.testTitle,
    attemptNumber: params.attemptNumber,
    totalMarksAwarded: params.totalMarksAwarded,
    maxMarks: params.maxMarks,
    percentage: params.percentage,
    requiresReview: params.requiresReview,
    scorecardUrl,
  })

  return sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    previewUrl: scorecardUrl,
    tags: [{ name: "category", value: "evaluation_ready" }],
  })
}

export async function sendEnrollmentReceiptEmail(params: {
  to: string
  name?: string | null
  testSeriesId: string
  testTitle: string
  amountPaise: number
  maxAttempts: number
  orderId?: string | null
}): Promise<EmailDispatchResult> {
  const baseUrl = getAppBaseUrl()
  const workspaceUrl = `${baseUrl}/student/tests/${encodeURIComponent(params.testSeriesId)}`
  const rendered = renderEnrollmentReceiptEmail({
    name: params.name,
    testTitle: params.testTitle,
    amountPaise: params.amountPaise,
    maxAttempts: params.maxAttempts,
    orderId: params.orderId,
    workspaceUrl,
  })

  return sendEmail({
    to: params.to,
    subject: rendered.subject,
    html: rendered.html,
    text: rendered.text,
    previewUrl: workspaceUrl,
    tags: [{ name: "category", value: "enrollment_receipt" }],
  })
}
