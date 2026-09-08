import type {
  DashboardStats,
  Project,
  RoadmapEdge,
  RoadmapNode,
  Task,
  TeamMember,
} from "@/types/task";

export const teamMembers: TeamMember[] = [
  { id: "1", name: "Alex Chen", role: "Engineering Lead", avatar: "", initials: "AC" },
  { id: "2", name: "Sarah Kim", role: "Product Designer", avatar: "", initials: "SK" },
  { id: "3", name: "Marcus Johnson", role: "Backend Engineer", avatar: "", initials: "MJ" },
  { id: "4", name: "Elena Rodriguez", role: "Frontend Engineer", avatar: "", initials: "ER" },
  { id: "5", name: "David Park", role: "DevOps", avatar: "", initials: "DP" },
];

export const tasks: Task[] = [
  {
    id: "t1",
    title: "Launch Q2 Product Release",
    description: "Global goal for the quarter",
    status: "in_progress",
    priority: "high",
    aiGenerated: false,
  },
  {
    id: "t2",
    title: "Design system audit",
    description: "Review and update component library",
    status: "todo",
    priority: "medium",
    assigneeId: "2",
    aiGenerated: true,
    tags: ["design"],
  },
  {
    id: "t3",
    title: "API authentication refactor",
    description: "Migrate to OAuth 2.0",
    status: "in_progress",
    priority: "high",
    assigneeId: "3",
    aiGenerated: true,
    tags: ["backend"],
  },
  {
    id: "t4",
    title: "Dashboard performance optimization",
    status: "review",
    priority: "medium",
    assigneeId: "4",
    aiGenerated: true,
    tags: ["frontend"],
  },
  {
    id: "t5",
    title: "CI/CD pipeline setup",
    status: "todo",
    priority: "high",
    assigneeId: "5",
    aiGenerated: true,
    tags: ["devops"],
  },
  {
    id: "t6",
    title: "User onboarding flow",
    status: "backlog",
    priority: "low",
    assigneeId: "2",
    aiGenerated: true,
    tags: ["design", "frontend"],
  },
  {
    id: "t7",
    title: "Database migration plan",
    status: "done",
    priority: "urgent",
    assigneeId: "3",
    aiGenerated: true,
    tags: ["backend"],
  },
  {
    id: "t8",
    title: "Security audit",
    status: "todo",
    priority: "urgent",
    assigneeId: "1",
    aiGenerated: true,
    tags: ["security"],
  },
];

export const project: Project = {
  id: "p1",
  title: "Q2 Product Release",
  description: "Launch the next major version with AI-powered features",
  progress: 42,
  tasks,
  team: teamMembers,
};

export const dashboardStats: DashboardStats = {
  totalTasks: tasks.length,
  completedTasks: tasks.filter((t) => t.status === "done").length,
  inProgressTasks: tasks.filter((t) => t.status === "in_progress").length,
  teamMembers: teamMembers.length,
  aiGeneratedTasks: tasks.filter((t) => t.aiGenerated).length,
};

export const roadmapNodes: RoadmapNode[] = [
  { id: "n1", label: "Define scope", status: "done", x: 10, y: 50 },
  { id: "n2", label: "Design system", status: "in_progress", x: 30, y: 30 },
  { id: "n3", label: "API refactor", status: "in_progress", x: 30, y: 70 },
  { id: "n4", label: "Frontend build", status: "todo", x: 55, y: 50 },
  { id: "n5", label: "CI/CD setup", status: "todo", x: 55, y: 80 },
  { id: "n6", label: "QA & testing", status: "backlog", x: 75, y: 40 },
  { id: "n7", label: "Launch", status: "backlog", x: 90, y: 50 },
];

export const roadmapEdges: RoadmapEdge[] = [
  { from: "n1", to: "n2" },
  { from: "n1", to: "n3" },
  { from: "n2", to: "n4" },
  { from: "n3", to: "n4" },
  { from: "n3", to: "n5" },
  { from: "n4", to: "n6" },
  { from: "n5", to: "n6" },
  { from: "n6", to: "n7" },
];

export const kanbanColumns: { id: Task["status"]; label: string }[] = [
  { id: "backlog", label: "Backlog" },
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "review", label: "Review" },
  { id: "done", label: "Done" },
];

export function getTasksByStatus(status: Task["status"]): Task[] {
  return tasks.filter((t) => t.status === status);
}

export function getMemberById(id: string): TeamMember | undefined {
  return teamMembers.find((m) => m.id === id);
}
