'use client'

import * as React from 'react';
import { RefreshCcw } from 'lucide-react'; // version: ^0.284.0
import { ErrorFallback } from '../../components/ErrorFallback';
import { Button } from '../../components/ui/button';

/**
 * NextJS error page component that handles unexpected runtime errors
 * that occur during rendering and provides a user-friendly error recovery interface.
 *
 * This component is automatically used by NextJS as an error boundary when
 * errors occur within the application.
 *
 * @param error - The error object thrown during rendering
 * @param reset - Function provided by NextJS to attempt to recover from the error
 * @returns A fallback UI with error details and recovery options
 */
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): React.ReactElement {
  // Log the error to console for debugging purposes
  React.useEffect(() => {
    console.error('Uncaught application error:', error);
  }, [error]);

  return (
    <div className="h-screen w-full flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorFallback 
          error={error} 
          resetErrorBoundary={reset} 
        />
      </div>
    </div>
  );
}