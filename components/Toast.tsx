"use client";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  show: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, show, onClose, duration = 3000 }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show && !isVisible) return null;

  const getToastStyles = () => {
    // Match the existing toast style from ComboBuilder and MyCombos
    const baseStyles = "fixed bottom-4 right-4 px-6 py-3 border-4 border-brutal-border box-shadow-brutal z-50 transition-all duration-300 transform";
    const visibilityStyles = isVisible 
      ? "translate-y-0 opacity-100" 
      : "translate-y-full opacity-0";

    // Use consistent colors based on type
    const typeStyles = {
      success: "bg-gray-800 text-neon-green", // Success with green text
      error: "bg-gray-800 text-brutal-red",   // Error with red text
      info: "bg-gray-800 text-white"          // Info with white text (default)
    };

    return `${baseStyles} ${visibilityStyles} ${typeStyles[type]}`;
  };

  const getIcon = () => {
    switch (type) {
      case "success": return "✓ ";
      case "error": return "✕ ";
      case "info": return "";
      default: return "";
    }
  };

  return (
    <div className={getToastStyles()}>
      <span className="text-sm font-bold uppercase tracking-wide">
        {getIcon()}{message}
      </span>
    </div>
  );
}
