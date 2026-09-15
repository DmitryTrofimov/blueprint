"use client";

import type { BoardColumn } from "@/types/board";
import { useDroppable } from "@dnd-kit/core";
import { KanbanDraggableTask } from "./kanban-draggable-task";
import { cn } from "@/lib/utils";

interface KanbanColumnDropProps {
  column: BoardColumn;
  onEditTask: (task: BoardColumn["tasks"][number]) => void;
  dragDisabled?: boolean;
}

export function KanbanColumnDrop({
  column,
  onEditTask,
  dragDisabled = false,
}: KanbanColumnDropProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto overscroll-y-contain rounded-xl transition-colors",
        isOver && "bg-accent-purple/5 ring-1 ring-inset ring-accent-purple/25",
      )}
    >
      {column.tasks.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-[#1c1c1f] px-3.5 py-8 text-center text-xs text-muted">
          No tasks yet
        </div>
      ) : (
        column.tasks.map((task) => (
          <KanbanDraggableTask
            key={task.id}
            task={task}
            columnId={column.id}
            onEdit={() => onEditTask(task)}
            disabled={dragDisabled}
          />
        ))
      )}
    </div>
  );
}
