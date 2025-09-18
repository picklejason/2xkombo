"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@/lib/supabaseClient";

export default function LoginPage() {
  const supabase = createBrowserClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    else router.push("/");
  }

  return (
    <div className="mx-auto max-w-lg panel p-8">
      <h1 className="neon-title text-3xl mb-6">LOG IN</h1>
      <form onSubmit={onSubmit} className="space-y-6">
        <input className="w-full bg-background border-4 border-brutal-border p-4 text-lg font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan" placeholder="EMAIL" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full bg-background border-4 border-brutal-border p-4 text-lg font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan" placeholder="PASSWORD" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
        {error && <p className="text-brutal-red text-lg font-bold uppercase tracking-wide">{error}</p>}
        <button className="brutal-btn brutal-btn--primary w-full py-4" type="submit">LOG IN</button>
      </form>
      <p className="text-lg font-bold text-foreground/70 mt-6 uppercase tracking-wide">NO ACCOUNT? <Link className="text-neon-cyan hover:text-neon-green underline" href="/signup">SIGN UP</Link></p>
    </div>
  );
}


