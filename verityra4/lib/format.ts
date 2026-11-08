/**
 * Server-safe formatting utilities for consistent SSR/CSR rendering
 * Prevents hydration mismatches by using explicit locale and options
 */

const DEFAULT_LOCALE = "en-IN"

/**
 * Format date as "25 Oct, 2026"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return "—"

  return parsed.toLocaleDateString(DEFAULT_LOCALE, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

/**
 * Format time as "18:51" (24-hour format)
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return "—"

  return parsed.toLocaleTimeString(DEFAULT_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // CRITICAL: Explicit 24-hour prevents server/client mismatch
  })
}

/**
 * Format full datetime for tooltips as "25/10/2026, 18:51:24" (24-hour format)
 * CRITICAL: hour12: false prevents hydration mismatch between server and client
 */
export function formatDateTimeFull(date: Date | string | null | undefined): string {
  if (!date) return "—"
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return "—"

  return parsed.toLocaleString(DEFAULT_LOCALE, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // CRITICAL: Must be explicit to prevent am/pm vs 24-hour mismatch
  })
}

/**
 * Format date and time as "25 Oct, 2026, 18:51"
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "—"
  return `${formatDate(date)}, ${formatTime(date)}`
}

/**
 * Format currency as "1,23,456.78" (Indian locale)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return "—"
  return amount.toLocaleString(DEFAULT_LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Format number as "1,23,456" (Indian locale)
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "—"
  return num.toLocaleString(DEFAULT_LOCALE)
}
