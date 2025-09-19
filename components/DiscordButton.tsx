"use client";
import { useState } from "react";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";

export default function DiscordButton() {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function signInWithDiscord() {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent('/?message=Welcome! Successfully signed in with Discord')}`,
      },
    });

    if (error) {
      console.error('Error signing in with Discord:', error);
      setLoading(false);
    }
  }

  return (
    <button
      onClick={signInWithDiscord}
      disabled={loading}
      className="brutal-btn brutal-btn--primary w-full flex items-center justify-center gap-2"
    >
      <Image src="/assets/logo-discord.svg" alt="Discord" width={24} height={24} />
      <span className="text-xs">{loading ? "CONNECTING..." : "SIGN IN WITH DISCORD"}</span>
    </button>
  );
}