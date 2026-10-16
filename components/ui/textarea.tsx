import * as React from "react"
import { cn } from "cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-24 w-full resize-none rounded-xl border border-input bg-white px-4 py-3 text-sm text-foreground transition-all outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-card dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 shadow-xs",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
