import { ProfileSettingsPanel } from "@/components/app/profile-settings";
import { Topbar } from "@/components/app/topbar";
import { getProfileSettings } from "@/lib/supabase/profile-server";

export default async function ProfilePage() {
  const settingsResult = await getProfileSettings();

  return (
    <>
      <Topbar title="Profile" description="Manage your account settings" />
      <main className="flex-1 overflow-x-auto bg-background p-6">
        {settingsResult.data ? (
          <ProfileSettingsPanel
            initialSettings={settingsResult.data}
            initialError={settingsResult.error}
          />
        ) : (
          <div role="alert" className="auth-form-error rounded-xl px-4 py-3 text-sm">
            {settingsResult.error ?? "Unable to load profile settings."}
          </div>
        )}
      </main>
    </>
  );
}
