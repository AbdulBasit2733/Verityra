"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  hint?: string
}

export interface SearchableComboboxProps {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  allowClear?: boolean
}

export function SearchableCombobox({
  options,
  value,
  onValueChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No matching options found.",
  disabled = false,
  className,
  allowClear = false,
}: SearchableComboboxProps) {
  const [open, setOpen] = React.useState(false)

  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value.toLowerCase() === value?.toLowerCase()) ||
      options.find((opt) => opt.label.toLowerCase() === value?.toLowerCase()),
    [options, value]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        role="combobox"
        aria-expanded={open}
        disabled={disabled}
        className={cn(
          "inline-flex h-9 w-full items-center justify-between rounded-md border border-border/80 bg-background px-3 text-xs font-normal text-foreground shadow-xs hover:bg-muted/40 transition-colors outline-none cursor-pointer",
          !selectedOption && "text-muted-foreground",
          className
        )}
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {allowClear && selectedOption && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation()
                onValueChange("")
              }}
              className="rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </span>
          )}
          <ChevronsUpDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] min-w-[220px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} className="h-9 text-xs" />
          <CommandList className="max-h-56">
            <CommandEmpty className="p-3 text-center text-xs text-muted-foreground">
              {emptyMessage}
            </CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected =
                  selectedOption?.value.toLowerCase() === option.value.toLowerCase() ||
                  selectedOption?.label.toLowerCase() === option.label.toLowerCase()
                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onValueChange(option.value)
                      setOpen(false)
                    }}
                    className="flex items-center justify-between py-1.5 px-2 text-xs cursor-pointer"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className={cn("truncate", isSelected && "font-bold text-primary")}>
                        {option.label}
                      </span>
                      {option.hint && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {option.hint}
                        </span>
                      )}
                    </div>
                    <Check
                      className={cn(
                        "h-3.5 w-3.5 shrink-0 text-primary",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
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
