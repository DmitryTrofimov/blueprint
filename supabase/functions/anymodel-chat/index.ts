/// <reference path="./deno-runtime.d.ts" />

const DEFAULT_ANYMODEL_BASE_URL = "https://anymodel.org/v1";
const DEFAULT_MODEL = "cx/gpt-5.6-luna";
const DEFAULT_MAX_SUBTASKS = 8;
const MANAGER_ROLE = "Manager";
const VALID_PRIORITIES = ["Urgent", "High", "Average", "Low"] as const;

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type PriorityName = (typeof VALID_PRIORITIES)[number];

type PlanRequestBody = {
  task?: string;
  context?: string;
  max_subtasks?: number;
};

type PlannedSubtask = {
  title: string;
  description: string;
  role_name: string;
  priority_hint: PriorityName;
};

type LlmPlan = {
  subtasks: PlannedSubtask[];
};

type UserDirectoryRow = {
  user_id: string;
  username: string;
  role_name: string;
};

type TaskPriorityRow = {
  id: string;
  name: string;
};

type CreatedTaskRow = {
  id: string;
  board_id: string;
  title: string;
  description: string;
  status_id: string;
  priority_id: string | null;
  assigned_to: string | null;
  created_by_name: string;
};

type AssignmentMeta = {
  role_name: string;
  assigned_to: string | null;
  assignee_username: string | null;
  fallback: "direct" | "manager" | "unassigned";
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function getAnyModelConfig():
  | { apiKey: string; baseUrl: string; defaultModel: string }
  | Response {
  const apiKey = Deno.env.get("ANYMODEL_API_KEY")?.trim();
  if (!apiKey) {
    return jsonResponse(
      { error: "ANYMODEL_API_KEY is not configured on the Edge Function." },
      500,
    );
  }

  const baseUrl =
    Deno.env.get("ANYMODEL_BASE_URL")?.trim().replace(/\/$/, "") ??
    DEFAULT_ANYMODEL_BASE_URL;

  const defaultModel =
    Deno.env.get("ANYMODEL_DEFAULT_MODEL")?.trim() || DEFAULT_MODEL;

  return { apiKey, baseUrl, defaultModel };
}

function getSupabaseConfig(): { url: string; serviceKey: string } | Response {
  const url = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();

  if (!url || !serviceKey) {
    return jsonResponse(
      {
        error:
          "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured for the Edge Function.",
      },
      500,
    );
  }

  return { url: url.replace(/\/$/, ""), serviceKey };
}

async function supabaseRest<T>(
  config: { url: string; serviceKey: string },
  path: string,
  init: RequestInit = {},
): Promise<{ data: T | null; error: string | null; status: number }> {
  const headers = new Headers(init.headers);
  headers.set("apikey", config.serviceKey);
  headers.set("Authorization", `Bearer ${config.serviceKey}`);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;
  try {
    response = await fetch(`${config.url}/rest/v1/${path}`, {
      ...init,
      headers,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { data: null, error: message, status: 502 };
  }

  const text = await response.text();
  if (!response.ok) {
    return {
      data: null,
      error: text || response.statusText,
      status: response.status,
    };
  }

  if (!text) {
    return { data: null, error: null, status: response.status };
  }

  try {
    return { data: JSON.parse(text) as T, error: null, status: response.status };
  } catch {
    return { data: null, error: "Invalid JSON from Supabase.", status: 502 };
  }
}

function parsePlanBody(raw: unknown): PlanRequestBody | Response {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return jsonResponse({ error: "Request body must be a JSON object." }, 400);
  }

  const body = raw as PlanRequestBody;

  if (typeof body.task !== "string" || body.task.trim().length === 0) {
    return jsonResponse(
      { error: "`task` is required and must be a non-empty string." },
      400,
    );
  }

  if (body.context !== undefined && typeof body.context !== "string") {
    return jsonResponse({ error: "`context` must be a string." }, 400);
  }

  if (
    body.max_subtasks !== undefined &&
    (typeof body.max_subtasks !== "number" ||
      !Number.isInteger(body.max_subtasks) ||
      body.max_subtasks < 1 ||
      body.max_subtasks > 20)
  ) {
    return jsonResponse(
      { error: "`max_subtasks` must be an integer between 1 and 20." },
      400,
    );
  }

  return body;
}

function parseBoardIdFromUrl(url: string): string | Response {
  const boardId = new URL(url).searchParams.get("board_id")?.trim();
  if (!boardId) {
    return jsonResponse(
      { error: "Query parameter `board_id` is required." },
      400,
    );
  }
  if (!UUID_RE.test(boardId)) {
    return jsonResponse({ error: "`board_id` must be a valid UUID." }, 400);
  }
  return boardId;
}

function clampText(value: string, maxLen: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return trimmed.slice(0, maxLen);
}

function extractJsonObject(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = (fenced?.[1] ?? text).trim();
  return JSON.parse(candidate);
}

function normalizePriorityHint(value: unknown): PriorityName {
  if (typeof value !== "string") return "Average";
  const normalized =
    value.trim().charAt(0).toUpperCase() +
    value.trim().slice(1).toLowerCase();
  if (normalized === "Urgent") return "Urgent";
  if (normalized === "High") return "High";
  if (normalized === "Low") return "Low";
  return "Average";
}

function parseLlmPlan(raw: unknown, allowedRoles: Set<string>): LlmPlan | Response {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return jsonResponse({ error: "LLM plan must be a JSON object." }, 502);
  }

  const plan = raw as { subtasks?: unknown };
  if (!Array.isArray(plan.subtasks) || plan.subtasks.length === 0) {
    return jsonResponse(
      { error: "LLM returned no subtasks to create." },
      502,
    );
  }

  const subtasks: PlannedSubtask[] = [];

  for (let i = 0; i < plan.subtasks.length; i++) {
    const item = plan.subtasks[i];
    if (!item || typeof item !== "object" || Array.isArray(item)) {
      return jsonResponse(
        { error: `Invalid subtask at index ${i}.` },
        502,
      );
    }

    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? row.title.trim() : "";
    const description =
      typeof row.description === "string" ? row.description.trim() : "";
    const roleName =
      typeof row.role_name === "string" ? row.role_name.trim() : "";

    if (!title || !roleName) {
      return jsonResponse(
        { error: `Subtask at index ${i} must include title and role_name.` },
        502,
      );
    }

    if (!allowedRoles.has(roleName)) {
      return jsonResponse(
        {
          error: `Subtask at index ${i} has unknown role_name: ${roleName}.`,
          allowed_roles: [...allowedRoles],
        },
        502,
      );
    }

    subtasks.push({
      title: clampText(title, 80),
      description: clampText(description, 220),
      role_name: roleName,
      priority_hint: normalizePriorityHint(row.priority_hint),
    });
  }

  return { subtasks };
}

async function fetchRoles(
  supabase: { url: string; serviceKey: string },
): Promise<string[] | Response> {
  const result = await supabaseRest<{ name: string }[]>(
    supabase,
    "roles?select=name&order=name.asc",
  );
  if (result.error || !result.data) {
    return jsonResponse(
      { error: "Failed to load roles from Supabase.", details: result.error },
      502,
    );
  }
  return result.data.map((row) => row.name);
}

async function fetchUserDirectory(
  supabase: { url: string; serviceKey: string },
): Promise<UserDirectoryRow[] | Response> {
  const result = await supabaseRest<UserDirectoryRow[]>(
    supabase,
    "user_directory?select=user_id,username,role_name",
  );
  if (result.error || !result.data) {
    return jsonResponse(
      {
        error: "Failed to load user directory from Supabase.",
        details: result.error,
      },
      502,
    );
  }
  return result.data;
}

async function fetchPriorities(
  supabase: { url: string; serviceKey: string },
): Promise<Map<PriorityName, string> | Response> {
  const result = await supabaseRest<TaskPriorityRow[]>(
    supabase,
    "task_priority?select=id,name",
  );
  if (result.error || !result.data) {
    return jsonResponse(
      { error: "Failed to load task priorities.", details: result.error },
      502,
    );
  }

  const map = new Map<PriorityName, string>();
  for (const name of VALID_PRIORITIES) {
    const row = result.data.find((p) => p.name === name);
    if (row) map.set(name, row.id);
  }
  return map;
}

async function fetchTodoStatusId(
  supabase: { url: string; serviceKey: string },
  boardId: string,
): Promise<string | Response> {
  const boardCheck = await supabaseRest<{ id: string }[]>(
    supabase,
    `boards?id=eq.${boardId}&select=id`,
  );
  if (boardCheck.error) {
    return jsonResponse(
      { error: "Failed to verify board.", details: boardCheck.error },
      502,
    );
  }
  if (!boardCheck.data?.length) {
    return jsonResponse({ error: "Board not found.", board_id: boardId }, 404);
  }

  const statusResult = await supabaseRest<{ id: string }[]>(
    supabase,
    `board_statuses?board_id=eq.${boardId}&is_todo=eq.true&select=id`,
  );
  if (statusResult.error || !statusResult.data?.length) {
    return jsonResponse(
      {
        error: "ToDo column not found for this board.",
        board_id: boardId,
      },
      400,
    );
  }

  return statusResult.data[0].id;
}

function pickUserForRole(
  directory: UserDirectoryRow[],
  roleName: string,
): UserDirectoryRow | null {
  const matches = directory.filter(
    (u) => u.role_name.toLowerCase() === roleName.toLowerCase(),
  );
  return matches[0] ?? null;
}

function resolveAssignee(
  directory: UserDirectoryRow[],
  roleName: string,
): { user: UserDirectoryRow | null; fallback: AssignmentMeta["fallback"] } {
  const direct = pickUserForRole(directory, roleName);
  if (direct) {
    return { user: direct, fallback: "direct" };
  }

  const manager = pickUserForRole(directory, MANAGER_ROLE);
  if (manager) {
    return { user: manager, fallback: "manager" };
  }

  return { user: null, fallback: "unassigned" };
}

async function callAnyModelPlan(params: {
  config: { apiKey: string; baseUrl: string; defaultModel: string };
  task: string;
  context: string;
  maxSubtasks: number;
  roleNames: string[];
}): Promise<LlmPlan | Response> {
  const systemPrompt = [
    "You are a technical project planner.",
    "Split the user's task into actionable subtasks for a software team.",
    "Respond with JSON only, no markdown, using this schema:",
    '{"subtasks":[{"title":"string","description":"string","role_name":"string","priority_hint":"Urgent|High|Average|Low"}]}',
    `Use only these role_name values exactly: ${params.roleNames.join(", ")}.`,
    `Return at most ${params.maxSubtasks} subtasks.`,
    "Keep title under 80 characters and description under 220 characters.",
  ].join(" ");

  const userContent = params.context
    ? `Task:\n${params.task}\n\nContext:\n${params.context}`
    : params.task;

  const payload = {
    model: params.config.defaultModel,
    temperature: 0.2,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
  };

  let upstream: Response;
  try {
    upstream = await fetch(`${params.config.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return jsonResponse(
      { error: "Failed to reach AnyModel API.", details: message },
      502,
    );
  }

  const upstreamText = await upstream.text();
  if (!upstream.ok) {
    return jsonResponse(
      { error: "AnyModel API error.", status: upstream.status, body: upstreamText },
      502,
    );
  }

  let completion: {
    choices?: { message?: { content?: string } }[];
  };
  try {
    completion = JSON.parse(upstreamText);
  } catch {
    return jsonResponse({ error: "Invalid JSON from AnyModel." }, 502);
  }

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    return jsonResponse({ error: "AnyModel returned empty content." }, 502);
  }

  let parsed: unknown;
  try {
    parsed = extractJsonObject(content);
  } catch {
    return jsonResponse(
      { error: "Failed to parse LLM JSON.", raw: content },
      502,
    );
  }

  const allowed = new Set(params.roleNames);
  return parseLlmPlan(parsed, allowed);
}

async function insertTask(
  supabase: { url: string; serviceKey: string },
  row: {
    board_id: string;
    title: string;
    description: string;
    status_id: string;
    priority_id: string | null;
    assigned_to: string | null;
  },
): Promise<CreatedTaskRow | Response> {
  const result = await supabaseRest<CreatedTaskRow[]>(
    supabase,
    "tasks?select=id,board_id,title,description,status_id,priority_id,assigned_to,created_by_name",
    {
      method: "POST",
      headers: {
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        ...row,
        created_by_name: "AI Planner",
        tags: ["AI"],
        progress: 0,
      }),
    },
  );

  if (result.error || !result.data?.[0]) {
    return jsonResponse(
      { error: "Failed to create task.", details: result.error },
      502,
    );
  }

  return result.data[0];
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed. Use POST." }, 405);
  }

  const anyModel = getAnyModelConfig();
  if (anyModel instanceof Response) return anyModel;

  const supabase = getSupabaseConfig();
  if (supabase instanceof Response) return supabase;

  const boardId = parseBoardIdFromUrl(req.url);
  if (boardId instanceof Response) return boardId;

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON in request body." }, 400);
  }

  const body = parsePlanBody(rawBody);
  if (body instanceof Response) return body;

  const maxSubtasks = body.max_subtasks ?? DEFAULT_MAX_SUBTASKS;

  const roles = await fetchRoles(supabase);
  if (roles instanceof Response) return roles;

  const directory = await fetchUserDirectory(supabase);
  if (directory instanceof Response) return directory;

  const priorities = await fetchPriorities(supabase);
  if (priorities instanceof Response) return priorities;

  const todoStatusId = await fetchTodoStatusId(supabase, boardId);
  if (todoStatusId instanceof Response) return todoStatusId;

  const plan = await callAnyModelPlan({
    config: anyModel,
    task: body.task!.trim(),
    context: body.context?.trim() ?? "",
    maxSubtasks,
    roleNames: roles,
  });
  if (plan instanceof Response) return plan;

  const created: CreatedTaskRow[] = [];
  const assignments: AssignmentMeta[] = [];
  const planned = plan.subtasks.slice(0, maxSubtasks);

  for (const subtask of planned) {
    const { user, fallback } = resolveAssignee(directory, subtask.role_name);
    const priorityId = priorities.get(subtask.priority_hint) ?? null;

    const inserted = await insertTask(supabase, {
      board_id: boardId,
      title: subtask.title,
      description: subtask.description,
      status_id: todoStatusId,
      priority_id: priorityId,
      assigned_to: user?.user_id ?? null,
    });

    if (inserted instanceof Response) return inserted;

    created.push(inserted);
    assignments.push({
      role_name: subtask.role_name,
      assigned_to: user?.user_id ?? null,
      assignee_username: user?.username ?? null,
      fallback,
    });
  }

  return jsonResponse({
    board_id: boardId,
    status_id: todoStatusId,
    planned_subtasks: planned,
    assignments,
    created_tasks: created,
  });
});
