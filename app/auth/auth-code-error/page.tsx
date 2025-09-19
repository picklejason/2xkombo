"use client";
import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="mx-auto max-w-lg panel p-8">
      <h1 className="neon-title text-3xl mb-6">AUTHENTICATION ERROR</h1>
      
      <div className="text-center space-y-6">
        <p className="text-brutal-red text-lg font-bold uppercase tracking-wide">
          Something went wrong during authentication
        </p>
        
        <p className="text-foreground/70 text-base font-bold uppercase tracking-wide">
          Please try logging in again
        </p>
        
        <Link 
          href="/login" 
          className="brutal-btn brutal-btn--primary py-4 px-6 inline-block"
        >
          BACK TO LOGIN
        </Link>
      </div>
    </div>
  );
}
