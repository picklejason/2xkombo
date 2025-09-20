import type { Metadata } from "next";
import "./globals.css";
import { Roboto } from "next/font/google";
import { AuthProvider } from "@/lib/AuthContext";
import { ToastProvider } from "@/lib/ToastContext";
import { Navigation } from "@/components/Navigation";
import LogoLink from "../components/LogoLink";
import { Footer } from "@/components/Footer";
import { ImagePreloader } from "@/components/ImagePreloader";

const roboto = Roboto({ 
  subsets: ["latin"], 
  weight: ["400","500","700"], 
  variable: "--font-shapiro",
  display: "swap",
  preload: true
});

export const metadata: Metadata = {
  title: "2XKOMBO",
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
        <ToastProvider>
          <AuthProvider>
            <ImagePreloader />
            <header className="app-header">
              <nav className="app-nav" role="navigation" aria-label="Main navigation">
                <LogoLink>
                  <span className="neon-title text-2xl font-bold tracking-wide">2XKOMBO</span>
                </LogoLink>
                <Navigation />
              </nav>
            </header>
            <main className="app-main" role="main">
              {children}
            </main>
            <Footer />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
