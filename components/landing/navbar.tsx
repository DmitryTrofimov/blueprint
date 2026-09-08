"use client";

import Link from "next/link";
import { useAuthModal } from "./auth-modal-context";
import { GhostButton, PrimaryButton } from "./cta-buttons";

const navLinks = [
  { href: "#product", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#route-map", label: "Route Map" },
  { href: "#integrations", label: "Integrations" },
  { href: "#how-it-works", label: "How it works" },
];

export function Navbar() {
  const { openLogin, openSignup } = useAuthModal();

  return (
    <header className="fixed top-0 z-50 w-full bg-background/60 backdrop-blur-xl">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8"
        aria-label="Main navigation"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight">Blueprint</span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <GhostButton onClick={openLogin} className="hidden sm:inline-flex">
            Log in
          </GhostButton>
          <PrimaryButton onClick={openSignup} className="px-4 py-2.5 text-sm">
            Get Started
          </PrimaryButton>
        </div>
      </nav>
    </header>
  );
}
