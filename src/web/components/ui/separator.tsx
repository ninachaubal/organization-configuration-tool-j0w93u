import * as React from "react"
import { Separator as RadixSeparator, SeparatorProps } from "@radix-ui/react-separator" // v1.0.0

import { cn } from "../../lib/utils"

/**
 * A visual divider component that can be oriented horizontally or vertically.
 * Used to separate content sections and improve visual organization in the 
 * configuration management interface.
 */
const Separator = React.forwardRef<
  React.ElementRef<typeof RadixSeparator>,
  React.ComponentPropsWithoutRef<typeof RadixSeparator>
>(({ className, orientation = "horizontal", decorative = true, ...props }, ref) => (
  <RadixSeparator
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
))

Separator.displayName = "Separator"

export { Separator }