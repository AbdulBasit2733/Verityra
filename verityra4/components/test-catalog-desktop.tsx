"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GlobalPagination } from "@/components/ui/pagination"
import { Card, CardContent } from "@/components/ui/card"
import { Filter, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react"
import { TestCatalogCard } from "./test-catalog-card"
import { useTestCatalogState } from "./test-catalog-state"
import type { TestCatalogItem } from "./test-catalog-client"

export function TestCatalogDesktop({ items }: { items: TestCatalogItem[] }) {
  const state = useTestCatalogState(items)
  return <div className="hidden lg:grid lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-8">
    <aside className="sticky top-24 space-y-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Catalog workspace</p><h2 className="mt-1 text-lg font-bold text-foreground">Find your next paper</h2></div>
      <Card className="shadow-sm"><CardContent className="space-y-5 p-5">
        <div className="space-y-2"><Label className="text-xs font-bold">Exam stream</Label><Select value={state.categoryFilter} onValueChange={(value) => state.setCategoryFilter(value || "ALL")}><SelectTrigger className="w-full" size="sm"><SelectValue placeholder="All exams" /></SelectTrigger><SelectContent><SelectItem value="ALL">All examination streams</SelectItem><SelectItem value="UPSC">UPSC Civil Services</SelectItem><SelectItem value="STATE_PCS">State PCS Mains</SelectItem><SelectItem value="JUDICIARY">Judicial Services</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label className="text-xs font-bold">Pricing</Label><div className="grid grid-cols-1 gap-1.5">{[["ALL", "All pricing"], ["FREE", "Free registration"], ["PAID", "Paid series"]].map(([value, label]) => <Button key={value} type="button" variant={state.pricingFilter === value ? "secondary" : "ghost"} size="sm" className="justify-start text-xs" onClick={() => state.setPricingFilter(value as "ALL" | "FREE" | "PAID")}>{label}</Button>)}</div></div>
        <div className="border-t border-border pt-4 text-xs text-muted-foreground"><div className="flex items-center justify-between"><span>Available papers</span><strong className="text-foreground">{items.length}</strong></div><div className="mt-2 flex items-center justify-between"><span>Matching results</span><strong className="text-primary">{state.filteredItems.length}</strong></div></div>
        {state.hasActiveFilters && <Button type="button" variant="outline" size="sm" className="w-full" onClick={state.reset}><RotateCcw className="h-3.5 w-3.5" /> Reset filters</Button>}
      </CardContent></Card>
    </aside>
    <section className="min-w-0 space-y-5">
      <div className="flex flex-col gap-4 border-b border-border pb-5 xl:flex-row xl:items-center xl:justify-between"><div className="relative min-w-0 flex-1 xl:max-w-xl"><Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={state.searchQuery} onChange={(e) => state.setSearchQuery(e.target.value)} placeholder="Search papers, subjects, or keywords" className="h-11 pl-10 pr-10" />{state.searchQuery && <button type="button" onClick={() => state.setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-4 w-4" /></button>}</div><div className="flex items-center gap-2"><Select value={state.sortBy} onValueChange={(value) => state.setSortBy(value as typeof state.sortBy)}><SelectTrigger size="sm" className="w-[180px]"><SlidersHorizontal className="h-3.5 w-3.5" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="NEWEST">Newest first</SelectItem><SelectItem value="PRICE_ASC">Price: low to high</SelectItem><SelectItem value="PRICE_DESC">Price: high to low</SelectItem><SelectItem value="MARKS_DESC">Highest marks</SelectItem><SelectItem value="DURATION_DESC">Longest duration</SelectItem></SelectContent></Select></div></div>
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-foreground">Available test series</h2><p className="text-xs text-muted-foreground">Showing {state.filteredItems.length} of {items.length} papers</p></div><Badge variant="outline" className="hidden gap-1.5 sm:inline-flex"><Filter className="h-3 w-3" /> Curated catalog</Badge></div>
      {state.pageItems.length ? <div className="grid grid-cols-2 gap-5 xl:grid-cols-3">{state.pageItems.map((item) => <TestCatalogCard key={item.id} item={item} />)}</div> : <EmptyCatalog onReset={state.reset} />}
      <GlobalPagination totalItems={state.filteredItems.length} totalPages={Math.max(1, Math.ceil(state.filteredItems.length / state.pageSize))} pageSize={state.pageSize} currentPage={state.currentPage} onPageChange={state.setCurrentPage} onPageSizeChange={(size) => { state.setPageSize(size); state.setCurrentPage(1) }} pageSizeOptions={[6, 9, 12]} />
    </section>
  </div>
}

function EmptyCatalog({ onReset }: { onReset: () => void }) { return <div className="border border-dashed border-border px-6 py-16 text-center"><Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><h3 className="font-bold">No matching test series</h3><p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">Try another search or clear the filters to view the full catalog.</p><Button variant="outline" size="sm" className="mt-4" onClick={onReset}>Reset filters</Button></div> }
