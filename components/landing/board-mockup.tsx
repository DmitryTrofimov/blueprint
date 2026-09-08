import { TaskBoard } from "@/components/app/task-board";
import { boardColumns } from "@/lib/mock-data";

export function BoardMockup() {
  return <TaskBoard columns={boardColumns} />;
}
