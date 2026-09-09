import { KanbanBoard } from "@/components/app/kanban-board";
import { boardColumns } from "@/lib/mock-data";

export function BoardMockup() {
  return <KanbanBoard columns={boardColumns} />;
}
