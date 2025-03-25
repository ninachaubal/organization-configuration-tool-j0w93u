import React, { createContext, useContext } from 'react';
import { Toast, ToastType } from '../types/ui';

/**
 * Interface defining the shape of the toast context
 * Contains toast state and management functions
 */
export interface ToastContextType {
  /** Array of current toast notifications */
  toasts: Toast[];
  
  /** Add a new toast notification (ID will be generated automatically) */
  addToast: (toast: Omit<Toast, "id">) => void;
  
  /** Remove a toast notification by ID */
  removeToast: (id: string) => void;
  
  /** Remove all toast notifications */
  clearToasts: () => void;
}

/**
 * Context for toast notifications that can be consumed by components.
 * Default value is undefined as it should be provided by ToastProvider.
 */
export const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * A custom hook that provides access to the toast notification functionality.
 * Must be used within a component that's wrapped in a ToastProvider.
 * 
 * @returns The toast context value with toast management functions
 * @throws Error if used outside of a ToastProvider
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};