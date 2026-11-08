export interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  text: string
  from?: string
  replyTo?: string
  previewUrl?: string
  tags?: { name: string; value: string }[]
}

export interface EmailDispatchResult {
  success: boolean
  id?: string
  simulated?: boolean
  error?: string
}

export interface RenderedEmailTemplate {
  subject: string
  html: string
  text: string
}
