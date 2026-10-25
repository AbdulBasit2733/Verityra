"use server"

import { prisma, isDatabaseConnected } from "@/lib/prisma"
import { EvaluationStatus } from "@prisma/client"

export type LeaderboardEntry = {
  rank: number
  studentName: string
  testTitle: string
  score: number
  maxMarks: number
  percentage: number
  attemptNumber: number
  submittedAt: string
}

/**
 * Server Action: Fetch Leaderboard Rankings for Published Test Series
 */
export async function getLeaderboardAction(testSeriesId?: string): Promise<LeaderboardEntry[]> {
  const dbConnected = await isDatabaseConnected()
  if (!dbConnected) {
    return [
      {
        rank: 1,
        studentName: "Aarav Sharma",
        testTitle: "UPSC GS Mains Mock Test 1",
        score: 84.5,
        maxMarks: 100,
        percentage: 84.5,
        attemptNumber: 1,
        submittedAt: new Date(Date.now() - 86400000 * 2).toLocaleDateString(),
      },
      {
        rank: 2,
        studentName: "Priya Patel",
        testTitle: "UPSC GS Mains Mock Test 1",
        score: 81.0,
        maxMarks: 100,
        percentage: 81.0,
        attemptNumber: 1,
        submittedAt: new Date(Date.now() - 86400000 * 3).toLocaleDateString(),
      },
      {
        rank: 3,
        studentName: "Rohan Verma",
        testTitle: "UPSC GS Mains Mock Test 1",
        score: 77.5,
        maxMarks: 100,
        percentage: 77.5,
        attemptNumber: 2,
        submittedAt: new Date(Date.now() - 86400000 * 1).toLocaleDateString(),
      },
      {
        rank: 4,
        studentName: "Ananya Iyer",
        testTitle: "UPSC GS Mains Mock Test 1",
        score: 74.0,
        maxMarks: 100,
        percentage: 74.0,
        attemptNumber: 1,
        submittedAt: new Date(Date.now() - 86400000 * 4).toLocaleDateString(),
      },
    ]
  }

  // Find evaluations for test series where results are published
  // OPTIMIZED: Use select instead of include to fetch only required fields
  const evaluations = await prisma.evaluation.findMany({
    where: {
      status: {
        in: [EvaluationStatus.COMPLETED, EvaluationStatus.APPROVED, EvaluationStatus.ADJUSTED],
      },
      submission: {
        testSeries: {
          resultsPublished: true,
          ...(testSeriesId ? { id: testSeriesId } : {}),
        },
      },
    },
    select: {
      totalMarksAwarded: true,
      maxMarks: true,
      percentage: true,
      submission: {
        select: {
          attemptNumber: true,
          submittedAt: true,
          user: { select: { name: true } },
          testSeries: { select: { title: true } },
        },
      },
    },
    orderBy: [
      { totalMarksAwarded: "desc" },
      { submission: { submittedAt: "asc" } }, // Tie breaker: earlier submission ranks higher
    ],
    take: 100, // Increased from 50 for better coverage
  })

  return evaluations.map((item, index) => ({
    rank: index + 1,
    studentName: item.submission.user.name || "Anonymous Candidate",
    testTitle: item.submission.testSeries.title,
    score: item.totalMarksAwarded,
    maxMarks: item.maxMarks,
    percentage: item.percentage,
    attemptNumber: item.submission.attemptNumber,
    submittedAt: item.submission.submittedAt.toISOString(),
  }))
}
