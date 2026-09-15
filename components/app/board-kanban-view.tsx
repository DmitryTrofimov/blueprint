"use client";

import type { CSSProperties } from "react";
import type { BoardColumn, BoardTask } from "@/types/board";
import type {
  CreateTaskFormValues,
  TaskAssigneeOption,
  TaskLookupOption,
} from "@/types/task-form";
import { EMPTY_CREATE_TASK_FORM } from "@/types/task-form";
import { KanbanCard } from "./kanban-card";
import { KanbanColumnDrop, KanbanColumnStatic } from "./kanban-column-drop";
import { TaskTagsField } from "./task-tags-field";
import { createTask, deleteTask, updateTask, updateTaskStatus } from "@/lib/supabase/tasks";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  TASK_DESCRIPTION_MAX_LENGTH,
  TASK_TITLE_MAX_LENGTH,
  formatTaskDeadlineDisplay,
  getTodayDateInputValue,
  normalizeTaskTags,
  validateTaskAssignedTo,
  validateTaskDeadline,
  validateTaskDescription,
  validateTaskPriorityId,
  validateTaskStatusId,
  validateTaskProgress,
  validateTaskTags,
  validateTaskTitle,
} from "@/lib/task-form-validation";
import {
  DEFAULT_TASK_PRIORITY_NAME,
  TODO_STATUS_NAME,
  isTodoStatusId,
  progressForStatus,
} from "@/lib/kanban-utils";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

const BOARD_PANEL_MAX_HEIGHT = "calc(100vh - 12rem)";
const COLUMN_MAX_HEIGHT = "calc(100vh - 12rem - 2.5rem)";

interface BoardKanbanViewProps {
  boardId: string;
  createdByName: string;
  initialColumns: BoardColumn[];
  statusOptions: TaskLookupOption[];
  priorityOptions: TaskLookupOption[];
  assigneeOptions: TaskAssigneeOption[];
  initialError?: string | null;
  className?: string;
}

type TaskModalMode = "create" | "edit" | null;

function addTaskToColumn(
  columns: BoardColumn[],
  statusId: string,
  task: BoardColumn["tasks"][number],
): BoardColumn[] {
  return columns.map((column) =>
    column.id === statusId
      ? { ...column, tasks: [...column.tasks, task] }
      : column,
  );
}

function replaceTaskInColumns(
  columns: BoardColumn[],
  taskId: string,
  statusId: string,
  task: BoardTask,
): BoardColumn[] {
  return columns.map((column) => {
    const without = column.tasks.filter((t) => t.id !== taskId);
    if (column.id === statusId) {
      return { ...column, tasks: [...without, task] };
    }
    return { ...column, tasks: without };
  });
}

function findColumnIdForItem(columns: BoardColumn[], itemId: string): string | null {
  if (columns.some((column) => column.id === itemId)) return itemId;
  for (const column of columns) {
    if (column.tasks.some((task) => task.id === itemId)) return column.id;
  }
  return null;
}

function moveTaskToColumn(
  columns: BoardColumn[],
  taskId: string,
  toStatusId: string,
): BoardColumn[] {
  let movedTask: BoardTask | undefined;

  const withoutTask = columns.map((column) => {
    const found = column.tasks.find((task) => task.id === taskId);
    if (found) movedTask = found;
    return { ...column, tasks: column.tasks.filter((task) => task.id !== taskId) };
  });

  if (!movedTask) return columns;

  const toLabel = columns.find((column) => column.id === toStatusId)?.label;
  const updatedTask: BoardTask = {
    ...movedTask,
    statusId: toStatusId,
    progress: toLabel === TODO_STATUS_NAME ? 0 : (movedTask.progress ?? 0),
  };
  return withoutTask.map((column) =>
    column.id === toStatusId
      ? { ...column, tasks: [...column.tasks, updatedTask] }
      : column,
  );
}

function removeTaskFromColumns(columns: BoardColumn[], taskId: string): BoardColumn[] {
  return columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => task.id !== taskId),
  }));
}

