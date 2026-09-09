"use client";

import type { ProfileSettings, RoleOption } from "@/lib/supabase/profile-server";
import { updateCurrentUserProfile } from "@/lib/supabase/profile";
import { validateUsername } from "@/lib/auth-validation";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ProfileFormValues {
  username: string;
  roleId: string;
}

interface ProfileSettingsPanelProps {
  initialSettings: ProfileSettings;
  initialError?: string | null;
}

export function ProfileSettingsPanel({
  initialSettings,
  initialError = null,
}: ProfileSettingsPanelProps) {
  const router = useRouter();

  const [settings, setSettings] = useState(initialSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(initialError);
  const [editForm, setEditForm] = useState<ProfileFormValues>({
    username: initialSettings.username,
    roleId: initialSettings.roleId ?? "",
  });
  const [editError, setEditError] = useState<string | null>(null);

  const startEdit = () => {
    setEditForm({
      username: settings.username,
      roleId: settings.roleId ?? settings.roles[0]?.id ?? "",
    });
    setEditError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      username: settings.username,
      roleId: settings.roleId ?? "",
    });
    setEditError(null);
  };

  const handleSave = async () => {
    const usernameError = validateUsername(editForm.username);
    if (usernameError) {
      setEditError(usernameError);
      return;
    }

    if (!editForm.roleId) {
      setEditError("Please select a role");
      return;
    }

    setIsSaving(true);
    setActionError(null);

    const { data, error } = await updateCurrentUserProfile({
      username: editForm.username,
      roleId: editForm.roleId,
    });

    setIsSaving(false);

    if (error || !data) {
      setEditError(error ?? "Failed to update profile.");
      return;
    }

    setSettings((prev) => ({
      ...prev,
      username: data.username,
      roleId: data.roleId,
      roleName: data.roleName,
    }));
    setIsEditing(false);
    setEditError(null);
    router.refresh();
  };

  return (
    <>
      {actionError && (
        <div role="alert" className="auth-form-error mb-4 rounded-xl px-4 py-3 text-sm">
          {actionError}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-card-border bg-surface-window">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-card-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">Profile Settings</h2>
            <p className="mt-1 text-sm text-muted">Update your display name and role</p>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={startEdit}
              disabled={isSaving}
              className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
            >
              Edit
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-sm">
            <thead>
              <tr className="border-b border-card-border bg-white/[0.02] text-xs uppercase tracking-wide text-muted">
                <th className="px-6 py-3 font-medium">Field</th>
                <th className="px-6 py-3 font-medium">Value</th>
                {isEditing && <th className="px-6 py-3 font-medium">Actions</th>}
              </tr>
            </thead>
            <tbody>
              <ProfileFieldRow
                label="Username"
                isEditing={isEditing}
                isSaving={isSaving}
                displayValue={settings.username}
                editValue={editForm.username}
                onEditChange={(value) => {
                  setEditForm((prev) => ({ ...prev, username: value }));
                  if (editError) setEditError(null);
                }}
                inputType="text"
              />
              <ProfileFieldRow
                label="Role"
                isEditing={isEditing}
                isSaving={isSaving}
                displayValue={settings.roleName}
                editValue={editForm.roleId}
                onEditChange={(value) => {
                  setEditForm((prev) => ({ ...prev, roleId: value }));
                  if (editError) setEditError(null);
                }}
                inputType="select"
                roles={settings.roles}
              />
              {isEditing && (
                <tr className="border-b border-card-border/70 last:border-b-0">
                  <td className="px-6 py-4" colSpan={3}>
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="rounded-lg bg-accent-purple/15 px-3 py-1.5 text-xs font-medium text-accent-purple-light transition-colors hover:bg-accent-purple/25 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          disabled={isSaving}
                          className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                      {editError && (
                        <p className="auth-error text-xs" role="alert">
                          {editError}
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function ProfileFieldRow({
  label,
  isEditing,
  isSaving,
  displayValue,
  editValue,
  onEditChange,
  inputType,
  roles = [],
}: {
  label: string;
  isEditing: boolean;
  isSaving: boolean;
  displayValue: string;
  editValue: string;
  onEditChange: (value: string) => void;
  inputType: "text" | "select";
  roles?: RoleOption[];
}) {
  return (
    <tr className="border-b border-card-border/70 last:border-b-0">
      <td className="px-6 py-4 align-top font-medium text-foreground">{label}</td>
      <td className="px-6 py-4 align-top">
        {isEditing ? (
          inputType === "select" ? (
            <select
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              disabled={isSaving}
              className="auth-input auth-select w-full min-w-[200px]"
              aria-label={`Edit ${label.toLowerCase()}`}
            >
              <option value="" disabled>
                Select your role
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => onEditChange(e.target.value)}
              disabled={isSaving}
              className="auth-input w-full min-w-[200px]"
              aria-label={`Edit ${label.toLowerCase()}`}
            />
          )
        ) : (
          <span className={cn(label === "Role" ? "text-muted" : "font-medium text-foreground")}>
            {displayValue || "—"}
          </span>
        )}
      </td>
      {isEditing && <td className="px-6 py-4 align-top" />}
    </tr>
  );
}
