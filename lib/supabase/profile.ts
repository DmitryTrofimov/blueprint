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
    getEmailPrefix(user.email) ||
    "User";
  const role = profile?.role?.trim() || "Member";

  return {
    username,
    role,
    initials: getInitials(username),
  };
}
