import Link from "next/link";
import { login } from "@/app/auth/actions";
import DiscordButton from "@/app/(auth)/login/discord-button";
import ForgotPasswordButton from "@/app/(auth)/login/forgot-password-button";
import AuthToast from "@/components/AuthToast";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;

  return (
    <>
      <AuthToast />
      <div className="mx-auto max-w-lg panel p-8">
        <h1 className="neon-title text-3xl mb-6">LOG IN</h1>
      
      {message && (
        <div className="mb-6 p-4 border-4 border-brutal-border bg-surface">
          <p className="text-lg font-bold uppercase tracking-wide text-center">
            {message}
          </p>
        </div>
      )}

      <form action={login} className="space-y-6">
        <input 
          className="w-full bg-background border-4 border-brutal-border p-4 text-lg font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan" 
          placeholder="EMAIL" 
          type="email" 
          name="email"
          required
        />
        <input 
          className="w-full bg-background border-4 border-brutal-border p-4 text-lg font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan" 
          placeholder="PASSWORD" 
          type="password" 
          name="password"
          required
        />
        <button 
          className="brutal-btn brutal-btn--primary w-full py-4" 
          type="submit"
        >
          LOG IN
        </button>
      </form>
      
      <ForgotPasswordButton />

      <div className="mt-6 relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t-4 border-brutal-border"></div>
        </div>
        <div className="relative flex justify-center text-lg font-bold uppercase tracking-wide">
          <span className="bg-surface px-4 text-foreground/70">OR</span>
        </div>
      </div>

      <div className="mt-6">
        <DiscordButton />
      </div>

        <p className="text-lg font-bold text-foreground/70 mt-6 uppercase tracking-wide text-center">
          NO ACCOUNT? <Link className="text-neon-cyan hover:text-neon-green underline" href="/signup">SIGN UP</Link>
        </p>
      </div>
    </>
  );
}


