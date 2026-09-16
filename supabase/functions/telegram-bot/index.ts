/// <reference path="./deno-runtime.d.ts" />

const TELEGRAM_API = "https://api.telegram.org";
const REPLY_TEXT = "ok";
const BOARDS_BUTTON_LABEL = "Boards";
const START_COMMAND = "/start";
const DEFAULT_LONG_POLL_TIMEOUT = 25;
const MAX_LONG_POLL_TIMEOUT = 50;
const DEFAULT_POLL_BUDGET_MS = 25_000;
const MAX_POLL_BUDGET_MS = 120_000;

type TelegramChat = { id: number };

type TelegramMessage = {
  chat?: TelegramChat;
  text?: string;
};

type TelegramReplyKeyboardMarkup = {
  keyboard: { text: string }[][];
  resize_keyboard?: boolean;
  is_persistent?: boolean;
};

type BoardRow = {
  name: string;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
};

type TelegramApiResult<T> = {
  ok: boolean;
  result?: T;
  description?: string;
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getBotToken(): string | Response {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN")?.trim();
  if (!token) {
    return jsonResponse(
      { error: "TELEGRAM_BOT_TOKEN is not configured on the Edge Function." },
      500,
    );
  }
  return token;
}

function getSupabaseConfig(): { url: string; serviceKey: string } | null {
  const url = Deno.env.get("SUPABASE_URL")?.trim();
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")?.trim();
  if (!url || !serviceKey) return null;
  return { url: url.replace(/\/$/, ""), serviceKey };
}

function verifyPollSecret(req: Request): Response | null {
  const expected = Deno.env.get("TELEGRAM_POLL_SECRET")?.trim();
  if (!expected) return null;

  const auth = req.headers.get("Authorization")?.trim();
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const header = req.headers.get("X-Telegram-Poll-Secret")?.trim();
  const received = bearer ?? header;
  if (received !== expected) {
    return jsonResponse({ error: "Invalid poll secret." }, 401);
  }
  return null;
}

function parseLongPollTimeout(url: string): number {
  const raw = new URL(url).searchParams.get("timeout")?.trim();
  if (!raw) return DEFAULT_LONG_POLL_TIMEOUT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0 || n > MAX_LONG_POLL_TIMEOUT) {
    return DEFAULT_LONG_POLL_TIMEOUT;
  }
  return n;
}

function parseOffsetOverride(url: string): number | null {
  const raw = new URL(url).searchParams.get("offset")?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function parsePollOnce(url: string): boolean {
  return new URL(url).searchParams.get("once") === "1";
}

function parsePollBudgetMs(url: string, once: boolean): number {
  if (once) return 0;
  const raw = new URL(url).searchParams.get("budget")?.trim();
  if (!raw) return DEFAULT_POLL_BUDGET_MS;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return DEFAULT_POLL_BUDGET_MS;
  return Math.min(n, MAX_POLL_BUDGET_MS);
}

function longPollTimeoutForSlice(
  reqUrl: string,
  once: boolean,
  remainingMs: number,
): number {
  if (once) return parseLongPollTimeout(reqUrl);
  const fromRemaining = Math.floor(remainingMs / 1000) - 1;
  if (fromRemaining <= 0) return 0;
  return Math.min(MAX_LONG_POLL_TIMEOUT, fromRemaining);
}

async function supabaseRest<T>(
  config: { url: string; serviceKey: string },
  path: string,
  init: RequestInit = {},
): Promise<{ data: T | null; error: string | null }> {
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
    return { data: null, error: message };
  }

  const text = await response.text();
  if (!response.ok) {
    return { data: null, error: text || response.statusText };
  }

  if (!text) return { data: null, error: null };
  try {
    return { data: JSON.parse(text) as T, error: null };
  } catch {
    return { data: null, error: "Invalid JSON from Supabase." };
  }
}

async function readStoredOffset(
  config: { url: string; serviceKey: string },
): Promise<number | Response> {
  const result = await supabaseRest<{ update_offset: number }[]>(
    config,
    "telegram_bot_state?select=update_offset&id=eq.1",
  );
  if (result.error) {
    return jsonResponse(
      { error: "Failed to read telegram_bot_state.", details: result.error },
      502,
    );
  }
  const row = result.data?.[0];
  if (!row || typeof row.update_offset !== "number") {
    return jsonResponse(
      {
        error:
          "telegram_bot_state row missing. Apply migration 009_telegram_bot_state.sql.",
      },
      500,
    );
  }
  return row.update_offset;
}

