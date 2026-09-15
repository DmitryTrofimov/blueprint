"use client";

import type { BoardTask } from "@/types/board";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";

interface KanbanDraggableTaskProps {
  task: BoardTask;
  columnId: string;
  hideProgress?: boolean;
  onEdit: () => void;
  disabled?: boolean;
}

export function KanbanDraggableTask({
  task,
  columnId,
  hideProgress = false,
  onEdit,
  disabled = false,
}: KanbanDraggableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: "task", columnId, task },
    disabled,
  });

  const style: React.CSSProperties | undefined = isDragging
    ? { opacity: 0 }
    : transform
      ? { transform: CSS.Translate.toString(transform) }
      : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "touch-none",
        isDragging && "pointer-events-none",
        !disabled && "cursor-grab active:cursor-grabbing",
      )}
      {...listeners}
      {...attributes}
    >
      <KanbanCard
        task={task}
        columnId={columnId}
        hideProgress={hideProgress}
        onClick={onEdit}
      />
    </div>
  );
}
