import { requireAdmin } from "@/lib/auth-guard"
import { getAdminProfileAction } from "@/actions/auth-actions"
import { AdminProfileClient } from "@/components/admin/profile/admin-profile-client"
import { BRAND_CONFIG } from "@/lib/brand"

export const dynamic = "force-dynamic"

export default async function AdminProfilePage() {
  const user = await requireAdmin("/admin/profile")
  const profileResult = await getAdminProfileAction()

  const initialData =
    profileResult.success && profileResult.data
      ? profileResult.data
      : {
          name: user.name || "Administrator",
          email: user.email || BRAND_CONFIG.defaultAdminEmail,
          role: "ADMIN",
          phoneNumber: "",
          bio: "",
          createdAt: new Date().toISOString(),
          totalReviewsPerformed: 0,
        }

  return <AdminProfileClient initialData={initialData} />
}
