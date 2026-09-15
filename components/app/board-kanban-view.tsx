import type { CSSProperties } from "react";
import type { BoardColumn } from "@/types/board";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";

/** Max board panel height (matches previous full-viewport layout). */
const BOARD_PANEL_MAX_HEIGHT = "calc(100vh - 12rem)";
/** Column body max height: panel max minus vertical padding (p-5). */
const COLUMN_MAX_HEIGHT = "calc(100vh - 12rem - 2.5rem)";

interface BoardKanbanViewProps {
  columns: BoardColumn[];
  className?: string;
}

export function BoardKanbanView({ columns, className }: BoardKanbanViewProps) {
  return (
    <div
      className={cn(
        "w-full max-h-[var(--board-panel-max-h)] overflow-hidden rounded-2xl border border-card-border bg-surface-window glow-purple",
        className,
      )}
      style={
        {
          "--board-panel-max-h": BOARD_PANEL_MAX_HEIGHT,
        } as CSSProperties
      }
    >
      <div className="flex items-start gap-5 overflow-x-auto p-5">
        {columns.map((col) => (
          <div
            key={col.id}
            className="flex w-[14.4rem] shrink-0 flex-col min-w-[14.4rem]"
            style={{ maxHeight: COLUMN_MAX_HEIGHT }}
          >
            <div className="mb-3 flex shrink-0 items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", col.dotColor)} />
              <span className="text-sm font-medium text-foreground">{col.label}</span>
              <span className="rounded-md bg-white/5 px-1.5 py-0.5 text-xs text-muted">
                {col.tasks.length}
              </span>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain">
              {col.tasks.length === 0 ? (
                <div className="rounded-xl border border-white/[0.06] bg-[#1c1c1f] px-3.5 py-8 text-center text-xs text-muted">
                  No tasks yet
                </div>
              ) : (
                col.tasks.map((task) => (
                  <KanbanCard key={task.id} task={task} columnId={col.id} />
                ))
              )}
            </div>

            <button
              type="button"
              className="mt-2.5 flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 py-2.5 text-xs text-muted transition-colors hover:border-white/20 hover:text-foreground"
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
