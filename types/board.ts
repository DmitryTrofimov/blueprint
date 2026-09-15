export interface BoardItem {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
}

export type BoardPriority = "high" | "med" | "low";

export interface BoardTask {
  id: string;
  title: string;
  ai: boolean;
  assignee: string;
  assigneeColor: string;
  /** Priority label from task_priority (e.g. Urgent, Average). */
  priorityName?: string;
  /** Legacy mock kanban mapping. */
  priority?: BoardPriority;
  progress?: number;
  /** Populated for board tasks loaded from Supabase (edit form). */
  description?: string;
  statusId?: string;
  priorityId?: string;
  assignedTo?: string;
  createdByName?: string;
  tags?: string[];
  /** ISO date YYYY-MM-DD */
  deadline?: string;
}

export interface BoardColumn {
  id: string;
  label: string;
  dotColor: string;
  isTodo: boolean;
  tasks: BoardTask[];
}

export interface RouteMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  glowClass: string;
}

export interface RouteMapEdge {
  from: string;
  to: string;
}

export interface AIGeneratedTaskItem {
  category: string;
  color: "purple" | "blue" | "pink" | "orange" | "green" | "lavender";
  task: string;
}
