"use client"

import * as React from "react"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastVariant = "default" | "success" | "error" | "warning" | "info"

export interface ToastItem {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration?: number
}

type ToastListener = (toasts: ToastItem[]) => void

let toastsState: ToastItem[] = []
const listeners = new Set<ToastListener>()

function notify() {
  listeners.forEach((listener) => listener([...toastsState]))
}

function addToast(item: Omit<ToastItem, "id">) {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const newToast: ToastItem = { id, duration: 4500, ...item }
  toastsState = [newToast, ...toastsState].slice(0, 5)
  notify()

  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      dismissToast(id)
    }, newToast.duration)
  }
  return id
}

export function dismissToast(id: string) {
  toastsState = toastsState.filter((t) => t.id !== id)
  notify()
}

export const toast = Object.assign(
  (title: string, options?: { description?: string; duration?: number }) =>
    addToast({ title, variant: "default", ...options }),
  {
    success: (
      title: string,
      options?: { description?: string; duration?: number }
    ) => addToast({ title, variant: "success", ...options }),
    error: (
      title: string,
      options?: { description?: string; duration?: number }
    ) => addToast({ title, variant: "error", duration: 6000, ...options }),
    warning: (
      title: string,
      options?: { description?: string; duration?: number }
    ) => addToast({ title, variant: "warning", ...options }),
    info: (
      title: string,
      options?: { description?: string; duration?: number }
    ) => addToast({ title, variant: "info", ...options }),
    dismiss: dismissToast,
  }
)

export function Toaster({
  position = "bottom-right",
}: {
  position?: "bottom-right" | "top-right" | "top-center"
}) {
  const [items, setItems] = React.useState<ToastItem[]>([])

  React.useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  if (items.length === 0) return null

  const posClasses =
    position === "top-right"
      ? "top-4 right-4"
      : position === "top-center"
        ? "top-4 left-1/2 -translate-x-1/2"
        : "bottom-4 right-4"

  return (
    <div
      data-slot="sonner-toaster"
      aria-live="polite"
      className={cn(
        "pointer-events-none fixed z-[100] flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2.5",
        posClasses
      )}
    >
      {items.map((item) => {
        const icon =
          item.variant === "success" ? (
            <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600" />
          ) : item.variant === "error" ? (
            <AlertCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-600" />
          ) : item.variant === "warning" ? (
            <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-600" />
          ) : (
            <Info className="mt-0.5 h-4.5 w-4.5 shrink-0 text-[#2A6AED]" />
          )

        return (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto flex animate-in items-start justify-between gap-3 rounded-xl border border-border bg-popover p-3.5 text-popover-foreground shadow-xl transition-all duration-200 fade-in slide-in-from-bottom-2",
              item.variant === "error" &&
                "border-red-300 dark:border-red-800/70",
              item.variant === "success" &&
                "border-emerald-300 dark:border-emerald-800/70",
              item.variant === "warning" &&
                "border-amber-300 dark:border-amber-800/70"
            )}
          >
            <div className="flex min-w-0 items-start gap-2.5">
              {icon}
              <div className="min-w-0 space-y-0.5">
                <p className="text-xs leading-snug font-semibold text-foreground sm:text-[13px]">
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-[11.5px] leading-relaxed break-words text-muted-foreground">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(item.id)}
              className="shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
