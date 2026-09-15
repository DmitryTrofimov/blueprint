import type { BoardTask } from "@/types/board";
import { toBoardTask } from "@/lib/kanban-utils";
import { normalizeTaskTags } from "@/lib/task-form-validation";
import { createClient } from "@/lib/supabase/client";

export interface TaskMutationResult {
  statusId: string;
  task: BoardTask;
}

interface TaskRow {
  id: string;
  title: string;
  description: string;
  tags: string[] | null;
  status_id: string;
  priority_id: string | null;
  assigned_to: string | null;
  created_by_name: string;
  deadline: string | null;
  progress: number;
  task_priority: { name: string } | { name: string }[] | null;
}

const TASK_SELECT =
  "id, title, description, tags, status_id, priority_id, assigned_to, created_by_name, deadline, progress, task_priority(name)";

function getPriorityName(
  priorityJoin: TaskRow["task_priority"],
): string | null {
  if (!priorityJoin) return null;
  if (Array.isArray(priorityJoin)) return priorityJoin[0]?.name ?? null;
  return priorityJoin.name;
}

function mapRowToResult(
  row: TaskRow,
  assigneeName: string | null | undefined,
): TaskMutationResult {
  const priorityName = getPriorityName(row.task_priority);
  return {
    statusId: row.status_id,
    task: toBoardTask({
      id: row.id,
      title: row.title,
      description: row.description,
      statusId: row.status_id,
      priorityId: row.priority_id ?? "",
      assignedTo: row.assigned_to ?? "",
      createdByName: row.created_by_name,
      assigneeName,
      priorityName,
      columnKey: row.status_id,
      tags: normalizeTaskTags(row.tags ?? []),
      deadline: row.deadline ?? undefined,
      progress: row.progress,
    }),
  };
}

export async function createTask(params: {
  boardId: string;
  title: string;
  description: string;
  statusId: string;
  priorityId: string;
  assignedTo: string;
  createdByName: string;
  assigneeName?: string | null;
  tags: string[];
  deadline: string | null;
  progress: number;
}): Promise<{ data: TaskMutationResult | null; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "You must be signed in to create a task." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      board_id: params.boardId,
      title: params.title.trim(),
      description: params.description.trim(),
      tags: params.tags,
      status_id: params.statusId,
      priority_id: params.priorityId,
      assigned_to: params.assignedTo,
      deadline: params.deadline,
      progress: params.progress,
      created_by: user.id,
      created_by_name: params.createdByName,
    })
    .select(TASK_SELECT)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: mapRowToResult(data as TaskRow, params.assigneeName),
    error: null,
  };
}

export async function updateTask(params: {
  id: string;
  title: string;
  description: string;
  statusId: string;
  priorityId: string;
  assignedTo: string;
  assigneeName?: string | null;
  tags: string[];
  deadline: string | null;
  progress: number;
}): Promise<{ data: TaskMutationResult | null; error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { data: null, error: "You must be signed in to update a task." };
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      title: params.title.trim(),
      description: params.description.trim(),
      tags: params.tags,
      status_id: params.statusId,
      priority_id: params.priorityId,
      assigned_to: params.assignedTo,
      deadline: params.deadline,
      progress: params.progress,
    })
    .eq("id", params.id)
    .select(TASK_SELECT)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: mapRowToResult(data as TaskRow, params.assigneeName),
    error: null,
  };
}

export async function updateTaskStatus(params: {
  id: string;
  statusId: string;
  resetProgress?: boolean;
}): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to update a task." };
  }

  const payload: { status_id: string; progress?: number } = {
    status_id: params.statusId,
  };
  if (params.resetProgress) {
    payload.progress = 0;
  }

  const { error } = await supabase.from("tasks").update(payload).eq("id", params.id);

  return { error: error?.message ?? null };
}

export async function deleteTask(id: string): Promise<{ error: string | null }> {
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "You must be signed in to delete a task." };
  }

  const { error } = await supabase.from("tasks").delete().eq("id", id);

  return { error: error?.message ?? null };
}
