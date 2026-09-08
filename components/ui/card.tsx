import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "purple" | "blue" | "none";
  id?: string;
}

export function Card({ children, className, glow = "none", id }: CardProps) {
  return (
    <div
      id={id}
      className={cn(
        "rounded-2xl border border-card-border bg-card backdrop-blur-sm",
        glow === "purple" && "glow-purple",
        glow === "blue" && "glow-blue",
        className,
      )}
    >
      {children}
    </div>
  );
}
