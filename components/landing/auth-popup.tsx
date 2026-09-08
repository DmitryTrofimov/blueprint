"use client";

import { useEffect, useId, useRef } from "react";

export type AuthMode = "login" | "signup";

const ROLE_OPTIONS = [
  "Backend Developer",
  "DevOps Engineer",
  "Frontend Developer",
  "Manager",
  "QA Engineer",
  "UI/UX",
] as const;

interface AuthPopupProps {
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
}

export function AuthPopup({ mode, onClose, onSwitchMode }: AuthPopupProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onClose();
  };

  const isLogin = mode === "login";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-card-border bg-surface-window glow-purple"
      >
        <div className="border-b border-card-border px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="text-xl font-semibold">
                {isLogin ? "Welcome back" : "Create your account"}
              </h2>
              <p id={descId} className="mt-1 text-sm text-muted">
                {isLogin
                  ? "Sign in to continue"
                  : "Start planning and executing with your team"}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-card-border p-1.5 text-muted transition-colors hover:border-white/15 hover:text-foreground"
              aria-label="Close"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {!isLogin && (
            <Field label="Username" htmlFor="username">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="auth-input"
                placeholder="John Doe"
              />
            </Field>
          )}

          <Field label="Email" htmlFor="email">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="auth-input"
              placeholder="john.doe@example.com"
            />
          </Field>

          <Field label="Password" htmlFor="password">
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              className="auth-input"
              placeholder="************"
            />
          </Field>

          {!isLogin && (
            <>
              <Field label="Confirm password" htmlFor="confirmPassword">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="auth-input"
                  placeholder="************"
                />
              </Field>

              <Field label="Role" htmlFor="role">
                <select id="role" name="role" required className="auth-input auth-select" defaultValue="">
                  <option value="" disabled>
                    Select your role
                  </option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </Field>
            </>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-gradient-to-r from-accent-purple to-[#6366f1] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-purple/20 transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple"
          >
            {isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <div className="border-t border-card-border px-6 py-4 text-center text-sm text-muted">
          {isLogin ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => onSwitchMode("signup")}
                className="font-medium text-accent-purple-light transition-colors hover:text-foreground"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => onSwitchMode("login")}
                className="font-medium text-accent-purple-light transition-colors hover:text-foreground"
              >
                Log in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
    </label>
  );
}
