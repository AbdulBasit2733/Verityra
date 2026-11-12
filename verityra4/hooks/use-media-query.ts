"use client"

import * as React from "react"

/**
 * SSR-safe React hook for responsive breakpoint detection
 *
 * @param query - Media query string (e.g., "(max-width: 1023px)")
 * @returns boolean - true if media query matches, false otherwise
 *
 * @example
 * const isMobile = useMediaQuery('(max-width: 1023px)')
 * const isDesktop = useMediaQuery('(min-width: 1024px)')
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = React.useState<boolean>(false)
  const [mounted, setMounted] = React.useState<boolean>(false)

  React.useEffect(() => {
    setMounted(true)

    // Create media query list
    const mediaQuery = window.matchMedia(query)

    // Set initial value
    setMatches(mediaQuery.matches)

    // Create event listener function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener (use addEventListener for better browser support)
    mediaQuery.addEventListener("change", handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [query])

  // Return false during SSR to prevent hydration mismatches
  return mounted ? matches : false
}

/**
 * Responsive breakpoint preset hooks
 * Based on Verityra's breakpoint system:
 * - Mobile S: < 375px
 * - Mobile M/L: 375px - 1023px
 * - Tablet: 768px - 1023px
 * - Desktop: ≥ 1024px
 * - Wide: ≥ 1280px
 */

/**
 * Returns true for mobile devices (< 1024px)
 * Includes Mobile S, M, L, and Tablet viewports
 */
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 1023px)")
}

/**
 * Returns true for tablet devices (768px - 1023px)
 */
export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)")
}

/**
 * Returns true for desktop devices (≥ 1024px)
 */
export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)")
}

/**
 * Returns true for wide desktop screens (≥ 1280px)
 */
export function useIsWideDesktop(): boolean {
  return useMediaQuery("(min-width: 1280px)")
}

/**
 * Returns true for small mobile devices (< 375px)
 * Useful for iPhone SE, Galaxy Fold (320px-360px)
 */
export function useIsSmallMobile(): boolean {
  return useMediaQuery("(max-width: 374px)")
}

/**
 * Returns the current breakpoint as a string
 * Useful for conditional rendering based on viewport size
 */
export function useBreakpoint():
  "mobile-s" | "mobile" | "tablet" | "desktop" | "wide" {
  const isSmallMobile = useIsSmallMobile()
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()
  const isWideDesktop = useIsWideDesktop()
  const isDesktop = useIsDesktop()

  if (isSmallMobile) return "mobile-s"
  if (isTablet) return "tablet"
  if (isWideDesktop) return "wide"
  if (isDesktop) return "desktop"
  if (isMobile) return "mobile"

  return "desktop" // fallback
}
