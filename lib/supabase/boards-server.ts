import type { BoardItem } from "@/types/board";
import type { BoardColumn } from "@/types/board";
import {
  getStatusDotColor,
  sortStatusesByWorkflow,
  toBoardTask,
} from "@/lib/kanban-utils";
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

export async function getBoardById(id: string): Promise<{
  data: BoardItem | null;
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("boards")
    .select("id, name, description, created_at, updated_at, created_by, created_by_name")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return { data: null, error: error.message };
  }

  if (!data) {
    return { data: null, error: null };
  }

  return { data: mapRowToItem(data as BoardRow), error: null };
}

interface TaskStatusRow {
  id: string;
  name: string;
}

interface TaskRow {
  id: string;
  title: string;
  status_id: string;
  created_by_name: string;
  task_priority: { name: string } | { name: string }[] | null;
}

export async function getBoardKanbanColumns(boardId: string): Promise<{
  columns: BoardColumn[];
  error: string | null;
}> {
  const supabase = await createClient();

  const [statusResult, tasksResult] = await Promise.all([
    supabase.from("task_status").select("id, name"),
    supabase
      .from("tasks")
      .select("id, title, status_id, created_by_name, task_priority(name)")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true }),
  ]);

  if (statusResult.error) {
    return { columns: [], error: statusResult.error.message };
  }

  if (tasksResult.error) {
    return { columns: [], error: tasksResult.error.message };
  }

  const statuses = sortStatusesByWorkflow((statusResult.data ?? []) as TaskStatusRow[]);
  const tasks = (tasksResult.data ?? []) as TaskRow[];

  const columns: BoardColumn[] = statuses.map((status) => {
    const statusTasks = tasks.filter((task) => task.status_id === status.id);
    const columnKey = status.name.toLowerCase().replace(/\s+/g, "_");

    return {
      id: status.id,
      label: status.name,
      dotColor: getStatusDotColor(status.name),
      tasks: statusTasks.map((task) => {
        const priorityJoin = task.task_priority;
        const priorityName = Array.isArray(priorityJoin)
          ? priorityJoin[0]?.name
          : priorityJoin?.name;

        return toBoardTask({
          id: task.id,
          title: task.title,
          createdByName: task.created_by_name,
          priorityName,
          columnKey,
        });
      }),
    };
  });

  return { columns, error: null };
}
