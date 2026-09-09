import type { TaskBoardItem } from "@/types/board";
import { createClient } from "@/lib/supabase/client";

interface TaskBoardRow {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  created_by_name: string;
}

function mapRowToItem(row: TaskBoardRow): TaskBoardItem {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
    createdBy: row.created_by_name,
    updatedAt: row.updated_at,
  };
}

export async function listTaskBoards(): Promise<{
  data: TaskBoardItem[] | null;
  error: string | null;
}> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("task_boards")
    .select("id, name, description, created_at, updated_at, created_by, created_by_name")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: (data as TaskBoardRow[]).map(mapRowToItem),
    error: null,
  };
}

export async function createTaskBoard(params: {
  name: string;
  description: string;
  createdByName: string;
}): Promise<{ data: TaskBoardItem | null; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "You must be signed in to create a board." };
  }

  const { data, error } = await supabase
    .from("task_boards")
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

  return { data: mapRowToItem(data as TaskBoardRow), error: null };
}

export async function updateTaskBoard(params: {
  id: string;
  name: string;
  description: string;
}): Promise<{ data: TaskBoardItem | null; error: string | null }> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("task_boards")
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

  return { data: mapRowToItem(data as TaskBoardRow), error: null };
}

export async function deleteTaskBoard(
  id: string,
): Promise<{ error: string | null }> {
  const supabase = createClient();
  const { error } = await supabase.from("task_boards").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
