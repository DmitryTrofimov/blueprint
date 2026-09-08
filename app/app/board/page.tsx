import { TaskBoard } from "@/components/app/task-board";
import { Topbar } from "@/components/app/topbar";
import { boardColumns } from "@/lib/mock-data";

export default function BoardPage() {
  return (
    <>
      <Topbar title="Task Board" description="Q4 Product Launch — AI Task Board" />
      <main className="flex-1 overflow-x-auto bg-background p-6">
        <TaskBoard columns={boardColumns} showChrome={false} />
      </main>
    </>
  );
}
