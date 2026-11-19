import Link from "next/link"
import { Award, ArrowRight, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { TestCatalogItem } from "./test-catalog-client"

export function TestCatalogCard({
  item,
  compact = false,
}: {
  item: TestCatalogItem
  compact?: boolean
}) {
  const isFree = item.price === 0
  return (
    <Card
      className={
        compact
          ? "gap-4 py-4 shadow-none"
          : "h-full gap-5 shadow-none transition-colors hover:border-[#2A6AED]"
      }
    >
      <CardHeader className={compact ? "gap-1.5" : "gap-3"}>
        <div className="flex items-start justify-between gap-3">
          <Badge
            variant="secondary"
            className="rounded-sm text-[11px] font-semibold"
          >
            {item.durationMinutes} min
          </Badge>
          {isFree ? (
            <Badge
              variant="success"
              className="rounded-sm text-[10px] font-bold"
            >
              Free
            </Badge>
          ) : (
            <span className="text-lg font-extrabold text-primary">
              ₹{(item.price / 100).toLocaleString()}
            </span>
          )}
        </div>
        <CardTitle
          className={
            compact
              ? "text-base leading-snug"
              : "line-clamp-2 text-lg leading-snug"
          }
        >
          {item.title}
        </CardTitle>
        <p
          className={
            compact
              ? "line-clamp-2 text-xs leading-relaxed text-muted-foreground"
              : "line-clamp-3 text-sm leading-relaxed text-muted-foreground"
          }
        >
          {item.description}
        </p>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Award className="h-4 w-4 text-primary" />
          {item.maxMarks} marks
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle className="h-4 w-4 text-primary" />
          {item.maxAttempts} attempts
        </span>
      </CardContent>
      <CardFooter className="mt-auto border-t border-border pt-4">
        <Link href={`/tests/${item.id}`} className="w-full">
          <Button size={compact ? "sm" : "default"} className="w-full">
            View test <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
