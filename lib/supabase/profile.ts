import type { User } from "@supabase/supabase-js";
import { createClient } from "./server";

export interface UserProfile {
  username: string;
  role: string;
  initials: string;
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
    return { username: "User", role: "Member", initials: "U" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, role")
    .eq("id", user.id)
    .maybeSingle();

  const username =
    profile?.username?.trim() ||
    getDisplayNameFromOAuthUser(user) ||
    getEmailPrefix(user.email) ||
    "User";
  const role = profile?.role?.trim() || "Member";

  return {
    username,
    role,
    initials: getInitials(username),
  };
}
