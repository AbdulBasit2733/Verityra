import { requireStudent } from "@/lib/auth-guard"
import { getStudentProfileAction } from "@/actions/auth-actions"
import { StudentProfileClient } from "@/components/student/profile/student-profile-client"

export const dynamic = "force-dynamic"

export default async function StudentProfilePage() {
  const user = await requireStudent("/student/profile")
  const profileResult = await getStudentProfileAction()

  const initialData =
    profileResult.success && profileResult.data
      ? profileResult.data
      : {
          name: user.name || "Candidate",
          email: user.email || "candidate@verityra.com",
          educationLevel: "Graduate / Aspirant",
          institution: "",
          phoneNumber: "",
          targetExam: "UPSC CSE Mains / State PCS",
          bio: "",
          createdAt: new Date().toISOString(),
        }

  return <StudentProfileClient initialData={initialData} />
}
