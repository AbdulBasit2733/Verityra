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
      <DialogContent className="max-w-4xl p-0 overflow-hidden sm:max-h-[90vh] flex flex-col border-[#DCE7FA] bg-white">
        <DialogHeader className="p-4 sm:p-5 border-b border-[#DCE7FA] bg-[#F1F6FF]/60 flex flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-[#DCE7FA] text-[#145DEB] shadow-xs">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base sm:text-lg font-bold text-[#071B3A] truncate font-heading">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#64748B] truncate">
                In-browser document preview
              </DialogDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <a href={fileUrl} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="h-9 gap-1.5 rounded-lg border-[#DCE7FA] text-xs font-semibold">
                <ExternalLink className="h-3.5 w-3.5 text-[#145DEB]" />
                <span className="hidden sm:inline">New Tab</span>
              </Button>
            </a>
            <a href={`${fileUrl}&download=1`} download>
              <Button size="sm" className="h-9 gap-1.5 rounded-lg bg-[#145DEB] hover:bg-[#0F4DC7] text-white text-xs font-semibold">
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </a>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-[60vh] bg-slate-100 flex items-center justify-center relative">
          <iframe
            src={`${fileUrl}#toolbar=0`}
            title={title}
            className="w-full h-[65vh] border-0"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
