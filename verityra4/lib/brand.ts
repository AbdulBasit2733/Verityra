/**
 * Central Brand & Identity Configuration Bridge
 *
 * NOTE: The primary industry-standard source of truth for all website, institute,
 * and brand configuration is located at `@/config/site` (`config/site.ts`).
 *
 * This module re-exports the configuration and utilities to maintain 100% backward
 * compatibility across all existing Server Components, Client Components, actions,
 * and test suites.
 *
 * @see "@/config/site"
 */

export * from "../config/site"
export { siteConfig as default } from "../config/site"
