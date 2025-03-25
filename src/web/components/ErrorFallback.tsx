import * as React from "react";
import { RefreshCcw } from "lucide-react"; // version: ^0.284.0
import { Alert, AlertTitle, AlertDescription, AlertIcon } from "./ui/alert";
import { Button } from "./ui/button";

/**
 * A component that displays a user-friendly error message with recovery options
 * when a React component fails to render due to an error.
 *
 * @param error - The error that was caught by the error boundary
 * @param resetErrorBoundary - Optional function to reset the error boundary and retry
 * @returns A React element displaying the error message and recovery options
 */
export function ErrorFallback({ 
  error, 
  resetErrorBoundary 
}: { 
  error: Error; 
  resetErrorBoundary?: () => void;
}): React.ReactElement {
  // Log the error to console for debugging purposes
  React.useEffect(() => {
    console.error("Caught by error boundary:", error);
  }, [error]);

  return (
    <div className="w-full p-4">
      <Alert
        variant="error"
        className="flex flex-col items-start p-6"
        aria-live="assertive"
      >
        <div className="flex items-center w-full">
          <AlertIcon variant="error" />
          <AlertTitle className="ml-2">Something went wrong</AlertTitle>
        </div>
        
        <AlertDescription className="mt-4">
          {error.message || "An unexpected error occurred. Please try again later."}
        </AlertDescription>
        
        {resetErrorBoundary && (
          <div className="mt-6">
            <Button
              onClick={resetErrorBoundary}
              variant="outline"
              className="inline-flex items-center"
              aria-label="Retry"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </div>
        )}
      </Alert>
    </div>
  );
}