"use client";

import {
  normalizeTaskTags,
  TASK_MAX_TAGS,
  TASK_TAG_MAX_LENGTH,
} from "@/lib/task-form-validation";
import { cn } from "@/lib/utils";
import { useId, useState } from "react";

interface TaskTagsFieldProps {
  id: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  error?: string;
}

export function TaskTagsField({
  id,
  tags,
  onChange,
  disabled = false,
  error,
}: TaskTagsFieldProps) {
  const hintId = useId();
  const errorId = `${id}-error`;
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);

  const addTagFromDraft = () => {
    const trimmed = draft.trim().toUpperCase();
    if (!trimmed) {
      setDraft("");
      setDraftError(null);
      return;
    }
    if (trimmed.length > TASK_TAG_MAX_LENGTH) {
      setDraftError(`Tag must be at most ${TASK_TAG_MAX_LENGTH} characters`);
      return;
    }
    const next = normalizeTaskTags([...tags, trimmed]);
    if (next.length === tags.length) {
      setDraftError("Tag already added or limit reached");
      return;
    }
    onChange(next);
    setDraft("");
    setDraftError(null);
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
    setDraftError(null);
  };

  const displayError = error ?? draftError ?? undefined;

  return (
    <div className="block">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        Tags
      </label>
      <div
        className={cn(
          "auth-input flex min-h-[2.75rem] flex-wrap items-center gap-1.5 px-2 py-2",
          displayError && "auth-input-error",
        )}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex max-w-full items-center gap-1 rounded-md bg-accent-purple/15 px-2 py-0.5 text-xs font-medium text-accent-purple-light"
          >
            <span className="truncate uppercase">{tag}</span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => removeTag(index)}
              className="shrink-0 rounded text-accent-purple-light/70 transition-colors hover:text-accent-purple-light disabled:opacity-50"
              aria-label={`Remove tag ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        {tags.length < TASK_MAX_TAGS && (
          <input
            id={id}
            type="text"
            value={draft}
            disabled={disabled}
            maxLength={TASK_TAG_MAX_LENGTH}
            placeholder={tags.length === 0 ? "Type and press Enter" : "Add tag"}
            aria-describedby={displayError ? `${hintId} ${errorId}` : hintId}
            className="min-w-[6rem] flex-1 border-0 bg-transparent px-1 py-0.5 text-sm uppercase outline-none placeholder:normal-case placeholder:text-muted"
            onChange={(e) => {
              setDraft(e.target.value.toUpperCase());
              if (draftError) setDraftError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTagFromDraft();
              } else if (e.key === "Backspace" && !draft && tags.length > 0) {
                removeTag(tags.length - 1);
              }
            }}
            onBlur={() => {
              if (draft.trim()) addTagFromDraft();
            }}
          />
        )}
      </div>
      {displayError && (
        <p id={errorId} role="alert" className="auth-error mt-1.5 text-xs">
          {displayError}
        </p>
      )}
    </div>
  );
}
