"use client";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

export function Navigation() {
  const { user, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="app-nav__actions">
        <div className="text-foreground/50 text-lg font-bold uppercase tracking-wide">
          LOADING...
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="app-nav__actions">
        <button
          onClick={signOut}
          className="brutal-btn brutal-btn--secondary"
          aria-label="Sign out of your account"
        >
          SIGN OUT
        </button>
      </div>
    );
  }

  return (
    <div className="app-nav__actions">
      <Link
        href="/login"
        className="brutal-btn brutal-btn--secondary"
        aria-label="Log in to your account"
      >
        LOG IN
      </Link>
      <Link
        href="/signup"
        className="brutal-btn brutal-btn--primary"
        aria-label="Create new account"
      >
        SIGN UP
      </Link>
    </div>
  );
}