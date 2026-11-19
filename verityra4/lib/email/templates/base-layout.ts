import { BRAND_CONFIG } from "../../brand"

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

export interface BaseEmailLayoutOptions {
  preheader: string
  heading: string
  badgeText?: string
  bodyHtml: string
  ctaLabel?: string
  ctaUrl?: string
  footerNote?: string
}

export function renderBaseEmailLayout(options: BaseEmailLayoutOptions): string {
  const year = new Date().getFullYear()
  const preheader = escapeHtml(options.preheader)
  const heading = escapeHtml(options.heading)
  const badgeHtml = options.badgeText
    ? `<div style="display:inline-block;padding:4px 12px;margin-bottom:14px;border-radius:9999px;background-color:#EFF6FF;border:1px solid #BFDBFE;color:#2A6AED;font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">${escapeHtml(options.badgeText)}</div>`
    : ""

  const ctaHtml =
    options.ctaLabel && options.ctaUrl
      ? `
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:28px 0 24px 0;">
        <tr>
          <td align="center" bgcolor="#2A6AED" style="border-radius:12px;background-color:#2A6AED;">
            <a href="${escapeHtml(options.ctaUrl)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 28px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">
              ${escapeHtml(options.ctaLabel)}
            </a>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 16px 0;font-size:12px;line-height:1.5;color:#64748B;">
        If the button above does not work, copy and paste this URL into your browser:<br />
        <a href="${escapeHtml(options.ctaUrl)}" style="color:#2A6AED;word-break:break-all;text-decoration:underline;">${escapeHtml(options.ctaUrl)}</a>
      </p>
      `
      : ""

  const footerNote = options.footerNote
    ? `<p style="margin:0 0 12px 0;font-size:12px;line-height:1.6;color:#64748B;">${escapeHtml(options.footerNote)}</p>`
    : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#0F172A;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${preheader}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#F8FAFC;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;">
          <!-- Brand Header -->
          <tr>
            <td align="left" style="padding-bottom:20px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" valign="middle" width="38" height="38" style="width:38px;height:38px;border-radius:10px;background-color:#2A6AED;color:#FFFFFF;font-size:20px;font-weight:900;text-align:center;">
                    ${escapeHtml(BRAND_CONFIG.initials)}
                  </td>
                  <td valign="middle" style="padding-left:10px;font-size:22px;font-weight:800;letter-spacing:-0.02em;color:#0F172A;">
                    ${escapeHtml(BRAND_CONFIG.name)}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Card -->
          <tr>
            <td style="background-color:#FFFFFF;border:1px solid #E2E8F0;border-radius:20px;padding:32px;box-shadow:0 4px 12px rgba(15,23,42,0.03);">
              ${badgeHtml}
              <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:800;line-height:1.3;color:#0F172A;">
                ${heading}
              </h1>
              <div style="font-size:15px;line-height:1.65;color:#334155;">
                ${options.bodyHtml}
              </div>
              ${ctaHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 8px 0 8px;text-align:center;">
              ${footerNote}
              <p style="margin:0;font-size:12px;color:#94A3B8;">
                &copy; ${year} ${escapeHtml(BRAND_CONFIG.name)} Evaluation Platform. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
