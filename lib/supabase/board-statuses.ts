import { createClient } from "@/lib/supabase/client";

export interface BoardStatusRow {
  id: string;
  board_id: string;
  name: string;
  position: number;
  is_todo: boolean;
}

const BOARD_STATUS_MAX_NAME_LENGTH = 40;

export function validateBoardStatusName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Column name is required";
  }
  if (trimmed.length > BOARD_STATUS_MAX_NAME_LENGTH) {
    return `Column name must be at most ${BOARD_STATUS_MAX_NAME_LENGTH} characters`;
  }
  return null;
}

export async function createBoardStatus(params: {
  boardId: string;
  name: string;
}): Promise<{ data: BoardStatusRow | null; error: string | null }> {
  const nameError = validateBoardStatusName(params.name);
  if (nameError) {
    return { data: null, error: nameError };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "You must be signed in to add a column." };
  }

  const { data: maxRow, error: maxError } = await supabase
    .from("board_statuses")
    .select("position")
    .eq("board_id", params.boardId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    return { data: null, error: maxError.message };
  }

  const nextPosition = maxRow ? maxRow.position + 1 : 0;

  const { data, error } = await supabase
    .from("board_statuses")
    .insert({
      board_id: params.boardId,
      name: params.name.trim(),
      position: nextPosition,
      is_todo: false,
    })
    .select("id, board_id, name, position, is_todo")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "A column with this name already exists on the board." };
    }
    return { data: null, error: error.message };
  }

  return { data: data as BoardStatusRow, error: null };
}

export async function renameBoardStatus(params: {
  id: string;
  name: string;
}): Promise<{ data: BoardStatusRow | null; error: string | null }> {
  const nameError = validateBoardStatusName(params.name);
  if (nameError) {
    return { data: null, error: nameError };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "You must be signed in to rename a column." };
  }

  const { data, error } = await supabase
    .from("board_statuses")
    .update({ name: params.name.trim() })
    .eq("id", params.id)
    .select("id, board_id, name, position, is_todo")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { data: null, error: "A column with this name already exists on the board." };
    }
    return { data: null, error: error.message };
  }

  return { data: data as BoardStatusRow, error: null };
}

export async function deleteBoardStatus(
  id: string,
  taskCount: number,
): Promise<{ error: string | null }> {
  if (taskCount > 0) {
    return { error: "Remove all tasks from this column before deleting it." };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to delete a column." };
  }

  const { error } = await supabase.from("board_statuses").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/** Reorder non-ToDo columns; ToDo must stay at index 0 in orderedIds. */
export async function reorderBoardStatuses(params: {
  boardId: string;
  orderedIds: string[];
}): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to reorder columns." };
  }

  const offset = 1000;
  for (let index = 0; index < params.orderedIds.length; index++) {
    const { error } = await supabase
      .from("board_statuses")
      .update({ position: offset + index })
      .eq("id", params.orderedIds[index])
      .eq("board_id", params.boardId);
    if (error) {
      return { error: error.message };
    }
  }

  for (let index = 0; index < params.orderedIds.length; index++) {
    const { error } = await supabase
      .from("board_statuses")
      .update({ position: index })
      .eq("id", params.orderedIds[index])
      .eq("board_id", params.boardId);
    if (error) {
      return { error: error.message };
    }
  }

  return { error: null };
}
