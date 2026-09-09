import { TaskBoardsTable } from "@/components/app/task-boards-table";
import { Topbar } from "@/components/app/topbar";
import { getCurrentUserProfile } from "@/lib/supabase/profile";
import { listTaskBoardsServer } from "@/lib/supabase/task-boards-server";

export default async function BoardPage() {
  const [profile, boardsResult] = await Promise.all([
    getCurrentUserProfile(),
    listTaskBoardsServer(),
  ]);

  return (
    <>
      <Topbar title="Task Boards" description="Create and manage your task boards" />
      <main className="flex-1 overflow-x-auto bg-background p-6">
        <TaskBoardsTable
          createdBy={profile.username}
          initialBoards={boardsResult.data}
          initialError={boardsResult.error}
        />
      </main>
    </>
  );
}
