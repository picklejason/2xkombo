"use client";
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import Toast from "@/components/Toast";

interface ToastData {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    // Prevent duplicate toasts with the same message
    setToasts(prev => {
      const isDuplicate = prev.some(toast => toast.message === message);
      if (isDuplicate) return prev;
      
      const id = Date.now().toString();
      const newToast = { id, message, type };
      return [...prev, newToast];
    });
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          show={true}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
