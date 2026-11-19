"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalLink, Download, FileText, X } from "lucide-react"

interface AdminPdfPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  fileUrl: string
}

export function AdminPdfPreviewModal({
  open,
  onOpenChange,
  title,
  fileUrl,
}: AdminPdfPreviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-w-4xl flex-col overflow-hidden border-[#DCE7FA] bg-white p-0 sm:max-h-[90vh]">
        <DialogHeader className="flex flex-row items-center justify-between gap-4 border-b border-[#DCE7FA] bg-[#F1F6FF]/60 p-4 sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm border border-[#DCE7FA] bg-white text-[#145DEB] shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="truncate font-heading text-base font-bold text-[#071B3A] sm:text-lg">
                {title}
              </DialogTitle>
              <DialogDescription className="truncate text-xs text-[#64748B]">
                In-browser document preview
              </DialogDescription>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <a href={fileUrl} target="_blank" rel="noreferrer">
              <Button
                size="sm"
                variant="outline"
                className="h-9 gap-1.5 rounded-md border-[#DCE7FA] text-xs font-semibold"
              >
                <ExternalLink className="h-3.5 w-3.5 text-[#145DEB]" />
                <span className="hidden sm:inline">New Tab</span>
              </Button>
            </a>
            <a href={`${fileUrl}&download=1`} download>
              <Button
                size="sm"
                className="h-9 gap-1.5 rounded-md bg-[#145DEB] text-xs font-semibold text-white hover:bg-[#0F4DC7]"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </a>
          </div>
        </DialogHeader>

        <div className="relative flex min-h-[60vh] flex-1 items-center justify-center bg-slate-100">
          <iframe
            src={`${fileUrl}#toolbar=0`}
            title={title}
            className="h-[65vh] w-full border-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
