import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "section" | "aside" | "div";
  interactive?: boolean;
}

export function GlowCard({
  as: Component = "section",
  children,
  className,
  interactive = true,
  ...props
}: GlowCardProps) {
  return (
    <Component
      className={cn(
        "glow-card relative overflow-hidden rounded-[28px] border border-[#d9ebff] bg-white/88 p-6 shadow-[0_20px_60px_rgba(0,88,190,0.07)] backdrop-blur-xl",
        interactive && "glow-card-interactive",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
