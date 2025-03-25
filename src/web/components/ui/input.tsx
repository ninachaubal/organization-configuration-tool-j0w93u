import React, { forwardRef } from "react";
import { cn } from "../../lib/utils";

/**
 * A reusable input component that provides consistent styling and behavior
 * for text input fields throughout the application. Supports error states
 * and integrates with form libraries like react-hook-form.
 */
const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    /**
     * When true, applies error styling to the input
     */
    error?: boolean;
  }
>(({ className, type = "text", error, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        // Base styles
        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        // Focus and file input styles
        "file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Error styling when error prop is true
        error && "border-destructive focus-visible:ring-destructive",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };