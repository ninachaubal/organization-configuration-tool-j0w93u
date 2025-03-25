import * as React from "react";
import { cva } from "class-variance-authority";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

import { cn } from "../../lib/utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-slate-200 dark:border-slate-700",
        error: "border-destructive/50 text-destructive dark:text-destructive bg-destructive/10 [&>svg]:text-destructive",
        warning: "border-yellow-500/50 text-yellow-700 dark:text-yellow-500 bg-yellow-500/10 [&>svg]:text-yellow-500",
        success: "border-green-500/50 text-green-700 dark:text-green-500 bg-green-500/10 [&>svg]:text-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  variant = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  variant?: "default" | "error" | "warning" | "success";
}) {
  return (
    <div
      role="alert"
      className={alertVariants({ variant, className })}
      {...props}
    />
  );
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm [&_p]:leading-relaxed", className)}
      {...props}
    />
  );
}

function AlertIcon({
  variant = "default",
  className,
}: {
  variant: "default" | "error" | "warning" | "success";
  className?: string;
}) {
  const Icon = {
    default: Info,
    error: AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle,
  }[variant];

  return <Icon className={cn("h-4 w-4", className)} />;
}

export { Alert, AlertTitle, AlertDescription, AlertIcon, alertVariants };