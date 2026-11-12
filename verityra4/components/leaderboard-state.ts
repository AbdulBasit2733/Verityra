"use client"

import * as React from "react"
import type { LeaderboardEntry } from "./leaderboard-client"

export function useLeaderboardState(rankings: LeaderboardEntry[]) {
  const [query, setQuery] = React.useState("")
  const [testModule, setTestModule] = React.useState("ALL")
  const [bracket, setBracket] = React.useState("ALL")
  const [attempt, setAttempt] = React.useState("ALL")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const modules = React.useMemo(
    () => Array.from(new Set(rankings.map((item) => item.testTitle))),
    [rankings]
  )
  const filtered = React.useMemo(
    () =>
      rankings.filter((item) => {
        const text = `${item.studentName} ${item.testTitle}`.toLowerCase()
        const matchesQuery =
          !query.trim() || text.includes(query.toLowerCase().trim())
        const matchesModule =
          testModule === "ALL" || item.testTitle === testModule
        const matchesAttempt =
          attempt === "ALL" || String(item.attemptNumber) === attempt
        const matchesBracket =
          bracket === "ALL" ||
          (bracket === "TOP"
            ? item.percentage >= 75
            : bracket === "HIGH"
              ? item.percentage >= 60 && item.percentage < 75
              : bracket === "PASS"
                ? item.percentage >= 50 && item.percentage < 60
                : item.percentage < 50)
        return matchesQuery && matchesModule && matchesAttempt && matchesBracket
      }),
    [rankings, query, testModule, attempt, bracket]
  )
  React.useEffect(() => setPage(1), [query, testModule, attempt, bracket])
  const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize)
  const reset = () => {
    setQuery("")
    setTestModule("ALL")
    setBracket("ALL")
    setAttempt("ALL")
    setPage(1)
  }
  return {
    query,
    setQuery,
    testModule,
    setTestModule,
    bracket,
    setBracket,
    attempt,
    setAttempt,
    page,
    setPage,
    pageSize,
    setPageSize,
    modules,
    filtered,
    pageItems,
    reset,
    hasFilters: Boolean(
      query || testModule !== "ALL" || bracket !== "ALL" || attempt !== "ALL"
    ),
  }
}
