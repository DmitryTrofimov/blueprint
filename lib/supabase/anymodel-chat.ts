import type {
  AiAssignmentMeta,
  AiCreatedTaskRow,
  AiPlannedSubtask,
} from "@/lib/ai-task-plan-events";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export type PlanTasksRequest = {
  task: string;
  context?: string;
  max_subtasks?: number;
};

export type PlanTasksResponse = {
  board_id: string;
  status_id: string;
  planned_subtasks: AiPlannedSubtask[];
  assignments: AiAssignmentMeta[];
  created_tasks: AiCreatedTaskRow[];
};

type PlanTasksErrorBody = {
  error?: string;
  details?: string;
};

export async function planTasksWithAi(
  boardId: string,
  body: PlanTasksRequest,
): Promise<{ data: PlanTasksResponse | null; error: string | null }> {
  const baseUrl = getSupabaseUrl().replace(/\/$/, "");
  const anonKey = getSupabaseAnonKey();

  const url = `${baseUrl}/functions/v1/anymodel-chat?board_id=${encodeURIComponent(boardId)}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        apikey: anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    return { data: null, error: message };
  }

  const text = await response.text();
  let parsed: PlanTasksResponse | PlanTasksErrorBody | null = null;
  if (text) {
    try {
      parsed = JSON.parse(text) as PlanTasksResponse | PlanTasksErrorBody;
    } catch {
      return { data: null, error: "Invalid response from task planner." };
    }
  }

  if (!response.ok) {
    const err = parsed as PlanTasksErrorBody | null;
    return {
      data: null,
      error: err?.error ?? err?.details ?? `Request failed (${response.status})`,
    };
  }

  if (!parsed || !("created_tasks" in parsed)) {
    return { data: null, error: "Unexpected response from task planner." };
  }

  return { data: parsed as PlanTasksResponse, error: null };
}
