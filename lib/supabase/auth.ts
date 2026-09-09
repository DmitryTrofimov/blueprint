import type { AuthError, Session, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export interface SignUpParams {
  email: string;
  password: string;
  username: string;
  role: string;
}

export interface AuthResult<T = { user: User | null; session: Session | null }> {
  data: T | null;
  error: AuthError | null;
}

export interface OAuthResult {
  data: { url: string | null } | null;
  error: AuthError | null;
}

function getAuthCallbackUrl(role?: string): string {
  const callbackUrl = new URL("/auth/callback", window.location.origin);
  callbackUrl.searchParams.set("next", "/app");
  if (role) {
    callbackUrl.searchParams.set("role", role);
  }
  return callbackUrl.toString();
}

export function getAuthErrorMessage(error: AuthError | null): string {
  if (!error) return "Something went wrong. Please try again.";

  switch (error.message) {
    case "Invalid login credentials":
      return "Invalid email or password.";
    case "Email not confirmed":
      return "Please confirm your email before signing in.";
    case "User already registered":
      return "An account with this email already exists.";
    default:
      return error.message;
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  return { data, error };
}

export async function signInWithGoogle(role?: string): Promise<OAuthResult> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthCallbackUrl(role),
      skipBrowserRedirect: true,
    },
  });

  return { data: data ? { url: data.url } : null, error };
}

export async function signUpWithEmail(params: SignUpParams): Promise<AuthResult> {
  const supabase = createClient();
  const redirectTo = getAuthCallbackUrl();

  const { data, error } = await supabase.auth.signUp({
    email: params.email.trim(),
    password: params.password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        username: params.username.trim(),
        role: params.role,
      },
    },
  });

  return { data, error };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}
