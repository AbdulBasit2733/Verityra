"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DateFilterPicker,
  DateFilterValue,
  isDateMatchingFilter,
} from "@/components/ui/date-picker"
import { GlobalPagination } from "@/components/ui/pagination"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Filter,
  RotateCcw,
  Search,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface DataTableColumn<T> {
  id: string
  header: string
  accessor?: (row: T) => React.ReactNode
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  sortAccessor?: (row: T) => string | number | Date | null | undefined
  searchAccessor?: (row: T) => string
  className?: string
  headerClassName?: string
}

export interface DataTableFilterOption {
  label: string
  value: string
}

export interface DataTableFilter<T> {
  id: string
  label: string
  options: DataTableFilterOption[]
  accessor: (row: T) => string
  defaultValue?: string
}

export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  keyExtractor: (row: T) => string
  searchPlaceholder?: string
  filters?: DataTableFilter<T>[]
  dateAccessor?: (row: T) => Date | string | null | undefined
  dateFilterLabel?: string
  defaultSortColumn?: string
  defaultSortDirection?: "asc" | "desc"
  defaultPageSize?: number
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  toolbarActions?: React.ReactNode
  className?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = "Search records...",
  filters = [],
  dateAccessor,
  dateFilterLabel = "Filter by date",
  defaultSortColumn,
  defaultSortDirection = "desc",
  defaultPageSize = 10,
  emptyTitle = "No matching records found",
  emptyDescription = "Try adjusting your search query, status filters, or date range.",
  emptyAction,
  toolbarActions,
  className,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState<Record<string, string>>(
    () => {
      const initial: Record<string, string> = {}
      for (const f of filters) {
        initial[f.id] = f.defaultValue || "ALL"
      }
      return initial
    }
  )
  const [dateFilter, setDateFilter] = React.useState<DateFilterValue>({
    preset: "ALL",
    selectedDate: null,
  })
  const [sortColumn, setSortColumn] = React.useState<string | null>(
    defaultSortColumn || null
  )
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">(
    defaultSortDirection
  )
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(defaultPageSize)

  const handleSort = (colId: string) => {
    if (sortColumn === colId) {
      if (sortDirection === "asc") {
        setSortDirection("desc")
      } else {
        setSortColumn(null)
      }
    } else {
      setSortColumn(colId)
      setSortDirection("asc")
    }
    setCurrentPage(1)
  }

  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }))
    setCurrentPage(1)
  }

  const hasActiveControls = React.useMemo(() => {
    if (searchQuery.trim().length > 0) return true
    if (dateFilter.preset !== "ALL") return true
    for (const f of filters) {
      if ((activeFilters[f.id] || "ALL") !== "ALL") return true
    }
    return false
  }, [searchQuery, dateFilter, filters, activeFilters])

  const resetAllFilters = () => {
    setSearchQuery("")
    const resetMap: Record<string, string> = {}
    for (const f of filters) {
      resetMap[f.id] = "ALL"
    }
    setActiveFilters(resetMap)
    setDateFilter({ preset: "ALL", selectedDate: null })
    setCurrentPage(1)
  }

  // 1. Filter by search, dropdowns, and date
  const filteredData = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return data.filter((row) => {
      // Search check
      if (query.length > 0) {
        const matchesSearch = columns.some((col) => {
          if (col.searchAccessor) {
            return col.searchAccessor(row).toLowerCase().includes(query)
          }
          if (col.sortAccessor) {
            const val = col.sortAccessor(row)
            return val !== null && val !== undefined
              ? String(val).toLowerCase().includes(query)
              : false
          }
          return false
        })
        if (!matchesSearch) return false
      }

      // Dropdown filters check
      for (const filter of filters) {
        const selectedVal = activeFilters[filter.id] || "ALL"
        if (selectedVal !== "ALL") {
          const rowVal = filter.accessor(row)
          if (rowVal !== selectedVal) return false
        }
      }

      // Date filter check
      if (dateAccessor && dateFilter.preset !== "ALL") {
        const rowDate = dateAccessor(row)
        if (!isDateMatchingFilter(rowDate, dateFilter)) return false
      }

      return true
    })
  }, [data, columns, searchQuery, filters, activeFilters, dateAccessor, dateFilter])

  // 2. Sort filtered rows
  const sortedData = React.useMemo(() => {
    if (!sortColumn) return filteredData
    const col = columns.find((c) => c.id === sortColumn)
    if (!col || !col.sortable) return filteredData

    const accessor = col.sortAccessor
    if (!accessor) return filteredData

    return [...filteredData].sort((a, b) => {
      const valA = accessor(a)
      const valB = accessor(b)

      if (valA === valB) return 0
      if (valA === null || valA === undefined) return 1
      if (valB === null || valB === undefined) return -1

      let comparison = 0
      if (valA instanceof Date && valB instanceof Date) {
        comparison = valA.getTime() - valB.getTime()
      } else if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB
      } else {
        comparison = String(valA).localeCompare(String(valB), undefined, {
          numeric: true,
          sensitivity: "base",
        })
      }

      return sortDirection === "asc" ? comparison : -comparison
    })
  }, [filteredData, sortColumn, sortDirection, columns])

  // 3. Paginate sorted rows
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize])

  // Ensure current page is valid when data shrinks
  React.useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(sortedData.length / pageSize))
    if (currentPage > maxPage) {
      setCurrentPage(maxPage)
    }
  }, [sortedData.length, pageSize, currentPage])

  return (
    <div className={cn("space-y-3", className)}>
      {/* Table Toolbar: Search + Dropdown Filters + Date Picker + Actions */}
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={searchPlaceholder}
              className="h-9 pl-9 pr-8 rounded-lg border-slate-200 bg-white text-xs sm:text-sm shadow-2xs focus-visible:ring-[#2A6AED]/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setCurrentPage(1)
                }}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Dropdown Menu Filters */}
          {filters.map((filter) => {
            const currentVal = activeFilters[filter.id] || "ALL"
            const activeOption = filter.options.find((o) => o.value === currentVal)
            const isFiltered = currentVal !== "ALL"

            return (
              <DropdownMenu key={filter.id}>
                <DropdownMenuTrigger
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors outline-none cursor-pointer",
                    isFiltered
                      ? "border-[#2A6AED]/30 bg-[#EFF6FF] text-[#2A6AED]"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <Filter className="h-3.5 w-3.5 shrink-0" />
                  <span>{filter.label}</span>
                  {isFiltered && activeOption && (
                    <Badge className="ml-0.5 h-5 rounded-md bg-[#2A6AED] px-1.5 py-0 text-[10px] font-bold text-white border-0">
                      {activeOption.label}
                    </Badge>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-52">
                  <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Filter by {filter.label}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={currentVal}
                    onValueChange={(val) => handleFilterChange(filter.id, val)}
                  >
                    <DropdownMenuRadioItem value="ALL" className="text-xs font-medium">
                      All {filter.label}
                    </DropdownMenuRadioItem>
                    {filter.options.map((opt) => (
                      <DropdownMenuRadioItem
                        key={opt.value}
                        value={opt.value}
                        className="text-xs font-medium"
                      >
                        {opt.label}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}

          {/* Date Filter Picker */}
          {dateAccessor && (
            <DateFilterPicker
              value={dateFilter}
              onChange={(next) => {
                setDateFilter(next)
                setCurrentPage(1)
              }}
              placeholder={dateFilterLabel}
            />
          )}

          {/* Reset Filters Button */}
          {hasActiveControls && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={resetAllFilters}
              className="h-9 px-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {/* Right Toolbar Slot */}
        {toolbarActions && (
          <div className="flex items-center gap-2 shrink-0">{toolbarActions}</div>
        )}
      </div>

      {/* shadcn Table */}
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            {columns.map((col) => {
              const isSorted = sortColumn === col.id
              return (
                <TableHead
                  key={col.id}
                  className={cn(
                    "h-11 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500",
                    col.headerClassName
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 uppercase tracking-wider transition-colors hover:text-[#0F172A] cursor-pointer select-none",
                        isSorted && "text-[#2A6AED] font-bold"
                      )}
                    >
                      <span>{col.header}</span>
                      {isSorted ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-3.5 w-3.5 text-[#2A6AED]" />
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5 text-[#2A6AED]" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 opacity-70" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              )
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className="h-48 text-center align-middle"
              >
                <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 py-6">
                  <p className="text-sm font-bold text-[#0F172A]">{emptyTitle}</p>
                  <p className="text-xs text-[#64748B] whitespace-normal leading-relaxed">
                    {emptyDescription}
                  </p>
                  {hasActiveControls ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resetAllFilters}
                      className="mt-2 h-8 px-3 text-xs font-semibold"
                    >
                      <RotateCcw className="h-3 w-3 mr-1.5" />
                      Clear all filters
                    </Button>
                  ) : (
                    emptyAction && <div className="mt-2">{emptyAction}</div>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((row) => (
              <TableRow key={keyExtractor(row)}>
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    className={cn("px-4 py-3.5 text-xs sm:text-sm", col.className)}
                  >
                    {col.cell
                      ? col.cell(row)
                      : col.accessor
                        ? col.accessor(row)
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Global Pagination Footer */}
      <GlobalPagination
        currentPage={currentPage}
        totalPages={Math.max(1, Math.ceil(sortedData.length / pageSize))}
        totalItems={sortedData.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size)
          setCurrentPage(1)
        }}
      />
    </div>
  )
}
