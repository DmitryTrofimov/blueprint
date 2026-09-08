import { Topbar } from "@/components/app/topbar";
import { getMemberById, getTasksByStatus, kanbanColumns } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const columnDots: Record<string, string> = {
  backlog: "bg-zinc-500",
  todo: "bg-zinc-400",
  in_progress: "bg-accent-blue",
  review: "bg-accent-orange",
  done: "bg-accent-green",
};

const priorityDot: Record<string, { dot: string; label: string }> = {
  low: { dot: "bg-emerald-500", label: "Low" },
  medium: { dot: "bg-amber-500", label: "Med" },
  high: { dot: "bg-red-500", label: "High" },
  urgent: { dot: "bg-red-500", label: "High" },
};

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-blue-600",
  "from-pink-500 to-rose-500",
  "from-amber-500 to-orange-500",
  "from-emerald-500 to-teal-500",
];

export default function BoardPage() {
  return (
    <>
      <Topbar title="Task Board" description="Q4 Product Launch — AI Task Board" />
      <main className="flex-1 overflow-x-auto bg-background p-6">
        <div className="mb-4 flex justify-end">
          <div className="flex items-center gap-1.5 rounded-full border border-accent-purple/30 bg-accent-purple/10 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-purple" />
            <span className="text-xs font-medium text-accent-purple-light">AI Active</span>
          </div>
        </div>
        <div className="flex min-w-max gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = getTasksByStatus(col.id).filter((t) => t.id !== "t1");
            return (
              <div key={col.id} className="w-72 shrink-0">
                <div className="mb-3 flex items-center gap-2">
                  <span className={cn("h-2 w-2 rounded-full", columnDots[col.id])} />
                  <h2 className="text-sm font-medium">{col.label}</h2>
                  <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs text-muted">
                    {colTasks.length}
                  </span>
                </div>
                <div className="min-h-[400px] space-y-2.5">
                  {colTasks.map((task, i) => {
                    const member = task.assigneeId ? getMemberById(task.assigneeId) : undefined;
                    const priority = priorityDot[task.priority];
                    return (
                      <div
                        key={task.id}
                        className="cursor-pointer rounded-xl border border-white/[0.06] bg-[#1c1c1f] p-3.5 transition-colors hover:border-white/10"
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          {task.aiGenerated ? (
                            <span className="inline-flex items-center gap-1 rounded-md bg-accent-purple/15 px-2 py-0.5 text-[11px] font-medium text-accent-purple-light">
                              ✦ AI
                            </span>
                          ) : (
                            <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-muted">
                              Manual
                            </span>
                          )}
                          {member && (
                            <div
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white",
                                avatarColors[i % avatarColors.length],
                              )}
                              title={member.name}
                            >
                              {member.initials}
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium leading-snug">{task.title}</p>
                        {priority && (
                          <div className="mt-3 flex items-center gap-1.5">
                            <span className={cn("h-1.5 w-1.5 rounded-full", priority.dot)} />
                            <span className="text-xs text-muted">{priority.label}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 py-2.5 text-xs text-muted transition-colors hover:border-white/20 hover:text-foreground"
                  >
                    <span className="text-base leading-none">+</span>
                    Add task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
