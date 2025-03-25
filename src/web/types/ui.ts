import React from "react";

// Button types
export type ButtonVariant = 
  | "primary" 
  | "secondary" 
  | "destructive" 
  | "outline" 
  | "ghost" 
  | "link";

export type ButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  className?: string;
}

// Tabs types
export type TabsOrientation = "horizontal" | "vertical";

// Form field types
export interface FormFieldContextValue {
  name: string;
  id: string;
}

// Toast types
export interface ToastProps {
  variant?: "default" | "success" | "error" | "warning";
  title: string;
  description?: string;
  duration?: number;
}

export interface ToastActionProps {
  altText: string;
}

export type ToastActionElement = React.ReactElement<ToastActionProps>;

// Card types
export interface CardProps {
  className?: string;
}

// Dialog types
export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface AlertDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Select types
export interface SelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

// Loading state type
export type LoadingState = "idle" | "loading" | "success" | "error";

// Empty state types
export interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

// Error fallback types
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

/**
 * A utility function for conditionally joining class names together
 * @param inputs - Class names or conditions
 * @returns Combined class names string
 */
export function cn(...inputs: (string | undefined | null | false | Record<string, boolean>)[]): string {
  return inputs
    .filter(Boolean)
    .flatMap((input) => {
      if (typeof input === "string") return input;
      if (typeof input === "object") {
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .join(" ");
}