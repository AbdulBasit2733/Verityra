"use client"

import * as React from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { formatDate, formatTime, formatDateTimeFull } from "@/lib/format"

export type DateFilterPreset = "ALL" | "TODAY" | "LAST_7_DAYS" | "LAST_30_DAYS" | "CUSTOM"

export interface DateFilterValue {
  preset: DateFilterPreset
  selectedDate: Date | null
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export function isDateMatchingFilter(
  rawDate: string | Date | null | undefined,
  filter: DateFilterValue
): boolean {
  if (!filter || filter.preset === "ALL") return true
  if (!rawDate) return false

  const target = new Date(rawDate)
  if (isNaN(target.getTime())) return false

  const now = new Date()

  if (filter.preset === "TODAY") {
    return (
      target.getFullYear() === now.getFullYear() &&
      target.getMonth() === now.getMonth() &&
      target.getDate() === now.getDate()
    )
  }

  if (filter.preset === "LAST_7_DAYS") {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    return target >= sevenDaysAgo && target <= now
  }

  if (filter.preset === "LAST_30_DAYS") {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    return target >= thirtyDaysAgo && target <= now
  }

  if (filter.preset === "CUSTOM" && filter.selectedDate) {
    return (
      target.getFullYear() === filter.selectedDate.getFullYear() &&
      target.getMonth() === filter.selectedDate.getMonth() &&
      target.getDate() === filter.selectedDate.getDate()
    )
  }

  return true
}

/**
 * Interactive shadcn/ui Date Filter & Calendar Picker
 */
export function DateFilterPicker({
  value,
  onChange,
  placeholder = "Filter by date",
}: {
  value: DateFilterValue
  onChange: (next: DateFilterValue) => void
  placeholder?: string
}) {
  const [open, setOpen] = React.useState(false)
  const initialDate = value.selectedDate || new Date()
  const [viewMonth, setViewMonth] = React.useState(initialDate.getMonth())
  const [viewYear, setViewYear] = React.useState(initialDate.getFullYear())

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay()

  function handlePrevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  function handleNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  function selectSpecificDay(day: number) {
    const chosen = new Date(viewYear, viewMonth, day)
    onChange({ preset: "CUSTOM", selectedDate: chosen })
    setOpen(false)
  }

  const label = React.useMemo(() => {
    if (value.preset === "TODAY") return "Today"
    if (value.preset === "LAST_7_DAYS") return "Last 7 Days"
    if (value.preset === "LAST_30_DAYS") return "Last 30 Days"
    if (value.preset === "CUSTOM" && value.selectedDate) {
      return value.selectedDate.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    }
    return placeholder
  }, [value, placeholder])

  const isActive = value.preset !== "ALL"

  return (
    <div className="inline-flex items-center gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors cursor-pointer outline-none",
            isActive
              ? "border-blue-200 bg-[#EFF6FF] text-[#2A6AED]"
              : "border-slate-200/90 bg-white text-slate-700 hover:bg-slate-50"
          )}
        >
          <CalendarIcon className={cn("h-3.5 w-3.5", isActive ? "text-[#2A6AED]" : "text-slate-400")} />
          <span>{label}</span>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3 space-y-3" align="end">
          {/* Quick Presets */}
          <div className="grid grid-cols-2 gap-1.5 pb-2.5 border-b border-slate-100">
            {(
              [
                { id: "ALL", label: "All Dates" },
                { id: "TODAY", label: "Today" },
                { id: "LAST_7_DAYS", label: "Last 7 Days" },
                { id: "LAST_30_DAYS", label: "Last 30 Days" },
              ] as const
            ).map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  onChange({ preset: preset.id, selectedDate: null })
                  setOpen(false)
                }}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-[11px] font-semibold text-left transition-colors cursor-pointer",
                  value.preset === preset.id
                    ? "bg-[#2A6AED] text-white"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Calendar Month Header */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <span className="text-xs font-bold text-slate-900">
              {MONTHS[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="h-7 w-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {DAYS.map((d) => (
              <span key={d} className="text-[10px] font-bold text-slate-400 py-1">
                {d}
              </span>
            ))}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1
              const isSelected =
                value.preset === "CUSTOM" &&
                value.selectedDate &&
                value.selectedDate.getDate() === day &&
                value.selectedDate.getMonth() === viewMonth &&
                value.selectedDate.getFullYear() === viewYear

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectSpecificDay(day)}
                  className={cn(
                    "h-7 w-7 rounded-lg text-xs font-medium flex items-center justify-center transition-colors cursor-pointer mx-auto",
                    isSelected
                      ? "bg-[#2A6AED] text-white font-bold"
                      : "text-slate-700 hover:bg-[#EFF6FF] hover:text-[#2A6AED]"
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>

      {isActive && (
        <button
          type="button"
          onClick={() => onChange({ preset: "ALL", selectedDate: null })}
          className="h-9 w-8 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
          aria-label="Clear date filter"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

/**
 * Formatted Date Display Component for Table Cells
 */
export function FormattedDate({
  date,
  showTime = false,
  includeTime = false,
  className,
}: {
  date: string | Date | null | undefined
  showTime?: boolean
  includeTime?: boolean
  className?: string
}) {
  if (!date) return <span className="text-slate-400 text-xs">—</span>
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return <span className="text-slate-400 text-xs">—</span>

  const formattedDate = formatDate(parsed)
  const formattedTime = formatTime(parsed)
  const fullDateTime = formatDateTimeFull(parsed)

  return (
    <span
      title={fullDateTime}
      className={cn("inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium", className)}
    >
      <CalendarIcon className="h-3 w-3 text-slate-400 shrink-0" />
      <span>{formattedDate}</span>
      {(showTime || includeTime) && (
        <span className="text-[11px] text-slate-400">{formattedTime}</span>
      )}
    </span>
  )
}
