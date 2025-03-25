import React, { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ToastContext, ToastContextType } from '../contexts/ToastContext';
import { Toast, ToastType } from '../types/ui';
import { Toaster } from '../components/ui/toaster';

/**
 * Provider component that implements the ToastContext to manage toast notifications
 * throughout the application. It maintains the state of active toasts and provides
 * methods to add, remove, and clear toast notifications.
 */
export const ToastProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  // Initialize state for storing toast notifications array
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Add a new toast notification with a unique ID
  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = uuidv4();
    setToasts((prevToasts) => [...prevToasts, { ...toast, id }]);

    // Auto-remove toast after duration (if specified)
    if (toast.duration) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
  }, []);

  // Remove a toast notification by ID
  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Clear all toast notifications
  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Create context value object with toasts array and toast management functions
  const contextValue: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
};

export default ToastProvider;