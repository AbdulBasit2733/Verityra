"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface FilterOption {
  label: string
  value: string
  count?: number
  icon?: React.ComponentType<{ className?: string }>
}

export interface PopoverDropdownFilterProps {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  options: FilterOption[]
  selectedValue: string
  onSelect: (value: string) => void
  searchPlaceholder?: string
  allLabel?: string
  className?: string
  width?: string
}

export function PopoverDropdownFilter({
  title,
  icon: Icon,
  options,
  selectedValue,
  onSelect,
  searchPlaceholder = "Search...",
  allLabel,
  className,
  width = "w-72",
}: PopoverDropdownFilterProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const isActive = selectedValue !== "ALL" && selectedValue !== ""
  const selectedOption = options.find((opt) => opt.value === selectedValue)
  const defaultAllLabel = allLabel || `All ${title}s`

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return options
    const q = search.trim().toLowerCase()
    return options.filter((opt) => opt.label.toLowerCase().includes(q))
  }, [options, search])

  const handleSelectOption = (value: string) => {
    onSelect(value)
    setOpen(false)
    setSearch("")
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect("ALL")
    setSearch("")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-10 cursor-pointer items-center justify-between gap-2 rounded-md border px-3 text-xs font-semibold shadow-xs transition-colors outline-none select-none",
          isActive
            ? "border-[#BFD5FA] bg-[#EFF6FF] text-[#145DEB] hover:bg-[#E4F0FF]"
            : "border-[#DCE7FA] bg-white text-[#071B3A] hover:border-[#BFD5FA] hover:bg-[#F1F6FF]",
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && (
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                isActive ? "text-[#145DEB]" : "text-slate-400"
              )}
            />
          )}
          <span className="font-medium text-slate-500">{title}:</span>
          <span className="truncate font-bold">
            {isActive
              ? selectedOption?.label || selectedValue
              : defaultAllLabel}
          </span>
        </div>

        <div className="ml-1 flex shrink-0 items-center gap-1">
          {isActive ? (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClear(e as any)
                }
              }}
              title={`Clear ${title} filter`}
              className="flex h-4 w-4 items-center justify-center rounded-sm text-[#145DEB] transition-colors hover:bg-blue-200/60"
            >
              <X className="h-3 w-3" />
            </span>
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn(
          "rounded-md border-[#DCE7FA] bg-white p-2 shadow-sm",
          width
        )}
      >
        {/* Search Header */}
        <div className="relative mb-1.5 px-1 pt-1">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 w-full rounded-md border border-[#DCE7FA] bg-[#F1F6FF]/60 pr-7 pl-8 text-xs text-[#071B3A] outline-none placeholder:text-slate-400 focus:border-[#145DEB]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Options List */}
        <div className="max-h-60 space-y-0.5 overflow-y-auto px-1 py-1 text-xs">
          {/* Default 'ALL' option */}
          {!search.trim() && (
            <button
              type="button"
              onClick={() => handleSelectOption("ALL")}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-left transition-colors",
                selectedValue === "ALL" || !selectedValue
                  ? "bg-[#EFF6FF] font-bold text-[#145DEB]"
                  : "text-slate-700 hover:bg-[#F1F6FF]"
              )}
            >
              <span>{defaultAllLabel}</span>
              {(selectedValue === "ALL" || !selectedValue) && (
                <Check className="h-3.5 w-3.5 text-[#145DEB]" />
              )}
            </button>
          )}

          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = selectedValue === option.value
              const OptionIcon = option.icon

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelectOption(option.value)}
                  className={cn(
                    "group flex w-full cursor-pointer items-center justify-between rounded-sm px-2.5 py-2 text-left transition-colors",
                    isSelected
                      ? "bg-[#EFF6FF] font-bold text-[#145DEB]"
                      : "text-slate-700 hover:bg-[#F1F6FF]"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {OptionIcon && (
                      <OptionIcon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isSelected
                            ? "text-[#145DEB]"
                            : "text-slate-400 group-hover:text-[#145DEB]"
                        )}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>

                  <div className="ml-2 flex shrink-0 items-center gap-1.5">
                    {option.count !== undefined && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                        {option.count}
                      </span>
                    )}
                    {isSelected && (
                      <Check className="h-3.5 w-3.5 text-[#145DEB]" />
                    )}
                  </div>
                </button>
              )
            })
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No matching {title.toLowerCase()}s found
            </div>
          )}
        </div>

        {/* Footer */}
        {isActive && (
          <div className="mt-1 border-t border-[#DCE7FA] px-1 pt-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="h-7 w-full justify-center text-[11px] text-[#145DEB] hover:bg-[#EFF6FF]"
            >
              Clear filter
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
