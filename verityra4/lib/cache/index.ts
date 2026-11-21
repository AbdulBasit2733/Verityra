import { unstable_cache, revalidatePath, revalidateTag } from "next/cache"
import { getLeaderboardAction } from "@/actions/leaderboard-actions"

/**
 * Caching Layer for Performance Optimization
 *
 * Uses Next.js unstable_cache for server-side data caching with tag-based invalidation.
 * This dramatically reduces database load for frequently accessed data like leaderboards and test catalogs.
 */

/**
 * Cached Leaderboard with 5-minute TTL
 */
export const getCachedLeaderboard = unstable_cache(
  async (testSeriesId?: string) => {
    return getLeaderboardAction(testSeriesId)
  },
  ["leaderboard"],
  {
    revalidate: 300, // 5 minutes TTL
    tags: ["leaderboard"],
  }
)

/**
 * Invalidate leaderboard cache
 * Call this when evaluation completes or scores are manually adjusted
 */
export function invalidateLeaderboardCache() {
  try {
    revalidateTag("leaderboard", "default")
    revalidatePath("/leaderboard", "page")
    revalidatePath("/", "page")
  } catch (error) {
    console.warn("[Cache] revalidate called from invalid context:", error)
  }
}

/**
 * Invalidate test series catalog cache
 * Call this when an admin creates, updates, or publishes a test series
 */
export function invalidateTestCatalogCache() {
  try {
    revalidateTag("test-series", "default")
    revalidatePath("/tests", "page")
    revalidatePath("/", "page")
    revalidatePath("/admin/test-series", "page")
  } catch (error) {
    console.warn("[Cache] revalidate called from invalid context:", error)
  }
}

/**
 * Invalidate admin dashboard analytics cache
 * Call this when a new payment is captured, a test is created, or an evaluation completes
 */
export function invalidateAdminAnalyticsCache() {
  try {
    revalidateTag("admin-analytics", "default")
    revalidatePath("/admin", "page")
  } catch (error) {
    console.warn("[Cache] revalidate called from invalid context:", error)
  }
}

/**
 * Invalidate all caches (use sparingly)
 */
export function invalidateAllCaches() {
  try {
    revalidateTag("leaderboard", "default")
    revalidateTag("test-series", "default")
    revalidateTag("admin-analytics", "default")
    revalidatePath("/leaderboard", "page")
    revalidatePath("/tests", "page")
    revalidatePath("/", "page")
    revalidatePath("/admin", "layout")
    revalidatePath("/student", "layout")
  } catch (error) {
    console.warn("[Cache] revalidate called from invalid context:", error)
  }
}
