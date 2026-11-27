"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GlobalPagination } from "@/components/ui/pagination"
import { Filter, RotateCcw, Search, X } from "lucide-react"
import { TestCatalogCard } from "./test-catalog-card"
import { useTestCatalogState } from "./test-catalog-state"
import type { TestCatalogItem } from "./test-catalog-client"

export function TestCatalogMobile({ items }: { items: TestCatalogItem[] }) {
  const state = useTestCatalogState(items)
  return (
    <div className="space-y-5 lg:hidden">
      <div className="space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={state.searchQuery}
            onChange={(e) => state.setSearchQuery(e.target.value)}
            placeholder="Search test series"
            className="h-11 bg-card pr-10 pl-10"
          />
          {state.searchQuery && (
            <button
              type="button"
              onClick={() => state.setSearchQuery("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Format selector pills: All / Bundles / Single Tests */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            ["ALL", "All formats", state.formatCounts.all],
            ["BUNDLE", "Test series", state.formatCounts.bundle],
            ["SINGLE", "Subject tests", state.formatCounts.single],
          ].map(([value, label, count]) => (
            <Button
              key={value}
              type="button"
              variant={state.formatFilter === value ? "default" : "secondary"}
              size="sm"
              className="shrink-0 text-xs font-semibold"
              onClick={() => state.setFormatFilter(value as "ALL" | "BUNDLE" | "SINGLE")}
              aria-pressed={state.formatFilter === value}
            >
              {label} ({count})
            </Button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {[
            ["ALL", "All streams"],
            ["SCHOOL_BOARDS", "Boards"],
            ["NEET", "NEET-UG"],
            ["JEE", "JEE"],
            ["FOUNDATION_OLYMPIADS", "Olympiads & NTSE"],
            ["UGC_NET_ENGLISH", "UGC NET & English"],
          ].map(([value, label]) => (
            <Button
              key={value}
              type="button"
              variant={
                state.categoryFilter === value ? "secondary" : "outline"
              }
              size="sm"
              className="shrink-0"
              onClick={() => state.setCategoryFilter(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 border-y border-border py-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Filter className="h-3 w-3" /> {state.filteredItems.length} papers
          </Badge>
          {state.pricingFilter !== "ALL" && (
            <Badge variant="secondary">
              {state.pricingFilter === "FREE" ? "Free" : "Paid"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={state.sortBy}
            onValueChange={(value) =>
              state.setSortBy(value as typeof state.sortBy)
            }
          >
            <SelectTrigger size="sm" className="w-[142px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NEWEST">Newest</SelectItem>
              <SelectItem value="PRICE_ASC">Lowest price</SelectItem>
              <SelectItem value="PRICE_DESC">Highest price</SelectItem>
              <SelectItem value="MARKS_DESC">Most marks</SelectItem>
              <SelectItem value="DURATION_DESC">Longest</SelectItem>
            </SelectContent>
          </Select>
          {state.hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={state.reset}
              aria-label="Reset filters"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      {state.pageItems.length ? (
        <div className="space-y-4">
          {state.pageItems.map((item) => (
            <TestCatalogCard key={item.id} item={item} compact />
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border px-5 py-12 text-center">
          <Search className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
          <p className="text-sm font-bold">No matching papers</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={state.reset}
          >
            Reset filters
          </Button>
        </div>
      )}
      <GlobalPagination
        totalItems={state.filteredItems.length}
        totalPages={Math.max(
          1,
          Math.ceil(state.filteredItems.length / state.pageSize)
        )}
        pageSize={state.pageSize}
        currentPage={state.currentPage}
        onPageChange={state.setCurrentPage}
        onPageSizeChange={(size) => {
          state.setPageSize(size)
          state.setCurrentPage(1)
        }}
        pageSizeOptions={[4, 6, 9]}
      />
    </div>
  )
}
