/**
 * Site Configuration & Central Brand Identity
 * Industry-standard single source of truth for platform metadata, coaching institute identity,
 * hours, contacts, and navigation links.
 *
 * Configured purely via code (no process.env runtime dependency).
 * Safe to import in Server Components, Client Components ("use client"), and edge runtimes.
 *
 * @see https://ui.shadcn.com/docs/components-json#site-config
 */

export interface SiteContact {
  /** Full physical institute address */
  readonly address: string
  /** Compact city / locality label */
  readonly shortLocation: string
  /** Primary display phone number */
  readonly phone: string
  /** tel: link URI */
  readonly phoneHref: string
  /** Regular Monday to Saturday schedule */
  readonly weekdayHours: string
  /** Extended hours note from public listings */
  readonly extendedHoursNote: string
  /** Sunday schedule */
  readonly sundayHours: string
  /** Aggregate public student rating */
  readonly rating: string
  /** Public Justdial listing URL */
  readonly justdialUrl: string
  /** Affiliated English speaking academy URL */
  readonly trainingAcademyUrl: string
}

export interface SiteConfig {
  /** Primary display name (e.g. "i ZONE") */
  readonly name: string
  /** Official brand logo asset path in /public (e.g. "/izone-logo.png") */
  readonly logo: string
  /** Official coaching institute name */
  readonly instituteName: string
  /** Affiliated spoken-English training wing */
  readonly trainingAcademyName: string
  /** Compact display name for tight spaces */
  readonly shortName: string
  /** Single-letter badge mark (e.g. "I") */
  readonly initials: string
  /** Two-letter avatar fallback monogram (e.g. "IZ") */
  readonly monogram: string
  /** Platform subtitle / tagline */
  readonly tagline: string
  /** Default meta description */
  readonly description: string
  /** Default root document title */
  readonly title: string
  /** Legal / corporate entity name */
  readonly companyName: string
  /** Public support email address */
  readonly supportEmail: string
  /** Default placeholder / fallback administrator email */
  readonly defaultAdminEmail: string
  /** Default placeholder / fallback candidate email */
  readonly defaultCandidateEmail: string
  /** Primary marketing/service domain */
  readonly domain: string
  /** Application workspace preview domain */
  readonly appDomain: string
  /** Auth security footer copy */
  readonly securityLabel: string
  /** Auth platform caption */
  readonly platformLabel: string
  /** AI evaluator persona phrase */
  readonly evaluatorPersona: string
  /** LocalStorage key for sidebar collapsed state */
  readonly sidebarStorageKey: string
  /** Legacy LocalStorage key retained for seamless user migration */
  readonly legacySidebarStorageKey: string
  /** Institute location, hours, phone, and directory links */
  readonly contact: SiteContact
  /** Outbound external links and social channels */
  readonly links: {
    readonly phone: string
    readonly justdial: string
    readonly trainingAcademy: string
  }
}

/**
 * Backward-compatibility aliases for existing codebase imports.
 */
export type BrandContact = SiteContact
export type BrandConfig = SiteConfig

export interface SiteConfigOverrides {
  brandName?: string
  appName?: string
  supportEmail?: string
  logo?: string
}

export type BrandConfigOverrides = SiteConfigOverrides

/**
 * Static physical contact information for I Zone Coaching Classes.
 */
