"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { planTasksWithAi } from "@/lib/supabase/anymodel-chat";
import { useBoardAiSync } from "@/components/app/board-ai-sync";
import { useCallback, useMemo, useState } from "react";

const navItems = [
  {
    href: "/app",
    label: "Dashboard",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: "/app/boards",
    label: "Boards",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10m0-10a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2" />
      </svg>
    ),
  },
  {
    href: "/app/roadmap",
    label: "Roadmap",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    href: "/app/settings",
    label: "Settings",
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

const BOARD_PATH_RE = /^\/app\/boards\/([^/]+)/;

interface SidebarProps {
  username: string;
  role: string;
  initials: string;
}

function parseBoardIdFromPathname(pathname: string): string | null {
  const match = pathname.match(BOARD_PATH_RE);
  return match?.[1] ?? null;
}

function SidebarTaskChat({ boardId }: { boardId: string }) {
  const { publishAiTasksCreated } = useBoardAiSync();
  const [taskText, setTaskText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const task = taskText.trim();
      if (!task) {
        setError("Describe the task you want to plan.");
        return;
      }

      setIsSubmitting(true);
      setError(null);

      const { data, error: planError } = await planTasksWithAi(boardId, { task });

      setIsSubmitting(false);

      if (planError || !data) {
        setError(planError ?? "Failed to plan tasks.");
        return;
      }

      publishAiTasksCreated({
        boardId: data.board_id,
        statusId: data.status_id,
        plannedSubtasks: data.planned_subtasks,
        assignments: data.assignments,
        createdTasks: data.created_tasks,
      });

      setTaskText("");
    },
    [boardId, taskText, publishAiTasksCreated],
  );

  return (
    <section
      className="border-t border-card-border p-4"
      aria-label="AI task planning chat"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
        Plan tasks with AI
      </h2>
      <p className="mt-1 text-xs text-muted">
        Describe scope of work for this board. AI splits it into ToDo tasks with assignees
      </p>

      <form onSubmit={handleSubmit} className="mt-3 space-y-2">
        {error ? (
          <p role="alert" className="auth-error text-xs">
            {error}
          </p>
        ) : null}

        <textarea
          value={taskText}
          onChange={(event) => {
            setTaskText(event.target.value);
            if (error) setError(null);
          }}
          disabled={isSubmitting}
          rows={4}
          placeholder="e.g. Launch login page with Google auth and error states"
          className="auth-input w-full resize-none text-sm"
        />

        <button
          type="submit"
          disabled={isSubmitting || !taskText.trim()}
          className="w-full rounded-lg bg-gradient-to-r from-accent-purple to-[#6366f1] px-3 py-2 text-sm font-semibold text-white transition-opacity hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "Planning…" : "Generate"}
        </button>
      </form>
    </section>
  );
}

export function Sidebar({ username, role, initials }: SidebarProps) {
  const pathname = usePathname();
  const boardId = useMemo(() => parseBoardIdFromPathname(pathname), [pathname]);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-card-border bg-surface">
      <div className="flex h-16 items-center gap-2 border-b border-card-border px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent-blue to-accent-purple">
            <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-base font-semibold">Blueprint</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4" aria-label="App navigation">
        {navItems.map((item) => {
          const isActive =
            item.href === "/app"
              ? pathname === "/app"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-purple/10 text-accent-purple-light"
                  : "text-muted hover:bg-white/5 hover:text-foreground",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {boardId ? <SidebarTaskChat boardId={boardId} /> : null}

      <div className="border-t border-card-border p-4">
        <Link
          href="/app/profile"
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
            pathname === "/app/profile"
              ? "bg-accent-purple/10 text-accent-purple-light"
              : "text-foreground hover:bg-white/5",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-blue text-xs font-bold text-white">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{username}</p>
            <p className="truncate text-xs text-muted">{role}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}
