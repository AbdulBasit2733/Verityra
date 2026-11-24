import Link from "next/link"
import { Award, ArrowRight, CheckCircle, Layers, BookOpen, Sparkles } from "lucide-react"
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
  const isBundle = item.type === "BUNDLE"
  const isFree = item.price === 0

  return (
    <Card
      className={
        compact
          ? "gap-4 py-4 shadow-none"
          : isBundle
            ? "h-full gap-5 border-2 border-primary/40 bg-gradient-to-b from-primary/[0.03] to-transparent shadow-xs transition-all hover:border-primary hover:shadow-md"
            : "h-full gap-5 shadow-none transition-colors hover:border-[#2A6AED]"
      }
    >
      <CardHeader className={compact ? "gap-1.5" : "gap-3"}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {isBundle ? (
              <Badge
                variant="default"
                className="bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wide"
              >
                <Layers className="mr-1 h-3 w-3" /> All-Subjects Bundle
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-slate-300 text-[10px] font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
              >
                <BookOpen className="mr-1 h-3 w-3 text-slate-500" /> Single Test
              </Badge>
            )}

            {item.subject && item.subject !== "All Subjects" && (
              <Badge variant="secondary" className="text-[10px] font-medium">
                {item.subject}
              </Badge>
            )}

            {item.standard && (
              <Badge variant="secondary" className="text-[10px] font-semibold">
                Class {item.standard}
              </Badge>
            )}
          </div>

          <div>
            {isFree ? (
              <Badge
                variant="success"
                className="rounded-sm text-[10px] font-bold"
              >
                Free
              </Badge>
            ) : (
              <div className="text-right">
                <span className="text-lg font-extrabold text-primary">
                  ₹{(item.price / 100).toLocaleString()}
                </span>
                {isBundle && (
                  <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Bundle Savings
                  </span>
                )}
              </div>
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
            <span className="text-[11px] font-semibold text-muted-foreground">
              Includes:
            </span>
            {item.includedSubjects.map((sub) => (
              <span
                key={sub}
                className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground"
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
              <Layers className="h-4 w-4 text-primary" />
              {item.testsCount || 4} Full Subject Tests
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
              3 Attempts / Test
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-primary" />
              {item.maxMarks} marks
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-primary" />
              {item.durationMinutes} min · {item.maxAttempts} attempts
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
            {isBundle ? "View Complete Bundle" : "View Subject Test"}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
