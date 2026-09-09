import { BoardsTable } from "@/components/app/boards-table";
import { Topbar } from "@/components/app/topbar";
import { getCurrentUserProfile } from "@/lib/supabase/profile-server";
import { listBoardsServer } from "@/lib/supabase/boards-server";

export default async function BoardsPage() {
  const [profile, boardsResult] = await Promise.all([
    getCurrentUserProfile(),
    listBoardsServer(),
  ]);

  return (
    <>
      <Topbar title="Boards" description="Create and manage your boards" />
      <main className="flex-1 overflow-x-auto bg-background p-6">
        <BoardsTable
          createdBy={profile.username}
          initialBoards={boardsResult.data}
          initialError={boardsResult.error}
        />
      </main>
    </>
  );
}
