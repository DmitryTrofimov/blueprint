import type { BoardItem } from "@/types/board";
import { createClient } from "./server";

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

export async function listBoardsServer(): Promise<{
  data: BoardItem[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("id, name, description, created_at, updated_at, created_by, created_by_name")
    .order("created_at", { ascending: false });

  if (error) {
    return { data: [], error: error.message };
  }

  return {
    data: (data as BoardRow[]).map(mapRowToItem),
    error: null,
  };
}
