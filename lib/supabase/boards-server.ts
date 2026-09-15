import type { BoardItem } from "@/types/board";
import type { BoardColumn } from "@/types/board";
import type { TaskAssigneeOption, TaskLookupOption } from "@/types/task-form";
import {
  getStatusDotColor,
  sortPrioritiesByWorkflow,
  sortStatusesByWorkflow,
  toBoardTask,
} from "@/lib/kanban-utils";
import { normalizeTaskTags } from "@/lib/task-form-validation";
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
  description: string;
  tags: string[] | null;
  status_id: string;
  priority_id: string | null;
  created_by_name: string;
  assigned_to: string | null;
  task_priority: { name: string } | { name: string }[] | null;
}

interface UserDirectoryRow {
  user_id: string;
  username: string;
  role_name: string;
}

export async function getTaskFormOptions(): Promise<{
  statuses: TaskLookupOption[];
  priorities: TaskLookupOption[];
  assignees: TaskAssigneeOption[];
  error: string | null;
}> {
  const supabase = await createClient();

  const [statusResult, priorityResult, assigneeResult] = await Promise.all([
    supabase.from("task_status").select("id, name"),
    supabase.from("task_priority").select("id, name"),
    supabase.from("user_directory").select("user_id, username, role_name").order("username"),
  ]);

  if (statusResult.error) {
    return { statuses: [], priorities: [], assignees: [], error: statusResult.error.message };
  }

  if (priorityResult.error) {
    return { statuses: [], priorities: [], assignees: [], error: priorityResult.error.message };
  }

  if (assigneeResult.error) {
    return { statuses: [], priorities: [], assignees: [], error: assigneeResult.error.message };
  }

  return {
    statuses: sortStatusesByWorkflow((statusResult.data ?? []) as TaskStatusRow[]).map(
      (row) => ({ id: row.id, name: row.name }),
    ),
    priorities: sortPrioritiesByWorkflow((priorityResult.data ?? []) as TaskLookupOption[]).map(
      (row) => ({
        id: row.id,
        name: row.name,
      }),
    ),
    assignees: ((assigneeResult.data ?? []) as UserDirectoryRow[]).map((row) => ({
      userId: row.user_id,
      username: row.username,
      roleName: row.role_name,
    })),
    error: null,
  };
}

export async function getBoardKanbanColumns(boardId: string): Promise<{
  columns: BoardColumn[];
  error: string | null;
}> {
  const supabase = await createClient();

  const [statusResult, tasksResult, directoryResult] = await Promise.all([
    supabase.from("task_status").select("id, name"),
    supabase
      .from("tasks")
      .select(
        "id, title, description, tags, status_id, priority_id, created_by_name, assigned_to, task_priority(name)",
      )
      .eq("board_id", boardId)
      .order("created_at", { ascending: true }),
    supabase.from("user_directory").select("user_id, username"),
  ]);

  if (statusResult.error) {
    return { columns: [], error: statusResult.error.message };
  }

  if (tasksResult.error) {
    return { columns: [], error: tasksResult.error.message };
  }

  if (directoryResult.error) {
    return { columns: [], error: directoryResult.error.message };
  }

  const statuses = sortStatusesByWorkflow((statusResult.data ?? []) as TaskStatusRow[]);
  const tasks = (tasksResult.data ?? []) as TaskRow[];
  const assigneeNames = new Map(
    ((directoryResult.data ?? []) as { user_id: string; username: string }[]).map(
      (row) => [row.user_id, row.username] as const,
    ),
  );

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
        const assigneeName = task.assigned_to
          ? assigneeNames.get(task.assigned_to)
          : null;

        return toBoardTask({
          id: task.id,
          title: task.title,
          description: task.description,
          statusId: task.status_id,
          priorityId: task.priority_id ?? "",
          assignedTo: task.assigned_to ?? "",
          createdByName: task.created_by_name,
          assigneeName,
          priorityName,
          columnKey,
          tags: normalizeTaskTags(task.tags ?? []),
        });
      }),
    };
  });

  return { columns, error: null };
}