const instituteContact: SiteContact = Object.freeze({
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

/**
 * Primary static site configuration.
 * Single source of truth managed directly in code (not via environment variables).
 */
export const siteConfig: SiteConfig = Object.freeze({
  name: "i ZONE",
  logo: "/izone-logo.png",
  instituteName: "I Zone Coaching Classes",
  trainingAcademyName: "I Zone Training Academy",
  shortName: "i ZONE",
  initials: "I",
  monogram: "IZ",
  tagline:
    "Online Test Series & Question Papers — Jr. KG to NEET, JEE & Olympiads",
  description:
    "Official online test series and question paper portal by I Zone Coaching Classes, Chhatrapati Sambhajinagar. Access free & paid mock tests and practice papers for CBSE, ICSE, State Board (Jr. KG–XII), NEET-UG, JEE, Olympiads, NTSE, UGC NET, and English Grammar.",
  title:
    "i ZONE — Online Test Series & Question Papers | I Zone Coaching Classes",
  companyName: "I Zone Coaching Classes",
  supportEmail: "support@izone.com",
  defaultAdminEmail: "admin@izonecc.in",
  defaultCandidateEmail: "candidate@izone.com",
  domain: "izone.com",
  appDomain: "izone.app",
  securityLabel: "Your session is protected by i ZONE security controls.",
  platformLabel: "i ZONE examination platform",
  evaluatorPersona: "i ZONE's expert academic evaluator",
  sidebarStorageKey: "izone-sidebar-collapsed",
  legacySidebarStorageKey: "verityra-sidebar-collapsed",
  contact: instituteContact,
  links: Object.freeze({
    phone: instituteContact.phoneHref,
    justdial: instituteContact.justdialUrl,
    trainingAcademy: instituteContact.trainingAcademyUrl,
  }),
})

/**
 * Alias BRAND_CONFIG for 100% drop-in compatibility across existing codebase imports.
 */
export const BRAND_CONFIG: SiteConfig = siteConfig

/**
 * Formats a page-specific document title or returns the default platform title.
 */
export function getSiteTitle(
  pageTitle?: string,
  config: SiteConfig = siteConfig
): string {
  if (!pageTitle) return config.title
  return `${pageTitle} | ${config.name}`
}

/**
 * Backward-compatible alias for getSiteTitle.
 */
export const getBrandTitle = getSiteTitle

/**
 * Formats the copyright notice for footers and transactional layouts.
 */
export function getCopyrightText(
  year: number = new Date().getFullYear(),
  config: SiteConfig = siteConfig
): string {
  return `© ${year} ${config.companyName}. All rights reserved.`
}

/**
 * Formats the mailto: URI for the configured support email address.
 */
export function getSupportMailto(config: SiteConfig = siteConfig): string {
  return `mailto:${config.supportEmail}`
}

/**
 * Builds an immutable SiteConfig from explicit override options (useful for testing or multi-tenant scenarios).
 * Purely functional without runtime environment variable dependencies.
 */
export function createSiteConfig(overrides?: SiteConfigOverrides): SiteConfig {
  if (!overrides) {
    return siteConfig
  }

  const rawBrand = overrides.brandName?.trim()
  const rawApp = overrides.appName?.trim()
  const resolvedName = rawBrand || rawApp || siteConfig.name

  const normalized = resolvedName.toLowerCase().replace(/[^a-z0-9]/g, "")
  const slug = normalized || "izone"
  const isDefaultIzone =
    normalized === "izone" ||
    normalized === "izonecoachingclasses" ||
    normalized === "izonecoaching"

  const resolvedSupportEmail =
    overrides.supportEmail?.trim() || (isDefaultIzone ? siteConfig.supportEmail : `support@${slug}.com`)
  const resolvedLogo = overrides.logo?.trim() || siteConfig.logo

  const customInitials =
    resolvedName.charAt(0).toUpperCase() || siteConfig.initials
  const customMonogram =
    resolvedName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2).toUpperCase() ||
    siteConfig.monogram

  return Object.freeze({
    ...siteConfig,
    name: resolvedName,
    logo: resolvedLogo,
    instituteName: isDefaultIzone ? siteConfig.instituteName : resolvedName,
    trainingAcademyName: isDefaultIzone
      ? siteConfig.trainingAcademyName
      : `${resolvedName} Training Academy`,
    shortName: resolvedName,
    initials: customInitials,
    monogram: customMonogram,
    title: isDefaultIzone
      ? `${resolvedName} — Online Test Series & Question Papers | ${siteConfig.instituteName}`
      : `${resolvedName} — Online Test Series & Question Papers`,
    companyName: isDefaultIzone
      ? siteConfig.companyName
      : `${resolvedName} Technologies`,
    supportEmail: resolvedSupportEmail,
    defaultAdminEmail: isDefaultIzone
      ? siteConfig.defaultAdminEmail
      : `admin@${slug}.com`,
    defaultCandidateEmail: isDefaultIzone
      ? siteConfig.defaultCandidateEmail
      : `candidate@${slug}.com`,
    domain: isDefaultIzone ? siteConfig.domain : `${slug}.com`,
    appDomain: isDefaultIzone ? siteConfig.appDomain : `${slug}.app`,
    securityLabel: `Your session is protected by ${resolvedName} security controls.`,
    platformLabel: `${resolvedName} examination platform`,
    evaluatorPersona: `${resolvedName}'s expert academic evaluator`,
    sidebarStorageKey: isDefaultIzone
      ? siteConfig.sidebarStorageKey
      : `${slug}-sidebar-collapsed`,
    legacySidebarStorageKey: siteConfig.legacySidebarStorageKey,
    contact: siteConfig.contact,
    links: siteConfig.links,
  })
}

/**
 * Backward-compatible alias for createSiteConfig.
 */
export const createBrandConfig = createSiteConfig
