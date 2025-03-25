import React from 'react';
import { Loader2 } from 'lucide-react'; // v0.284.0
import { cn } from '../lib/utils';

export interface LoadingIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Size of the loading indicator
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Optional text to display next to the loading indicator
   */
  text?: string;
}

/**
 * A component that displays a spinning loader with optional text to indicate loading state
 */
const LoadingIndicator = ({
  size = 'md',
  text,
  className,
  ...props
}: LoadingIndicatorProps) => {
  // Determine spinner size based on prop
  const spinnerSize = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }[size];

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2',
        className
      )}
      aria-busy="true"
      aria-live="polite"
      role="status"
      {...props}
    >
      <Loader2 className={cn('animate-spin', spinnerSize)} />
      {text && <span>{text}</span>}
    </div>
  );
};

export default LoadingIndicator;