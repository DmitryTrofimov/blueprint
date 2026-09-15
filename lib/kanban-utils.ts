import type { BoardPriority, BoardTask } from "@/types/board";

export const TASK_STATUS_ORDER = [
  "ToDo",
  "In Progress",
  "Blocked",
  "In Review",
  "Completed",
] as const;

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
  priorityName?: string | null;
  columnKey: string;
}): BoardTask {
  const assignee = getInitialsFromName(params.createdByName || "?");
  return {
    id: params.id,
    title: params.title,
    ai: false,
    assignee,
    assigneeColor: getAssigneeColor(params.createdByName || params.id),
    priority: mapPriorityNameToBoardPriority(params.priorityName),
  };
}

export function sortStatusesByWorkflow<T extends { name: string }>(statuses: T[]): T[] {
  const order = new Map(TASK_STATUS_ORDER.map((name, index) => [name, index]));
  return [...statuses].sort(
    (a, b) => (order.get(a.name as (typeof TASK_STATUS_ORDER)[number]) ?? 99) -
      (order.get(b.name as (typeof TASK_STATUS_ORDER)[number]) ?? 99),
  );
}
