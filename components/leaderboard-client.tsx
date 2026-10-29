"use client"

import { LeaderboardDesktop } from "./leaderboard-desktop"
import { LeaderboardMobile } from "./leaderboard-mobile"

export interface LeaderboardEntry {
  rank: number
  studentName: string
  testTitle: string
  score: number
  maxMarks: number
  percentage: number
  attemptNumber: number
  submittedAt: string
}

export function LeaderboardClient({ rankings }: { rankings: LeaderboardEntry[] }) {
  return <><LeaderboardDesktop rankings={rankings} /><LeaderboardMobile rankings={rankings} /></>
}
