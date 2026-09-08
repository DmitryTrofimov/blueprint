import type { BoardPriority, BoardTask } from "@/types/board";
import { cn } from "@/lib/utils";

const priorityStyles: Record<BoardPriority, { dot: string; label: string }> = {
  high: { dot: "bg-red-500", label: "High" },
  med: { dot: "bg-amber-500", label: "Med" },
  low: { dot: "bg-emerald-500", label: "Low" },
};

const progressBarColor: Record<string, string> = {
  in_progress: "bg-accent-blue",
  review: "bg-accent-orange",
};

interface TaskBoardCardProps {
  task: BoardTask;
  columnId: string;
}

export function TaskBoardCard({ task, columnId }: TaskBoardCardProps) {
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
