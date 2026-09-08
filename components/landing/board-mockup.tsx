import { cn } from "@/lib/utils";

type Priority = "high" | "med" | "low";

interface BoardTask {
  id: string;
  title: string;
  ai: boolean;
  assignee: string;
  assigneeColor: string;
  priority?: Priority;
  progress?: number;
}

interface BoardColumn {
  id: string;
  label: string;
  dotColor: string;
  tasks: BoardTask[];
}

const columns: BoardColumn[] = [
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

const priorityStyles: Record<Priority, { dot: string; label: string }> = {
  high: { dot: "bg-red-500", label: "High" },
  med: { dot: "bg-amber-500", label: "Med" },
  low: { dot: "bg-emerald-500", label: "Low" },
};

const progressBarColor: Record<string, string> = {
  in_progress: "bg-accent-blue",
  review: "bg-accent-orange",
};

function TaskCard({ task, columnId }: { task: BoardTask; columnId: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#1c1c1f] p-3.5 transition-colors hover:border-white/10">
      <div className="mb-2.5 flex items-start justify-between gap-2">
        {task.ai ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-accent-purple/15 px-2 py-0.5 text-[11px] font-medium text-accent-purple-light">
            ✦ AI
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-muted">
            Manual
          </span>
        )}
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white",
            task.assigneeColor,
          )}
        >
          {task.assignee}
        </div>
      </div>

      <p className="text-sm font-medium leading-snug text-foreground">{task.title}</p>

      {task.priority && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", priorityStyles[task.priority].dot)} />
          <span className="text-xs text-muted">{priorityStyles[task.priority].label}</span>
        </div>
      )}

      {task.progress !== undefined && (
        <div className="mt-3">
          <div className="h-1 overflow-hidden rounded-full bg-white/5">
            <div
              className={cn("h-full rounded-full", progressBarColor[columnId] ?? "bg-accent-blue")}
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <p className="mt-1.5 text-[11px] text-muted">{task.progress}% complete</p>
        </div>
      )}
    </div>
  );
}

export function BoardMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-surface-window glow-purple">
      <div className="flex items-center justify-between border-b border-card-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </div>
        <p className="text-sm text-muted">Q4 Product Launch — AI Task Board</p>
        <div className="flex items-center gap-1.5 rounded-full border border-accent-purple/30 bg-accent-purple/10 px-3 py-1">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-purple" />
          <span className="text-xs font-medium text-accent-purple-light">AI Active</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 p-5 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.id} className="min-w-0">
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", col.dotColor)} />
              <span className="text-sm font-medium text-foreground">{col.label}</span>
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs text-muted">
                {col.tasks.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {col.tasks.map((task) => (
                <TaskCard key={task.id} task={task} columnId={col.id} />
              ))}
            </div>

            <button
              type="button"
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 py-2.5 text-xs text-muted transition-colors hover:border-white/20 hover:text-foreground"
            >
              <span className="text-base leading-none">+</span>
              Add task
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
