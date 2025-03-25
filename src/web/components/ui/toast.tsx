import * as React from "react";
import { forwardRef, ElementRef, ComponentPropsWithoutRef } from "react";
import { cva, VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { 
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction
} from "@radix-ui/react-toast";

import { cn } from "../../lib/utils";
import { ToastProps, ToastActionElement, ToastActionProps } from "../../types/ui";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        success: "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-50",
        error: "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-50",
        warning: "border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = forwardRef<
  ElementRef<typeof Toast>,
  ComponentPropsWithoutRef<typeof Toast> & VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <Toast
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
});
Toast.displayName = Toast.displayName;

const ToastAction = forwardRef<
  ElementRef<typeof ToastAction>,
  ComponentPropsWithoutRef<typeof ToastAction> & ToastActionProps
>(({ className, altText, ...props }, ref) => (
  <ToastAction
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastAction.displayName;

const ToastClose = forwardRef<
  ElementRef<typeof ToastClose>,
  ComponentPropsWithoutRef<typeof ToastClose>
>(({ className, ...props }, ref) => (
  <ToastClose
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastClose>
));
ToastClose.displayName = ToastClose.displayName;

const ToastTitle = forwardRef<
  ElementRef<typeof ToastTitle>,
  ComponentPropsWithoutRef<typeof ToastTitle>
>(({ className, ...props }, ref) => (
  <ToastTitle
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
));
ToastTitle.displayName = ToastTitle.displayName;

const ToastDescription = forwardRef<
  ElementRef<typeof ToastDescription>,
  ComponentPropsWithoutRef<typeof ToastDescription>
>(({ className, ...props }, ref) => (
  <ToastDescription
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastDescription.displayName;

const ToastViewport = forwardRef<
  ElementRef<typeof ToastViewport>,
  ComponentPropsWithoutRef<typeof ToastViewport>
>(({ className, ...props }, ref) => (
  <ToastViewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastViewport.displayName;

export {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  toastVariants,
};