import type { TaskBoardItem } from "@/types/board";
import { createClient } from "./server";

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

export async function listTaskBoardsServer(): Promise<{
  data: TaskBoardItem[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("task_boards")
    .select("id, name, description, created_at, updated_at, created_by, created_by_name")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return {
    data: (data as TaskBoardRow[]).map(mapRowToItem),
    error: null,
  };
}
