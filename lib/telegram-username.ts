const TELEGRAM_USERNAME_MIN = 5;
const TELEGRAM_USERNAME_MAX = 32;
const TELEGRAM_USERNAME_RE = /^[A-Za-z0-9_]+$/;

export function normalizeTelegramUsername(raw: string): string | null {
  const trimmed = raw.trim().replace(/^@+/, "");
  if (!trimmed) return null;
  return trimmed.toLowerCase();
}

export function validateTelegramUsername(raw: string): string | null {
  const normalized = normalizeTelegramUsername(raw);
  if (normalized === null) return null;

  if (normalized.length < TELEGRAM_USERNAME_MIN) {
    return `Telegram username must be at least ${TELEGRAM_USERNAME_MIN} characters.`;
  }
  if (normalized.length > TELEGRAM_USERNAME_MAX) {
    return `Telegram username must be at most ${TELEGRAM_USERNAME_MAX} characters.`;
  }
  if (!TELEGRAM_USERNAME_RE.test(normalized)) {
    return "Telegram username may only contain letters, numbers, and underscores.";
  }
  return null;
}

export function formatTelegramUsernameForDisplay(
  username: string | null | undefined,
): string {
  const normalized = username?.trim();
  if (!normalized) return "—";
  return `@${normalized.replace(/^@+/, "")}`;
}
