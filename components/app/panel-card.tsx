import { cn } from "@/lib/utils";

interface PanelCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "purple" | "blue" | "none";
}

export function PanelCard({ children, className, glow = "none" }: PanelCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-card-border bg-card p-5",
        glow === "purple" && "glow-purple",
        glow === "blue" && "glow-blue",
        className,
      )}
    >
      {children}
    </div>
  );
}
