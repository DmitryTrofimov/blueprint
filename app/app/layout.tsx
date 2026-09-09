import { Sidebar } from "@/components/app/sidebar";
import { getCurrentUserProfile } from "@/lib/supabase/profile";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const profile = await getCurrentUserProfile();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar username={profile.username} role={profile.role} initials={profile.initials} />
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
