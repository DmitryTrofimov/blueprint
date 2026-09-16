import type { BoardColumn, BoardTask } from "@/types/board";
import type { TaskAssigneeOption } from "@/types/task-form";
import type { AiTasksCreatedDetail } from "@/lib/ai-task-plan-events";
import { toBoardTask } from "@/lib/kanban-utils";

export function mapAiPlanToBoardTasks(
  detail: AiTasksCreatedDetail,
  assigneeOptions: TaskAssigneeOption[],
): BoardTask[] {
  return detail.createdTasks.map((row, index) => {
    const planned = detail.plannedSubtasks[index];
    const assignment = detail.assignments[index];
    const assigneeName =
      assignment?.assignee_username ??
      assigneeOptions.find((option) => option.userId === row.assigned_to)?.username ??
      null;

    const task = toBoardTask({
      id: row.id,
      title: row.title,
      description: row.description,
      statusId: row.status_id,
      priorityId: row.priority_id ?? "",
      assignedTo: row.assigned_to ?? "",
      createdByName: row.created_by_name,
      assigneeName,
      priorityName: planned?.priority_hint ?? undefined,
      columnKey: detail.statusId,
      tags: ["AI"],
      progress: 0,
    });

    return { ...task, ai: true };
  });
}

export function resolveAiTasksTargetColumnId(
  columns: BoardColumn[],
  detail: AiTasksCreatedDetail,
): string | null {
  if (columns.some((column) => column.id === detail.statusId)) {
    return detail.statusId;
  }
  return columns.find((column) => column.isTodo)?.id ?? null;
}

export function mergeAiTasksIntoColumns(
  columns: BoardColumn[],
  detail: AiTasksCreatedDetail,
  assigneeOptions: TaskAssigneeOption[],
): BoardColumn[] {
  const newTasks = mapAiPlanToBoardTasks(detail, assigneeOptions);
  if (newTasks.length === 0) return columns;

  const targetColumnId = resolveAiTasksTargetColumnId(columns, detail);
  if (!targetColumnId) return columns;

  return columns.map((column) =>
    column.id === targetColumnId
      ? { ...column, tasks: [...column.tasks, ...newTasks] }
      : column,
  );
}
