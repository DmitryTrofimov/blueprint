import type { BoardItem } from "@/types/board";
import { createClient } from "@/lib/supabase/client";

interface BoardRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  created_by_name: string;
}

function mapRowToItem(row: BoardRow): BoardItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    createdBy: row.created_by_name,
    updatedAt: row.updated_at,
  };
}

export async function listBoards(): Promise<{
  data: BoardItem[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("id, name, description, created_at, updated_at, created_by, created_by_name")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: (data as BoardRow[]).map(mapRowToItem),
    error: null,
  };
}

export async function createBoard(params: {
  name: string;
  description: string;
  createdByName: string;
}): Promise<{ data: BoardItem | null; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "You must be signed in to create a board." };
  }

  const { data, error } = await supabase
    .from("boards")
    .insert({
      name: params.name,
      description: params.description,
      created_by: user.id,
      created_by_name: params.createdByName,
    })
    .select("id, name, description, created_at, updated_at, created_by, created_by_name")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: mapRowToItem(data as BoardRow), error: null };
}

export async function updateBoard(params: {
  id: string;
  name: string;
  description: string;
}): Promise<{ data: BoardItem | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("boards")
    .update({
      name: params.name,
      description: params.description,
    })
    .eq("id", params.id)
    .select("id, name, description, created_at, updated_at, created_by, created_by_name")
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: mapRowToItem(data as BoardRow), error: null };
}

export async function deleteBoard(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("boards").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
