import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { roadmapEdges, roadmapNodes } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusFill: Record<string, string> = {
  done: "#8b5cf6",
  in_progress: "#3b82f6",
  review: "#f59e0b",
  todo: "#94a3b8",
  backlog: "#475569",
};

const statusStyles: Record<string, { dot: string; label: string }> = {
  done: { dot: "bg-accent-purple", label: "Done" },
  in_progress: { dot: "bg-accent-blue", label: "In Progress" },
  review: { dot: "bg-amber-500", label: "Review" },
  todo: { dot: "bg-slate-400", label: "To Do" },
  backlog: { dot: "bg-slate-600", label: "Backlog" },
};

export default function RoadmapPage() {
  return (
    <>
      <Topbar title="Route Map" description="Q2 Product Release execution path" />
      <main className="flex-1 overflow-y-auto p-6">
        <Card className="mb-6 p-6">
          <div className="mb-4 flex flex-wrap items-center gap-4">
            {Object.entries(statusStyles).map(([status, style]) => (
              <span key={status} className="flex items-center gap-1.5 text-xs text-muted">
                <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
                {style.label}
              </span>
            ))}
          </div>

          <svg viewBox="0 0 100 60" className="h-64 w-full md:h-80">
            {roadmapEdges.map((edge) => {
              const from = roadmapNodes.find((n) => n.id === edge.from);
              const to = roadmapNodes.find((n) => n.id === edge.to);
              if (!from || !to) return null;
              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={from.x}
                  y1={from.y * 0.6}
                  x2={to.x}
                  y2={to.y * 0.6}
                  stroke="rgba(139, 92, 246, 0.3)"
                  strokeWidth="0.4"
                  strokeDasharray="1.5,0.8"
                />
              );
            })}
            {roadmapNodes.map((node) => {
              const fill = statusFill[node.status] ?? statusFill.backlog;
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y * 0.6}
                    r="3"
                    fill={fill}
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="0.3"
                  />
                  <text
                    x={node.x}
                    y={node.y * 0.6 + 6}
                    textAnchor="middle"
                    className="fill-muted text-[2.5px]"
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roadmapNodes.map((node) => {
            const style = statusStyles[node.status] ?? statusStyles.backlog;
            return (
              <Card key={node.id} className="p-4">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
                  <span className="text-xs capitalize text-muted">{style.label}</span>
                </div>
                <p className="mt-2 text-sm font-medium">{node.label}</p>
              </Card>
            );
          })}
        </div>
      </main>
    </>
  );
}
