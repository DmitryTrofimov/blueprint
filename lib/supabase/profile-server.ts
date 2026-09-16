import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";

export interface UserProfile {
  username: string;
  role: string;
  initials: string;
}

export interface RoleOption {
  id: string;
  name: string;
}

export interface ProfileSettings {
  username: string;
  roleId: string | null;
  roleName: string;
  telegramUsername: string | null;
  roles: RoleOption[];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function getEmailPrefix(email: string | undefined): string | null {
  if (!email) return null;
  const prefix = email.split("@")[0]?.trim();
  return prefix || null;
}

function getRoleNameFromProfile(
  roles: { name: string } | { name: string }[] | null | undefined,
): string | null {
  if (!roles) return null;
  const role = Array.isArray(roles) ? roles[0] : roles;
  const name = role?.name?.trim();
  return name || null;
}

function getMetadataString(metadata: Record<string, unknown>, key: string): string | null {
  const value = metadata[key];
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function getDisplayNameFromOAuthUser(user: User): string | null {
  const metadata = user.user_metadata ?? {};
  return (
    getMetadataString(metadata, "username") ||
    getMetadataString(metadata, "full_name") ||
    getMetadataString(metadata, "name") ||
    getMetadataString(metadata, "preferred_username")
  );
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { username: "User", role: "Reviewer", initials: "U" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, roles(name)")
    .eq("id", user.id)
    .maybeSingle();

  const username =
    profile?.username?.trim() ||
    getDisplayNameFromOAuthUser(user) ||
    getEmailPrefix(user.email) ||
    "User";
  const role = getRoleNameFromProfile(profile?.roles) || "Reviewer";

  return {
    username,
    role,
    initials: getInitials(username),
  };
}

export async function getProfileSettings(): Promise<{
  data: ProfileSettings | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "You must be signed in to view profile settings." };
  }

  const [profileResult, rolesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("username, role_id, telegram_username, roles(name)")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("roles").select("id, name").order("name"),
  ]);

  if (profileResult.error) {
    return { data: null, error: profileResult.error.message };
  }

  if (rolesResult.error) {
    return { data: null, error: rolesResult.error.message };
  }

  const profile = profileResult.data;
  const roles = (rolesResult.data ?? []) as RoleOption[];

  const username =
    profile?.username?.trim() ||
    getDisplayNameFromOAuthUser(user) ||
    getEmailPrefix(user.email) ||
    "User";
  const roleName = getRoleNameFromProfile(profile?.roles) || "Reviewer";

  return {
    data: {
      username,
      roleId: profile?.role_id ?? null,
      roleName,
      telegramUsername: profile?.telegram_username?.trim() || null,
      roles,
    },
    error: null,
  };
}
