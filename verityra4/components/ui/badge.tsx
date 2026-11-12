import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex min-h-7 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-lg border border-transparent px-3 py-1 text-xs font-semibold whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3.5!",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs [a]:hover:bg-primary/90",
        secondary:
          "border border-blue-200 bg-secondary text-secondary-foreground dark:border-blue-800/60 [a]:hover:bg-blue-100 dark:[a]:hover:bg-blue-900/40",
        success:
          "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-300 [a]:hover:bg-emerald-100 dark:[a]:hover:bg-emerald-900/40",
        warning:
          "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 [a]:hover:bg-amber-100 dark:[a]:hover:bg-amber-900/40",
        info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-700/60 dark:bg-blue-950/40 dark:text-blue-300 [a]:hover:bg-blue-100 dark:[a]:hover:bg-blue-900/40",
        destructive:
          "border-red-300 bg-red-50 text-red-800 focus-visible:ring-destructive/20 dark:border-red-700/60 dark:bg-red-950/40 dark:text-red-300 dark:focus-visible:ring-destructive/40 [a]:hover:bg-red-100 dark:[a]:hover:bg-red-900/40",
        outline:
          "border-border bg-card text-foreground [a]:hover:bg-muted [a]:hover:text-foreground",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