interface TaskTableRow {
  task: BoardTask;
  statusLabel: string;
  assigneeLabel: string;
}

function buildTaskTableRows(
  columns: BoardColumn[],
  assigneeOptions: TaskAssigneeOption[],
): TaskTableRow[] {
  const rows: TaskTableRow[] = [];

  for (const column of columns) {
    for (const task of column.tasks) {
      const assigneeLabel =
        assigneeOptions.find((option) => option.userId === task.assignedTo)?.username ??
        task.createdByName ??
        "—";

      rows.push({
        task,
        statusLabel: column.label,
        assigneeLabel,
      });
    }
  }

  return rows;
}

export function BoardKanbanView({
  boardId,
  createdByName,
  initialColumns,
  statusOptions,
  priorityOptions,
  assigneeOptions,
  initialError = null,
  className,
}: BoardKanbanViewProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [columns, setColumns] = useState<BoardColumn[]>(initialColumns);
  const [actionError, setActionError] = useState<string | null>(initialError);
  const [activeDragTask, setActiveDragTask] = useState<BoardTask | null>(null);
  const [activeDragColumnId, setActiveDragColumnId] = useState<string | null>(null);
  const [isMovingTask, setIsMovingTask] = useState(false);

  const dragSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );
  const [taskModalMode, setTaskModalMode] = useState<TaskModalMode>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [taskForm, setTaskForm] = useState<CreateTaskFormValues>(EMPTY_CREATE_TASK_FORM);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof CreateTaskFormValues, string>>>(
    {},
  );
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDndReady, setIsDndReady] = useState(false);

  const closeTaskModal = useCallback(() => {
    setTaskModalMode(null);
    setEditingTaskId(null);
    setTaskForm(EMPTY_CREATE_TASK_FORM);
    setFieldErrors({});
    setSubmitError(null);
  }, []);

  const defaultPriorityId =
    priorityOptions.find((option) => option.name === DEFAULT_TASK_PRIORITY_NAME)?.id ?? "";

  const minDeadlineDate = getTodayDateInputValue();

  const openCreateModal = useCallback(
    (statusId: string) => {
      setEditingTaskId(null);
      setTaskForm({
        title: "",
        description: "",
        tags: [],
        statusId,
        priorityId: defaultPriorityId,
        assignedTo: "",
        deadline: getTodayDateInputValue(),
        progress: 0,
      });
      setFieldErrors({});
      setSubmitError(null);
      setTaskModalMode("create");
    },
    [defaultPriorityId],
  );

  const openEditModal = useCallback((task: BoardTask) => {
    if (!task.statusId || !task.priorityId || !task.assignedTo) return;
    setEditingTaskId(task.id);
    setTaskForm({
      title: task.title,
      description: task.description ?? "",
      tags: normalizeTaskTags(task.tags ?? []),
      statusId: task.statusId,
      priorityId: task.priorityId,
      assignedTo: task.assignedTo,
      deadline: task.deadline ?? "",
      progress: task.progress ?? 0,
    });
    setFieldErrors({});
    setSubmitError(null);
    setTaskModalMode("edit");
  }, []);

  const isTaskModalOpen = taskModalMode !== null;
  const dragDisabled = isSaving || isMovingTask || isTaskModalOpen;

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type !== "task") return;
    setActiveDragTask(data.task as BoardTask);
    setActiveDragColumnId(data.columnId as string);
  };

  const handleDragCancel = () => {
    setActiveDragTask(null);
    setActiveDragColumnId(null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragTask(null);
    setActiveDragColumnId(null);

    if (!over) return;

    const taskId = String(active.id);
    const fromColumnId =
      findColumnIdForItem(columns, taskId) ??
      (active.data.current?.columnId as string | undefined);
    const toColumnId = findColumnIdForItem(columns, String(over.id));

    if (!fromColumnId || !toColumnId || fromColumnId === toColumnId) return;

    let snapshot: BoardColumn[] = columns;
    setColumns((prev) => {
      snapshot = prev;
      return moveTaskToColumn(prev, taskId, toColumnId);
    });
    setActionError(null);
    setIsMovingTask(true);

    const toColumn = columns.find((column) => column.id === toColumnId);
    const resetProgress = toColumn?.label === TODO_STATUS_NAME;

    const { error } = await updateTaskStatus({
      id: taskId,
      statusId: toColumnId,
      resetProgress,
    });

    setIsMovingTask(false);

    if (error) {
      setColumns(snapshot);
      setActionError(error);
    }
  };

  useEffect(() => {
    if (!isTaskModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeTaskModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isTaskModalOpen, closeTaskModal]);

  useEffect(() => {
    setIsDndReady(true);
  }, []);

  const validateForm = (values: CreateTaskFormValues) => {
    const errors: Partial<Record<keyof CreateTaskFormValues, string>> = {};
    const titleError = validateTaskTitle(values.title);
    const descriptionError = validateTaskDescription(values.description);
    const statusError = validateTaskStatusId(values.statusId);
    const assignedToError = validateTaskAssignedTo(values.assignedTo);
    const priorityError = validateTaskPriorityId(values.priorityId);
    const tagsError = validateTaskTags(values.tags);
    const deadlineError = validateTaskDeadline(values.deadline);
    const progressError = isTodoStatusId(values.statusId, statusOptions)
      ? undefined
      : validateTaskProgress(values.progress);

    if (titleError) errors.title = titleError;
    if (descriptionError) errors.description = descriptionError;
    if (statusError) errors.statusId = statusError;
    if (assignedToError) errors.assignedTo = assignedToError;
    if (priorityError) errors.priorityId = priorityError;
    if (tagsError) errors.tags = tagsError;
    if (deadlineError) errors.deadline = deadlineError;
    if (progressError) errors.progress = progressError;

    return errors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validateForm(taskForm);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const assignedTo = taskForm.assignedTo.trim();
    const assigneeName =
      assigneeOptions.find((option) => option.userId === assignedTo)?.username ?? null;
    const tags = normalizeTaskTags(taskForm.tags);
    const deadline = taskForm.deadline.trim() || null;
    const progress = progressForStatus(
      taskForm.statusId,
      taskForm.progress,
      statusOptions,
    );

    setIsSaving(true);
    setActionError(null);
    setSubmitError(null);

    if (taskModalMode === "edit" && editingTaskId) {
      const { data, error } = await updateTask({
        id: editingTaskId,
        title: taskForm.title,
        description: taskForm.description,
        statusId: taskForm.statusId,
        priorityId: taskForm.priorityId,
        assignedTo,
        assigneeName,
        tags,
        deadline,
        progress,
      });

      setIsSaving(false);

      if (error || !data) {
        setSubmitError(error ?? "Failed to update task.");
        return;
      }

      setColumns((prev) =>
        replaceTaskInColumns(prev, editingTaskId, data.statusId, data.task),
      );
      closeTaskModal();
      return;
    }

    const { data, error } = await createTask({
      boardId,
      title: taskForm.title,
      description: taskForm.description,
      statusId: taskForm.statusId,
      priorityId: taskForm.priorityId,
      assignedTo,
      createdByName,
      assigneeName,
      tags,
      deadline,
      progress,
    });

    setIsSaving(false);

    if (error || !data) {
      setSubmitError(error ?? "Failed to create task.");
      return;
    }

    setColumns((prev) => addTaskToColumn(prev, data.statusId, data.task));
    closeTaskModal();
  };

  const taskTableRows = useMemo(
    () => buildTaskTableRows(columns, assigneeOptions),
    [columns, assigneeOptions],
  );

  const handleDeleteFromModal = async () => {
    if (!editingTaskId) return;

    const title = taskForm.title.trim() || "this task";
    const confirmed = window.confirm(`Delete task "${title}"?`);
    if (!confirmed) return;

    const taskId = editingTaskId;

    setIsSaving(true);
    setActionError(null);
    setSubmitError(null);

    const { error } = await deleteTask(taskId);

    setIsSaving(false);

    if (error) {
      setSubmitError(error);
      return;
    }

    setColumns((prev) => removeTaskFromColumns(prev, taskId));
    closeTaskModal();
  };

  const titleTrimmed = taskForm.title.trim();
  const canSubmit =
    titleTrimmed.length > 0 &&
    titleTrimmed.length <= TASK_TITLE_MAX_LENGTH &&
    taskForm.description.length <= TASK_DESCRIPTION_MAX_LENGTH &&
    Boolean(taskForm.statusId) &&
    Boolean(taskForm.assignedTo.trim()) &&
    Boolean(taskForm.priorityId) &&
    !validateTaskTags(taskForm.tags) &&
    !validateTaskDeadline(taskForm.deadline.trim()) &&
    (isTodoStatusId(taskForm.statusId, statusOptions) ||
      !validateTaskProgress(taskForm.progress));

  const isTodoFormStatus = isTodoStatusId(taskForm.statusId, statusOptions);

  const kanbanPanel = (
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

            {isDndReady ? (
              <KanbanColumnDrop
                column={col}
                onEditTask={openEditModal}
                dragDisabled={dragDisabled}
              />
            ) : (
              <KanbanColumnStatic column={col} onEditTask={openEditModal} />
            )}

            <button
              type="button"
              onClick={() => openCreateModal(col.id)}
              disabled={isSaving || isMovingTask}
              className="mt-2.5 flex w-full shrink-0 items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/10 py-2.5 text-xs text-muted transition-colors hover:border-white/20 hover:text-foreground disabled:opacity-50"
            >
              <span className="text-base leading-none">+</span>
              Add task
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {actionError && (
        <div role="alert" className="auth-form-error mb-4 rounded-xl px-4 py-3 text-sm">
          {actionError}
        </div>
      )}

      <div className="flex flex-col gap-6">
      {isDndReady ? (
        <DndContext
          sensors={dragSensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          {kanbanPanel}
          <DragOverlay dropAnimation={null}>
            {activeDragTask && activeDragColumnId ? (
              <div className="w-[14.4rem] cursor-grabbing shadow-xl">
                <KanbanCard
                  task={activeDragTask}
                  columnId={activeDragColumnId}
                  hideProgress={
                    columns.find((column) => column.id === activeDragColumnId)?.label ===
                    TODO_STATUS_NAME
                  }
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      ) : (
        kanbanPanel
      )}

      <section className="overflow-hidden rounded-2xl border border-card-border bg-surface-window">
        <div className="border-b border-card-border px-6 py-4">
          <h2 className="text-base font-semibold">Tasks on this board</h2>
          <p className="mt-1 text-sm text-muted">
            {taskTableRows.length === 0
              ? "No tasks yet. Add one from the kanban above"
              : `${taskTableRows.length} task${taskTableRows.length === 1 ? "" : "s"}`}
          </p>
        </div>

        {taskTableRows.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted">
            Tasks will appear here once created
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-card-border bg-white/[0.02] text-xs uppercase tracking-wide text-muted">
                  <th className="px-6 py-3 font-medium">Title</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium">Priority</th>
                  <th className="px-6 py-3 font-medium">Progress</th>
                  <th className="px-6 py-3 font-medium">Deadline</th>
                  <th className="px-6 py-3 font-medium">Assigned to</th>
                  <th className="px-6 py-3 font-medium">Tags</th>
                </tr>
              </thead>
              <tbody>
                {taskTableRows.map(({ task, statusLabel, assigneeLabel }) => (
                  <tr
                    key={task.id}
                    className="border-b border-card-border/70 last:border-b-0"
                  >
                    <td className="px-6 py-4 align-top">
                      <button
                        type="button"
                        onClick={() => openEditModal(task)}
                        disabled={isSaving || isMovingTask}
                        className="text-left font-medium text-accent-purple-light transition-colors hover:text-foreground disabled:opacity-50"
                      >
                        {task.title}
                      </button>
                    </td>
                    <td className="px-6 py-4 align-top text-muted">{statusLabel}</td>
                    <td className="px-6 py-4 align-top text-muted">
                      {task.priorityName ?? "—"}
                    </td>
                    <td className="px-6 py-4 align-top tabular-nums text-muted">
                      {statusLabel === TODO_STATUS_NAME ? "0%" : `${task.progress ?? 0}%`}
                    </td>
                    <td className="px-6 py-4 align-top whitespace-nowrap text-muted">
                      {task.deadline
                        ? formatTaskDeadlineDisplay(task.deadline)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 align-top text-muted">{assigneeLabel}</td>
                    <td className="px-6 py-4 align-top">
                      {task.tags && task.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-accent-purple/15 px-1.5 py-0.5 text-[10px] font-medium uppercase text-accent-purple-light"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      </div>

      {isTaskModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={closeTaskModal}
          />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-card-border bg-surface-window glow-purple"
          >
            <div className="border-b border-card-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id={titleId} className="text-xl font-semibold">
                    {taskModalMode === "edit" ? "Edit task" : "Create a new task"}
                  </h2>
                  <p id={descId} className="mt-1 text-sm text-muted">
                    {taskModalMode === "edit"
                      ? "Update task details on this board"
                      : "Add a task to this board"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="rounded-lg border border-card-border p-1.5 text-muted transition-colors hover:border-white/15 hover:text-foreground"
                  aria-label="Close"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              {submitError && (
                <div role="alert" className="auth-form-error rounded-xl px-4 py-3 text-sm">
                  {submitError}
                </div>
              )}

              <Field label="Title" htmlFor="task-title" error={fieldErrors.title} required>
                <input
                  id="task-title"
                  type="text"
                  maxLength={TASK_TITLE_MAX_LENGTH}
                  value={taskForm.title}
                  onChange={(e) => {
                    setTaskForm((prev) => ({ ...prev, title: e.target.value }));
                    if (fieldErrors.title) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.title;
                        return next;
                      });
                    }
                  }}
                  disabled={isSaving}
                  className={cn("auth-input w-full", fieldErrors.title && "auth-input-error")}
                  placeholder="Task title"
                  autoFocus
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Status" htmlFor="task-status" error={fieldErrors.statusId} required>
                  <select
                    id="task-status"
                    value={taskForm.statusId}
                    onChange={(e) => {
                      const statusId = e.target.value;
                      setTaskForm((prev) => ({
                        ...prev,
                        statusId,
                        progress: isTodoStatusId(statusId, statusOptions) ? 0 : prev.progress,
                      }));
                      if (fieldErrors.statusId) {
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          delete next.statusId;
                          return next;
                        });
                      }
                    }}
                    disabled={isSaving}
                    className={cn(
                      "auth-input auth-select w-full",
                      fieldErrors.statusId && "auth-input-error",
                    )}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Priority"
                  htmlFor="task-priority"
                  error={fieldErrors.priorityId}
                  required
                >
                  <select
                    id="task-priority"
                    value={taskForm.priorityId}
                    onChange={(e) =>
                      setTaskForm((prev) => ({ ...prev, priorityId: e.target.value }))
                    }
                    disabled={isSaving}
                    className={cn(
                      "auth-input auth-select w-full",
                      fieldErrors.priorityId && "auth-input-error",
                    )}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Description" htmlFor="task-description" error={fieldErrors.description}>
                <textarea
                  id="task-description"
                  maxLength={TASK_DESCRIPTION_MAX_LENGTH}
                  rows={4}
                  value={taskForm.description}
                  onChange={(e) => {
                    setTaskForm((prev) => ({ ...prev, description: e.target.value }));
                    if (fieldErrors.description) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.description;
                        return next;
                      });
                    }
                  }}
                  disabled={isSaving}
                  className={cn(
                    "auth-input w-full resize-y min-h-[6rem]",
                    fieldErrors.description && "auth-input-error",
                  )}
                  placeholder="Optional description"
                />
                <p className="mt-1.5 text-right text-xs text-muted">
                  {taskForm.description.length}/{TASK_DESCRIPTION_MAX_LENGTH}
                </p>
              </Field>

              {!isTodoFormStatus ? (
                <Field label="Progress" htmlFor="task-progress" error={fieldErrors.progress}>
                  <div className="flex items-center gap-3">
                    <input
                      id="task-progress"
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={taskForm.progress}
                      onChange={(e) => {
                        setTaskForm((prev) => ({
                          ...prev,
                          progress: Number(e.target.value),
                        }));
                        if (fieldErrors.progress) {
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            delete next.progress;
                            return next;
                          });
                        }
                      }}
                      disabled={isSaving}
                      className={cn(
                        "auth-range-input flex-1",
                        fieldErrors.progress && "opacity-80",
                      )}
                    />
                    <span className="w-10 shrink-0 text-right text-sm font-medium tabular-nums text-accent-purple-light">
                      {taskForm.progress}%
                    </span>
                  </div>
                </Field>
              ) : (
                <p className="text-xs text-muted">Progress is 0% for ToDo tasks.</p>
              )}

              <Field label="Deadline" htmlFor="task-deadline" error={fieldErrors.deadline}>
                <input
                  id="task-deadline"
                  type="date"
                  value={taskForm.deadline}
                  min={minDeadlineDate}
                  onChange={(e) => {
                    setTaskForm((prev) => ({ ...prev, deadline: e.target.value }));
                    if (fieldErrors.deadline) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.deadline;
                        return next;
                      });
                    }
                  }}
                  disabled={isSaving}
                  className={cn(
                    "auth-input auth-date-input w-full",
                    fieldErrors.deadline && "auth-input-error",
                  )}
                />
              </Field>

              <TaskTagsField
                id="task-tags"
                tags={taskForm.tags}
                disabled={isSaving}
                error={fieldErrors.tags}
                onChange={(tags) => {
                  setTaskForm((prev) => ({ ...prev, tags }));
                  if (fieldErrors.tags) {
                    setFieldErrors((prev) => {
                      const next = { ...prev };
                      delete next.tags;
                      return next;
                    });
                  }
                }}
              />

              <Field
                label="Assigned to"
                htmlFor="task-assigned-to"
                error={fieldErrors.assignedTo}
                required
              >
                <select
                  id="task-assigned-to"
                  value={taskForm.assignedTo}
                  onChange={(e) => {
                    setTaskForm((prev) => ({ ...prev, assignedTo: e.target.value }));
                    if (fieldErrors.assignedTo) {
                      setFieldErrors((prev) => {
                        const next = { ...prev };
                        delete next.assignedTo;
                        return next;
                      });
                    }
                  }}
                  disabled={isSaving}
                  className={cn(
                    "auth-input auth-select w-full",
                    fieldErrors.assignedTo && "auth-input-error",
                  )}
                >
                  <option value="" disabled>
                    Select assignee
                  </option>
                  {assigneeOptions.map((option) => (
                    <option key={option.userId} value={option.userId}>
                      {option.username}
                      {option.roleName ? ` · ${option.roleName}` : ""}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                {taskModalMode === "edit" ? (
                  <button
                    type="button"
                    onClick={handleDeleteFromModal}
                    disabled={isSaving}
                    className="rounded-xl border border-red-500/30 px-5 py-2.5 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                  >
                    Delete
                  </button>
                ) : (
                  <span aria-hidden="true" />
                )}
                <div className="flex flex-wrap justify-end gap-3">
                  <button
                    type="submit"
                    disabled={isSaving || !canSubmit}
                    className="min-w-[5.75rem] rounded-xl bg-gradient-to-r from-accent-purple to-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={closeTaskModal}
                    disabled={isSaving}
                    className="min-w-[5.75rem] rounded-xl border border-card-border px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function Field({
  label,
  htmlFor,
  error,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const errorId = `${htmlFor}-error`;

  return (
    <div className="block">
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
        {required && <span className="text-accent-purple-light"> *</span>}
      </label>
      {children}
      {error && (
        <p id={errorId} role="alert" className="auth-error mt-1.5 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
