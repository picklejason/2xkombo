"use client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface LogoLinkProps {
  children: ReactNode;
}

export default function LogoLink({ children }: LogoLinkProps) {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // Navigate to home page with clean URL (no edit parameters)
    router.push('/');
  };

  return (
    <button
      onClick={handleClick}
      className="app-nav__brand"
      aria-label="2XKOmbo homepage"
    >
      {children}
    </button>
  );
}
