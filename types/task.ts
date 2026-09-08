export type TaskStatus = "backlog" | "todo" | "in_progress" | "review" | "done";

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId?: string;
  tags?: string[];
  dueDate?: string;
  aiGenerated?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  progress: number;
  tasks: Task[];
  team: TeamMember[];
}

export interface RoadmapNode {
  id: string;
  label: string;
  status: TaskStatus;
  x: number;
  y: number;
}

export interface RoadmapEdge {
  from: string;
  to: string;
}

export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  teamMembers: number;
  aiGeneratedTasks: number;
}
