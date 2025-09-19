import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Roboto } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import { Navigation } from "@/components/Navigation";
import { LogoLink } from "@/components/LogoLink";
import { Footer } from "@/components/Footer";

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
        <AuthProvider>
          <header className="app-header">
            <nav className="app-nav" role="navigation" aria-label="Main navigation">
              <LogoLink>
                <span className="neon-title text-2xl font-bold tracking-wide">2XKOmbo</span>
              </LogoLink>
              <Navigation />
            </nav>
          </header>
          <main className="app-main" role="main">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
