import { AuthModalProvider } from "@/components/landing/auth-modal-context";
import { AuthStatusBanner } from "@/components/landing/auth-status-banner";
import { FeatureSections } from "@/components/landing/feature-sections";
import { Hero } from "@/components/landing/hero";
import { Navbar } from "@/components/landing/navbar";
import { Suspense } from "react";

export default function Home() {
  return (
    <AuthModalProvider>
      <Suspense fallback={null}>
        <AuthStatusBanner />
      </Suspense>
      <Navbar />
      <main>
        <Hero />
        <FeatureSections />
      </main>
      <footer className="border-t border-card-border/50 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple">
              <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-sm font-medium">Blueprint</span>
          </div>
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Blueprint. All rights reserved.
          </p>
        </div>
      </footer>
    </AuthModalProvider>
  );
}
