import type { AIGeneratedTaskItem } from "@/types/board";
import { cn } from "@/lib/utils";

const categoryStyles: Record<AIGeneratedTaskItem["color"], { dot: string; badge: string }> = {
  purple: { dot: "bg-violet-500", badge: "text-violet-400 bg-violet-500/10" },
  blue: { dot: "bg-blue-500", badge: "text-blue-400 bg-blue-500/10" },
  pink: { dot: "bg-pink-500", badge: "text-pink-400 bg-pink-500/10" },
  orange: { dot: "bg-amber-500", badge: "text-amber-400 bg-amber-500/10" },
  green: { dot: "bg-emerald-500", badge: "text-emerald-400 bg-emerald-500/10" },
  lavender: { dot: "bg-indigo-400", badge: "text-indigo-300 bg-indigo-500/10" },
};

interface AIGeneratedTasksProps {
  tasks: AIGeneratedTaskItem[];
  totalCount?: number;
  limit?: number;
  className?: string;
}

export function AIGeneratedTasks({
  tasks,
  totalCount,
  limit,
  className,
}: AIGeneratedTasksProps) {
  const visibleTasks = limit ? tasks.slice(0, limit) : tasks;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-card-border bg-card p-5 glow-purple",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue">
            <span className="text-sm text-white" aria-hidden="true">
              ✦
            </span>
          </div>
          <span className="text-sm font-medium text-accent-purple-light">AI Generated Tasks</span>
        </div>
        <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-muted">
          {totalCount ?? tasks.length} tasks
        </span>
      </div>

      <div className="space-y-2">
        {visibleTasks.map((item) => {
          const style = categoryStyles[item.color];
          return (
            <div
              key={item.task}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#1c1c1f] px-4 py-3.5 transition-colors hover:border-white/10"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
              </div>
              <p className="min-w-0 flex-1 text-sm text-foreground">{item.task}</p>
              <span className={cn("shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium", style.badge)}>
                {item.category}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
