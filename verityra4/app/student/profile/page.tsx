import { requireStudent } from "@/lib/auth-guard"
import { getStudentProfileAction } from "@/actions/auth-actions"
import { StudentProfileClient } from "@/components/student/profile/student-profile-client"
import { BRAND_CONFIG } from "@/lib/brand"

export const dynamic = "force-dynamic"

export default async function StudentProfilePage() {
  const user = await requireStudent("/student/profile")
  const profileResult = await getStudentProfileAction()

  const initialData =
    profileResult.success && profileResult.data
      ? profileResult.data
      : {
          name: user.name || "Candidate",
          email: user.email || BRAND_CONFIG.defaultCandidateEmail,
          educationLevel: "Graduate / Aspirant",
          institution: "",
          phoneNumber: "",
          targetExam: "CBSE / NEET-UG / JEE Preparation",
          bio: "",
          createdAt: new Date().toISOString(),
        }

  return <StudentProfileClient initialData={initialData} />
}
