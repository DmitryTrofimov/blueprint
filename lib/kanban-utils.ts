import type { BoardPriority, BoardTask } from "@/types/board";

export const TASK_STATUS_ORDER = [
  "ToDo",
  "In Progress",
  "Blocked",
  "In Review",
  "Completed",
] as const;

export const TASK_PRIORITY_ORDER = ["Urgent", "High", "Average", "Low"] as const;

export const DEFAULT_TASK_PRIORITY_NAME = "Average";

export const TODO_STATUS_NAME = "ToDo";

export function isTodoStatusId(
  statusId: string,
  statuses: { id: string; name: string }[],
): boolean {
  return statuses.find((s) => s.id === statusId)?.name === TODO_STATUS_NAME;
}

export function progressForStatus(
  statusId: string,
  progress: number,
  statuses: { id: string; name: string }[],
): number {
  return isTodoStatusId(statusId, statuses) ? 0 : progress;
}

export function getStatusDotColor(statusName: string): string {
  switch (statusName) {
    case "ToDo":
      return "bg-zinc-400";
    case "In Progress":
      return "bg-accent-blue";
    case "Blocked":
      return "bg-red-500";
    case "In Review":
      return "bg-accent-orange";
    case "Completed":
      return "bg-accent-green";
    default:
      return "bg-zinc-400";
  }
}

export function getPriorityDotColor(priorityName: string): string {
  switch (priorityName) {
    case "Urgent":
      return "bg-red-700";
    case "High":
      return "bg-orange-500";
    case "Average":
      return "bg-yellow-400";
    case "Low":
      return "bg-emerald-500";
    default:
      return "bg-zinc-400";
  }
}

export function mapPriorityNameToBoardPriority(
  priorityName: string | null | undefined,
): BoardPriority | undefined {
  if (!priorityName) return undefined;
  switch (priorityName) {
    case "Urgent":
    case "High":
      return "high";
    case "Average":
      return "med";
    case "Low":
      return "low";
    default:
      return undefined;
  }
}

export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

const ASSIGNEE_COLORS = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-blue-600",
  "from-pink-500 to-rose-500",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
];

export function getAssigneeColor(seed: string): string {
  const index =
    [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    ASSIGNEE_COLORS.length;
  return ASSIGNEE_COLORS[index];
}

export function toBoardTask(params: {
  id: string;
  title: string;
  createdByName: string;
  assigneeName?: string | null;
  priorityName?: string | null;
  columnKey: string;
  description?: string;
  statusId?: string;
  priorityId?: string;
  assignedTo?: string;
  tags?: string[];
  deadline?: string;
  progress?: number;
}): BoardTask {
  const assigneeLabel =
    params.assigneeName?.trim() || params.createdByName?.trim() || "?";
  const assignee = getInitialsFromName(assigneeLabel);
  return {
    id: params.id,
    title: params.title,
    ai: false,
    assignee,
    assigneeColor: getAssigneeColor(assigneeLabel || params.id),
    priorityName: params.priorityName?.trim() || undefined,
    priority: mapPriorityNameToBoardPriority(params.priorityName),
    description: params.description,
    statusId: params.statusId,
    priorityId: params.priorityId,
    assignedTo: params.assignedTo,
    createdByName: params.createdByName,
    tags: params.tags?.length ? params.tags : undefined,
    deadline: params.deadline || undefined,
    progress: params.progress ?? 0,
  };
}

export function sortStatusesByWorkflow<T extends { name: string }>(statuses: T[]): T[] {
  const order = new Map(TASK_STATUS_ORDER.map((name, index) => [name, index]));
  return [...statuses].sort(
    (a, b) => (order.get(a.name as (typeof TASK_STATUS_ORDER)[number]) ?? 99) -
      (order.get(b.name as (typeof TASK_STATUS_ORDER)[number]) ?? 99),
  );
}

export function sortPrioritiesByWorkflow<T extends { name: string }>(priorities: T[]): T[] {
  const order = new Map(TASK_PRIORITY_ORDER.map((name, index) => [name, index]));
  return [...priorities].sort(
    (a, b) => (order.get(a.name as (typeof TASK_PRIORITY_ORDER)[number]) ?? 99) -
      (order.get(b.name as (typeof TASK_PRIORITY_ORDER)[number]) ?? 99),
  );
}
