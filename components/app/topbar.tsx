interface TopbarProps {
  title: string;
  description?: string;
}

export function Topbar({ title, description }: TopbarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-card-border bg-surface/50 px-6 backdrop-blur-sm">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-lg border border-card-border bg-surface-elevated px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
          aria-label="Search"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        <button
          type="button"
          className="rounded-xl bg-gradient-to-r from-accent-purple to-[#6366f1] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent-purple/20 transition-all hover:brightness-110"
        >
          + New Task
        </button>
      </div>
    </header>
  );
}
