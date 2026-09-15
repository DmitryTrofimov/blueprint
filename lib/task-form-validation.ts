export const TASK_TITLE_MAX_LENGTH = 80;
export const TASK_DESCRIPTION_MAX_LENGTH = 220;
export const TASK_TAG_MAX_LENGTH = 30;
export const TASK_MAX_TAGS = 10;

/** Local calendar date as YYYY-MM-DD for `<input type="date">`. */
export function getTodayDateInputValue(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, "0");
  const day = String(referenceDate.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateTaskProgress(value: number): string | undefined {
  if (!Number.isInteger(value)) {
    return "Progress must be a whole number";
  }
  if (value < 0 || value > 100) {
    return "Progress must be between 0 and 100";
  }
  if (value % 5 !== 0) {
    return "Progress must be in steps of 5";
  }
  return undefined;
}

export function validateTaskDeadline(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return "Invalid date";
  }
  if (trimmed < getTodayDateInputValue()) {
    return "Deadline cannot be in the past";
  }
  return undefined;
}

export function formatTaskDeadlineDisplay(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
    new Date(year, month - 1, day),
  );
}

export function validateTaskTitle(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return "Title is required";
  }
  if (trimmed.length > TASK_TITLE_MAX_LENGTH) {
    return `Title must be at most ${TASK_TITLE_MAX_LENGTH} characters`;
  }
  return undefined;
}

export function validateTaskDescription(value: string): string | undefined {
  if (value.length > TASK_DESCRIPTION_MAX_LENGTH) {
    return `Description must be at most ${TASK_DESCRIPTION_MAX_LENGTH} characters`;
  }
  return undefined;
}

export function validateTaskStatusId(value: string): string | undefined {
  if (!value) {
    return "Please select a status";
  }
  return undefined;
}

export function validateTaskPriorityId(value: string): string | undefined {
  if (!value) {
    return "Please select a priority";
  }
  return undefined;
}

export function validateTaskAssignedTo(value: string): string | undefined {
  if (!value.trim()) {
    return "Please select an assignee";
  }
  return undefined;
}

/** Trim, uppercase, dedupe case-insensitively, cap count and per-tag length. */
export function normalizeTaskTags(tags: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const raw of tags) {
    const tag = raw.trim().toUpperCase();
    if (!tag || tag.length > TASK_TAG_MAX_LENGTH) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(tag);
    if (result.length >= TASK_MAX_TAGS) break;
  }

  return result;
}

export function validateTaskTags(tags: string[]): string | undefined {
  if (tags.length > TASK_MAX_TAGS) {
    return `You can add at most ${TASK_MAX_TAGS} tags`;
  }
  for (const tag of tags) {
    const trimmed = tag.trim().toUpperCase();
    if (!trimmed) {
      return "Tags cannot be empty";
    }
    if (trimmed.length > TASK_TAG_MAX_LENGTH) {
      return `Each tag must be at most ${TASK_TAG_MAX_LENGTH} characters`;
    }
  }
  return undefined;
}
