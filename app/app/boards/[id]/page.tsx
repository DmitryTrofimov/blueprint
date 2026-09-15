import Link from "next/link";
import { BoardKanbanView } from "@/components/app/board-kanban-view";
import { Topbar } from "@/components/app/topbar";
import { getBoardById, getBoardKanbanColumns } from "@/lib/supabase/boards-server";
import { notFound } from "next/navigation";

interface BoardPageProps {
  params: Promise<{ id: string }>;
}

export default async function BoardDetailPage({ params }: BoardPageProps) {
  const { id } = await params;
  const [boardResult, kanbanResult] = await Promise.all([
    getBoardById(id),
    getBoardKanbanColumns(id),
  ]);

  if (boardResult.error) {
    return (
      <>
        <Topbar title="Board" description="Unable to load board" />
        <main className="flex-1 overflow-x-auto bg-background p-6">
          <div role="alert" className="auth-form-error rounded-xl px-4 py-3 text-sm">
            {boardResult.error}
          </div>
        </main>
      </>
    );
  }

  if (!boardResult.data) {
    notFound();
  }

  const board = boardResult.data;

  return (
    <>
      <Topbar
        title={board.name}
        description={board.description || "Task board"}
      />
      <main className="flex flex-1 flex-col overflow-hidden bg-background p-6">
        <div className="mb-4 flex items-center gap-3 text-sm text-muted">
          <Link
            href="/app/boards"
            className="font-medium text-accent-purple-light transition-colors hover:text-foreground"
          >
            ← Back to boards
          </Link>
          <span aria-hidden="true">·</span>
          <span>Created by {board.createdBy}</span>
        </div>

        {kanbanResult.error && (
          <div role="alert" className="auth-form-error mb-4 rounded-xl px-4 py-3 text-sm">
            {kanbanResult.error}
          </div>
        )}

        <BoardKanbanView columns={kanbanResult.columns} />
      </main>
    </>
  );
}
