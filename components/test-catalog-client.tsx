"use client"

import * as React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GlobalPagination } from "@/components/ui/pagination"
import { DataTable, DataTableColumn, DataTableFilter } from "@/components/ui/data-table"
import {
  ArrowRight,
  ArrowUpDown,
  Award,
  BookOpen,
  CheckCircle,
  Clock,
  Compass,
  Filter,
  Grid,
  Layers,
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface TestCatalogItem {
  id: string
  title: string
  slug: string
  description: string
  price: number // in paise (e.g. 49900 = ₹499)
  maxMarks: number
  durationMinutes: number
  maxAttempts: number
  studentInstructions?: string
  papersCount?: number
  templatesCount?: number
  createdAt?: string
}

export function TestCatalogClient({
  testSeriesList,
}: {
  testSeriesList: TestCatalogItem[]
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pricingFilter, setPricingFilter] = React.useState<"ALL" | "FREE" | "PAID">("ALL")
  const [categoryFilter, setCategoryFilter] = React.useState<string>("ALL")
  const [sortBy, setSortBy] = React.useState<"NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "MARKS_DESC" | "DURATION_DESC">("NEWEST")
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(6)

  // Filter & Search logic
  const filteredItems = React.useMemo(() => {
    let result = [...testSeriesList]

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.studentInstructions && t.studentInstructions.toLowerCase().includes(q))
      )
    }

    // 2. Pricing Filter
    if (pricingFilter === "FREE") {
      result = result.filter((t) => t.price === 0)
    } else if (pricingFilter === "PAID") {
      result = result.filter((t) => t.price > 0)
    }

    // 3. Category Filter
    if (categoryFilter !== "ALL") {
      result = result.filter((t) => {
        const text = `${t.title} ${t.description} ${t.slug}`.toLowerCase()
        if (categoryFilter === "UPSC") return text.includes("upsc") || text.includes("civil")
        if (categoryFilter === "STATE_PCS") return text.includes("state") || text.includes("pcs")
        if (categoryFilter === "JUDICIARY") return text.includes("judic") || text.includes("law")
        return true
      })
    }

    // 4. Sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "PRICE_ASC":
          return a.price - b.price
        case "PRICE_DESC":
          return b.price - a.price
        case "MARKS_DESC":
          return b.maxMarks - a.maxMarks
        case "DURATION_DESC":
          return b.durationMinutes - a.durationMinutes
        case "NEWEST":
        default:
          return (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
            (a.createdAt ? new Date(a.createdAt).getTime() : 0)
      }
    })

    return result
  }, [testSeriesList, searchQuery, pricingFilter, categoryFilter, sortBy])

  // Reset page on filter change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, pricingFilter, categoryFilter, sortBy])

  // Paginated slices for Grid View
  const paginatedGridItems = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredItems.slice(start, start + pageSize)
  }, [filteredItems, currentPage, pageSize])

  const hasActiveFilters = searchQuery !== "" || pricingFilter !== "ALL" || categoryFilter !== "ALL" || sortBy !== "NEWEST"

  const handleResetFilters = () => {
    setSearchQuery("")
    setPricingFilter("ALL")
    setCategoryFilter("ALL")
    setSortBy("NEWEST")
    setCurrentPage(1)
  }

  // Table view columns
  const tableColumns: DataTableColumn<TestCatalogItem>[] = [
    {
      id: "title",
      header: "Test Series Paper",
      sortable: true,
      sortAccessor: (t) => t.title,
      searchAccessor: (t) => `${t.title} ${t.description}`,
      cell: (t) => (
        <div className="space-y-1 max-w-sm whitespace-normal">
          <Link
            href={`/tests/${t.id}`}
            className="font-bold text-slate-900 dark:text-slate-100 hover:text-[#2A6AED] dark:hover:text-blue-400 transition-colors block leading-snug"
          >
            {t.title}
          </Link>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {t.description}
          </p>
        </div>
      ),
    },
    {
      id: "price",
      header: "Registration Fee",
      sortable: true,
      sortAccessor: (t) => t.price,
      cell: (t) =>
        t.price === 0 ? (
          <Badge className="bg-emerald-600 text-white font-bold text-[10px] border-0 px-2.5 py-0.5 rounded-full">
            FREE
          </Badge>
        ) : (
          <span className="font-extrabold text-[#2A6AED] dark:text-blue-400 text-sm">
            ₹{(t.price / 100).toLocaleString()}
          </span>
        ),
    },
    {
      id: "duration",
      header: "Duration",
      sortable: true,
      sortAccessor: (t) => t.durationMinutes,
      cell: (t) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          {t.durationMinutes} mins
        </span>
      ),
    },
    {
      id: "maxMarks",
      header: "Max Marks",
      sortable: true,
      sortAccessor: (t) => t.maxMarks,
      cell: (t) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <Award className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400" />
          {t.maxMarks} Marks
        </span>
      ),
    },
    {
      id: "attempts",
      header: "Attempt Allowance",
      sortable: true,
      sortAccessor: (t) => t.maxAttempts,
      cell: (t) => (
        <Badge
          variant="outline"
          className="border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 text-[10px] font-bold rounded-full"
        >
          {t.maxAttempts} Attempts
        </Badge>
      ),
    },
    {
      id: "action",
      header: "Action",
      headerClassName: "text-right",
      className: "text-right",
      cell: (t) => (
        <Link href={`/tests/${t.id}`}>
          <Button
            size="sm"
            className="h-8 px-3 rounded-lg bg-[#2A6AED] hover:bg-[#1E55C7] text-white text-xs font-semibold shadow-2xs"
          >
            View Details
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </Link>
      ),
    },
  ]

  const tableFilters: DataTableFilter<TestCatalogItem>[] = [
    {
      id: "pricing",
      label: "Pricing",
      accessor: (t) => (t.price === 0 ? "FREE" : "PAID"),
      options: [
        { label: "Free Tests", value: "FREE" },
        { label: "Paid Tests", value: "PAID" },
      ],
    },
    {
      id: "category",
      label: "Exam Stream",
      accessor: (t) => {
        const text = `${t.title} ${t.description}`.toLowerCase()
        if (text.includes("upsc") || text.includes("civil")) return "UPSC"
        if (text.includes("state") || text.includes("pcs")) return "STATE_PCS"
        if (text.includes("judic") || text.includes("law")) return "JUDICIARY"
        return "GENERAL"
      },
      options: [
        { label: "UPSC Civil Services", value: "UPSC" },
        { label: "State PCS Mains", value: "STATE_PCS" },
        { label: "Judicial Services", value: "JUDICIARY" },
      ],
    },
  ]

  return (
    <div className="space-y-8">
      {/* Search, Filter & Toolbar Bar */}
      <div className="flex flex-col gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests by title, syllabus, or keywords..."
              className="pl-10 pr-9 h-10 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-xs sm:text-sm focus-visible:ring-[#2A6AED]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Action Filters Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Pricing Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "inline-flex items-center justify-center h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1.5 transition-colors cursor-pointer shadow-2xs bg-white dark:bg-slate-900",
                  pricingFilter !== "ALL" && "border-[#2A6AED] text-[#2A6AED] bg-blue-50/50 dark:bg-blue-950/40"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {pricingFilter === "ALL"
                    ? "All Pricing"
                    : pricingFilter === "FREE"
                      ? "Free Tests"
                      : "Paid Tests"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 rounded-xl">
                <DropdownMenuRadioGroup
                  value={pricingFilter}
                  onValueChange={(v) => setPricingFilter(v as any)}
                >
                  <DropdownMenuRadioItem value="ALL" className="text-xs">
                    All Pricing Tiers
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="FREE" className="text-xs">
                    Free Registration
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="PAID" className="text-xs">
                    Paid Test Series
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Exam Stream Category Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  "inline-flex items-center justify-center h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1.5 transition-colors cursor-pointer shadow-2xs bg-white dark:bg-slate-900",
                  categoryFilter !== "ALL" && "border-[#2A6AED] text-[#2A6AED] bg-blue-50/50 dark:bg-blue-950/40"
                )}
              >
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {categoryFilter === "ALL"
                    ? "All Exams"
                    : categoryFilter === "UPSC"
                      ? "UPSC Civil Services"
                      : categoryFilter === "STATE_PCS"
                        ? "State PCS Mains"
                        : "Judicial Services"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuRadioGroup
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <DropdownMenuRadioItem value="ALL" className="text-xs">
                    All Examination Streams
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="UPSC" className="text-xs">
                    UPSC Civil Services
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="STATE_PCS" className="text-xs">
                    State PCS Mains
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="JUDICIARY" className="text-xs">
                    Judicial Services
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex items-center justify-center h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold gap-1.5 transition-colors cursor-pointer shadow-2xs bg-white dark:bg-slate-900"
              >
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                <span>
                  {sortBy === "NEWEST"
                    ? "Newest First"
                    : sortBy === "PRICE_ASC"
                      ? "Price: Low to High"
                      : sortBy === "PRICE_DESC"
                        ? "Price: High to Low"
                        : sortBy === "MARKS_DESC"
                          ? "Highest Marks"
                          : "Longest Duration"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuRadioGroup
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as any)}
                >
                  <DropdownMenuRadioItem value="NEWEST" className="text-xs">
                    Newest First
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="PRICE_ASC" className="text-xs">
                    Price: Low to High
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="PRICE_DESC" className="text-xs">
                    Price: High to Low
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="MARKS_DESC" className="text-xs">
                    Highest Max Marks
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="DURATION_DESC" className="text-xs">
                    Longest Duration
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Mode Toggle: Grid vs Table */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-50 dark:bg-slate-950">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                title="Grid Cards View"
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "grid"
                    ? "bg-white dark:bg-slate-800 text-[#2A6AED] shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                title="List Table View"
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  viewMode === "table"
                    ? "bg-white dark:bg-slate-800 text-[#2A6AED] shadow-2xs font-bold"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 px-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#2A6AED] gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Filter Summary Tags */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredItems.length}</strong> of {testSeriesList.length} test papers
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px]">Mode:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{viewMode} View</span>
          </div>
        </div>
      </div>

      {/* Render View Mode */}
      {viewMode === "grid" ? (
        filteredItems.length === 0 ? (
          <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-[#2A6AED]">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              No matching test series found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              We couldn't find any test series matching your search or active filters. Try resetting your criteria.
            </p>
            <Button
              onClick={handleResetFilters}
              size="sm"
              variant="outline"
              className="mt-2 rounded-xl text-xs"
            >
              Reset All Filters
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {paginatedGridItems.map((test) => {
                const isFree = test.price === 0
                const priceInRupees = test.price / 100

                return (
                  <div
                    key={test.id}
                    className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-7 flex flex-col justify-between shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="text-xs font-semibold border-blue-200 dark:border-blue-900 text-[#2A6AED] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                        >
                          {test.durationMinutes} Minutes
                        </Badge>
                        {isFree ? (
                          <Badge className="bg-emerald-600 text-white font-bold text-xs border-0 px-3 py-1 rounded-full">
                            Free Registration
                          </Badge>
                        ) : (
                          <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                            ₹{priceInRupees.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                        {test.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                        {test.description}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <Award className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                          <span>Max Marks: {test.maxMarks}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-[#2A6AED] dark:text-blue-400">
                          <CheckCircle className="h-4 w-4 text-[#2A6AED] dark:text-blue-400" />
                          <span>{test.maxAttempts} Attempts</span>
                        </div>
                      </div>

                      <Link href={`/tests/${test.id}`} className="block w-full">
                        <Button className="w-full bg-[#2A6AED] hover:bg-[#1E55C7] text-white font-semibold text-xs sm:text-sm h-11 rounded-xl shadow-xs">
                          View Test & Register
                          <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Grid Pagination */}
            <GlobalPagination
              totalItems={filteredItems.length}
              totalPages={Math.max(1, Math.ceil(filteredItems.length / pageSize))}
              pageSize={pageSize}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onPageSizeChange={(newSize) => {
                setPageSize(newSize)
                setCurrentPage(1)
              }}
              pageSizeOptions={[6, 9, 12, 18]}
            />
          </div>
        )
      ) : (
        /* Table View */
        <DataTable
          data={filteredItems}
          columns={tableColumns}
          keyExtractor={(t) => t.id}
          searchPlaceholder="Search catalog papers..."
          filters={tableFilters}
          defaultSortColumn="title"
          defaultSortDirection="asc"
          defaultPageSize={10}
          showSerialNumber={true}
          emptyTitle="No test series found"
          emptyDescription="No papers match your search and filter criteria."
        />
      )}
    </div>
  )
}
