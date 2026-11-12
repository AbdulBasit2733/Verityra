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
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react"

export interface ConfirmOptions {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive" | "warning"
  badgeText?: string
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmDialogContext = React.createContext<ConfirmFn | null>(null)

export function useConfirm(): ConfirmFn {
  const context = React.useContext(ConfirmDialogContext)
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmDialogProvider")
  }
  return context
}

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const [options, setOptions] = React.useState<ConfirmOptions>({
    title: "Confirm Action",
    description: "Are you sure you want to proceed?",
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "default",
  })

  const resolverRef = React.useRef<((confirmed: boolean) => void) | null>(null)

  const confirm = React.useCallback(
    (opts: ConfirmOptions): Promise<boolean> => {
      setOptions({
        confirmText: "Confirm",
        cancelText: "Cancel",
        variant: "default",
        ...opts,
      })
      setOpen(true)
      return new Promise<boolean>((resolve) => {
        resolverRef.current = resolve
      })
    },
    []
  )

  const handleClose = React.useCallback((result: boolean) => {
    setOpen(false)
    if (resolverRef.current) {
      resolverRef.current(result)
      resolverRef.current = null
    }
  }, [])

  const variant = options.variant ?? "default"

  return (
    <ConfirmDialogContext.Provider value={confirm}>
      {children}
      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            handleClose(false)
          }
        }}
      >
        <DialogContent className="gap-5 rounded-2xl p-6 sm:max-w-md">
          <DialogHeader className="gap-3">
            <div className="flex items-start gap-3.5">
              <div
                className={
                  variant === "destructive"
                    ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600"
                    : variant === "warning"
                      ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 text-amber-600"
                      : "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] text-[#2A6AED]"
                }
              >
                {variant === "destructive" ? (
                  <ShieldAlert className="h-5 w-5" />
                ) : variant === "warning" ? (
                  <AlertTriangle className="h-5 w-5" />
                ) : (
                  <Info className="h-5 w-5" />
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                {options.badgeText && (
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wider text-slate-600 uppercase">
                    {options.badgeText}
                  </span>
                )}
                <DialogTitle className="text-base leading-snug font-bold text-[#0F172A]">
                  {options.title}
                </DialogTitle>
                <DialogDescription className="text-xs leading-relaxed text-[#64748B] sm:text-sm">
                  {options.description}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <DialogFooter className="gap-2.5 border-t border-slate-100 pt-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleClose(false)}
              className="h-9 rounded-lg border-slate-200 px-4 font-semibold text-slate-700"
            >
              {options.cancelText || "Cancel"}
            </Button>
            <Button
              type="button"
              variant={variant === "destructive" ? "destructive" : "default"}
              size="sm"
              onClick={() => handleClose(true)}
              className={
                variant === "destructive"
                  ? "h-9 rounded-lg bg-red-600 px-4 font-semibold text-white hover:bg-red-700"
                  : variant === "warning"
                    ? "h-9 rounded-lg bg-amber-600 px-4 font-semibold text-white hover:bg-amber-700"
                    : "h-9 rounded-lg bg-[#2A6AED] px-4 font-semibold text-white hover:bg-[#1E55C7]"
              }
            >
              <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
              {options.confirmText || "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ConfirmDialogContext.Provider>
  )
}
