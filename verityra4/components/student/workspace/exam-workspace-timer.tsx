"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  UploadCloud,
  Volume2,
  VolumeX,
} from "lucide-react"

export type TimerPhase = "IDLE" | "WRITING" | "BUFFER" | "OVERTIME" | "COMPLETED"
export type TimerMode = "STRICT" | "PRACTICE"

export interface ExamTimerState {
  startedAt: number | null
  pausedAt: number | null
  totalPausedMs: number
  finishedWritingAt: number | null
  mode: TimerMode
  soundEnabled: boolean
}

export interface ExamWorkspaceTimerProps {
  testSeriesId: string
  durationMinutes: number
  bufferMinutes?: number
  currentAttemptNumber?: number
  onNavigateToUpload?: () => void
  className?: string
  variant?: "banner" | "compact"
}

const DEFAULT_BUFFER_MINUTES = 20

/**
 * Format milliseconds into HH : MM : SS string
 */
export function formatTimerDigits(totalSeconds: number): {
  hours: string
  minutes: string
  seconds: string
  formatted: string
} {
  const isNegative = totalSeconds < 0
  const absSec = Math.abs(totalSeconds)
  const h = Math.floor(absSec / 3600)
  const m = Math.floor((absSec % 3600) / 60)
  const s = Math.floor(absSec % 60)

  const pad = (n: number) => n.toString().padStart(2, "0")
  const hours = pad(h)
  const minutes = pad(m)
  const seconds = pad(s)
  const prefix = isNegative ? "+ " : ""

  return {
    hours,
    minutes,
    seconds,
    formatted: `${prefix}${hours}:${minutes}:${seconds}`,
  }
}

/**
 * Synthesize two-tone gentle audio chime using Web Audio API
 */
export function playChimeSound(type: "milestone" | "warning" | "finished") {
  if (typeof window === "undefined") return
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = "sine"
      osc.frequency.setValueAtTime(freq, startTime)

      gain.gain.setValueAtTime(0.001, startTime)
      gain.gain.exponentialRampToValueAtTime(0.12, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(startTime + duration)
    }

    const now = ctx.currentTime
    if (type === "milestone") {
      playTone(523.25, now, 0.25) // C5
      playTone(659.25, now + 0.15, 0.4) // E5
    } else if (type === "warning") {
      playTone(659.25, now, 0.2) // E5
      playTone(587.33, now + 0.18, 0.3) // D5
    } else {
      playTone(440.0, now, 0.2) // A4
      playTone(554.37, now + 0.18, 0.2) // C#5
      playTone(659.25, now + 0.36, 0.5) // E5
    }
  } catch {
    // Non-fatal if audio context is blocked by browser autoplay policy
  }
}

