"use client";

import {
  EMPTY_LOGIN_VALUES,
  EMPTY_SIGNUP_VALUES,
  ROLE_OPTIONS,
  isLoginFormValid,
  isSignupFormValid,
  validateLoginField,
  validateLoginForm,
  validateSignupField,
  validateSignupForm,
  type AuthMode,
  type LoginField,
  type LoginFormValues,
  type SignupField,
  type SignupFormValues,
} from "@/lib/auth-validation";
import {
  getAuthErrorMessage,
  signInWithEmail,
  signUpWithEmail,
} from "@/lib/supabase/auth";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

export type { AuthMode };

interface AuthPopupProps {
  mode: AuthMode;
  onClose: () => void;
  onSwitchMode: (mode: AuthMode) => void;
}

export function AuthPopup({ mode, onClose, onSwitchMode }: AuthPopupProps) {
  const router = useRouter();
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [loginValues, setLoginValues] = useState<LoginFormValues>(EMPTY_LOGIN_VALUES);
  const [signupValues, setSignupValues] = useState<SignupFormValues>(EMPTY_SIGNUP_VALUES);
  const [loginTouched, setLoginTouched] = useState<Partial<Record<LoginField, boolean>>>({});
  const [signupTouched, setSignupTouched] = useState<Partial<Record<SignupField, boolean>>>({});
  const [loginErrors, setLoginErrors] = useState<Partial<Record<LoginField, string>>>({});
  const [signupErrors, setSignupErrors] = useState<Partial<Record<SignupField, string>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLogin = mode === "login";

  const formValid = useMemo(
    () => (isLogin ? isLoginFormValid(loginValues) : isSignupFormValid(signupValues)),
    [isLogin, loginValues, signupValues],
  );

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

  const clearAuthFeedback = useCallback(() => {
    setFormError(null);
    setSuccessMessage(null);
  }, []);

  const handleSwitchMode = useCallback(
    (newMode: AuthMode) => {
      if (mode === "login") {
        setLoginTouched({});
        setLoginErrors({});
      } else {
        setSignupTouched({});
        setSignupErrors({});
      }
      setSubmitAttempted(false);
      clearAuthFeedback();
      onSwitchMode(newMode);
    },
    [mode, onSwitchMode, clearAuthFeedback],
  );

  const updateLoginField = (field: LoginField, value: string) => {
    const next = { ...loginValues, [field]: value };
    setLoginValues(next);
    if (formError) setFormError(null);
    if (loginTouched[field] || submitAttempted) {
      const error = validateLoginField(field, next);
      setLoginErrors((prev) => {
        const updated = { ...prev };
        if (error) updated[field] = error;
        else delete updated[field];
        return updated;
      });
    }
  };

  const updateSignupField = (field: SignupField, value: string) => {
    const next = { ...signupValues, [field]: value };
    setSignupValues(next);
    if (formError) setFormError(null);
    if (signupTouched[field] || submitAttempted) {
      const fieldsToValidate: SignupField[] =
        field === "password" ? ["password", "confirmPassword"] : [field];
      setSignupErrors((prev) => {
        const updated = { ...prev };
        for (const f of fieldsToValidate) {
          const error = validateSignupField(f, next);
          if (error) updated[f] = error;
          else delete updated[f];
        }
        return updated;
      });
    }
  };

  const handleLoginBlur = (field: LoginField, value?: string) => {
    const values =
      value !== undefined ? { ...loginValues, [field]: value } : loginValues;
    setLoginTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateLoginField(field, values);
    setLoginErrors((prev) => {
      const updated = { ...prev };
      if (error) updated[field] = error;
      else delete updated[field];
      return updated;
    });
  };

  const handleSignupBlur = (field: SignupField, value?: string) => {
    const values =
      value !== undefined ? { ...signupValues, [field]: value } : signupValues;
    setSignupTouched((prev) => ({ ...prev, [field]: true }));
    const fieldsToValidate: SignupField[] =
      field === "password" ? ["password", "confirmPassword"] : [field];
    setSignupErrors((prev) => {
      const updated = { ...prev };
      for (const f of fieldsToValidate) {
        const error = validateSignupField(f, values);
        if (error) updated[f] = error;
        else delete updated[f];
      }
      return updated;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setFormError(null);
    setSuccessMessage(null);

    if (isLogin) {
      const errors = validateLoginForm(loginValues);
      setLoginErrors(errors);
      setLoginTouched({ email: true, password: true });
      if (Object.keys(errors).length > 0) return;

      setIsSubmitting(true);
      const { data, error } = await signInWithEmail(
        loginValues.email,
        loginValues.password,
      );
      setIsSubmitting(false);

      if (error) {
        setFormError(getAuthErrorMessage(error));
        return;
      }

      if (data?.session) {
        onClose();
        router.push("/app");
        router.refresh();
      }
    } else {
      const errors = validateSignupForm(signupValues);
      setSignupErrors(errors);
      setSignupTouched({
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
        role: true,
      });
      if (Object.keys(errors).length > 0) return;

      setIsSubmitting(true);
      const { data, error } = await signUpWithEmail({
        email: signupValues.email,
        password: signupValues.password,
        username: signupValues.username,
        role: signupValues.role,
      });
      setIsSubmitting(false);

      if (error) {
        setFormError(getAuthErrorMessage(error));
        return;
      }

      if (data?.session) {
        onClose();
        router.push("/app");
        router.refresh();
        return;
      }

      setSuccessMessage(
        `We sent a confirmation link to ${signupValues.email.trim()}. ` +
          "Please verify your email, then sign in to continue.",
      );
    }
  };

  const showLoginError = (field: LoginField) =>
    (loginTouched[field] || submitAttempted) && loginErrors[field];

  const showSignupError = (field: SignupField) =>
    (signupTouched[field] || submitAttempted) && signupErrors[field];

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
                {successMessage
                  ? "Check your email"
                  : isLogin
                    ? "Welcome back"
                    : "Create your account"}
              </h2>
              <p id={descId} className="mt-1 text-sm text-muted">
                {successMessage
                  ? "One more step to activate your account"
                  : isLogin
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

        {successMessage ? (
          <div className="space-y-4 px-6 py-5">
            <div className="rounded-xl border border-accent-green/30 bg-accent-green/10 px-4 py-3 text-sm text-foreground">
              {successMessage}
            </div>
            <p className="text-xs text-muted">
              The confirmation link will redirect through{" "}
              <code className="rounded bg-white/5 px-1 py-0.5">/auth/callback</code>{" "}
              and then to the app.
            </p>
            <button
              type="button"
              onClick={() => handleSwitchMode("login")}
              className="w-full rounded-xl bg-gradient-to-r from-accent-purple to-[#6366f1] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-purple/20 transition-all hover:brightness-110"
            >
              Go to Log in
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4 px-6 py-5">
            {formError && (
              <div role="alert" className="auth-form-error rounded-xl px-4 py-3 text-sm">
                {formError}
              </div>
            )}

            {!isLogin && (
              <Field
                label="Username"
                htmlFor="username"
                error={showSignupError("username")}
              >
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={signupValues.username}
                  onChange={(e) => updateSignupField("username", e.target.value)}
                  onBlur={(e) => handleSignupBlur("username", e.target.value)}
                  aria-invalid={Boolean(showSignupError("username"))}
                  aria-describedby={showSignupError("username") ? "username-error" : undefined}
                  className={cn("auth-input", showSignupError("username") && "auth-input-error")}
                  placeholder="John Doe"
                />
              </Field>
            )}

            <Field
              label="Email"
              htmlFor="email"
              error={isLogin ? showLoginError("email") : showSignupError("email")}
            >
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={isLogin ? loginValues.email : signupValues.email}
                onChange={(e) =>
                  isLogin
                    ? updateLoginField("email", e.target.value)
                    : updateSignupField("email", e.target.value)
                }
                onBlur={(e) =>
                  isLogin
                    ? handleLoginBlur("email", e.target.value)
                    : handleSignupBlur("email", e.target.value)
                }
                aria-invalid={Boolean(
                  isLogin ? showLoginError("email") : showSignupError("email"),
                )}
                aria-describedby={
                  (isLogin ? showLoginError("email") : showSignupError("email"))
                    ? "email-error"
                    : undefined
                }
                className={cn(
                  "auth-input",
                  (isLogin ? showLoginError("email") : showSignupError("email")) &&
                    "auth-input-error",
                )}
                placeholder="john.doe@example.com"
              />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              error={isLogin ? showLoginError("password") : showSignupError("password")}
            >
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={isLogin ? loginValues.password : signupValues.password}
                onChange={(e) =>
                  isLogin
                    ? updateLoginField("password", e.target.value)
                    : updateSignupField("password", e.target.value)
                }
                onBlur={(e) =>
                  isLogin
                    ? handleLoginBlur("password", e.target.value)
                    : handleSignupBlur("password", e.target.value)
                }
                aria-invalid={Boolean(
                  isLogin ? showLoginError("password") : showSignupError("password"),
                )}
                aria-describedby={
                  (isLogin ? showLoginError("password") : showSignupError("password"))
                    ? "password-error"
                    : undefined
                }
                className={cn(
                  "auth-input",
                  (isLogin ? showLoginError("password") : showSignupError("password")) &&
                    "auth-input-error",
                )}
                placeholder="************"
              />
            </Field>

            {!isLogin && (
              <>
                <Field
                  label="Confirm password"
                  htmlFor="confirmPassword"
                  error={showSignupError("confirmPassword")}
                >
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={signupValues.confirmPassword}
                    onChange={(e) => updateSignupField("confirmPassword", e.target.value)}
                    onBlur={(e) => handleSignupBlur("confirmPassword", e.target.value)}
                    aria-invalid={Boolean(showSignupError("confirmPassword"))}
                    aria-describedby={
                      showSignupError("confirmPassword") ? "confirmPassword-error" : undefined
                    }
                    className={cn(
                      "auth-input",
                      showSignupError("confirmPassword") && "auth-input-error",
                    )}
                    placeholder="************"
                  />
                </Field>

                <Field label="Role" htmlFor="role" error={showSignupError("role")}>
                  <select
                    id="role"
                    name="role"
                    value={signupValues.role}
                    onChange={(e) => updateSignupField("role", e.target.value)}
                    onBlur={(e) => handleSignupBlur("role", e.target.value)}
                    aria-invalid={Boolean(showSignupError("role"))}
                    aria-describedby={showSignupError("role") ? "role-error" : undefined}
                    className={cn(
                      "auth-input auth-select",
                      showSignupError("role") && "auth-input-error",
                    )}
                  >
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
              disabled={!formValid || isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-accent-purple to-[#6366f1] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent-purple/20 transition-all hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100"
            >
              {isSubmitting ? "Please wait..." : isLogin ? "Log in" : "Create account"}
            </button>
          </form>
        )}

        {!successMessage && (
          <div className="border-t border-card-border px-6 py-4 text-center text-sm text-muted">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => handleSwitchMode("signup")}
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
                  onClick={() => handleSwitchMode("login")}
                  className="font-medium text-accent-purple-light transition-colors hover:text-foreground"
                >
                  Log in
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | false;
  children: React.ReactNode;
}) {
  const errorId = `${htmlFor}-error`;

  return (
    <div className="block">
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} role="alert" className="auth-error mt-1.5 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
