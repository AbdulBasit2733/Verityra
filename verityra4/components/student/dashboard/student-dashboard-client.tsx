"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { IconActionButton } from "@/components/ui/icon-action-button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import { PageHeader } from "@/components/ui/page-header"
import { KpiMetricStrip, KpiMetric } from "@/components/shared/kpi-metric-strip"
import { SubmissionStatusBadge } from "@/components/student/shared/submission-status-badge"
import {
  Award,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  GraduationCap,
  Layers,
  Loader2,
  MailWarning,
} from "lucide-react"
import { resendVerificationEmailAction } from "@/actions/auth-actions"

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
  userEmail,
  isEmailVerified = true,
  registrations,
  submissions,
  showRegisteredTests = false,
}: {
  userName: string
  userEmail?: string
  isEmailVerified?: boolean
  registrations: StudentRegistrationRow[]
  submissions: StudentSubmissionRow[]
  showRegisteredTests?: boolean
}) {
  const [resendingVerify, setResendingVerify] = React.useState(false)
  const [verifyFeedback, setVerifyFeedback] = React.useState<string | null>(null)

  async function handleResendVerification() {
    setResendingVerify(true)
    setVerifyFeedback(null)
    try {
      const res = await resendVerificationEmailAction(userEmail)
      if (res.success) {
        setVerifyFeedback(res.message || "Verification link sent to your email.")
      } else {
        setVerifyFeedback(res.error || "Unable to send verification link right now.")
      }
    } catch {
      setVerifyFeedback("Failed to send verification link.")
    } finally {
      setResendingVerify(false)
    }
  }
  const totalRegistered = registrations.length
  const totalAttemptsUsed = registrations.reduce((acc, r) => acc + r.attemptsUsed, 0)
  const totalAttemptsRemaining = registrations.reduce(
    (acc, r) => acc + Math.max(0, r.maxAttempts - r.attemptsUsed),
    0
  )

  const registrationColumns: DataTableColumn<StudentRegistrationRow>[] = React.useMemo(
    () => [
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
        sortAccessor: (r) => new Date(r.registeredAt).getTime(),
        cell: (r) => <FormattedDate date={r.registeredAt} />,
      },
      {
        id: "action",
        header: "Action",
        headerClassName: "text-right",
        className: "text-right",
        cell: (r) => (
          <IconActionButton
            label="Open test workspace"
            render={<Link href={`/student/tests/${r.testSeriesId}`} />}
            nativeButton={false}
            className="bg-[#2A6AED] text-white hover:bg-[#1E55C7]"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </IconActionButton>
        ),
      },
    ],
    []
  )

  const registrationFilters: DataTableFilter<StudentRegistrationRow>[] = React.useMemo(
    () => [
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
    ],
    []
  )

  const submissionColumns: DataTableColumn<StudentSubmissionRow>[] = React.useMemo(
    () => [
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
          <SubmissionStatusBadge
            submissionId={s.id}
            initialStatus={s.status}
            initialPercentage={s.percentage}
          />
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
        sortAccessor: (s) => new Date(s.submittedAt).getTime(),
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
    ],
    []
  )

  const submissionFilters: DataTableFilter<StudentSubmissionRow>[] = React.useMemo(
    () => [
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
    ],
    []
  )

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

      {!isEmailVerified && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30 p-4 text-sm">
          <div className="flex items-start sm:items-center gap-3">
            <MailWarning className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Verify your email address
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {verifyFeedback ||
                  "Confirm your email to receive instant AI scorecard and rubric alerts."}
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={resendingVerify}
            onClick={handleResendVerification}
            className="h-9 px-3.5 rounded-xl border-amber-300 bg-white hover:bg-amber-50 text-xs font-bold text-slate-900 shrink-0"
          >
            {resendingVerify ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Sending...
              </>
            ) : verifyFeedback ? (
              <>
                <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                Resend Again
              </>
            ) : (
              "Resend Verification Link"
            )}
          </Button>
        </div>
      )}

      {/* KPI Metric Strip - Flat Divided Design */}
      <KpiMetricStrip columns={4}>
        <KpiMetric
          label="Enrolled Test Series"
          value={totalRegistered}
          subtext="Active exam registrations"
          icon={BookOpen}
          variant="blue"
        />
        <KpiMetric
          label="Evaluated Submissions"
          value={submissions.length}
          subtext="Detailed scorecards produced"
          icon={FileCheck2}
          variant="emerald"
        />
        <KpiMetric
          label="Remaining Guarantee"
          value={totalAttemptsRemaining}
          subtext="Attempts left across tests"
          icon={Clock}
          variant="amber"
        />
        <KpiMetric
          label="Attempts Consumed"
          value={totalAttemptsUsed}
          subtext="Handwritten sheets evaluated"
          icon={Layers}
          variant="indigo"
        />
      </KpiMetricStrip>

      {/* Tabs with DataTables */}
      <Tabs defaultValue={showRegisteredTests ? "enrolled" : "submissions"} className="space-y-4">
        <TabsList variant="line" className="border-b border-slate-200 dark:border-slate-800 w-full sm:w-auto justify-start">
          {showRegisteredTests && <TabsTrigger value="enrolled" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2">
            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
            <span className="sm:hidden">Enrolled ({registrations.length})</span>
            <span className="hidden sm:inline">My Enrolled Test Series ({registrations.length})</span>
          </TabsTrigger>}
          <TabsTrigger value="submissions" className="text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2">
            <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
            <span className="sm:hidden">Evaluations ({submissions.length})</span>
            <span className="hidden sm:inline">My Evaluated Submissions ({submissions.length})</span>
          </TabsTrigger>
        </TabsList>

        {showRegisteredTests && <TabsContent value="enrolled" className="pt-1">
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
            renderCard={(r, idx, serialNumber) => {
              const left = Math.max(0, r.maxAttempts - r.attemptsUsed)
              return (
                <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-2xs space-y-3.5 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 shrink-0">
                          #{serialNumber}
                        </span>
                        <Link
                          href={`/student/tests/${r.testSeriesId}`}
                          className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#2A6AED] dark:hover:text-blue-400 transition-colors text-sm sm:text-base leading-snug line-clamp-2"
                        >
                          {r.testTitle}
                        </Link>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          left > 0
                            ? "border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 text-[10px] font-semibold shrink-0"
                            : "border-amber-200 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 text-[10px] font-semibold shrink-0"
                        }
                      >
                        {left > 0 ? `${left} left` : "Exhausted"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        {r.durationMinutes} mins
                      </span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-1 font-medium">
                        <Award className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400" />
                        {r.maxMarks} Marks
                      </span>
                      <span>·</span>
                      <span>Enrolled <FormattedDate date={r.registeredAt} /></span>
                    </div>

                    {/* Quota Progress Strip */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          3-Attempt Guarantee
                        </span>
                        <span className="font-bold text-[#2A6AED] dark:text-blue-400">
                          {r.attemptsUsed} of {r.maxAttempts} consumed
                        </span>
                      </div>
                      <Progress
                        value={r.attemptsUsed}
                        max={r.maxAttempts}
                        indicatorClassName={left === 0 ? "bg-amber-500" : "bg-[#2A6AED]"}
                      />
                    </div>

                    {/* Score display */}
                    {r.latestScore !== null ? (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                        <span className="text-slate-500 font-medium">Latest Evaluation:</span>
                        <div className="flex items-baseline gap-1.5 font-bold">
                          <span className="text-[#2A6AED] dark:text-blue-400 text-sm">
                            {r.latestScore} / {r.maxMarks}
                          </span>
                          <span className="text-slate-400 text-[11px]">({r.latestPercentage}%)</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-slate-50/60 dark:bg-slate-800/30 text-xs text-slate-400 italic text-center">
                        No handwritten attempt submitted yet
                      </div>
                    )}
                  </div>

                  <Link href={`/student/tests/${r.testSeriesId}`} className="block w-full pt-1">
                    <Button className="w-full h-10 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-semibold shadow-2xs">
                      Open Examination Workspace
                    </Button>
                  </Link>
                </div>
              )
            }}
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
        </TabsContent>}

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
            renderCard={(s, idx, serialNumber) => (
              <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-4 sm:p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 shrink-0">
                        #{serialNumber}
                      </span>
                      <Link
                        href={`/student/tests/${s.testSeriesId}`}
                        className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#2A6AED] dark:hover:text-blue-400 transition-colors text-sm sm:text-base leading-snug line-clamp-2"
                      >
                        {s.testTitle}
                      </Link>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[10px] font-semibold shrink-0"
                    >
                      Attempt #{s.attemptNumber}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <SubmissionStatusBadge
                      submissionId={s.id}
                      initialStatus={s.status}
                      initialPercentage={s.percentage}
                    />
                    <span className="text-slate-400 text-[11px]">
                      <FormattedDate date={s.submittedAt} />
                    </span>
                  </div>

                  {s.totalMarksAwarded !== null && s.maxMarks && (
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
                      <span className="text-slate-500 font-medium">Awarded Score:</span>
                      <div className="flex items-baseline gap-1.5 font-bold">
                        <span className="text-[#2A6AED] dark:text-blue-400 text-sm">
                          {s.totalMarksAwarded} / {s.maxMarks}
                        </span>
                        {s.percentage !== null && (
                          <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">
                            ({s.percentage.toFixed(1)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <Link href={`/student/tests/${s.testSeriesId}`} className="block w-full pt-1">
                  <Button variant="outline" className="w-full h-9 rounded-xl border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
                    View Evaluation & Rubric
                  </Button>
                </Link>
              </div>
            )}
            emptyTitle="No answer sheets submitted yet"
            emptyDescription="Open any enrolled test series above to upload your handwritten PDF response."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
