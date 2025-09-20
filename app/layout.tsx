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
  weight: ["400","500","700","900"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "2XKOMBO - Create, Share and Save 2XKO Combos",
  description: "Create, share, and save combos for 2XKO. Build your combos with our visual notation system.",
  keywords: "2XKO, combos, fighting game, Riot Games, combo notation, share combos",
  authors: [{ name: "2XKOMBO" }],
  openGraph: {
    title: "2XKOMBO - Create, Share and Save 2XKO Combos",
    description: "Create, share, and save combos for 2XKO. Build your combos with our visual notation system.",
    url: "https://2xkombo.app",
    siteName: "2XKOMBO",
    images: [
      {
        url: "/assets/preview.png",
        width: 1200,
        height: 630,
        alt: "2XKOMBO - Create, Share and Save 2XKO Combos",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "2XKOMBO - Create, Share and Save 2XKO Combos",
    description: "Create, share, and save combos for 2XKO. Build your combos with our visual notation system.",
    images: ["/assets/preview.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} font-sans antialiased min-h-dvh bg-background text-foreground`}>
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
