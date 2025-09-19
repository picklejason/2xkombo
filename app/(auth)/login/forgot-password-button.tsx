"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const supabase = createClient();

  async function handleForgotPassword() {
    const email = (document.querySelector('input[name="email"]') as HTMLInputElement)?.value;
    
    if (!email) {
      setMessage("Please enter your email address first");
      return;
    }

    setLoading(true);
    setMessage("");
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    setLoading(false);
    
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset email sent! Check your inbox.");
    }
  }

  return (
    <div className="mt-6 text-center">
      <button 
        type="button"
        onClick={handleForgotPassword}
        disabled={loading}
        className="text-neon-cyan hover:text-neon-green underline text-lg font-bold uppercase tracking-wide"
      >
        {loading ? "SENDING..." : "FORGOT PASSWORD?"}
      </button>
      {message && (
        <div className="mt-2 p-2 border-2 border-brutal-border bg-surface">
          <p className="text-sm font-bold uppercase tracking-wide">
            {message}
          </p>
        </div>
      )}
    </div>
  );
}
