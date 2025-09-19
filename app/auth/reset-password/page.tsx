import Link from "next/link";
import { updatePassword } from "@/app/auth/actions";
import { createClient } from "@/utils/supabase/server";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ message: string }>;
}) {
  const { message } = await searchParams;
  const supabase = await createClient();
  
  // Check if user has a valid session (from password reset link)
  const { data: { session } } = await supabase.auth.getSession();
  const isValidSession = !!session?.user;

  return (
    <div className="mx-auto max-w-lg panel p-8">
      <h1 className="neon-title text-3xl mb-6">RESET PASSWORD</h1>
      
      {message && (
        <div className="mb-6 p-4 border-4 border-brutal-border bg-surface">
          <p className="text-lg font-bold uppercase tracking-wide text-center">
            {message}
          </p>
        </div>
      )}
      
      {!isValidSession ? (
        <div className="text-center space-y-6">
          <p className="text-brutal-red text-lg font-bold uppercase tracking-wide">
            Invalid or expired reset link
          </p>
          <p className="text-foreground/70 text-base font-bold uppercase tracking-wide">
            Please request a new password reset
          </p>
          <Link 
            href="/login" 
            className="brutal-btn brutal-btn--secondary py-4 px-6 inline-block"
          >
            BACK TO LOGIN
          </Link>
        </div>
      ) : (
        <>
          <form action={updatePassword} className="space-y-6">
            <input 
              className="w-full bg-background border-4 border-brutal-border p-4 text-lg font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan" 
              placeholder="NEW PASSWORD" 
              type="password" 
              name="password"
              required
              minLength={6}
            />
            <input 
              className="w-full bg-background border-4 border-brutal-border p-4 text-lg font-bold uppercase tracking-wide focus:outline-none focus:border-neon-cyan" 
              placeholder="CONFIRM PASSWORD" 
              type="password" 
              name="confirmPassword"
              required
              minLength={6}
            />
            
            <button 
              className="brutal-btn brutal-btn--primary w-full py-4" 
              type="submit"
            >
              UPDATE PASSWORD
            </button>
          </form>
          
          <p className="text-lg font-bold text-foreground/70 mt-6 uppercase tracking-wide text-center">
            <Link className="text-neon-cyan hover:text-neon-green underline" href="/login">
              BACK TO LOGIN
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
