import Link from "next/link"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function DownloadEmptyState({
  filtered = false,
}: {
  filtered?: boolean
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-primary">
          <Download className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="text-lg font-bold text-foreground">
          {filtered ? "No downloads match" : "Your downloads will appear here"}
        </p>
        <p className="max-w-md text-sm leading-6 text-muted-foreground">
          {filtered
            ? "Try a different search term."
            : "Register for a test series to access its question paper and answer-sheet resources."}
        </p>
        {!filtered && (
          <Button render={<Link href="/tests" />} className="mt-2 h-11">
            Explore test series
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
