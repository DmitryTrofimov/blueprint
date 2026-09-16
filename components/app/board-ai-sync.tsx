"use client";

import type { AiTasksCreatedDetail } from "@/lib/ai-task-plan-events";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type AiTasksListener = (detail: AiTasksCreatedDetail) => void;

type BoardAiSyncContextValue = {
  publishAiTasksCreated: (detail: AiTasksCreatedDetail) => void;
  subscribeAiTasksCreated: (listener: AiTasksListener) => () => void;
};

const BoardAiSyncContext = createContext<BoardAiSyncContextValue | null>(null);

export function BoardAiSyncProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef(new Set<AiTasksListener>());

  const publishAiTasksCreated = useCallback((detail: AiTasksCreatedDetail) => {
    for (const listener of listenersRef.current) {
      listener(detail);
    }
  }, []);

  const subscribeAiTasksCreated = useCallback((listener: AiTasksListener) => {
    listenersRef.current.add(listener);
    return () => {
      listenersRef.current.delete(listener);
    };
  }, []);

  const value = useMemo(
    () => ({ publishAiTasksCreated, subscribeAiTasksCreated }),
    [publishAiTasksCreated, subscribeAiTasksCreated],
  );

  return (
    <BoardAiSyncContext.Provider value={value}>{children}</BoardAiSyncContext.Provider>
  );
}

export function useBoardAiSync(): BoardAiSyncContextValue {
  const value = useContext(BoardAiSyncContext);
  if (!value) {
    throw new Error("useBoardAiSync must be used within BoardAiSyncProvider");
  }
  return value;
}

export function useBoardAiSyncOptional(): BoardAiSyncContextValue | null {
  return useContext(BoardAiSyncContext);
}
