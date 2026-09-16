"use client";

import { Sidebar } from "@/components/app/sidebar";
import { BoardAiSyncProvider } from "@/components/app/board-ai-sync";

interface AppShellProps {
  username: string;
  role: string;
  initials: string;
  children: React.ReactNode;
}

export function AppShell({ username, role, initials, children }: AppShellProps) {
  return (
    <BoardAiSyncProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar username={username} role={role} initials={initials} />
        <div className="flex flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </BoardAiSyncProvider>
  );
}
