import { Card } from "@/components/ui/card";
import { teamMembers } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Section, SectionHeader } from "./section";

const aiGeneratedTasks = [
  { category: "Strategy", color: "purple", task: "Define ICP and enterprise buyer persona" },
  { category: "Finance", color: "blue", task: "Build pricing model with volume discounts" },
  { category: "Docs", color: "pink", task: "Create technical onboarding documentation" },
  { category: "Design", color: "orange", task: "Design enterprise dashboard UI" },
  { category: "Engineering", color: "green", task: "Implement SSO and SCIM provisioning" },
  { category: "Ops", color: "lavender", task: "Set up enterprise SLA and support tier" },
];

const categoryStyles: Record<string, { dot: string; badge: string }> = {
  purple: { dot: "bg-violet-500", badge: "text-violet-400 bg-violet-500/10" },
  blue: { dot: "bg-blue-500", badge: "text-blue-400 bg-blue-500/10" },
  pink: { dot: "bg-pink-500", badge: "text-pink-400 bg-pink-500/10" },
  orange: { dot: "bg-amber-500", badge: "text-amber-400 bg-amber-500/10" },
  green: { dot: "bg-emerald-500", badge: "text-emerald-400 bg-emerald-500/10" },
  lavender: { dot: "bg-indigo-400", badge: "text-indigo-300 bg-indigo-500/10" },
};

