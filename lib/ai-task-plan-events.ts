export const AI_TASKS_CREATED_EVENT = "blueprint:ai-tasks-created";

export type AiPlannedSubtask = {
  title: string;
  description: string;
  role_name: string;
  priority_hint: string;
};

export type AiAssignmentMeta = {
  role_name: string;
  assigned_to: string | null;
  assignee_username: string | null;
  fallback: "direct" | "manager" | "unassigned";
};

export type AiCreatedTaskRow = {
  id: string;
  board_id: string;
  title: string;
  description: string;
  status_id: string;
  priority_id: string | null;
  assigned_to: string | null;
  created_by_name: string;
};

export type AiTasksCreatedDetail = {
  boardId: string;
  statusId: string;
  plannedSubtasks: AiPlannedSubtask[];
  assignments: AiAssignmentMeta[];
  createdTasks: AiCreatedTaskRow[];
};

export function dispatchAiTasksCreated(detail: AiTasksCreatedDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<AiTasksCreatedDetail>(AI_TASKS_CREATED_EVENT, { detail }),
  );
}
