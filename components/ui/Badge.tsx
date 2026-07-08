import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "energy" | "tech" | "success" | "danger" | "reward";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-guandan-border bg-guandan-muted text-guandan-subtext",
  energy: "border-guandan-gold/50 bg-guandan-gold/10 text-guandan-gold",
  tech: "border-guandan-blue/50 bg-guandan-blue/10 text-guandan-blue",
  success: "border-guandan-success/50 bg-guandan-success/10 text-guandan-success",
  danger: "border-guandan-danger/50 bg-guandan-danger/10 text-guandan-danger",
  reward: "border-guandan-reward/60 bg-guandan-reward/10 text-guandan-reward"
};

export function Badge({
  children,
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded-full border px-3 py-1 text-xs font-bold leading-4",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