function AITaskBreakdownMockup() {
  return (
    <Card className="overflow-hidden p-5 glow-purple">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue">
            <span className="text-sm text-white" aria-hidden="true">✦</span>
          </div>
          <span className="text-sm font-medium text-accent-purple-light">AI Generated Tasks</span>
        </div>
        <span className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-muted">24 tasks</span>
      </div>

      <div className="space-y-2">
        {aiGeneratedTasks.map((item) => {
          const style = categoryStyles[item.color];
          return (
            <div
              key={item.task}
              className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#1c1c1f] px-4 py-3.5 transition-colors hover:border-white/10"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <span className={cn("h-2.5 w-2.5 rounded-full", style.dot)} />
              </div>
              <p className="min-w-0 flex-1 text-sm text-foreground">{item.task}</p>
              <span className={cn("shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium", style.badge)}>
                {item.category}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function SmartAssignmentMockup() {
  const assignments = [
    { task: "Design system audit", member: teamMembers[1], match: 96 },
    { task: "API authentication refactor", member: teamMembers[2], match: 94 },
    { task: "Dashboard performance", member: teamMembers[3], match: 91 },
    { task: "CI/CD pipeline setup", member: teamMembers[4], match: 98 },
  ];

  const avatarColors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-blue-600",
    "from-pink-500 to-rose-500",
    "from-amber-500 to-orange-500",
  ];

  return (
    <Card className="p-5 glow-blue">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium">AI Assignment Engine</p>
        <span className="flex items-center gap-1.5 rounded-full border border-accent-blue/30 bg-accent-blue/10 px-3 py-1 text-xs font-medium text-blue-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-blue" />
          Auto-assigning
        </span>
      </div>
      <div className="space-y-2.5">
        {assignments.map(({ task, member, match }, i) => (
          <div
            key={task}
            className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-[#1c1c1f] p-3.5"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{task}</p>
              <div className="mt-1.5 flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white",
                    avatarColors[i],
                  )}
                >
                  {member.initials}
                </div>
                <span className="text-xs text-muted">{member.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-accent-blue">{match}%</p>
              <p className="text-[10px] text-muted">match</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface RouteNode {
  id: string;
  label: string;
  x: number;
  y: number;
  color: string;
  glowClass: string;
  icon?: string;
}

function RouteMapMockup() {
  const nodes: RouteNode[] = [
    { id: "start", label: "Q4 Launch", x: 8, y: 50, color: "#7c3aed", glowClass: "node-glow-purple" },
    { id: "strategy", label: "Strategy", x: 28, y: 22, color: "#3b82f6", glowClass: "node-glow-blue" },
    { id: "icp", label: "ICP Research", x: 48, y: 12, color: "#3b82f6", glowClass: "node-glow-blue" },
    { id: "gtm", label: "GTM Plan", x: 48, y: 32, color: "#3b82f6", glowClass: "node-glow-blue" },
    { id: "design", label: "Design", x: 28, y: 50, color: "#ec4899", glowClass: "node-glow-pink" },
    { id: "ui", label: "UI Design", x: 48, y: 50, color: "#ec4899", glowClass: "node-glow-pink" },
    { id: "eng", label: "Engineering", x: 28, y: 78, color: "#f59e0b", glowClass: "node-glow-orange" },
    { id: "api", label: "API Build", x: 48, y: 68, color: "#f59e0b", glowClass: "node-glow-orange" },
    { id: "sso", label: "SSO Integration", x: 48, y: 88, color: "#f59e0b", glowClass: "node-glow-orange" },
    { id: "launch", label: "Launch 🚀", x: 88, y: 50, color: "#10b981", glowClass: "node-glow-green" },
  ];

  const edges: [string, string][] = [
    ["start", "strategy"],
    ["start", "design"],
    ["start", "eng"],
    ["strategy", "icp"],
    ["strategy", "gtm"],
    ["design", "ui"],
    ["eng", "api"],
    ["eng", "sso"],
    ["icp", "launch"],
    ["gtm", "launch"],
    ["ui", "launch"],
    ["api", "launch"],
    ["sso", "launch"],
  ];

  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <Card id="route-map" className="overflow-hidden p-0 glow-purple">
      <div className="dot-grid relative p-6 md:p-8">
        <svg viewBox="0 0 100 100" className="h-56 w-full md:h-72" aria-label="Project route map">
          {edges.map(([from, to]) => {
            const a = nodeMap[from];
            const b = nodeMap[to];
            if (!a || !b) return null;
            return (
              <line
                key={`${from}-${to}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.3"
                strokeDasharray="1.5,1"
              />
            );
          })}
          {nodes.map((node) => (
            <g key={node.id} className={node.glowClass}>
              <circle cx={node.x} cy={node.y} r="6" fill="none" stroke={node.color} strokeWidth="0.8" opacity="0.4" />
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
    </Card>
  );
}

function TelegramMockup() {
  const messages = [
    { from: "bot", text: "New task created: Security audit assigned to Alex Chen" },
    { from: "user", text: "/create Fix login page bug - assign to Elena" },
    { from: "bot", text: "✓ Task created and assigned to Elena Rodriguez" },
    { from: "bot", text: "🔔 Dashboard performance moved to Review" },
  ];

  return (
    <Card className="overflow-hidden glow-blue">
      <div className="border-b border-card-border bg-[#2AABEE]/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2AABEE]">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold">Blueprint Bot</p>
            <p className="text-xs text-muted">online</p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm",
              msg.from === "bot"
                ? "rounded-tl-sm bg-[#1c1c1f] text-foreground"
                : "ml-auto rounded-tr-sm bg-accent-blue/15 text-foreground",
            )}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </Card>
  );
}

function UnifiedBoardMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-surface-window glow-purple">
      <div className="flex items-center justify-between border-b border-card-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
        </div>
        <p className="text-xs text-muted">Unified Task Board</p>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-[11px] text-muted">Live</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        {[
          { label: "To Do", dot: "bg-zinc-400", count: 3 },
          { label: "In Progress", dot: "bg-accent-blue", count: 2 },
          { label: "Review", dot: "bg-accent-orange", count: 1 },
          { label: "Done", dot: "bg-accent-green", count: 2 },
        ].map((col) => (
          <div key={col.label}>
            <div className="mb-2 flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", col.dot)} />
              <span className="text-xs font-medium text-muted">{col.label}</span>
            </div>
            {Array.from({ length: col.count }).map((_, i) => (
              <div
                key={i}
                className="mb-1.5 rounded-lg border border-white/[0.06] bg-[#1c1c1f] p-2.5"
              >
                <div className="mb-1.5 h-1.5 w-3/4 rounded bg-white/10" />
                <div className="h-1 w-1/2 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

const steps = [
  {
    step: "01",
    title: "Define a goal",
    description: "Describe your big objective in plain language. Blueprint understands context and scope.",
  },
  {
    step: "02",
    title: "AI creates & assigns tasks",
    description: "Our AI breaks the goal into actionable tasks and assigns them to the right team members.",
  },
  {
    step: "03",
    title: "Team executes",
    description: "Track progress on a unified board, get Telegram notifications, and stay aligned.",
  },
];

export function FeatureSections() {
  return (
    <div id="features">
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHeader
            eyebrow="AI Task Breakdown"
            title="One goal becomes a complete action plan"
            description="Blueprint's AI analyzes your global objective and automatically generates a structured set of smaller, actionable tasks — ready for your team to execute."
          />
          <AITaskBreakdownMockup />
        </div>
      </Section>

      <Section className="border-t border-card-border/50 bg-surface/30">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <SmartAssignmentMockup />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeader
              eyebrow="Smart Assignment"
              title="Right person, right task, automatically"
              description="AI matches tasks to team members based on skills, workload, and availability — so nothing falls through the cracks."
            />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHeader
            eyebrow="Route Map"
            title="See the full execution path"
            description="Visualize your project as a connected roadmap. Understand dependencies, track flow, and know exactly what's blocking progress."
          />
          <RouteMapMockup />
        </div>
      </Section>

      <Section id="integrations" className="border-t border-card-border/50 bg-surface/30">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="order-2 lg:order-1">
            <TelegramMockup />
          </div>
          <div className="order-1 lg:order-2">
            <SectionHeader
              eyebrow="Telegram Integration"
              title="Manage tasks from anywhere"
              description="Create tasks, assign work, and receive instant notifications directly in Telegram. Your team stays connected without switching apps."
            />
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHeader
            eyebrow="Unified Task Board"
            title="Simple board, powerful execution"
            description="An elegant, AI-first Kanban board that keeps planning lightweight and execution clear — built for modern teams who want to move fast."
          />
          <UnifiedBoardMockup />
        </div>
      </Section>

      <Section id="how-it-works" className="border-t border-card-border/50 bg-surface/30 pb-8">
        <SectionHeader
          eyebrow="How it works"
          title="From goal to done in three steps"
          description="Blueprint removes the overhead of project planning so your team can focus on execution."
          align="center"
        />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <Card key={step.step} className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple to-accent-blue text-sm font-bold text-white">
                {step.step}
              </div>
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}
