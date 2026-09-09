"use client";

import { useAuthModal } from "@/components/landing/auth-modal-context";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthStatusBanner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openLogin } = useAuthModal();
  const auth = searchParams.get("auth");
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (auth === "confirmed") {
      openLogin();
    }
  }, [auth, openLogin]);

  if (!auth || dismissed) {
    return null;
  }

  const isConfirmed = auth === "confirmed";
  const message = isConfirmed
    ? "Email confirmed successfully. You can now sign in."
    : "Email confirmation failed. Please try signing up again or contact support.";

  const dismiss = () => {
    setDismissed(true);
    router.replace("/", { scroll: false });
  };

  return (
    <div
      role="status"
      className={`fixed top-20 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 rounded-xl border px-4 py-3 text-sm shadow-lg ${
        isConfirmed
          ? "border-accent-green/30 bg-accent-green/10 text-foreground"
          : "auth-form-error"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p>{message}</p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-muted transition-colors hover:text-foreground"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
