import { requireAdmin } from "@/lib/auth-guard"
import { getAllSubjectTestsAction } from "@/actions/test-series-actions"
import {
  getSubjectsAction,
  getStandardsAction,
  getBoardsAction,
} from "@/actions/master-actions"
import { AdminTestsClient } from "@/components/admin/tests/admin-tests-client"

export const dynamic = "force-dynamic"

export default async function AdminTestsPage() {
  await requireAdmin("/admin/tests")

  const [testsRes, subjectsRes, standardsRes, boardsRes] = await Promise.all([
    getAllSubjectTestsAction(),
    getSubjectsAction({ activeOnly: true }),
    getStandardsAction({ activeOnly: true }),
    getBoardsAction({ activeOnly: true }),
  ])

  const tests = testsRes.success && testsRes.data ? testsRes.data.tests : []
  const subjects = subjectsRes.success && subjectsRes.data ? subjectsRes.data.subjects : []
  const standards = standardsRes.success && standardsRes.data ? standardsRes.data.standards : []
  const boards = boardsRes.success && boardsRes.data ? boardsRes.data.boards : []

  return (
    <AdminTestsClient
      initialTests={tests}
      masterSubjects={subjects}
      masterStandards={standards}
      masterBoards={boards}
    />
  )
}
