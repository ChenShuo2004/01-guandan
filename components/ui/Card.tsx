import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "training" | "success" | "danger";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: CardVariant;
}

const variantClasses: Record<CardVariant, string> = {
  default: "border-guandan-border bg-guandan-card shadow-panel",
  elevated: "border-guandan-border bg-guandan-elevated shadow-panel",
  training: "border-guandan-activeBorder bg-guandan-gold/10 shadow-energy",
  success: "border-guandan-success/50 bg-guandan-success/10 shadow-panel",
  danger: "border-guandan-danger/50 bg-guandan-danger/10 shadow-panel"
};

export function Card({
  children,
  className,
  variant = "default",
  ...props
}: CardProps) {
  return (
    <section
      className={cn(
        "rounded-arena border p-4 text-guandan-text lg:p-5",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </section>
  );
}
