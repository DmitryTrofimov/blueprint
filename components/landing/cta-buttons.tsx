import Link from "next/link";
import { cn } from "@/lib/utils";

const primaryStyles =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent-purple to-[#6366f1] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent-purple/20 transition-all hover:shadow-accent-purple/30 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple";

const secondaryStyles =
  "inline-flex items-center justify-center gap-2.5 rounded-xl border border-card-border bg-surface-elevated/80 px-6 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-white/15 hover:bg-surface-elevated focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple";

const ghostStyles =
  "inline-flex items-center justify-center rounded-xl border border-card-border px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-white/15 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-purple";

interface PrimaryButtonProps {
  children: React.ReactNode;
  className?: string;
  showArrow?: boolean;
  href?: string;
  onClick?: () => void;
}

export function PrimaryButton({
  href,
  onClick,
  children,
  className,
  showArrow = false,
}: PrimaryButtonProps) {
  const content = (
    <>
      {children}
      {showArrow && <span aria-hidden="true">→</span>}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(primaryStyles, className)}>
        {content}
      </button>
    );
  }

  return (
    <Link href={href ?? "/app"} className={cn(primaryStyles, className)}>
      {content}
    </Link>
  );
}

interface SecondaryButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SecondaryButton({ href, children, className }: SecondaryButtonProps) {
  return (
    <Link href={href} className={cn(secondaryStyles, className)}>
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full border border-card-border bg-surface"
        aria-hidden="true"
      >
        <svg className="ml-0.5 h-3 w-3 text-muted" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
      {children}
    </Link>
  );
}

interface GhostButtonProps {
  children: React.ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}

export function GhostButton({ href, onClick, children, className }: GhostButtonProps) {
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(ghostStyles, className)}>
        {children}
      </button>
    );
  }

  return (
    <Link href={href ?? "/app"} className={cn(ghostStyles, className)}>
      {children}
    </Link>
  );
}
