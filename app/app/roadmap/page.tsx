import { RouteMap } from "@/components/app/route-map";
import { Topbar } from "@/components/app/topbar";
import { project, routeMapEdges, routeMapNodes } from "@/lib/mock-data";

const branchLegend = [
  { label: "Launch", color: "bg-accent-purple" },
  { label: "Strategy", color: "bg-accent-blue" },
  { label: "Design", color: "bg-accent-pink" },
  { label: "Engineering", color: "bg-accent-orange" },
  { label: "Complete", color: "bg-accent-green" },
];

export default function RoadmapPage() {
  return (
    <>
      <Topbar title="Route Map" description={`${project.title} execution path`} />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mb-6 flex flex-wrap items-center gap-4">
          {branchLegend.map((item) => (
            <span key={item.label} className="flex items-center gap-1.5 text-xs text-muted">
              <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
              {item.label}
            </span>
          ))}
        </div>

        <RouteMap nodes={routeMapNodes} edges={routeMapEdges} heightClassName="h-64 md:h-96" />

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {routeMapNodes.map((node) => (
            <div
              key={node.id}
              className="rounded-xl border border-white/[0.06] bg-[#1c1c1f] p-4"
            >
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: node.color }}
                />
                <span className="text-xs text-muted">Milestone</span>
              </div>
              <p className="text-sm font-medium">{node.label}</p>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
