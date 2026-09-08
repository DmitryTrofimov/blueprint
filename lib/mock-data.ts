import type {
  AIGeneratedTaskItem,
  BoardColumn,
  RouteMapEdge,
  RouteMapNode,
} from "@/types/board";
import type {
  DashboardStats,
  Project,
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
    title: "Q4 Product Launch",
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
  title: "Q4 Product Launch",
  description: "Launch the next major version with AI-powered features",
  progress: 58,
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

export const boardColumns: BoardColumn[] = [
  {
    id: "todo",
    label: "To Do",
    dotColor: "bg-zinc-400",
    tasks: [
      {
        id: "1",
        title: "Define brand voice guidelines",
        ai: true,
        assignee: "SJ",
        assigneeColor: "from-violet-500 to-purple-600",
        priority: "high",
      },
      {
        id: "2",
        title: "Competitive analysis report",
        ai: false,
        assignee: "MK",
        assigneeColor: "from-blue-500 to-blue-600",
        priority: "med",
      },
      {
        id: "3",
        title: "Write launch blog post",
        ai: true,
        assignee: "AL",
        assigneeColor: "from-pink-500 to-rose-500",
        priority: "low",
      },
    ],
  },
  {
    id: "in_progress",
    label: "In Progress",
    dotColor: "bg-accent-blue",
    tasks: [
      {
        id: "4",
        title: "Design landing page mockups",
        ai: true,
        assignee: "SJ",
        assigneeColor: "from-violet-500 to-purple-600",
        progress: 65,
      },
      {
        id: "5",
        title: "Set up analytics tracking",
        ai: false,
        assignee: "MK",
        assigneeColor: "from-blue-500 to-blue-600",
        progress: 40,
      },
    ],
  },
  {
    id: "review",
    label: "Review",
    dotColor: "bg-accent-orange",
    tasks: [
      {
        id: "6",
        title: "API rate limiting implementation",
        ai: true,
        assignee: "AL",
        assigneeColor: "from-pink-500 to-rose-500",
        progress: 90,
      },
    ],
  },
  {
    id: "done",
    label: "Done",
    dotColor: "bg-accent-green",
    tasks: [
      {
        id: "7",
        title: "Database schema migration",
        ai: true,
        assignee: "AL",
        assigneeColor: "from-pink-500 to-rose-500",
      },
      {
        id: "8",
        title: "CI/CD pipeline setup",
        ai: false,
        assignee: "MK",
        assigneeColor: "from-blue-500 to-blue-600",
      },
    ],
  },
];

export const aiGeneratedTasks: AIGeneratedTaskItem[] = [
  { category: "Strategy", color: "purple", task: "Define ICP and enterprise buyer persona" },
  { category: "Finance", color: "blue", task: "Build pricing model with volume discounts" },
  { category: "Docs", color: "pink", task: "Create technical onboarding documentation" },
  { category: "Design", color: "orange", task: "Design enterprise dashboard UI" },
  { category: "Engineering", color: "green", task: "Implement SSO and SCIM provisioning" },
  { category: "Ops", color: "lavender", task: "Set up enterprise SLA and support tier" },
];

export const routeMapNodes: RouteMapNode[] = [
  { id: "start", label: "Q4 Launch", x: 8, y: 50, color: "#7c3aed", glowClass: "node-glow-purple" },
  { id: "strategy", label: "Strategy", x: 28, y: 22, color: "#3b82f6", glowClass: "node-glow-blue" },
  { id: "icp", label: "ICP Research", x: 48, y: 12, color: "#3b82f6", glowClass: "node-glow-blue" },
  { id: "gtm", label: "GTM Plan", x: 48, y: 32, color: "#3b82f6", glowClass: "node-glow-blue" },
  { id: "design", label: "Design", x: 28, y: 50, color: "#ec4899", glowClass: "node-glow-pink" },
  { id: "ui", label: "UI Design", x: 48, y: 50, color: "#ec4899", glowClass: "node-glow-pink" },
  { id: "eng", label: "Engineering", x: 28, y: 78, color: "#f59e0b", glowClass: "node-glow-orange" },
  { id: "api", label: "API Build", x: 48, y: 68, color: "#f59e0b", glowClass: "node-glow-orange" },
  { id: "sso", label: "SSO Integration", x: 48, y: 88, color: "#f59e0b", glowClass: "node-glow-orange" },
  { id: "launch", label: "Launch 🚀", x: 88, y: 50, color: "#10b981", glowClass: "node-glow-green" },
];

export const routeMapEdges: RouteMapEdge[] = [
  { from: "start", to: "strategy" },
  { from: "start", to: "design" },
  { from: "start", to: "eng" },
  { from: "strategy", to: "icp" },
  { from: "strategy", to: "gtm" },
  { from: "design", to: "ui" },
  { from: "eng", to: "api" },
  { from: "eng", to: "sso" },
  { from: "icp", to: "launch" },
  { from: "gtm", to: "launch" },
  { from: "ui", to: "launch" },
  { from: "api", to: "launch" },
  { from: "sso", to: "launch" },
];

export const teamAvatarColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-blue-600",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
];

export const roadmapNodes = routeMapNodes;
export const roadmapEdges = routeMapEdges;
