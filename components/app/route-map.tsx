import type { RouteMapEdge, RouteMapNode } from "@/types/board";
import { cn } from "@/lib/utils";

interface RouteMapProps {
  nodes: RouteMapNode[];
  edges: RouteMapEdge[];
  className?: string;
  heightClassName?: string;
}

export function RouteMap({
  nodes,
  edges,
  className,
  heightClassName = "h-56 md:h-72",
}: RouteMapProps) {
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-card-border bg-surface-window glow-purple",
        className,
      )}
    >
      <div className="dot-grid relative p-6 md:p-8">
        <svg
          viewBox="0 0 100 100"
          className={cn("w-full", heightClassName)}
          aria-label="Project route map"
        >
          {edges.map((edge) => {
            const from = nodeMap[edge.from];
            const to = nodeMap[edge.to];
            if (!from || !to) return null;
            return (
              <line
                key={`${edge.from}-${edge.to}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.3"
                strokeDasharray="1.5,1"
              />
            );
          })}
          {nodes.map((node) => (
            <g key={node.id} className={node.glowClass}>
              <circle
                cx={node.x}
                cy={node.y}
                r="6"
                fill="none"
                stroke={node.color}
                strokeWidth="0.8"
                opacity="0.4"
              />
              <circle cx={node.x} cy={node.y} r="4" fill={node.color} opacity="0.9" />
              <circle cx={node.x} cy={node.y} r="1.5" fill="white" opacity="0.9" />
              <text
                x={node.x}
                y={node.y + 9}
                textAnchor="middle"
                className="fill-muted text-[2.8px] font-medium"
              >
                {node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
