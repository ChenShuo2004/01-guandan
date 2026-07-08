import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveContainerProps {
  children: ReactNode;
  variant?: "default" | "wide";
  className?: string;
}

export function ResponsiveContainer({
  children,
  className,
  variant = "default"
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 md:max-w-[720px] md:px-6 lg:px-8",
        variant === "wide" ? "lg:max-w-[1180px]" : "lg:max-w-[760px]",
        className
      )}
    >
      {children}
    </div>
  );
}
