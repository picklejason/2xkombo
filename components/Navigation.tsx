"use client";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import DiscordButton from "@/components/DiscordButton";

export function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="app-nav__actions">
        <div className="text-foreground/50 text-lg font-normal uppercase tracking-wide">
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
          prefetch={true}
        >
          MY COMBOS
        </Link>
      )}
      {user ? (
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="brutal-btn brutal-btn--secondary"
            aria-label="Sign out of your account"
          >
            SIGN OUT
          </button>
        </form>
      ) : (
        <div className="w-64">
          <DiscordButton />
        </div>
      )}
    </div>
  );
}