"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import { FormattedDate } from "@/components/ui/date-picker"
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  FileCheck2,
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
            className="font-bold text-[#0F172A] hover:text-[#2A6AED] transition-colors block leading-snug"
          >
            {r.testTitle}
          </Link>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#64748B]">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3 text-slate-400" />
              {r.durationMinutes} mins
            </span>
            <span className="inline-flex items-center gap-1">
              <Award className="h-3 w-3 text-[#2A6AED]" />
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
              <span className="font-bold text-[#0F172A]">
                {r.attemptsUsed} / {r.maxAttempts} used
              </span>
              <span
                className={
                  left > 0
                    ? "text-[11px] font-semibold text-emerald-600"
                    : "text-[11px] font-semibold text-amber-600"
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
            <span className="font-extrabold text-[#2A6AED] text-sm">
              {r.latestScore} / {r.maxMarks}
            </span>
            <span className="block text-[11px] font-medium text-[#64748B]">
              {r.latestPercentage}% score
            </span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 font-medium">No evaluated attempt</span>
        ),
    },
    {
      id: "registeredAt",
      header: "Enrolled Date",
      sortable: true,
      sortAccessor: (r) => new Date(r.registeredAt),
      cell: (r) => <FormattedDate date={r.registeredAt} />,
    },
    {
      id: "action",
      header: "Workspace",
      headerClassName: "text-right",
      className: "text-right",
      cell: (r) => (
        <Link href={`/student/tests/${r.testSeriesId}`}>
          <Button
            size="sm"
            className="h-8 px-3.5 rounded-lg bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-semibold"
          >
            Open Workspace
            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </Link>
      ),
    },
  ]

  const registrationFilters: DataTableFilter<StudentRegistrationRow>[] = [
    {
      id: "quota",
      label: "Quota Status",
      accessor: (r) => (r.attemptsUsed < r.maxAttempts ? "AVAILABLE" : "EXHAUSTED"),
      options: [
        { label: "Attempts Available", value: "AVAILABLE" },
        { label: "Quota Exhausted (3/3)", value: "EXHAUSTED" },
      ],
    },
    {
      id: "evaluation",
      label: "Progress",
      accessor: (r) => (r.latestScore !== null ? "EVALUATED" : "NOT_STARTED"),
      options: [
        { label: "Graded & Evaluated", value: "EVALUATED" },
        { label: "Pending First Attempt", value: "NOT_STARTED" },
      ],
    },
  ]

  const submissionColumns: DataTableColumn<StudentSubmissionRow>[] = [
    {
      id: "testTitle",
      header: "Test Series",
      sortable: true,
      sortAccessor: (s) => s.testTitle,
      searchAccessor: (s) => `${s.testTitle} Attempt ${s.attemptNumber} ${s.status}`,
      cell: (s) => (
        <Link
          href={`/student/tests/${s.testSeriesId}`}
          className="font-bold text-[#0F172A] hover:text-[#2A6AED] transition-colors block max-w-xs truncate"
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
          className="text-[11px] font-semibold border-blue-200 text-[#2A6AED] bg-[#EFF6FF]"
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
              ? "border-emerald-200 text-emerald-700 bg-emerald-50 text-[11px] font-semibold"
              : s.status === "REVIEW_REQUIRED"
                ? "border-amber-200 text-amber-700 bg-amber-50 text-[11px] font-semibold"
                : "border-blue-200 text-blue-700 bg-blue-50 text-[11px] font-semibold"
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
          <span className="font-extrabold text-[#2A6AED]">
            {s.totalMarksAwarded} / {s.maxMarks}{" "}
            <span className="text-xs font-medium text-slate-500">({s.percentage}%)</span>
          </span>
        ) : (
          <span className="text-slate-400 text-xs">Pending</span>
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
            className="h-8 px-3 rounded-lg border-slate-200 text-xs font-semibold text-slate-700 hover:text-[#2A6AED]"
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
  ]

  return (
    <div className="space-y-6">
      {/* Flat Page Header — No Card Wrapper */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#2A6AED]">
            Candidate Workspace
          </p>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] tracking-tight">
            Welcome back, {userName}
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B]">
            Manage your enrolled test series, download margin-aligned answer sheets, and track your 3-attempt progression.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link href="/tests">
            <Button className="h-10 px-4 rounded-xl bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs sm:text-sm font-semibold">
              <BookOpen className="mr-2 h-4 w-4" />
              Enroll in New Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Flat Divided Metric Strip — Replaces Heavy KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border-y border-slate-200 bg-slate-50/40">
        <div className="py-4 px-4 sm:px-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Enrolled Test Series
            </span>
            <p className="text-2xl font-extrabold text-[#0F172A] mt-0.5">{totalRegistered}</p>
            <span className="text-xs text-[#64748B]">Active exam registrations</span>
          </div>
          <BookOpen className="h-5 w-5 text-[#2A6AED] shrink-0" />
        </div>

        <div className="py-4 px-4 sm:px-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Attempts Evaluated
            </span>
            <p className="text-2xl font-extrabold text-[#2A6AED] mt-0.5">{totalAttemptsUsed}</p>
            <span className="text-xs text-[#64748B]">Handwritten booklets graded</span>
          </div>
          <CheckCircle2 className="h-5 w-5 text-[#2A6AED] shrink-0" />
        </div>

        <div className="py-4 px-4 sm:px-6 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Attempts Remaining
            </span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-0.5">
              {totalAttemptsRemaining}
            </p>
            <span className="text-xs text-[#64748B]">Available submission slots</span>
          </div>
          <Layers className="h-5 w-5 text-emerald-600 shrink-0" />
        </div>
      </div>

      {/* shadcn Tabs Switching Between Enrolled Tests Table & Submission Activity Table */}
      <Tabs defaultValue="enrolled" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <TabsList variant="line" className="border-b border-slate-200 w-full sm:w-auto justify-start">
            <TabsTrigger value="enrolled" className="text-xs sm:text-sm font-semibold px-4 py-2">
              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
              Enrolled Test Series ({registrations.length})
            </TabsTrigger>
            <TabsTrigger value="submissions" className="text-xs sm:text-sm font-semibold px-4 py-2">
              <FileCheck2 className="h-3.5 w-3.5 mr-1.5" />
              Submission History ({submissions.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="enrolled" className="space-y-4 pt-1">
          <DataTable
            data={registrations}
            columns={registrationColumns}
            keyExtractor={(r) => r.id}
            searchPlaceholder="Search enrolled tests by title or feedback..."
            filters={registrationFilters}
            dateAccessor={(r) => r.registeredAt}
            dateFilterLabel="Enrolled Date"
            defaultSortColumn="registeredAt"
            defaultSortDirection="desc"
            defaultPageSize={10}
            emptyTitle="No enrolled test series found"
            emptyDescription="Enroll in a free or paid mock examination to download margin-aligned answer sheets and submit up to 3 handwritten attempts."
            emptyAction={
              <Link href="/tests">
                <Button size="sm" className="bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-semibold">
                  Explore Test Catalog
                </Button>
              </Link>
            }
          />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-4 pt-1">
          <DataTable
            data={submissions}
            columns={submissionColumns}
            keyExtractor={(s) => s.id}
            searchPlaceholder="Search submissions by test series..."
            filters={submissionFilters}
            dateAccessor={(s) => s.submittedAt}
            dateFilterLabel="Submission Date"
            defaultSortColumn="submittedAt"
            defaultSortDirection="desc"
            defaultPageSize={10}
            emptyTitle="No handwritten submissions found"
            emptyDescription="Upload your first scanned handwritten answer booklet inside any enrolled test workspace."
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
