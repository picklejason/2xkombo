"use client";
import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/lib/ToastContext";

export default function AuthToast() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const processedMessages = useRef(new Set<string>());

  useEffect(() => {
    const message = searchParams.get('message');
    if (message && !processedMessages.current.has(message)) {
      // Mark this message as processed to prevent duplicates
      processedMessages.current.add(message);
      
      // Determine toast type based on message content
      const isError = message.toLowerCase().includes('error') || 
                     message.toLowerCase().includes('could not') ||
                     message.toLowerCase().includes('invalid');
      
      const isSuccess = message.toLowerCase().includes('welcome') || 
                       message.toLowerCase().includes('successful') ||
                       message.toLowerCase().includes('updated') ||
                       message.toLowerCase().includes('created');
      
      const toastType = isError ? 'error' : isSuccess ? 'success' : 'info';
      
      showToast(message, toastType);
      
      // Clean up URL without causing a page refresh
      const url = new URL(window.location.href);
      url.searchParams.delete('message');
      window.history.replaceState({}, '', url.toString());
      
      // Clean up the processed message after a delay
      setTimeout(() => {
        processedMessages.current.delete(message);
      }, 1000);
    }
  }, [searchParams, showToast]);

  return null; // This component doesn't render anything visible
}
