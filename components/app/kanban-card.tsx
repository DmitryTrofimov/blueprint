import type { BoardPriority, BoardTask } from "@/types/board";
import { getPriorityDotColor } from "@/lib/kanban-utils";
import { cn } from "@/lib/utils";

const legacyPriorityStyles: Record<BoardPriority, { dot: string; label: string }> = {
  high: { dot: "bg-red-500", label: "High" },
  med: { dot: "bg-amber-500", label: "Med" },
  low: { dot: "bg-emerald-500", label: "Low" },
};

function getTaskPriorityDisplay(task: BoardTask): { dot: string; label: string } | null {
  if (task.priorityName) {
    return {
      dot: getPriorityDotColor(task.priorityName),
      label: task.priorityName,
    };
  }
  if (task.priority) {
    return legacyPriorityStyles[task.priority];
  }
  return null;
}

const progressBarColor: Record<string, string> = {
  in_progress: "bg-accent-blue",
  review: "bg-accent-orange",
};

interface KanbanCardProps {
  task: BoardTask;
  columnId: string;
  hideProgress?: boolean;
  onClick?: () => void;
}

export function KanbanCard({ task, columnId, hideProgress = false, onClick }: KanbanCardProps) {
  const priorityDisplay = getTaskPriorityDisplay(task);

  const className = cn(
    "w-full rounded-xl border border-white/[0.06] bg-[#1c1c1f] p-3.5 text-left transition-colors",
    onClick ? "hover:border-white/10" : "hover:border-white/10",
  );

  const content = (
    <>
      <div className="mb-2">
        {task.ai ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-accent-purple/15 px-2 py-0.5 text-[11px] font-medium text-accent-purple-light">
            ✦ AI
          </span>
        ) : (
          <span className="inline-flex items-center rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-muted">
            Manual
          </span>
        )}
      </div>

      <div className="mb-2.5 flex items-center gap-2">
        <p className="min-w-0 flex-1 text-sm font-medium leading-snug text-foreground">
          {task.title}
        </p>
        <div
          className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white",
            task.assigneeColor,
          )}
        >
          {task.assignee}
        </div>
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-accent-purple/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-accent-purple-light"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {priorityDisplay && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", priorityDisplay.dot)} />
          <span className="text-xs text-muted">{priorityDisplay.label}</span>
        </div>
      )}

      {!hideProgress && task.progress !== undefined && (
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
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={className}>
        {content}
      </button>
    );
  }

  return <div className={className}>{content}</div>;
}
