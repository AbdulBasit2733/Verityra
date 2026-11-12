"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/sonner"
import { AlertOctagon, Copy, Check } from "lucide-react"

export interface GlobalErrorPayload {
  title: string
  message: string
  code?: string
  details?: string
  alsoToast?: boolean
}

interface ErrorDialogContextValue {
  showError: (payload: GlobalErrorPayload) => void
  clearError: () => void
}

const ErrorDialogContext = React.createContext<ErrorDialogContextValue | null>(
  null
)

export function useGlobalError(): ErrorDialogContextValue {
  const context = React.useContext(ErrorDialogContext)
  if (!context) {
    throw new Error("useGlobalError must be used within an ErrorDialogProvider")
  }
  return context
}

export function ErrorDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<GlobalErrorPayload | null>(null)
  const [copied, setCopied] = React.useState(false)

  const showError = React.useCallback((payload: GlobalErrorPayload) => {
    setError(payload)
    setOpen(true)
    if (payload.alsoToast !== false) {
      toast.error(payload.title, {
        description: payload.message,
      })
    }
  }, [])

  const clearError = React.useCallback(() => {
    setOpen(false)
  }, [])

  const handleCopyDetails = () => {
    if (!error) return
    const text = `[${error.code || "ERR"}] ${error.title}: ${error.message}${
      error.details ? `\n${error.details}` : ""
    }`
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <ErrorDialogContext.Provider value={{ showError, clearError }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="gap-5 rounded-2xl border-red-200 p-6 sm:max-w-md">
          <DialogHeader className="gap-3">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
                <AlertOctagon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-700 uppercase">
                    {error?.code || "Action Blocked"}
                  </span>
                </div>
                <DialogTitle className="text-base leading-snug font-bold text-[#0F172A]">
                  {error?.title || "Operation Failed"}
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-[#64748B] sm:text-sm">
                  {error?.message}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {error?.details && (
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 font-mono text-xs break-words text-slate-600">
              {error.details}
            </div>
          )}

          <DialogFooter className="gap-2 border-t border-slate-100 pt-2 sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleCopyDetails}
              className="h-8 px-2.5 text-xs text-slate-500 hover:text-slate-800"
            >
              {copied ? (
                <>
                  <Check className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-1 h-3.5 w-3.5" />
                  Copy diagnostic
                </>
              )}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => setOpen(false)}
              className="h-9 rounded-lg bg-[#0F172A] px-4 font-semibold text-white hover:bg-slate-800"
            >
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ErrorDialogContext.Provider>
  )
}
