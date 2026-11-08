"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

type IconActionButtonProps = Omit<React.ComponentProps<typeof Button>, "children" | "size"> & {
  label: string
  children: React.ReactNode
  tooltipSide?: "top" | "right" | "bottom" | "left"
}

/** An accessible, icon-only action with the shared Shadcn-style tooltip. */
function IconActionButton({
  label,
  children,
  tooltipSide = "top",
  disabled,
  ...buttonProps
}: IconActionButtonProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          disabled={disabled}
          render={
            <Button type="button" size="icon" aria-label={label} disabled={disabled} {...buttonProps}>
              {children}
            </Button>
          }
        />
        <TooltipContent side={tooltipSide}>{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export { IconActionButton }
