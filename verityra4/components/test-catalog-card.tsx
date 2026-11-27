import Link from "next/link"
import { Award, ArrowRight, CheckCircle, Layers, BookOpen } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  entryPrice,
  formatInr,
  formatStandard,
} from "@/lib/test-catalog-projection"
import type { TestCatalogItem } from "./test-catalog-client"

export function TestCatalogCard({
  item,
  compact = false,
}: {
  item: TestCatalogItem
  compact?: boolean
}) {
  const isBundle = item.type === "BUNDLE"
  const bundleOnly = !isBundle && item.isStandalone === false
  const isFree = item.price === 0 && !bundleOnly

  return (
    <Card
      className={
        compact
          ? "gap-4 py-4 shadow-none"
          : isBundle
            ? "h-full gap-5 border-primary/50 shadow-none transition-colors hover:border-primary"
            : "h-full gap-5 shadow-none transition-colors hover:border-primary"
      }
    >
      <CardHeader className={compact ? "gap-1.5" : "gap-3"}>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {isBundle ? (
              <Badge variant="default" className="text-xs font-semibold">
                <Layers className="mr-1 h-3 w-3" aria-hidden="true" />
                Test series
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs font-semibold">
                <BookOpen className="mr-1 h-3 w-3" aria-hidden="true" />
                Subject test
              </Badge>
            )}
            {item.subject && item.subject !== "All Subjects" && (
              <Badge variant="secondary" className="text-xs font-medium">
                {item.subject}
              </Badge>
            )}
            {item.standard && (
              <Badge variant="secondary" className="text-xs font-medium">
                {formatStandard(item.standard)}
              </Badge>
            )}
          </div>

          <div className="text-right">
            {bundleOnly ? (
              <span className="text-sm font-semibold text-muted-foreground">
                In series
              </span>
            ) : isFree ? (
              <Badge variant="success" className="text-xs font-bold">
                Free
              </Badge>
            ) : (
              <span className="text-lg font-bold text-primary tabular-nums">
                {formatInr(item.price)}
              </span>
            )}
            {isBundle && (item.savingsAmount ?? 0) > 0 && (
              <span className="block text-xs font-semibold text-emerald-700 tabular-nums">
                Save {formatInr(item.savingsAmount as number)}
              </span>
            )}
          </div>
        </div>

        <CardTitle
          className={
            compact
              ? "text-base leading-snug"
              : "line-clamp-2 text-lg leading-snug font-bold"
          }
        >
          {item.title}
        </CardTitle>

        {item.parentSeriesTitle && (
          <p className="text-xs text-muted-foreground">
            Part of {item.parentSeriesTitle}
          </p>
        )}

        <p
          className={
            compact
              ? "line-clamp-2 text-xs leading-relaxed text-muted-foreground"
              : "line-clamp-3 text-sm leading-relaxed text-muted-foreground"
          }
        >
          {item.description}
        </p>

        {isBundle && item.includedSubjects && item.includedSubjects.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 pt-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Includes
            </span>
            {item.includedSubjects.map((sub) => (
              <span
                key={sub}
                className="rounded-sm bg-muted px-1.5 py-0.5 text-xs font-medium text-foreground"
              >
                {sub}
              </span>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        {isBundle ? (
          <>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Layers className="h-4 w-4 text-primary" aria-hidden="true" />
              {item.testsCount || 0} subject tests
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" aria-hidden="true" />
              {item.maxAttempts} attempts per test
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" aria-hidden="true" />
              {item.maxMarks} marks
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" aria-hidden="true" />
              {item.durationMinutes} min, {item.maxAttempts} attempts
            </span>
          </>
        )}
      </CardContent>

      <CardFooter className="mt-auto border-t border-border pt-4">
        <Link href={`/tests/${item.id}`} className="w-full">
          <Button
            size={compact ? "sm" : "default"}
            variant={isBundle ? "default" : "outline"}
            className="w-full font-semibold"
          >
            {isBundle
              ? "View test series"
              : bundleOnly
                ? `View series from ${formatInr(entryPrice(item))}`
                : "View subject test"}
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
