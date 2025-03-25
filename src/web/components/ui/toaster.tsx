import React from "react";
import { useToast } from "../../contexts/ToastContext";
import {
  Toast,
  ToastProvider,
  ToastViewport,
  ToastTitle,
  ToastDescription,
  ToastClose,
} from "./toast";
import { ToastType } from "../../types/ui";

/**
 * A component that renders toast notifications from the ToastContext
 * @returns The rendered toast notifications
 */
export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <ToastProvider>
      {toasts.map((toast) => {
        // Determine the variant based on the toast type
        let variant: "default" | "success" | "error" | "warning" = "default";
        
        if (toast.type === ToastType.SUCCESS) {
          variant = "success";
        } else if (toast.type === ToastType.ERROR) {
          variant = "error";
        } else if (toast.type === ToastType.WARNING) {
          variant = "warning";
        }

        return (
          <Toast
            key={toast.id}
            variant={variant}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
          >
            <div className="grid gap-1">
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}