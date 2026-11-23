"use client"

import * as React from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AdminCommandFilterOption {
  label: string
  value: string
  count?: number
  hint?: string
}

interface AdminCommandFilterProps {
  title: string
  icon?: React.ComponentType<{ className?: string }>
  options: AdminCommandFilterOption[]
  selectedValue: string
  onSelect: (value: string) => void
  placeholder?: string
  width?: string
  allLabel?: string
}

export function AdminCommandFilter({
  title,
  icon: Icon,
  options,
  selectedValue,
  onSelect,
  placeholder,
  width = "w-64",
  allLabel,
}: AdminCommandFilterProps) {
  const [open, setOpen] = React.useState(false)

  const isActive = selectedValue !== "ALL" && selectedValue !== ""
  const selectedOption = options.find((opt) => opt.value === selectedValue)
  const defaultAll = allLabel || `All ${title}s`

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect("ALL")
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          "inline-flex h-9 cursor-pointer items-center justify-between gap-1.5 rounded-md border px-3 text-xs font-semibold shadow-2xs transition-colors outline-none select-none",
          isActive
            ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/15"
            : "border-border/80 bg-background text-foreground hover:bg-muted/50"
        )}
      >
        <div className="flex items-center gap-1.5 truncate">
          {Icon && (
            <Icon
              className={cn(
                "h-3.5 w-3.5 shrink-0",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            />
          )}
          <span className="text-muted-foreground font-medium">{title}:</span>
          <span className="truncate font-bold">
            {isActive ? selectedOption?.label || selectedValue : defaultAll}
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
              className="flex h-4 w-4 items-center justify-center rounded-sm text-primary transition-colors hover:bg-primary/20"
            >
              <X className="h-3 w-3" />
            </span>
          ) : (
            <ChevronDown className="h-3 w-3 opacity-60" />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent align="start" className={cn("p-0 shadow-md", width)}>
        <Command>
          <CommandInput
            placeholder={placeholder || `Search ${title.toLowerCase()}...`}
            className="h-8 text-xs"
          />
          <CommandList className="max-h-60 p-1">
            <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">
              No {title.toLowerCase()} found.
            </CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="ALL"
                onSelect={() => {
                  onSelect("ALL")
                  setOpen(false)
                }}
                className="flex items-center justify-between text-xs py-1.5 px-2 cursor-pointer rounded-sm"
              >
                <span className="font-semibold">{defaultAll}</span>
                {selectedValue === "ALL" && (
                  <Check className="h-3.5 w-3.5 text-primary" />
                )}
              </CommandItem>

              {options.map((opt) => {
                const isSelected = selectedValue === opt.value
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.label}
                    onSelect={() => {
                      onSelect(opt.value)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex items-center justify-between text-xs py-1.5 px-2 cursor-pointer rounded-sm",
                      isSelected && "font-bold text-primary"
                    )}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="truncate">{opt.label}</span>
                      {opt.hint && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          ({opt.hint})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {opt.count !== undefined && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0 font-bold"
                        >
                          {opt.count}
                        </Badge>
                      )}
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
