"use client"

import * as React from "react"

/**
 * SSR-safe hook that returns true only after component has mounted on the client
 *
 * This is useful for:
 * - Preventing hydration mismatches when using browser-only APIs
 * - Conditionally rendering client-only features
 * - Ensuring responsive hooks work correctly during SSR
 *
 * @returns boolean - false during SSR, true after hydration on client
 *
 * @example
 * function Component() {
 *   const mounted = useMounted()
 *
 *   if (!mounted) {
 *     // Return skeleton or null during SSR
 *     return <Skeleton />
 *   }
 *
 *   // Render full component only on client
 *   return <ClientOnlyFeature />
 * }
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = React.useState<boolean>(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return mounted
}
