import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  from: "user" | "bot";
  text?: string;
  taskCard?: {
    title: string;
    status: string;
    priority: string;
    assignee: string;
    assigneeColor: string;
    ai?: boolean;
  };
  statusSummary?: {
    project: string;
    todo: number;
    inProgress: number;
    done: number;
  };
}

const messages: ChatMessage[] = [
  {
    id: "1",
    from: "user",
    text: "Create task: Launch Q4 marketing campaign by Friday",
  },
  {
    id: "2",
    from: "bot",
    taskCard: {
      title: "Launch Q4 marketing campaign",
      status: "To Do",
      priority: "High",
      assignee: "ER",
      assigneeColor: "from-pink-500 to-rose-500",
      ai: true,
    },
  },
  {
    id: "3",
    from: "bot",
    text: "✦ 3 subtasks generated and added to your board",
  },
  {
    id: "4",
    from: "user",
    text: "/status",
  },
  {
    id: "5",
    from: "bot",
    statusSummary: {
      project: "Q4 Product Launch",
      todo: 3,
      inProgress: 2,
      done: 2,
    },
  },
  {
    id: "6",
    from: "bot",
    text: "🔔 API rate limiting moved to Review",
  },
];

function TaskCardBubble({
  task,
}: {
  task: NonNullable<ChatMessage["taskCard"]>;
}) {
  return (
    <div className="mt-1 max-w-[90%] overflow-hidden rounded-xl border border-white/[0.08] bg-[#1c1c1f]">
      <div className="border-b border-white/[0.06] px-3.5 py-2">
        <div className="flex items-center gap-2">
          {task.ai && (
            <span className="inline-flex items-center gap-1 rounded-md bg-accent-purple/15 px-1.5 py-0.5 text-[10px] font-medium text-accent-purple-light">
              ✦ AI
            </span>
          )}
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted">
            Task created
          </span>
        </div>
      </div>
      <div className="px-3.5 py-3">
        <p className="text-sm font-medium leading-snug">{task.title}</p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted">
          <span>{task.status}</span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            {task.priority}
          </span>
          <span className="flex items-center gap-1.5">
            Assigned
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br text-[9px] font-bold text-white",
                task.assigneeColor,
              )}
            >
              {task.assignee}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function StatusSummaryBubble({
  summary,
}: {
  summary: NonNullable<ChatMessage["statusSummary"]>;
}) {
  return (
    <div className="mt-1 max-w-[90%] rounded-xl border border-white/[0.08] bg-[#1c1c1f] px-3.5 py-3">
      <p className="text-xs font-medium text-muted">📊 {summary.project}</p>
      <div className="mt-2.5 flex gap-4 text-[11px]">
        <span>
          <span className="text-zinc-400">To Do</span>{" "}
          <span className="font-semibold text-foreground">{summary.todo}</span>
        </span>
        <span>
          <span className="text-accent-blue">In Progress</span>{" "}
          <span className="font-semibold text-foreground">{summary.inProgress}</span>
        </span>
        <span>
          <span className="text-accent-green">Done</span>{" "}
          <span className="font-semibold text-foreground">{summary.done}</span>
        </span>
      </div>
    </div>
  );
}

export function TelegramMockup() {
  return (
    <div className="overflow-hidden rounded-2xl border border-card-border bg-surface-window glow-blue">
      <div className="flex items-center justify-between border-b border-card-border px-5 py-3.5">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-500/80" />
          <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </div>
        <p className="text-sm text-muted">Telegram — Blueprint Bot</p>
        <div className="flex items-center gap-1.5 rounded-full border border-[#2AABEE]/30 bg-[#2AABEE]/10 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-[#2AABEE]" />
          <span className="text-xs font-medium text-[#5bc0f8]">Connected</span>
        </div>
      </div>

      <div className="border-b border-card-border bg-[#2AABEE]/8 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2AABEE]">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9.036 15.803l-.374 5.292a.525.525 0 00.82.442l2.942-2.066 3.438 2.538a.525.525 0 00.826-.412l2.6-13.764A.525.525 0 0018.9 7.36L2.46 13.78a.525.525 0 00.022.988l4.05 1.276 9.414-5.94-8.055 8.615 2.153-.956z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold">Blueprint Bot</p>
            <p className="text-xs text-[#5bc0f8]">online</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 bg-[#0d0d10] p-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn("flex flex-col", msg.from === "user" && "items-end")}
          >
            {msg.text && (
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.from === "bot"
                    ? "rounded-tl-sm bg-[#1c1c1f] text-foreground"
                    : "rounded-tr-sm bg-[#2AABEE]/20 text-foreground",
                )}
              >
                {msg.text}
              </div>
            )}
            {msg.taskCard && <TaskCardBubble task={msg.taskCard} />}
            {msg.statusSummary && <StatusSummaryBubble summary={msg.statusSummary} />}
          </div>
        ))}
      </div>

      <div className="border-t border-card-border bg-[#0d0d10] px-4 py-3">
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-[#1c1c1f] px-3.5 py-2.5">
          <span className="flex-1 text-sm text-muted-foreground">Message Blueprint Bot…</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2AABEE]">
            <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
