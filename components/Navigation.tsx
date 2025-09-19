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

  return (
    <div className="app-nav__actions">
      {user && (
        <Link
          href="/my-combos"
          className="brutal-btn brutal-btn--secondary"
          aria-label="My Combos"
        >
          MY COMBOS
        </Link>
      )}
      {user ? (
        <button
          onClick={signOut}
          className="brutal-btn brutal-btn--secondary"
          aria-label="Sign out of your account"
        >
          SIGN OUT
        </button>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}