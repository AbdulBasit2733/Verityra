"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiStatCard } from "@/components/ui/kpi-stat-card"
import {
  Award,
  BookOpen,
  Clock,
  Compass,
  FileCheck2,
  GraduationCap,
  Layers,
} from "lucide-react"

export interface StudentRegistrationRow {
  id: string
  testSeriesId: string
  testTitle: string
  maxMarks: number
  durationMinutes: number
  attemptsUsed: number
  maxAttempts: number
  registeredAt: string
  latestScore: number | null
  latestPercentage: number | null
  latestStatus: string | null
  latestFeedback: string | null
}

export interface StudentSubmissionRow {
  id: string
  testSeriesId: string
  testTitle: string
  attemptNumber: number
  status: string
  submittedAt: string
  totalMarksAwarded: number | null
  maxMarks: number | null
  percentage: number | null
}

export function StudentDashboardClient({
  userName,
  registrations,
  submissions,
}: {
  userName: string
  registrations: StudentRegistrationRow[]
  submissions: StudentSubmissionRow[]
}) {
  const totalRegistered = registrations.length
  const totalAttemptsUsed = registrations.reduce((acc, r) => acc + r.attemptsUsed, 0)
  const totalAttemptsRemaining = registrations.reduce(
    (acc, r) => acc + Math.max(0, r.maxAttempts - r.attemptsUsed),
    0
  )

  const registrationColumns: DataTableColumn<StudentRegistrationRow>[] = [
    {
      id: "title",
      header: "Enrolled Test Series",
      sortable: true,
      sortAccessor: (r) => r.testTitle,
      searchAccessor: (r) => `${r.testTitle} ${r.latestFeedback || ""}`,
      cell: (r) => (
        <div className="space-y-1 max-w-md whitespace-normal">
          <Link
            href={`/student/tests/${r.testSeriesId}`}
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#2A6AED] dark:hover:text-blue-400 transition-colors block leading-snug"
          >
            {r.testTitle}
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              {r.durationMinutes} mins
            </span>
            <span className="inline-flex items-center gap-1">
              <Award className="h-3 w-3 text-[#2A6AED] dark:text-blue-400" />
              {r.maxMarks} Marks
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "attempts",
      header: "3-Attempt Quota",
      sortable: true,
      sortAccessor: (r) => r.attemptsUsed,
      cell: (r) => {
        const left = Math.max(0, r.maxAttempts - r.attemptsUsed)
        return (
          <div className="w-40 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {r.attemptsUsed} / {r.maxAttempts} used
              </span>
              <span
                className={
                  left > 0
                    ? "text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
                    : "text-[11px] font-semibold text-amber-600 dark:text-amber-400"
                }
              >
                {left} left
              </span>
            </div>
            <Progress
              value={r.attemptsUsed}
              max={r.maxAttempts}
              indicatorClassName={left === 0 ? "bg-amber-500" : "bg-[#2A6AED]"}
            />
          </div>
        )
      },
    },
    {
      id: "latestScore",
      header: "Latest Score",
      sortable: true,
      sortAccessor: (r) => r.latestScore ?? -1,
      cell: (r) =>
        r.latestScore !== null ? (
          <div className="space-y-0.5">
            <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-sm">
              {r.latestScore} / {r.maxMarks}
            </span>
            <span className="block text-[11px] font-medium text-slate-500 dark:text-slate-400">
              {r.latestPercentage}% score
            </span>
          </div>
        ) : (
          <span className="text-slate-400 text-xs">No attempt submitted</span>
        ),
    },
    {
      id: "registeredAt",
      header: "Enrolled On",
      sortable: true,
      sortAccessor: (r) => new Date(r.registeredAt),
      cell: (r) => <FormattedDate date={r.registeredAt} />,
    },
    {
      id: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      cell: (r) => (
        <Link href={`/student/tests/${r.testSeriesId}`}>
          <Button
            size="sm"
            className="h-8 px-3 rounded-lg bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-semibold shadow-2xs"
          >
            Open Workspace
          </Button>
        </Link>
      ),
    },
  ]

  const registrationFilters: DataTableFilter<StudentRegistrationRow>[] = [
    {
      id: "attemptStatus",
      label: "Attempts Remaining",
      accessor: (r) =>
        r.attemptsUsed >= r.maxAttempts ? "EXHAUSTED" : "AVAILABLE",
      options: [
        { label: "Attempts Available", value: "AVAILABLE" },
        { label: "Quota Exhausted", value: "EXHAUSTED" },
      ],
    },
    {
      id: "maxMarks",
      label: "Marks Weightage",
      accessor: (r) => (r.maxMarks >= 250 ? "FULL_MOCK" : "SECTIONAL"),
      options: [
        { label: "Full Mock (≥ 250 Marks)", value: "FULL_MOCK" },
        { label: "Sectional / Essay (< 250 Marks)", value: "SECTIONAL" },
      ],
    },
  ]

  const submissionColumns: DataTableColumn<StudentSubmissionRow>[] = [
    {
      id: "testTitle",
      header: "Test Series",
      sortable: true,
      sortAccessor: (s) => s.testTitle,
      searchAccessor: (s) => `${s.testTitle} ${s.status}`,
      cell: (s) => (
        <Link
          href={`/student/tests/${s.testSeriesId}`}
          className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#2A6AED] dark:hover:text-blue-400 transition-colors block max-w-xs truncate"
        >
          {s.testTitle}
        </Link>
      ),
    },
    {
      id: "attemptNumber",
      header: "Attempt",
      sortable: true,
      sortAccessor: (s) => s.attemptNumber,
      cell: (s) => (
        <Badge
          variant="outline"
          className="text-[11px] font-semibold border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-full"
        >
          Attempt #{s.attemptNumber} of 3
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Evaluation Status",
      sortable: true,
      sortAccessor: (s) => s.status,
      cell: (s) => (
        <Badge
          variant="outline"
          className={
            s.status === "COMPLETED"
              ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[11px] font-semibold rounded-full"
              : s.status === "REVIEW_REQUIRED"
                ? "border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 text-[11px] font-semibold rounded-full"
                : "border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[11px] font-semibold rounded-full"
          }
        >
          {s.status === "COMPLETED"
            ? "Evaluated"
            : s.status === "REVIEW_REQUIRED"
              ? "Educator Review"
              : "Processing"}
        </Badge>
      ),
    },
    {
      id: "score",
      header: "Score",
      sortable: true,
      sortAccessor: (s) => s.totalMarksAwarded ?? -1,
      cell: (s) =>
        s.totalMarksAwarded !== null ? (
          <span className="font-extrabold text-[#2A6AED] dark:text-blue-400">
            {s.totalMarksAwarded} / {s.maxMarks}{" "}
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              ({s.percentage}%)
            </span>
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Pending Evaluation</span>
        ),
    },
    {
      id: "submittedAt",
      header: "Submitted On",
      sortable: true,
      sortAccessor: (s) => new Date(s.submittedAt),
      cell: (s) => <FormattedDate date={s.submittedAt} includeTime />,
    },
    {
      id: "action",
      header: "Report",
      headerClassName: "text-right",
      className: "text-right",
      cell: (s) => (
        <Link href={`/student/tests/${s.testSeriesId}`}>
          <Button
            size="sm"
            variant="outline"
            className="h-8 px-3 rounded-lg border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-[#2A6AED] dark:hover:text-blue-400 shadow-2xs"
          >
            View Breakdown
          </Button>
        </Link>
      ),
    },
  ]

  const submissionFilters: DataTableFilter<StudentSubmissionRow>[] = [
    {
      id: "status",
      label: "Status",
      accessor: (s) => s.status,
      options: [
        { label: "Evaluated", value: "COMPLETED" },
        { label: "Educator Review", value: "REVIEW_REQUIRED" },
        { label: "Processing", value: "PROCESSING" },
      ],
    },
    {
      id: "attempt",
      label: "Attempt #",
      accessor: (s) => String(s.attemptNumber),
      options: [
        { label: "Attempt #1", value: "1" },
        { label: "Attempt #2", value: "2" },
        { label: "Attempt #3", value: "3" },
      ],
    },
    {
      id: "scoreTier",
      label: "Score Bracket",
      accessor: (s) => {
        if (s.percentage === null) return "PENDING"
        if (s.percentage >= 70) return "HIGH"
        if (s.percentage >= 50) return "AVERAGE"
        return "LOW"
      },
      options: [
        { label: "High Marks (≥ 70%)", value: "HIGH" },
        { label: "Average Marks (50–69%)", value: "AVERAGE" },
        { label: "Needs Improvement (< 50%)", value: "LOW" },
        { label: "Pending Evaluation", value: "PENDING" },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        icon={GraduationCap}
        title={`Welcome back, ${userName}`}
        subtitle="Viewing: Your Enrolled UPSC Test Series & 3-Attempt Progression"
      >
        <Link href="/tests">
          <Button className="h-10 px-4 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs sm:text-sm font-semibold shadow-xs">
            <Compass className="mr-1.5 h-4 w-4" />
            Explore Test Catalog
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiStatCard
          label="Enrolled Test Series"
          value={totalRegistered}
          subtext="Active exam registrations"
          icon={BookOpen}
          variant="blue"
        />
        <KpiStatCard
          label="Evaluated Submissions"
          value={submissions.length}
          subtext="Detailed scorecards produced"
          icon={FileCheck2}
          variant="emerald"
        />
        <KpiStatCard
          label="Remaining Guarantee"
          value={totalAttemptsRemaining}
          subtext="Attempts left across tests"
          icon={Clock}
          variant="amber"
        />
        <KpiStatCard
          label="Attempts Consumed"
          value={totalAttemptsUsed}
          subtext="Handwritten sheets evaluated"
          icon={Layers}
          variant="indigo"
        />
      </div>

      {/* Tabs with DataTables */}
      <Tabs defaultValue="enrolled" className="space-y-4">
        <TabsList variant="line" className="border-b border-slate-200 dark:border-slate-800 w-full sm:w-auto justify-start">
          <TabsTrigger value="enrolled" className="text-xs sm:text-sm font-semibold px-4 py-2">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            My Enrolled Test Series ({registrations.length})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="text-xs sm:text-sm font-semibold px-4 py-2">
            <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
            My Evaluated Submissions ({submissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="pt-1">
          <DataTable
            data={registrations}
            columns={registrationColumns}
            keyExtractor={(r) => r.id}
            searchPlaceholder="Search enrolled test title or syllabus..."
            filters={registrationFilters}
            dateAccessor={(r) => r.registeredAt}
            dateFilterLabel="Enrollment Date"
            defaultSortColumn="registeredAt"
            defaultSortDirection="desc"
            defaultPageSize={10}
            showSerialNumber={true}
            emptyTitle="No test series enrolled yet"
            emptyDescription="Explore our UPSC Mains test series catalog to enroll and start submitting handwritten answer sheets."
            emptyAction={
              <Link href="/tests">
                <Button size="sm" className="bg-[#2A6AED] text-white">
                  Browse Test Catalog
                </Button>
              </Link>
            }
          />
        </TabsContent>

        <TabsContent value="submissions" className="pt-1">
          <DataTable
            data={submissions}
            columns={submissionColumns}
            keyExtractor={(s) => s.id}
            searchPlaceholder="Search submitted test title or status..."
            filters={submissionFilters}
            dateAccessor={(s) => s.submittedAt}
            dateFilterLabel="Submission Date"
            defaultSortColumn="submittedAt"
            defaultSortDirection="desc"
            defaultPageSize={10}
            showSerialNumber={true}
            emptyTitle="No answer sheets submitted yet"
            emptyDescription="Open any enrolled test series above to upload your handwritten PDF response."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
