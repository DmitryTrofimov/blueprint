import { AppShell } from "@/components/app/app-shell";
import { getCurrentUserProfile } from "@/lib/supabase/profile-server";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const profile = await getCurrentUserProfile();

  return (
    <AppShell
      username={profile.username}
      role={profile.role}
      initials={profile.initials}
    >
      {children}
    </AppShell>
  );
}
