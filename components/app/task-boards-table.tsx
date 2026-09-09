"use client";

import type { TaskBoardItem } from "@/types/board";
import {
  createTaskBoard,
  deleteTaskBoard,
  updateTaskBoard,
} from "@/lib/supabase/task-boards";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useId, useRef, useState } from "react";

interface BoardFormValues {
  name: string;
  description: string;
}

const EMPTY_FORM: BoardFormValues = { name: "", description: "" };

interface TaskBoardsTableProps {
  createdBy: string;
  initialBoards: TaskBoardItem[];
  initialError?: string | null;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function TaskBoardsTable({
  createdBy,
  initialBoards,
  initialError = null,
}: TaskBoardsTableProps) {
  const titleId = useId();
  const descId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  const [boards, setBoards] = useState<TaskBoardItem[]>(initialBoards);
  const [isSaving, setIsSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(initialError);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState<BoardFormValues>(EMPTY_FORM);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<BoardFormValues>(EMPTY_FORM);
  const [editError, setEditError] = useState<string | null>(null);

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    setCreateForm(EMPTY_FORM);
    setCreateError(null);
  }, []);

  const openCreateModal = useCallback(() => {
    setCreateForm(EMPTY_FORM);
    setCreateError(null);
    setIsCreateModalOpen(true);
  }, []);

  useEffect(() => {
    if (!isCreateModalOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCreateModal();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    const focusable = dialogRef.current?.querySelector<HTMLElement>(
      'button, input, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isCreateModalOpen, closeCreateModal]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = createForm.name.trim();
    if (!name) {
      setCreateError("Name is required");
      return;
    }

    setIsSaving(true);
    setActionError(null);
    const { data, error } = await createTaskBoard({
      name,
      description: createForm.description.trim(),
      createdByName: createdBy,
    });
    setIsSaving(false);

    if (error || !data) {
      setCreateError(error ?? "Failed to create board.");
      return;
    }

    setBoards((prev) => [data, ...prev]);
    closeCreateModal();
  };

  const startEdit = (board: TaskBoardItem) => {
    setEditingId(board.id);
    setEditForm({ name: board.name, description: board.description });
    setEditError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_FORM);
    setEditError(null);
  };

  const handleSaveEdit = async (boardId: string) => {
    const name = editForm.name.trim();
    if (!name) {
      setEditError("Name is required");
      return;
    }

    setIsSaving(true);
    setActionError(null);
    const { data, error } = await updateTaskBoard({
      id: boardId,
      name,
      description: editForm.description.trim(),
    });
    setIsSaving(false);

    if (error || !data) {
      setEditError(error ?? "Failed to update board.");
      return;
    }

    setBoards((prev) => prev.map((board) => (board.id === boardId ? data : board)));
    cancelEdit();
  };

  const handleDelete = async (board: TaskBoardItem) => {
    const confirmed = window.confirm(`Delete board "${board.name}"?`);
    if (!confirmed) return;

    setIsSaving(true);
    setActionError(null);
    const { error } = await deleteTaskBoard(board.id);
    setIsSaving(false);

    if (error) {
      setActionError(error);
      return;
    }

    setBoards((prev) => prev.filter((item) => item.id !== board.id));
    if (editingId === board.id) cancelEdit();
  };

  return (
    <>
      {actionError && (
        <div role="alert" className="auth-form-error mb-4 rounded-xl px-4 py-3 text-sm">
          {actionError}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-card-border bg-surface-window">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-card-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">Your current boards</h2>
            <p className="mt-1 text-sm text-muted">
              {boards.length === 0
                ? "No boards yet. Create your first one"
                : `${boards.length} board${boards.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <button
            type="button"
            onClick={openCreateModal}
            disabled={isSaving}
            className="rounded-xl bg-gradient-to-r from-accent-purple to-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            +
          </button>
        </div>

        {boards.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted">
            Your boards will appear here once created
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-card-border bg-white/[0.02] text-xs uppercase tracking-wide text-muted">
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Description</th>
                  <th className="px-6 py-3 font-medium">Created At</th>
                  <th className="px-6 py-3 font-medium">Created By</th>
                  <th className="px-6 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {boards.map((board) => {
                  const isEditing = editingId === board.id;

                  return (
                    <tr
                      key={board.id}
                      className="border-b border-card-border/70 last:border-b-0"
                    >
                      <td className="px-6 py-4 align-top">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => {
                              setEditForm((prev) => ({ ...prev, name: e.target.value }));
                              if (editError) setEditError(null);
                            }}
                            disabled={isSaving}
                            className={cn(
                              "auth-input w-full min-w-[180px]",
                              editError && "auth-input-error",
                            )}
                            aria-label="Edit board name"
                          />
                        ) : (
                          <span className="font-medium text-foreground">{board.name}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-muted">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editForm.description}
                            onChange={(e) =>
                              setEditForm((prev) => ({
                                ...prev,
                                description: e.target.value,
                              }))
                            }
                            disabled={isSaving}
                            className="auth-input w-full min-w-[200px]"
                            aria-label="Edit board description"
                          />
                        ) : (
                          board.description || "—"
                        )}
                      </td>
                      <td className="px-6 py-4 align-top whitespace-nowrap text-muted">
                        {formatDate(board.createdAt)}
                      </td>
                      <td className="px-6 py-4 align-top text-muted">{board.createdBy}</td>
                      <td className="px-6 py-4 align-top">
                        {isEditing ? (
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(board.id)}
                                disabled={isSaving}
                                className="rounded-lg bg-accent-purple/15 px-3 py-1.5 text-xs font-medium text-accent-purple-light transition-colors hover:bg-accent-purple/25 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                disabled={isSaving}
                                className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                            {editError && (
                              <p className="auth-error text-xs" role="alert">
                                {editError}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(board)}
                              disabled={isSaving}
                              className="rounded-lg border border-card-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(board)}
                              disabled={isSaving}
                              className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            aria-label="Close dialog"
            onClick={closeCreateModal}
          />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-card-border bg-surface-window glow-purple"
          >
            <div className="border-b border-card-border px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 id={titleId} className="text-xl font-semibold">
                    Create a new board
                  </h2>
                  <p id={descId} className="mt-1 text-sm text-muted">
                    Start a new project by creating a board
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closeCreateModal}
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

            <form onSubmit={handleCreate} className="space-y-4 px-6 py-5">
              <div>
                <label htmlFor="board-name" className="mb-1.5 block text-sm font-medium">
                  Name <span className="text-accent-purple-light">*</span>
                </label>
                <input
                  id="board-name"
                  type="text"
                  value={createForm.name}
                  onChange={(e) => {
                    setCreateForm((prev) => ({ ...prev, name: e.target.value }));
                    if (createError) setCreateError(null);
                  }}
                  disabled={isSaving}
                  className={cn("auth-input w-full", createError && "auth-input-error")}
                  placeholder="Name"
                  autoFocus
                />
                {createError && (
                  <p className="auth-error mt-1.5 text-xs" role="alert">
                    {createError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="board-description" className="mb-1.5 block text-sm font-medium">
                  Description
                </label>
                <input
                  id="board-description"
                  type="text"
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  disabled={isSaving}
                  className="auth-input w-full"
                  placeholder="Description"
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="min-w-[5.75rem] rounded-xl bg-gradient-to-r from-accent-purple to-[#6366f1] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/20 transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={closeCreateModal}
                  disabled={isSaving}
                  className="min-w-[5.75rem] rounded-xl border border-card-border px-5 py-2.5 text-sm font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
