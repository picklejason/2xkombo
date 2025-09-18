import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Roboto } from "next/font/google";

const roboto = Roboto({ subsets: ["latin"], weight: ["400","500","700"], variable: "--font-shapiro" });

export const metadata: Metadata = {
  title: "2XKOmbo",
  description: "Share and save 2XKO combos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} antialiased min-h-dvh bg-background text-foreground`}>
        <header className="app-header">
          <nav className="app-nav" role="navigation" aria-label="Main navigation">
            <Link href="/" className="app-nav__brand" aria-label="2XKOmbo homepage">
              <span className="neon-title text-xl font-bold tracking-wide">2XKOmbo</span>
            </Link>
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
          </nav>
        </header>
        <main className="app-main" role="main">
          {children}
        </main>
      </body>
    </html>
  );
}
