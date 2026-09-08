import { Topbar } from "@/components/app/topbar";
import { Card } from "@/components/ui/card";
import { dashboardStats, getMemberById, project, tasks, teamMembers } from "@/lib/mock-data";

export default function DashboardPage() {
  const recentTasks = tasks.filter((t) => t.id !== "t1").slice(0, 5);

  return (
    <>
      <Topbar
        title="Dashboard"
        description={`${project.title} · ${project.progress}% complete`}
      />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Tasks", value: dashboardStats.totalTasks, color: "text-foreground" },
            { label: "In Progress", value: dashboardStats.inProgressTasks, color: "text-accent-blue" },
            { label: "Completed", value: dashboardStats.completedTasks, color: "text-accent-purple" },
            { label: "AI Generated", value: dashboardStats.aiGeneratedTasks, color: "text-accent-purple" },
          ].map((stat) => (
            <Card key={stat.label} className="p-5">
              <p className="text-sm text-muted">{stat.label}</p>
              <p className={`mt-1 text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 p-5">
            <h2 className="mb-4 text-sm font-semibold">Recent Tasks</h2>
            <div className="space-y-3">
              {recentTasks.map((task) => {
                const member = task.assigneeId ? getMemberById(task.assigneeId) : undefined;
                return (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-card-border bg-background/40 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{task.title}</p>
                      <p className="text-xs capitalize text-muted">{task.status.replace("_", " ")}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.aiGenerated && (
                        <span className="rounded bg-accent-purple/20 px-1.5 py-0.5 text-[10px] font-medium text-accent-purple">
                          AI
                        </span>
                      )}
                      {member && (
                        <div
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-blue text-[10px] font-bold text-white"
                          title={member.name}
                        >
                          {member.initials}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="mb-4 text-sm font-semibold">Team</h2>
            <div className="space-y-3">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-blue text-xs font-bold text-white">
                    {member.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="mt-6 p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Project Progress</h2>
            <span className="text-sm font-bold text-accent-purple">{project.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-elevated">
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent-purple to-accent-blue transition-all"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </Card>
      </main>
    </>
  );
}
