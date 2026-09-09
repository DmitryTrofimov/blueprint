import { createClient } from "@/lib/supabase/client";

export interface UpdatedProfile {
  username: string;
  roleId: string;
  roleName: string;
}

export async function updateCurrentUserProfile(params: {
  username: string;
  roleId: string;
}): Promise<{ data: UpdatedProfile | null; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "You must be signed in to update your profile." };
  }

  const { data: roleRow, error: roleError } = await supabase
    .from("roles")
    .select("id, name")
    .eq("id", params.roleId)
    .maybeSingle();

  if (roleError) {
    return { data: null, error: roleError.message };
  }

  if (!roleRow) {
    return { data: null, error: "Please select a valid role." };
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      username: params.username.trim(),
      role_id: params.roleId,
    })
    .eq("id", user.id)
    .select("username, role_id, roles(name)")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  const rolesJoin = data.roles as { name: string } | { name: string }[] | null;
  const joinedRoleName = Array.isArray(rolesJoin)
    ? rolesJoin[0]?.name
    : rolesJoin?.name;
  const roleName = joinedRoleName?.trim() || roleRow.name;

  return {
    data: {
      username: data.username,
      roleId: data.role_id,
      roleName,
    },
    error: null,
  };
}
