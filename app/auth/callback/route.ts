import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType, User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ROLE_OPTIONS, type RoleOption } from "@/lib/auth-validation";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const DEFAULT_NEXT = "/app";
const DEFAULT_OAUTH_ROLE = "Reviewer";

function getSafeNext(next: string | null): string {
  if (next && next.startsWith("/")) {
    return next;
  }
  return DEFAULT_NEXT;
}

function getSelectedRole(role: string | null): string | null {
  if (!role) return null;
  const normalizedRole = role.trim();
  if (!normalizedRole) return null;
  return ROLE_OPTIONS.includes(normalizedRole as RoleOption) ? normalizedRole : null;
}

function getUsernameFromOAuthUser(user: User): string {
  const preferredName =
    (typeof user.user_metadata?.username === "string" &&
      user.user_metadata.username.trim()) ||
    (typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata?.name === "string" &&
      user.user_metadata.name.trim()) ||
    user.email?.split("@")[0]?.trim();

  return preferredName || "User";
}

async function applyOAuthProfileUpdates(
  supabase: ReturnType<typeof createServerClient>,
  selectedRole: string | null,
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return;

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role_id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) return;

  const updates: { username?: string; role_id?: string } = {};
  const username = profile.username?.trim() || getUsernameFromOAuthUser(user);

  if (username && username !== profile.username?.trim()) {
    updates.username = username;
  }

  if (!profile.role_id) {
    const roleName = selectedRole ?? DEFAULT_OAUTH_ROLE;
    const { data: roleRow } = await supabase
      .from("roles")
      .select("id")
      .eq("name", roleName)
      .maybeSingle();

    if (roleRow) {
      updates.role_id = roleRow.id;
    }
  }

  if (Object.keys(updates).length === 0) return;

  await supabase.from("profiles").update(updates).eq("id", user.id);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const selectedRole = getSelectedRole(searchParams.get("role"));
  const safeNext = getSafeNext(searchParams.get("next"));
  const redirectUrl = `${origin}${safeNext}`;
  const redirectResponse = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          redirectResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      await applyOAuthProfileUpdates(supabase, selectedRole);
      return redirectResponse;
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as EmailOtpType,
    });
    if (!error) {
      await applyOAuthProfileUpdates(supabase, selectedRole);
      return redirectResponse;
    }
  }

  return NextResponse.redirect(`${origin}/?auth=error`);
}
