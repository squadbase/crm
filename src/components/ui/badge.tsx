import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-lg border px-3 py-1 text-caption font-medium w-fit whitespace-nowrap shrink-0 transition-all duration-200 [&>svg]:size-3 gap-1.5 [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "border-line bg-muted text-muted-foreground hover:bg-muted/80",
        success:
          "border-transparent bg-success text-white hover:bg-success/90",
        warning:
          "border-transparent bg-warning text-white hover:bg-warning/90",
        danger:
          "border-transparent bg-danger text-white hover:bg-danger/90",
        accent:
          "border-transparent bg-accent text-accent-foreground hover:bg-accent/90",
        outline:
          "text-foreground border-line hover:bg-muted hover:text-foreground",
      },
      size: {
        default: "px-3 py-1 text-caption",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-4 py-2 text-small",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
