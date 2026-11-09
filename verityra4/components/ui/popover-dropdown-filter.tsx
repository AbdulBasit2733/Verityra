"use client"

import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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
          "inline-flex h-10 items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all cursor-pointer outline-none shadow-xs select-none",
          isActive
            ? "border-[#BFD5FA] bg-[#EFF6FF] text-[#145DEB] hover:bg-[#E4F0FF]"
            : "border-[#DCE7FA] bg-white text-[#071B3A] hover:bg-[#F1F6FF] hover:border-[#BFD5FA]",
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
          <span className="text-slate-500 font-medium">{title}:</span>
          <span className="font-bold truncate">
            {isActive ? selectedOption?.label || selectedValue : defaultAllLabel}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
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
              className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200/60 text-[#145DEB] transition-colors"
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
        className={cn("p-2 border-[#DCE7FA] bg-white shadow-xl rounded-2xl", width)}
      >
        {/* Search Header */}
        <div className="relative mb-1.5 px-1 pt-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full h-8 pl-8 pr-7 text-xs bg-[#F1F6FF]/60 border border-[#DCE7FA] rounded-lg outline-none focus:border-[#145DEB] text-[#071B3A] placeholder:text-slate-400"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Options List */}
        <div className="max-h-60 overflow-y-auto space-y-0.5 py-1 px-1 text-xs">
          {/* Default 'ALL' option */}
          {!search.trim() && (
            <button
              type="button"
              onClick={() => handleSelectOption("ALL")}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer",
                selectedValue === "ALL" || !selectedValue
                  ? "bg-[#EFF6FF] text-[#145DEB] font-bold"
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
                    "w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer group",
                    isSelected
                      ? "bg-[#EFF6FF] text-[#145DEB] font-bold"
                      : "text-slate-700 hover:bg-[#F1F6FF]"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {OptionIcon && (
                      <OptionIcon
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          isSelected ? "text-[#145DEB]" : "text-slate-400 group-hover:text-[#145DEB]"
                        )}
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {option.count !== undefined && (
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 rounded-md px-1.5 py-0.5">
                        {option.count}
                      </span>
                    )}
                    {isSelected && <Check className="h-3.5 w-3.5 text-[#145DEB]" />}
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
          <div className="border-t border-[#DCE7FA] pt-1.5 mt-1 px-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full h-7 text-[11px] text-[#145DEB] hover:bg-[#EFF6FF] justify-center"
            >
              Clear filter
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
