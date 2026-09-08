import type { BoardColumn } from "@/types/board";
import { cn } from "@/lib/utils";
import { TaskBoardCard } from "./task-board-card";

interface TaskBoardProps {
  columns: BoardColumn[];
  title?: string;
  showChrome?: boolean;
  className?: string;
}

export function TaskBoard({
  columns,
  title = "Q4 Product Launch — AI Task Board",
  showChrome = true,
  className,
}: TaskBoardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-card-border bg-surface-window glow-purple",
        className,
      )}
    >
      {showChrome && (
        <div className="flex items-center justify-between border-b border-card-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <p className="text-sm text-muted">{title}</p>
          <div className="flex items-center gap-1.5 rounded-full border border-accent-purple/30 bg-accent-purple/10 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-purple" />
            <span className="text-xs font-medium text-accent-purple-light">AI Active</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
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
                <TaskBoardCard key={task.id} task={task} columnId={col.id} />
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
