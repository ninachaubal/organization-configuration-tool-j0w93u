import React from "react";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardTitle, CardDescription } from "./ui/card";
import { cn } from "../lib/utils";
import { EmptyStateProps } from "../types/ui";

/**
 * A component that displays an empty state message with a title, description, and optional action button
 */
export function EmptyState({
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps & React.HTMLAttributes<HTMLDivElement>): React.ReactElement {
  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardContent className="flex flex-col items-center justify-center py-10 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" aria-hidden="true" />
        <CardTitle className="mb-2">{title}</CardTitle>
        <CardDescription className="mb-6 max-w-md mx-auto">{description}</CardDescription>
        {action && <div className="mt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}