async function writeStoredOffset(
  config: { url: string; serviceKey: string },
  offset: number,
): Promise<Response | null> {
  const result = await supabaseRest<unknown[]>(
    config,
    "telegram_bot_state?id=eq.1",
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ update_offset: offset }),
    },
  );
  if (result.error) {
    return jsonResponse(
      { error: "Failed to update telegram_bot_state.", details: result.error },
      502,
    );
  }
  return null;
}

async function telegramApi<T>(
  token: string,
  method: string,
  params?: Record<string, string | number>,
): Promise<{ ok: true; result: T } | { ok: false; error: string }> {
  const url = new URL(`${TELEGRAM_API}/bot${token}/${method}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: message };
  }

  let body: TelegramApiResult<T>;
  try {
    body = (await response.json()) as TelegramApiResult<T>;
  } catch {
    return { ok: false, error: "Invalid JSON from Telegram API." };
  }

  if (!response.ok || !body.ok || body.result === undefined) {
    return {
      ok: false,
      error: body.description ?? response.statusText ?? "Telegram API error",
    };
  }

  return { ok: true, result: body.result };
}

async function ensurePollingMode(
  token: string,
): Promise<Response | null> {
  const deleted = await telegramApi<boolean>(token, "deleteWebhook");
  if (!deleted.ok) {
    return jsonResponse(
      { error: "Failed to delete Telegram webhook.", details: deleted.error },
      502,
    );
  }
  return null;
}

function extractIncomingMessage(update: TelegramUpdate): TelegramMessage | null {
  const msg =
    update.message ??
    update.edited_message ??
    update.channel_post ??
    update.edited_channel_post;
  return msg ?? null;
}

function extractChatId(update: TelegramUpdate): number | null {
  const id = extractIncomingMessage(update)?.chat?.id;
  return typeof id === "number" ? id : null;
}

function extractMessageText(update: TelegramUpdate): string {
  const text = extractIncomingMessage(update)?.text;
  return typeof text === "string" ? text.trim() : "";
}

function mainReplyKeyboard(): TelegramReplyKeyboardMarkup {
  return {
    keyboard: [[{ text: BOARDS_BUTTON_LABEL }]],
    resize_keyboard: true,
    is_persistent: true,
  };
}

function formatBoardsListText(boards: BoardRow[]): string {
  if (boards.length === 0) return "No boards yet.";
  const lines = boards.map((board, index) => `${index + 1}. ${board.name.trim()}`);
  return `Boards:\n${lines.join("\n")}`;
}

async function fetchBoardsList(
  config: { url: string; serviceKey: string },
): Promise<{ ok: true; boards: BoardRow[] } | { ok: false; error: string }> {
  const result = await supabaseRest<BoardRow[]>(
    config,
    "boards?select=name&order=created_at.desc",
  );
  if (result.error) {
    return { ok: false, error: result.error };
  }
  const boards = (result.data ?? []).filter(
    (row) => typeof row.name === "string" && row.name.trim().length > 0,
  );
  return { ok: true, boards };
}

async function resolveOutgoingMessage(
  messageText: string,
  supabase: { url: string; serviceKey: string } | null,
): Promise<{ text: string; replyMarkup: TelegramReplyKeyboardMarkup }> {
  const replyMarkup = mainReplyKeyboard();
  const normalized = messageText.trim();

  if (normalized === START_COMMAND || normalized.startsWith(`${START_COMMAND} `)) {
    return {
      text: "Welcome! Tap Boards to list all task boards.",
      replyMarkup,
    };
  }

  if (normalized === BOARDS_BUTTON_LABEL) {
    if (!supabase) {
      return {
        text: "Boards are unavailable (Supabase is not configured).",
        replyMarkup,
      };
    }
    const boards = await fetchBoardsList(supabase);
    if (!boards.ok) {
      return {
        text: "Failed to load boards. Try again later.",
        replyMarkup,
      };
    }
    return { text: formatBoardsListText(boards.boards), replyMarkup };
  }

  return { text: REPLY_TEXT, replyMarkup };
}

async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
  replyMarkup?: TelegramReplyKeyboardMarkup,
): Promise<{ ok: boolean; error?: string }> {
  const payload: {
    chat_id: number;
    text: string;
    reply_markup?: TelegramReplyKeyboardMarkup;
  } = { chat_id: chatId, text };
  if (replyMarkup) payload.reply_markup = replyMarkup;

  let response: Response;
  try {
    response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: message };
  }

  if (!response.ok) {
    const details = await response.text();
    return { ok: false, error: details || response.statusText };
  }

  return { ok: true };
}

async function pollUpdates(
  token: string,
  offset: number,
  timeout: number,
): Promise<
  { ok: true; updates: TelegramUpdate[] } | { ok: false; error: string }
> {
  const fetched = await telegramApi<TelegramUpdate[]>(token, "getUpdates", {
    offset,
    timeout,
  });
  if (!fetched.ok) {
    return { ok: false, error: fetched.error };
  }
  return { ok: true, updates: fetched.result };
}

async function processUpdates(
  token: string,
  updates: TelegramUpdate[],
  offset: number,
  supabase: { url: string; serviceKey: string } | null,
): Promise<
  | { ok: true; processed: number; nextOffset: number }
  | { ok: false; error: string; nextOffset: number }
> {
  let processed = 0;
  let nextOffset = offset;

  for (const update of updates) {
    if (typeof update.update_id !== "number") continue;
    nextOffset = update.update_id + 1;

    const chatId = extractChatId(update);
    if (chatId === null) continue;

    const messageText = extractMessageText(update);
    const outgoing = await resolveOutgoingMessage(messageText, supabase);
    const sent = await sendTelegramMessage(
      token,
      chatId,
      outgoing.text,
      outgoing.replyMarkup,
    );
    if (!sent.ok) {
      return {
        ok: false,
        error: sent.error ?? "sendMessage failed",
        nextOffset,
      };
    }
    processed += 1;
  }

  return { ok: true, processed, nextOffset };
}

Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method !== "GET" && req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed. Use GET or POST." }, 405);
  }

  const secretError = verifyPollSecret(req);
  if (secretError) return secretError;

  const token = getBotToken();
  if (token instanceof Response) return token;

  const webhookClear = await ensurePollingMode(token);
  if (webhookClear) return webhookClear;

  const supabase = getSupabaseConfig();
  const offsetOverride = parseOffsetOverride(req.url);

  let offset: number | Response;
  if (offsetOverride !== null) {
    offset = offsetOverride;
  } else if (supabase) {
    offset = await readStoredOffset(supabase);
  } else {
    offset = 0;
  }
  if (offset instanceof Response) return offset;

  const once = parsePollOnce(req.url);
  const budgetMs = parsePollBudgetMs(req.url, once);
  const deadline = Date.now() + budgetMs;
  let totalProcessed = 0;
  let polls = 0;
  let nextOffset = offset;

  while (true) {
    const remainingMs = deadline - Date.now();
    const timeout = longPollTimeoutForSlice(req.url, once, remainingMs);
    if (!once && remainingMs <= 0) break;
    if (timeout <= 0 && !once) break;

    const polled = await pollUpdates(token, nextOffset, timeout);
    polls += 1;
    if (!polled.ok) {
      return jsonResponse(
        {
          error: "Failed to fetch Telegram updates.",
          details: polled.error,
          next_offset: nextOffset,
          processed: totalProcessed,
        },
        502,
      );
    }

    if (polled.updates.length > 0) {
      const handled = await processUpdates(
        token,
        polled.updates,
        nextOffset,
        supabase,
      );
      nextOffset = handled.nextOffset;
      if (!handled.ok) {
        return jsonResponse(
          {
            error: "Failed to send Telegram message.",
            details: handled.error,
            next_offset: nextOffset,
            processed: totalProcessed,
          },
          502,
        );
      }
      totalProcessed += handled.processed;

      if (supabase && offsetOverride === null) {
        const saved = await writeStoredOffset(supabase, nextOffset);
        if (saved) return saved;
      }
    }

    if (once) break;
  }

  return jsonResponse({
    ok: true,
    mode: "polling",
    processed: totalProcessed,
    polls,
    next_offset: nextOffset,
    offset_persisted: supabase !== null && offsetOverride === null,
    poll_budget_ms: once ? 0 : budgetMs,
  });
});

export {};
