import React from 'react';
import LoadingIndicator from '../../components/LoadingIndicator';

/**
 * NextJS loading component that displays during page content loading.
 * This component is automatically used by NextJS App Router to show a loading state
 * during server-side data fetching operations.
 * 
 * @returns The rendered loading indicator element
 */
export default function Loading() {
  return (
    <div 
      className="flex h-screen w-full items-center justify-center flex-col gap-4"
      data-testid="page-loading"
    >
      <LoadingIndicator 
        size="lg" 
        text="Loading configuration data..." 
      />
      <p className="text-muted-foreground text-sm">
        Please wait while we fetch the organization data...
      </p>
    </div>
  );
}