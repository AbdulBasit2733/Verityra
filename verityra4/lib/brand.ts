/**
 * Central Brand & Identity Configuration
 * Single source of truth for platform name, marks, emails, and corporate identity.
 * Safe to import in both Server Components and Client Components ("use client").
 */

export interface BrandContact {
  /** Full physical institute address */
  address: string
  /** Compact city / locality label */
  shortLocation: string
  /** Primary display phone number */
  phone: string
  /** tel: link URI */
  phoneHref: string
  /** Regular Monday to Saturday schedule */
  weekdayHours: string
  /** Extended hours note from public listings */
  extendedHoursNote: string
  /** Sunday schedule */
  sundayHours: string
  /** Aggregate public student rating */
  rating: string
  /** Public Justdial listing URL */
  justdialUrl: string
  /** Affiliated English speaking academy URL */
  trainingAcademyUrl: string
}

export interface BrandConfig {
  /** Primary display name (e.g. "Izone") */
  name: string
  /** Official coaching institute name */
  instituteName: string
  /** Affiliated spoken-English training wing */
  trainingAcademyName: string
  /** Compact display name for tight spaces */
  shortName: string
  /** Single-letter badge mark (e.g. "I") */
  initials: string
  /** Two-letter avatar fallback monogram (e.g. "IZ") */
  monogram: string
  /** Platform subtitle / tagline */
  tagline: string
  /** Default meta description */
  description: string
  /** Default root document title */
  title: string
  /** Legal / corporate entity name */
  companyName: string
  /** Public support email address */
  supportEmail: string
  /** Default placeholder / fallback administrator email */
  defaultAdminEmail: string
  /** Default placeholder / fallback candidate email */
  defaultCandidateEmail: string
  /** Primary marketing/service domain */
  domain: string
  /** Application workspace preview domain */
  appDomain: string
  /** Auth security footer copy */
  securityLabel: string
  /** Auth platform caption */
  platformLabel: string
  /** AI evaluator persona phrase */
  evaluatorPersona: string
  /** LocalStorage key for sidebar collapsed state */
  sidebarStorageKey: string
  /** Legacy LocalStorage key retained for seamless user migration */
  legacySidebarStorageKey: string
  /** Institute location, hours, phone, and directory links */
  contact: BrandContact
}

export interface BrandConfigOverrides {
  brandName?: string
  appName?: string
  supportEmail?: string
}

/**
 * Builds an immutable BrandConfig from optional environment overrides.
 */
export function createBrandConfig(
  env?: BrandConfigOverrides
): BrandConfig {
  const resolvedName =
    env?.brandName?.trim() || env?.appName?.trim() || "Izone"
  const slug =
    resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, "") || "izone"
  const isDefaultIzone = resolvedName.toLowerCase() === "izone"
  const resolvedSupportEmail =
    env?.supportEmail?.trim() || `support@${slug}.com`

  const contact: BrandContact = Object.freeze({
    address:
      "Central Naka Rd, near Iqra Girls High School, Bari Colony, Kiradpura, Chhatrapati Sambhajinagar, Maharashtra 431001",
    shortLocation:
      "Kiradpura, Chhatrapati Sambhajinagar (Aurangabad), Maharashtra",
    phone: "+91 98604 47370",
    phoneHref: "tel:+919860447370",
    weekdayHours: "Mon–Sat: 3:00 PM – 9:00 PM",
    extendedHoursNote: "Extended hours up to 10:00 PM on select days",
    sundayHours: "Sun: 8:00 AM – 2:00 PM",
    rating: "4.8",
    justdialUrl:
      "https://www.justdial.com/Aurangabad-Maharashtra/I-Zone-coaching-Classes-Kiradpura/9999PX240-X240-221202234429-T6I6_BZDET",
    trainingAcademyUrl:
      "https://www.facebook.com/p/I-Zone-Training-Academy-100066642098447/",
  })

  return Object.freeze({
    name: resolvedName,
    instituteName: isDefaultIzone ? "I Zone Coaching Classes" : resolvedName,
    trainingAcademyName: isDefaultIzone
      ? "I Zone Training Academy"
      : `${resolvedName} Training Academy`,
    shortName: resolvedName,
    initials: resolvedName.charAt(0).toUpperCase() || "I",
    monogram: resolvedName.slice(0, 2).toUpperCase() || "IZ",
    tagline:
      "Online Test Series & Question Papers — Jr. KG to NEET, JEE & Olympiads",
    description:
      "Official online test series and question paper portal by I Zone Coaching Classes, Chhatrapati Sambhajinagar. Access free & paid mock tests and practice papers for CBSE, ICSE, State Board (Jr. KG–XII), NEET-UG, JEE, Olympiads, NTSE, UGC NET, and English Grammar.",
    title: isDefaultIzone
      ? `${resolvedName} — Online Test Series & Question Papers | I Zone Coaching Classes`
      : `${resolvedName} — Online Test Series & Question Papers`,
    companyName: isDefaultIzone
      ? "I Zone Coaching Classes"
      : `${resolvedName} Technologies`,
    supportEmail: resolvedSupportEmail,
    defaultAdminEmail: `admin@${slug}.com`,
    defaultCandidateEmail: `candidate@${slug}.com`,
    domain: `${slug}.com`,
    appDomain: `${slug}.app`,
    securityLabel: `Your session is protected by ${resolvedName} security controls.`,
    platformLabel: `${resolvedName} examination platform`,
    evaluatorPersona: `${resolvedName}'s expert academic evaluator`,
    sidebarStorageKey: `${slug}-sidebar-collapsed`,
    legacySidebarStorageKey: "verityra-sidebar-collapsed",
    contact,
  })
}

/**
 * Static NEXT_PUBLIC_* property access enables Next.js client bundle inlining.
 */
export const BRAND_CONFIG: BrandConfig = createBrandConfig({
  brandName: process.env.NEXT_PUBLIC_BRAND_NAME,
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL,
})

/**
 * Formats a page-specific document title or returns the default platform title.
 */
export function getBrandTitle(
  pageTitle?: string,
  config: BrandConfig = BRAND_CONFIG
): string {
  if (!pageTitle) return config.title
  return `${pageTitle} | ${config.name}`
}

/**
 * Formats the copyright notice for footers and transactional layouts.
 */
export function getCopyrightText(
  year: number = new Date().getFullYear(),
  config: BrandConfig = BRAND_CONFIG
): string {
  return `© ${year} ${config.companyName}. All rights reserved.`
}

/**
 * Formats the mailto: URI for the configured support email address.
 */
export function getSupportMailto(config: BrandConfig = BRAND_CONFIG): string {
  return `mailto:${config.supportEmail}`
}
