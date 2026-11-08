"use client"

import * as React from "react"
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDownIcon } from "lucide-react"
import { cn } from "cn"

function Accordion({
  className,
  ...props
}: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col gap-3", className)}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "group/item rounded-2xl border border-slate-200/80 bg-white px-4 sm:px-6 shadow-card transition-all duration-200 hover:border-blue-200 data-[open]:border-[#2A6AED]/50 data-[open]:shadow-card-hover",
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/trigger flex flex-1 items-center justify-between gap-3 py-4 sm:py-5 text-left text-xs min-[375px]:text-sm sm:text-base font-bold text-slate-900 transition-colors outline-none hover:text-[#2A6AED] focus-visible:ring-2 focus-visible:ring-[#2A6AED]/25 disabled:pointer-events-none disabled:opacity-50 data-[panel-open]:text-[#2A6AED]",
          className
        )}
        {...props}
      >
        {children}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 transition-all duration-200 group-hover/trigger:bg-[#EFF6FF] group-hover/trigger:text-[#2A6AED] group-data-[panel-open]/trigger:rotate-180 group-data-[panel-open]/trigger:bg-[#2A6AED] group-data-[panel-open]/trigger:text-white">
          <ChevronDownIcon className="h-4 w-4 transition-transform duration-200" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-[var(--accordion-panel-height)] overflow-hidden text-xs sm:text-[13.5px] text-slate-600 transition-[height] duration-200 ease-out data-[ending-style]:h-0 data-[starting-style]:h-0"
      {...props}
    >
      <div className={cn("pb-4 sm:pb-5 pt-0 leading-relaxed border-t border-slate-100/80 pt-3", className)}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
