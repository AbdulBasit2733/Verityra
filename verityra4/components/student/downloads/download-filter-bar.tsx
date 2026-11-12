"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function DownloadFilterBar({
  query,
  onQueryChange,
}: {
  query: string
  onQueryChange: (value: string) => void
}) {
  return (
    <div className="relative max-w-xl">
      <Search
        className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search papers and templates"
        aria-label="Search downloads"
        className="h-11 pl-9"
      />
    </div>
  )
}
