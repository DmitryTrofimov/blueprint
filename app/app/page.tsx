import { Topbar } from "@/components/app/topbar";
import { AIGeneratedTasks } from "@/components/app/ai-generated-tasks";
import { PanelCard } from "@/components/app/panel-card";
import { RouteMap } from "@/components/app/route-map";
import {
  aiGeneratedTasks,
  dashboardStats,
  project,
  routeMapEdges,
  routeMapNodes,
  teamAvatarColors,
  teamMembers,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  return (
    <>
      <Topbar
        title="Dashboard"
        description={`${project.title} · ${project.progress}% complete`}
      />
      <main className="flex-1 overflow-y-auto bg-background p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Active project</p>
            <h2 className="text-xl font-semibold">{project.title}</h2>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-accent-purple/30 bg-accent-purple/10 px-3 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-purple" />
            <span className="text-xs font-medium text-accent-purple-light">AI Active</span>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Tasks", value: dashboardStats.totalTasks, accent: "text-foreground" },
            { label: "In Progress", value: dashboardStats.inProgressTasks, accent: "text-accent-blue" },
            { label: "Completed", value: dashboardStats.completedTasks, accent: "text-accent-green" },
            { label: "AI Generated", value: dashboardStats.aiGeneratedTasks, accent: "text-accent-purple-light" },
          ].map((stat) => (
            <PanelCard key={stat.label}>
              <p className="text-sm text-muted">{stat.label}</p>
              <p className={cn("mt-1 text-3xl font-bold", stat.accent)}>{stat.value}</p>
            </PanelCard>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <AIGeneratedTasks tasks={aiGeneratedTasks} totalCount={24} limit={4} />
          </div>

          <div className="space-y-6">
            <PanelCard>
              <h2 className="mb-4 text-sm font-semibold">Team</h2>
              <div className="space-y-3">
                {teamMembers.map((member, i) => (
                  <div key={member.id} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
                        teamAvatarColors[i],
                      )}
                    >
                      {member.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PanelCard>

            <PanelCard glow="purple">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Project Progress</h2>
                <span className="text-sm font-bold text-accent-purple-light">{project.progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </PanelCard>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-4">
            <h2 className="text-sm font-semibold">Route Map Overview</h2>
            <p className="text-sm text-muted">Execution path for {project.title}</p>
          </div>
          <RouteMap
            nodes={routeMapNodes}
            edges={routeMapEdges}
            heightClassName="h-48 md:h-56"
          />
        </div>
      </main>
    </>
  );
}
