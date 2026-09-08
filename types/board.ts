export type BoardPriority = "high" | "med" | "low";

export interface BoardTask {
  id: string;
  title: string;
  ai: boolean;
  assignee: string;
  assigneeColor: string;
  priority?: BoardPriority;
  progress?: number;
}

export interface BoardColumn {
  id: string;
  label: string;
  dotColor: string;
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