export function ExamWorkspaceTimer({
  testSeriesId,
  durationMinutes,
  bufferMinutes = DEFAULT_BUFFER_MINUTES,
  currentAttemptNumber = 1,
  onNavigateToUpload,
  className,
  variant = "banner",
}: ExamWorkspaceTimerProps) {
  const storageKey = `verityra-exam-timer:${testSeriesId}:att-${currentAttemptNumber}`
  const containerRef = React.useRef<HTMLDivElement>(null)

  const [isMounted, setIsMounted] = React.useState(false)
  const [isSheetOpen, setIsSheetOpen] = React.useState(false)
  const [isFloating, setIsFloating] = React.useState(false)
  const [showConfirmReset, setShowConfirmReset] = React.useState(false)
  const [isMinimized, setIsMinimized] = React.useState(false)

  // Timer persistent state
  const [timerState, setTimerState] = React.useState<ExamTimerState>({
    startedAt: null,
    pausedAt: null,
    totalPausedMs: 0,
    finishedWritingAt: null,
    mode: "PRACTICE",
    soundEnabled: true,
  })

  // Live clock ticks
  const [clockNow, setClockNow] = React.useState<number>(0)
  const lastAlertPlayedRef = React.useRef<{ [key: string]: boolean }>({})

  // Initialize and load persisted state on client
  React.useEffect(() => {
    setIsMounted(true)
    setClockNow(Date.now())

    try {
      const stored = window.localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        setTimerState((prev) => ({
          ...prev,
          ...parsed,
        }))
      }
    } catch {
      // LocalStorage read error fallback
    }
  }, [storageKey])

  // Sync state to LocalStorage
  const updateTimerState = React.useCallback(
    (updater: (prev: ExamTimerState) => ExamTimerState) => {
      setTimerState((prev) => {
        const next = updater(prev)
        try {
          window.localStorage.setItem(storageKey, JSON.stringify(next))
        } catch {}
        return next
      })
    },
    [storageKey]
  )

  // Ticking effect when running
  React.useEffect(() => {
    if (!timerState.startedAt || timerState.pausedAt) return

    setClockNow(Date.now())
    const interval = window.setInterval(() => {
      setClockNow(Date.now())
    }, 1000)

    return () => window.clearInterval(interval)
  }, [timerState.startedAt, timerState.pausedAt])

  // Sticky visibility observer
  React.useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFloating(!entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Calculations
  const writingTotalSeconds = Math.max(1, durationMinutes * 60)
  const bufferTotalSeconds = Math.max(1, bufferMinutes * 60)

  let effectiveElapsedSeconds = 0
  if (timerState.startedAt) {
    const currentAnchor = timerState.pausedAt || clockNow || Date.now()
    const activeElapsedMs = Math.max(
      0,
      currentAnchor - timerState.startedAt - timerState.totalPausedMs
    )
    effectiveElapsedSeconds = Math.floor(activeElapsedMs / 1000)
  }

  // Determine active phase
  let phase: TimerPhase = "IDLE"
  if (timerState.startedAt) {
    if (timerState.finishedWritingAt) {
      const bufferElapsedSec = Math.floor(
        Math.max(0, (clockNow || Date.now()) - timerState.finishedWritingAt) / 1000
      )
      phase = bufferElapsedSec > bufferTotalSeconds ? "OVERTIME" : "BUFFER"
    } else if (effectiveElapsedSeconds < writingTotalSeconds) {
      phase = "WRITING"
    } else {
      const overtimeSec = effectiveElapsedSeconds - writingTotalSeconds
      phase = overtimeSec > bufferTotalSeconds ? "OVERTIME" : "BUFFER"
    }
  }

  // Countdown calculations
  const remainingWritingSeconds = writingTotalSeconds - effectiveElapsedSeconds
  const isWritingRunning =
    timerState.startedAt !== null &&
    timerState.pausedAt === null &&
    !timerState.finishedWritingAt
  const isPaused = timerState.pausedAt !== null

  // Progress percentage (0 - 100)
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((effectiveElapsedSeconds / writingTotalSeconds) * 100))
  )

  // Sound triggers at milestones
  React.useEffect(() => {
    if (!timerState.soundEnabled || !isWritingRunning) return

    // 50% milestone
    if (progressPercent >= 50 && !lastAlertPlayedRef.current["50%"]) {
      lastAlertPlayedRef.current["50%"] = true
      playChimeSound("milestone")
    }

    // 15 minutes remaining
    if (
      remainingWritingSeconds <= 15 * 60 &&
      remainingWritingSeconds > 14 * 60 &&
      !lastAlertPlayedRef.current["15m"]
    ) {
      lastAlertPlayedRef.current["15m"] = true
      playChimeSound("warning")
    }

    // 5 minutes remaining
    if (
      remainingWritingSeconds <= 5 * 60 &&
      remainingWritingSeconds > 4 * 60 &&
      !lastAlertPlayedRef.current["5m"]
    ) {
      lastAlertPlayedRef.current["5m"] = true
      playChimeSound("warning")
    }

    // Time's up
    if (remainingWritingSeconds <= 0 && !lastAlertPlayedRef.current["0m"]) {
      lastAlertPlayedRef.current["0m"] = true
      playChimeSound("finished")
    }
  }, [progressPercent, remainingWritingSeconds, timerState.soundEnabled, isWritingRunning])

  // Timer Actions
  const handleStart = () => {
    const now = Date.now()
    lastAlertPlayedRef.current = {}
    updateTimerState((prev) => ({
      ...prev,
      startedAt: now,
      pausedAt: null,
      totalPausedMs: 0,
      finishedWritingAt: null,
    }))
    setClockNow(now)
    setIsSheetOpen(true)
  }

  const handlePause = () => {
    if (timerState.mode === "STRICT") return
    const now = Date.now()
    updateTimerState((prev) => ({
      ...prev,
      pausedAt: now,
    }))
  }

  const handleResume = () => {
    const now = Date.now()
    updateTimerState((prev) => {
      const pauseDuration = prev.pausedAt ? now - prev.pausedAt : 0
      return {
        ...prev,
        pausedAt: null,
        totalPausedMs: prev.totalPausedMs + Math.max(0, pauseDuration),
      }
    })
    setClockNow(now)
  }

  const handleFinishWriting = () => {
    const now = Date.now()
    updateTimerState((prev) => ({
      ...prev,
      finishedWritingAt: now,
      pausedAt: null,
    }))
    setIsSheetOpen(false)
    if (onNavigateToUpload) {
      onNavigateToUpload()
    }
  }

  const handleReset = () => {
    lastAlertPlayedRef.current = {}
    updateTimerState(() => ({
      startedAt: null,
      pausedAt: null,
      totalPausedMs: 0,
      finishedWritingAt: null,
      mode: "PRACTICE",
      soundEnabled: true,
    }))
    setShowConfirmReset(false)
  }

  const toggleSound = () => {
    updateTimerState((prev) => ({ ...prev, soundEnabled: !prev.soundEnabled }))
  }

  const toggleMode = () => {
    if (timerState.startedAt) return
    updateTimerState((prev) => ({
      ...prev,
      mode: prev.mode === "PRACTICE" ? "STRICT" : "PRACTICE",
    }))
  }

  // Formatting digits for UI
  const displayCountdown =
    phase === "BUFFER" || phase === "OVERTIME"
      ? formatTimerDigits(
          timerState.finishedWritingAt
            ? bufferTotalSeconds -
                Math.floor(((clockNow || Date.now()) - timerState.finishedWritingAt) / 1000)
            : remainingWritingSeconds
        )
      : formatTimerDigits(remainingWritingSeconds)

  const displayElapsed = formatTimerDigits(effectiveElapsedSeconds)

  // Color scheme based on urgency
  const getUrgencyStyles = () => {
    if (phase === "OVERTIME") {
      return {
        cardBorder: "border-destructive/40 bg-destructive/5 dark:bg-destructive/10",
        badgeVariant: "destructive" as const,
        clockColor: "text-destructive font-black animate-pulse",
        progressColor: "bg-destructive",
        phaseLabel: "Overtime — Complete Upload Immediately",
      }
    }
    if (phase === "BUFFER") {
      return {
        cardBorder: "border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10",
        badgeVariant: "default" as const,
        clockColor: "text-amber-600 dark:text-amber-400 font-extrabold",
        progressColor: "bg-amber-500",
        phaseLabel: "Scanning & Upload Buffer Phase",
      }
    }
    if (remainingWritingSeconds <= 10 * 60 && phase === "WRITING") {
      return {
        cardBorder: "border-destructive/40 bg-destructive/5 dark:bg-destructive/10",
        badgeVariant: "destructive" as const,
        clockColor: "text-destructive font-black animate-pulse",
        progressColor: "bg-destructive",
        phaseLabel: "Final 10 Minutes — Conclude Writing",
      }
    }
    if (remainingWritingSeconds <= 30 * 60 && phase === "WRITING") {
      return {
        cardBorder: "border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10",
        badgeVariant: "default" as const,
        clockColor: "text-amber-600 dark:text-amber-400 font-extrabold",
        progressColor: "bg-amber-500",
        phaseLabel: "Final 30 Minutes of Writing",
      }
    }
    return {
      cardBorder: "border-border/80 bg-card/60 dark:bg-card/40",
      badgeVariant: "secondary" as const,
      clockColor: "text-foreground font-extrabold",
      progressColor: "bg-primary",
      phaseLabel:
        phase === "IDLE"
          ? "Ready to Start Examination"
          : "Subjective Writing Phase in Progress",
    }
  }

  const urgency = getUrgencyStyles()

  return (
    <>
      {/* 1. WORKSPACE TRIGGER / BANNER */}
      {variant === "compact" ? (
        <div ref={containerRef} className={cn("inline-flex items-center gap-2", className)}>
          {phase === "IDLE" ? (
            <Button
              type="button"
              size="sm"
              onClick={() => setIsSheetOpen(true)}
              className="h-9 rounded-xl bg-primary px-3.5 text-xs font-bold text-primary-foreground shadow-2xs hover:bg-hover-accent gap-1.5"
            >
              <Timer className="h-3.5 w-3.5" />
              <span>Exam Timer</span>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSheetOpen(true)}
              className={cn(
                "h-9 rounded-xl border px-3 text-xs font-bold shadow-2xs gap-2 transition-colors",
                urgency.cardBorder
              )}
            >
              <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
              <Timer className="h-3.5 w-3.5 text-primary" />
              <span
                suppressHydrationWarning
                className={cn("font-mono font-extrabold", urgency.clockColor)}
              >
                {isMounted ? displayCountdown.formatted : "03:00:00"}
              </span>
              <Badge variant={urgency.badgeVariant} className="text-[9px] h-4 px-1.5 font-semibold">
                {isPaused ? "PAUSED" : phase === "BUFFER" ? "BUFFER" : "WRITING"}
              </Badge>
            </Button>
          )}
        </div>
      ) : (
        <div
          ref={containerRef}
          className={cn(
            "relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all duration-300 shadow-xs",
            urgency.cardBorder,
            className
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Info & Status */}
            <div className="flex items-center gap-3.5">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                  phase === "IDLE"
                    ? "bg-primary/10 text-primary"
                    : phase === "OVERTIME"
                      ? "bg-destructive/15 text-destructive"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                )}
              >
                <Timer className="h-5 w-5" />
              </span>

              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-foreground sm:text-base">
                    Exam Simulation Timer
                  </h3>
                  <Badge
                    variant={urgency.badgeVariant}
                    className="text-[10px] sm:text-[11px] font-semibold tracking-wide"
                  >
                    {isPaused
                      ? "PAUSED"
                      : phase === "IDLE"
                        ? "NOT STARTED"
                        : phase === "WRITING"
                          ? "WRITING"
                          : phase === "BUFFER"
                            ? "BUFFER / UPLOAD"
                            : "OVERTIME"}
                  </Badge>
                  {timerState.mode === "STRICT" && (
                    <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                      Strict Mode
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {phase === "IDLE" ? (
                    <span>
                      Allotted: <strong>{durationMinutes} mins</strong> writing +{" "}
                      <strong>{bufferMinutes} mins</strong> upload buffer
                    </span>
                  ) : (
                    <span>
                      {urgency.phaseLabel} ·{" "}
                      <span suppressHydrationWarning className="font-mono font-semibold text-foreground">
                        {isMounted ? displayCountdown.formatted : "03:00:00"}
                      </span>{" "}
                      remaining ({progressPercent}% used)
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Right: Actions & Trigger Button */}
            <div className="flex items-center gap-2.5">
              {phase === "IDLE" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSheetOpen(true)}
                    className="rounded-xl border-border text-xs font-semibold hover:bg-muted"
                  >
                    View Timer Info
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleStart}
                    className="rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs hover:bg-hover-accent gap-1.5"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    Start Exam Timer
                  </Button>
                </>
              ) : (
                <>
                  {/* Live Countdown Chip inside banner */}
                  <div
                    suppressHydrationWarning
                    className={cn(
                      "hidden rounded-xl border border-border/80 bg-background/80 px-3 py-1.5 font-mono text-sm font-extrabold sm:block",
                      urgency.clockColor
                    )}
                  >
                    {isMounted ? displayCountdown.formatted : "03:00:00"}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsSheetOpen(true)}
                    className="rounded-xl bg-primary px-4 text-xs font-bold text-primary-foreground shadow-xs hover:bg-hover-accent gap-1.5"
                  >
                    <Timer className="h-3.5 w-3.5" />
                    Open Timer Drawer
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. FLOATING MINI-HUD PILL ON SCROLL */}
      {isFloating && phase !== "IDLE" && (
        <aside
          role="region"
          aria-label="Floating Exam Timer Pill"
          className={cn(
            "fixed bottom-5 right-5 z-40 transition-all duration-300 animate-in slide-in-from-bottom-5",
            isMinimized ? "w-auto" : "w-[92vw] max-w-sm"
          )}
        >
          <div className="rounded-2xl border border-primary/20 bg-background/95 p-3 shadow-xl backdrop-blur-md dark:bg-slate-900/95">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsSheetOpen(true)}
                className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Timer className="h-4 w-4" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      suppressHydrationWarning
                      className={cn(
                        "font-mono text-base font-black tracking-tight",
                        urgency.clockColor
                      )}
                    >
                      {displayCountdown.formatted}
                    </span>
                    <Badge variant={urgency.badgeVariant} className="text-[9px] h-4 px-1.5">
                      {isPaused ? "PAUSED" : phase === "BUFFER" ? "BUFFER" : "WRITING"}
                    </Badge>
                  </div>
                  {!isMinimized && (
                    <p className="text-[11px] text-muted-foreground">
                      Click to open full exam timer sheet ({progressPercent}%)
                    </p>
                  )}
                </div>
              </button>

              <div className="flex items-center gap-1.5">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setIsSheetOpen(true)}
                  className="h-8 rounded-lg px-2.5 text-xs font-bold gap-1"
                >
                  Sheet
                  <ArrowRight className="h-3 w-3" />
                </Button>
                <button
                  type="button"
                  onClick={() => setIsMinimized((prev) => !prev)}
                  title={isMinimized ? "Expand mini pill" : "Minimize mini pill"}
                  aria-label={isMinimized ? "Expand mini pill" : "Minimize mini pill"}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground"
                >
                  {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* 3. SHADCN SHEET: COMPLETE EXAM SIMULATION SUITE */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          side="right"
          className="flex h-full w-full flex-col justify-between overflow-y-auto sm:max-w-md md:max-w-lg p-5 sm:p-6"
        >
          {/* Sheet Header */}
          <SheetHeader className="space-y-2 border-b border-border/60 pb-4 text-left">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[11px] font-semibold border-primary/30 text-primary">
                Attempt #{currentAttemptNumber}
              </Badge>
              <Badge variant={urgency.badgeVariant} className="text-[11px] font-semibold">
                {isPaused
                  ? "PAUSED"
                  : phase === "IDLE"
                    ? "NOT STARTED"
                    : phase === "WRITING"
                      ? "WRITING PHASE"
                      : phase === "BUFFER"
                        ? "BUFFER / UPLOAD"
                        : "OVERTIME"}
              </Badge>
              {timerState.mode === "STRICT" && (
                <Badge variant="outline" className="text-[11px] border-amber-500/40 text-amber-700 dark:text-amber-300">
                  Strict Continuous
                </Badge>
              )}
            </div>

            <SheetTitle className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
              <Timer className="h-5 w-5 text-primary" />
              Exam Simulation Clock
            </SheetTitle>

            <SheetDescription className="text-xs text-muted-foreground leading-relaxed">
              Authentic UPSC CSE subjective examination simulation with real-time countdown, phase progression, and document scanning buffer.
            </SheetDescription>
          </SheetHeader>

          {/* Sheet Scrollable Body */}
          <div className="my-4 flex-1 space-y-6 overflow-y-auto pr-1">
            {/* Urgency Stage Alert Box */}
            <div
              className={cn(
                "rounded-xl border p-3.5 text-xs transition-colors",
                phase === "OVERTIME"
                  ? "border-destructive/40 bg-destructive/10 text-destructive"
                  : phase === "BUFFER"
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                    : remainingWritingSeconds <= 10 * 60 && phase === "WRITING"
                      ? "border-destructive/40 bg-destructive/10 text-destructive"
                      : "border-border bg-muted/40 text-muted-foreground"
              )}
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-foreground">
                    {urgency.phaseLabel}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">
                    {phase === "IDLE"
                      ? "Make sure your question paper and 24-page answer booklet are ready before starting."
                      : phase === "BUFFER"
                        ? "Writing time has concluded. Use this 20-minute buffer to photograph and merge pages into a single PDF."
                        : phase === "OVERTIME"
                          ? "Buffer expired. Upload your completed booklet right now to avoid submission penalty."
                          : "Maintain a steady writing pace of approximately 7 to 8 minutes per 10-mark question."}
                  </p>
                </div>
              </div>
            </div>

            {/* Giant Digital Time Readout */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border/80 bg-card p-6 text-center shadow-xs">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                {phase === "BUFFER" || phase === "OVERTIME"
                  ? "Upload Buffer Remaining"
                  : "Writing Time Remaining"}
              </span>

              <div
                suppressHydrationWarning
                className={cn(
                  "my-2 font-mono text-5xl sm:text-6xl tracking-tight select-none",
                  urgency.clockColor
                )}
              >
                {isMounted
                  ? displayCountdown.formatted
                  : `${Math.floor(durationMinutes / 60).toString().padStart(2, "0")}:${(durationMinutes % 60).toString().padStart(2, "0")}:00`}
              </div>

              {/* Quick Sub-Stats */}
              <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Total: {durationMinutes}m
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  Elapsed:{" "}
                  <span suppressHydrationWarning className="font-mono font-semibold">
                    {isMounted ? displayElapsed.formatted : "00:00:00"}
                  </span>
                </span>
                {timerState.totalPausedMs > 0 && (
                  <>
                    <span>•</span>
                    <span className="font-medium text-amber-600 dark:text-amber-400">
                      Paused: {Math.round(timerState.totalPausedMs / 60000)}m
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Progress Bar & Phase Milestones */}
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Exam Progression</span>
                <span className="font-mono text-foreground">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn("h-full transition-all duration-500 rounded-full", urgency.progressColor)}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      phase === "WRITING" ? "bg-primary animate-ping" : "bg-muted-foreground/40"
                    )}
                  />
                  <div className="leading-tight">
                    <p className="font-semibold text-foreground">Writing Window</p>
                    <p className="text-[11px] text-muted-foreground">{durationMinutes} minutes</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background p-2">
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full",
                      phase === "BUFFER" ? "bg-amber-500 animate-ping" : "bg-muted-foreground/40"
                    )}
                  />
                  <div className="leading-tight">
                    <p className="font-semibold text-foreground">Scan & Buffer</p>
                    <p className="text-[11px] text-muted-foreground">+{bufferMinutes} minutes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mode & Sound Utilities */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMode}
                  disabled={Boolean(timerState.startedAt)}
                  title={
                    timerState.mode === "STRICT"
                      ? "Strict Mode (Continuous Exam Clock)"
                      : "Practice Mode (Allows Pause/Resume)"
                  }
                  className={cn(
                    "inline-flex h-8 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors",
                    timerState.mode === "STRICT"
                      ? "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>{timerState.mode === "STRICT" ? "Strict Mode" : "Practice Mode"}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleSound}
                  title={timerState.soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
                  aria-label={timerState.soundEnabled ? "Mute audio chimes" : "Enable audio chimes"}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg border transition-colors",
                    timerState.soundEnabled
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  )}
                >
                  {timerState.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>
              </div>

              {timerState.startedAt && (
                <button
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  title="Reset exam timer"
                  aria-label="Reset exam timer"
                  className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs text-muted-foreground hover:border-destructive hover:text-destructive transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Reset Confirmation Overlay */}
            {showConfirmReset && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center animate-in fade-in-50">
                <AlertCircle className="mx-auto h-8 w-8 text-destructive mb-2" />
                <h4 className="text-sm font-bold text-foreground">Reset Exam Timer?</h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  This will reset the elapsed time and all phase milestones for this attempt.
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setShowConfirmReset(false)}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={handleReset}
                    className="h-8 text-xs font-bold"
                  >
                    Yes, Reset Timer
                  </Button>
                </div>
              </div>
            )}

            {/* UPSC Booklet & Margin Guidelines */}
            <div className="rounded-xl border border-border/80 bg-muted/30 p-3.5 text-xs space-y-1.5">
              <p className="font-bold text-foreground">Exam Writing Directives:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground text-[11px] leading-relaxed">
                <li>Write strictly inside the vertical margins of the official booklet.</li>
                <li>Label each answer clearly with its question number.</li>
                <li>When writing ends, photograph pages in natural light and combine them into a single PDF.</li>
              </ul>
            </div>
          </div>

          {/* Sheet Footer Action Controls */}
          <div className="space-y-2.5 border-t border-border/60 pt-4">
            {phase === "IDLE" ? (
              <Button
                type="button"
                onClick={handleStart}
                className="w-full gap-2 rounded-xl bg-primary py-5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-hover-accent"
              >
                <Play className="h-4 w-4 fill-current" />
                Start Exam Timer Now
              </Button>
            ) : isPaused ? (
              <Button
                type="button"
                onClick={handleResume}
                className="w-full gap-2 rounded-xl bg-primary py-5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-hover-accent"
              >
                <Play className="h-4 w-4 fill-current" />
                Resume Exam Timer
              </Button>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                {timerState.mode === "PRACTICE" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePause}
                    className="flex-1 gap-1.5 rounded-xl border-border text-xs font-semibold hover:border-primary"
                  >
                    <Pause className="h-3.5 w-3.5" />
                    Pause Timer
                  </Button>
                )}
                {!timerState.finishedWritingAt && (
                  <Button
                    type="button"
                    onClick={handleFinishWriting}
                    className="flex-1 gap-1.5 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-sm hover:bg-hover-accent"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Done Writing — Upload Booklet
                  </Button>
                )}
              </div>
            )}

            {/* Secondary Utility Controls */}
            <div className="flex items-center justify-between gap-2 pt-1">
              {onNavigateToUpload && phase !== "IDLE" && (
                <button
                  type="button"
                  onClick={() => {
                    setIsSheetOpen(false)
                    onNavigateToUpload()
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <UploadCloud className="h-3.5 w-3.5" />
                  Jump to Upload Box
                </button>
              )}

              <SheetClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                >
                  Close Sheet
                </Button>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
