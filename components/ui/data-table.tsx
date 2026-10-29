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
  DropdownMenuCheckboxItem,
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
  LayoutGrid,
  List,
  RotateCcw,
  Search,
  SlidersHorizontal,
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
  hideable?: boolean
  defaultHidden?: boolean
}

export interface DataTableFilterOption {
  label: string
  value: string
  icon?: React.ComponentType<{ className?: string }>
}

export interface DataTableFilter<T> {
  id: string
  label: string
  options: DataTableFilterOption[]
  accessor: (row: T) => string
  defaultValue?: string
  icon?: React.ComponentType<{ className?: string }>
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
  showSerialNumber?: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  toolbarActions?: React.ReactNode
  className?: string
  defaultViewMode?: "auto" | "table" | "grid"
  renderCard?: (row: T, index: number, serialNumber: number) => React.ReactNode
  gridClassName?: string
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  searchPlaceholder = "Search by keyword, candidate, or title...",
  filters = [],
  dateAccessor,
  dateFilterLabel = "Filter by date",
  defaultSortColumn,
  defaultSortDirection = "desc",
  defaultPageSize = 10,
  showSerialNumber = true,
  emptyTitle = "No matching records found",
  emptyDescription = "Try adjusting your search query, status filters, or date range.",
  emptyAction,
  toolbarActions,
  className,
  defaultViewMode = "auto",
  renderCard,
  gridClassName,
}: DataTableProps<T>) {
  const [viewMode, setViewMode] = React.useState<"auto" | "table" | "grid">(defaultViewMode)
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

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {}
      for (const col of columns) {
        initial[col.id] = !col.defaultHidden
      }
      return initial
    }
  )

  const visibleColumns = React.useMemo(() => {
    return columns.filter((col) => columnVisibility[col.id] !== false)
  }, [columns, columnVisibility])

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

  const totalCols = (showSerialNumber ? 1 : 0) + visibleColumns.length

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card shadow-card overflow-hidden",
        className
      )}
    >
      {/* =========================================================================
          TABLE TOOLBAR: Multi-tier toolbar matching Reference Screenshots
          Row 1: Search input + Column Selector + Toolbar Actions
          Row 2: Dropdown filters + Date Picker + Reset Filters
      ========================================================================= */}
      <div className="p-4 sm:p-5 border-b border-border space-y-3 bg-card">
        {/* Tier 1: Search & Right Tools */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-2xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={searchPlaceholder}
              className="h-10 pl-10 pr-9 rounded-lg border-border bg-muted/50 text-xs sm:text-sm shadow-none focus-visible:ring-primary/20 focus-visible:border-primary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("")
                  setCurrentPage(1)
                }}
                aria-label="Clear search query"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* View Mode Switcher: [ ▦ Grid | ▤ Table ] */}
            <div className="inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100/70 dark:bg-slate-950/70 shadow-2xs">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "grid" ? "auto" : "grid")}
                title="Grid Card View (Default on Mobile)"
                className={cn(
                  "inline-flex items-center justify-center h-8 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "grid"
                    ? "!bg-white dark:!bg-slate-800 !text-[#2A6AED] dark:!text-blue-400 !shadow-2xs"
                    : viewMode === "auto"
                      ? "bg-white dark:bg-slate-800 text-[#2A6AED] dark:text-blue-400 shadow-2xs md:bg-transparent md:text-slate-500 md:shadow-none"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <LayoutGrid className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "table" ? "auto" : "table")}
                title="Table List View (Default on Desktop)"
                className={cn(
                  "inline-flex items-center justify-center h-8 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                  viewMode === "table"
                    ? "!bg-white dark:!bg-slate-800 !text-[#2A6AED] dark:!text-blue-400 !shadow-2xs"
                    : viewMode === "auto"
                      ? "hidden md:inline-flex md:bg-white md:dark:bg-slate-800 md:text-[#2A6AED] md:dark:text-blue-400 md:shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <List className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

            {/* Columns (N/N) Dropdown Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-9 sm:h-10 items-center gap-1.5 sm:gap-2 rounded-lg border border-border bg-card px-2.5 sm:px-3.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors outline-none cursor-pointer shadow-none"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">
                  Columns ({visibleColumns.length}/{columns.length})
                </span>
                <span className="sm:hidden text-[11px]">
                  ({visibleColumns.length})
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Toggle Columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((col) => {
                  const isVisible = columnVisibility[col.id] !== false
                  return (
                    <DropdownMenuCheckboxItem
                      key={col.id}
                      checked={isVisible}
                      onCheckedChange={(checked) => {
                        setColumnVisibility((prev) => ({
                          ...prev,
                          [col.id]: !!checked,
                        }))
                      }}
                      className="text-xs font-medium"
                    >
                      {col.header}
                    </DropdownMenuCheckboxItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {toolbarActions}
          </div>
        </div>

        {/* Tier 2: Horizontal Filter Strip */}
        {(filters.length > 0 || dateAccessor || hasActiveControls) && (
          <div className="flex overflow-x-auto no-scrollbar scroll-smooth flex-nowrap sm:flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            {/* Dropdown Filters */}
            {filters.map((filter) => {
              const currentVal = activeFilters[filter.id] || "ALL"
              const activeOption = filter.options.find((o) => o.value === currentVal)
              const isFiltered = currentVal !== "ALL"
              const FilterIcon = filter.icon || Filter

              return (
                <DropdownMenu key={filter.id}>
                  <DropdownMenuTrigger
                    className={cn(
                      "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors outline-none cursor-pointer shadow-2xs",
                      isFiltered
                        ? "border-primary/30 bg-secondary text-secondary-foreground"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    )}
                  >
                    <FilterIcon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                    <span>{filter.label}</span>
                    {isFiltered && activeOption && (
                      <Badge className="ml-0.5 h-5 rounded-md bg-primary px-1.5 py-0 text-[10px] font-bold text-primary-foreground border-0">
                        {activeOption.label}
                      </Badge>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
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

            {/* Reset Filters Action */}
            {hasActiveControls && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetAllFilters}
                className="h-9 px-2.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 rounded-xl"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1" />
                Reset
              </Button>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          DATA DISPLAY: DUAL RESPONSIVE VIEWS
          1. Card Grid Layout (Mobile default or explicit grid mode)
          2. Table View (Desktop default or explicit table mode)
      ========================================================================= */}

      {/* 1. CARD GRID VIEW */}
      <div
        className={cn(
          "p-4 sm:p-5",
          viewMode === "grid"
            ? "block"
            : viewMode === "table"
              ? "hidden"
              : "block md:hidden"
        )}
      >
        {paginatedData.length === 0 ? (
          <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 py-10 text-center">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {emptyTitle}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-normal leading-relaxed">
              {emptyDescription}
            </p>
            {hasActiveControls ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={resetAllFilters}
                className="mt-2 h-8 px-3 text-xs font-semibold rounded-lg"
              >
                <RotateCcw className="h-3 w-3 mr-1.5" />
                Clear all filters
              </Button>
            ) : (
              emptyAction && <div className="mt-2">{emptyAction}</div>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-2 gap-4",
              gridClassName
            )}
          >
            {paginatedData.map((row, index) => {
              const serialNumber = (currentPage - 1) * pageSize + index + 1
              if (renderCard) {
                return (
                  <React.Fragment key={keyExtractor(row)}>
                    {renderCard(row, index, serialNumber)}
                  </React.Fragment>
                )
              }

              // Automatic fallback card generator from visible columns
              const primaryCol = visibleColumns[0]
              const actionCol = visibleColumns.find((c) => c.id === "action" || c.id === "actions")
              const otherCols = visibleColumns.filter(
                (c) => c.id !== primaryCol?.id && c.id !== actionCol?.id
              )

              return (
                <div
                  key={keyExtractor(row)}
                  className="rounded-xl border border-border bg-card p-4 shadow-none space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {showSerialNumber && (
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-500 shrink-0">
                          #{serialNumber}
                        </span>
                      )}
                      <div>
                        {primaryCol?.cell
                          ? primaryCol.cell(row)
                          : primaryCol?.accessor
                            ? primaryCol.accessor(row)
                            : null}
                      </div>
                    </div>
                  </div>

                  {otherCols.length > 0 && (
                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                      {otherCols.map((col) => (
                        <div key={col.id} className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                            {col.header}
                          </span>
                          <div className="text-right">
                            {col.cell
                              ? col.cell(row)
                              : col.accessor
                                ? col.accessor(row)
                                : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {actionCol && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end">
                      {actionCol.cell
                        ? actionCol.cell(row)
                        : actionCol.accessor
                          ? actionCol.accessor(row)
                          : null}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* 2. TABLE VIEW */}
      <div
        className={cn(
          "overflow-x-auto",
          viewMode === "table"
            ? "block"
            : viewMode === "grid"
              ? "hidden"
              : "hidden md:block"
        )}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/70 border-b border-border">
              {/* Sr. Column Header matching reference screenshots */}
              {showSerialNumber && (
                <TableHead className="w-14 h-11 px-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Sr.
                </TableHead>
              )}
              {visibleColumns.map((col) => {
                const isSorted = sortColumn === col.id
                return (
                  <TableHead
                    key={col.id}
                    className={cn(
                      "h-11 px-4 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400",
                      col.headerClassName
                    )}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        onClick={() => handleSort(col.id)}
                        className={cn(
                          "inline-flex items-center gap-1.5 uppercase tracking-wider transition-colors hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer select-none",
                          isSorted && "text-[#2A6AED] dark:text-blue-400 font-bold"
                        )}
                      >
                        <span>{col.header}</span>
                        {isSorted ? (
                          sortDirection === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5 text-[#2A6AED] dark:text-blue-400" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 opacity-60" />
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
                  colSpan={totalCols}
                  className="h-56 text-center align-middle"
                >
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center gap-2 py-8">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {emptyTitle}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-normal leading-relaxed">
                      {emptyDescription}
                    </p>
                    {hasActiveControls ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetAllFilters}
                        className="mt-2 h-8 px-3 text-xs font-semibold rounded-lg"
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
              paginatedData.map((row, index) => {
                const serialNumber = (currentPage - 1) * pageSize + index + 1
                return (
                  <TableRow
                    key={keyExtractor(row)}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80 transition-colors"
                  >
                    {showSerialNumber && (
                      <TableCell className="w-14 px-4 py-3.5 text-center text-xs font-bold text-slate-400 dark:text-slate-500">
                        {serialNumber}
                      </TableCell>
                    )}
                    {visibleColumns.map((col) => (
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
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* =========================================================================
          GLOBAL PAGINATION FOOTER
      ========================================================================= */}
      <div className="px-4 sm:px-5 py-3.5 bg-card border-t border-border">
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
    </div>
  )
}
