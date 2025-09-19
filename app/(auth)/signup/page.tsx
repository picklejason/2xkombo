import Link from "next/link";
import { signup } from "@/app/auth/actions";
import AuthToast from "@/components/AuthToast";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;

  return (
    <>
      <AuthToast />
      <div className="mx-auto max-w-lg panel p-8">
        <h1 className="neon-title text-3xl mb-6">CREATE ACCOUNT</h1>
      
      {message && (
        <div className="mb-6 p-4 border-4 border-brutal-border bg-surface">
          <p className="text-lg font-bold uppercase tracking-wide text-center">
            {message}
          </p>
        </div>
      )}

      <form action={signup} className="space-y-6">
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
          minLength={6}
        />
        <button className="brutal-btn brutal-btn--primary w-full py-4" type="submit">
          SIGN UP
        </button>
      </form>
      
        <p className="text-lg font-bold text-foreground/70 mt-6 uppercase tracking-wide text-center">
          HAVE AN ACCOUNT? <Link className="text-neon-cyan hover:text-neon-green underline" href="/login">LOG IN</Link>
        </p>
      </div>
    </>
  );
}


