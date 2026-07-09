import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface AnimatedProgressProps {
  value: number;
  className?: string;
  showValue?: boolean;
}

export function AnimatedProgress({
  value,
  className,
  showValue = false
}: AnimatedProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className={cn("animated-progress-wrap", className)}>
      <div className="animated-progress-track">
        <div
          className="animated-progress-fill"
          style={{ "--progress-value": `${safeValue}%` } as CSSProperties}
        />
      </div>
      {showValue ? <span className="animated-progress-value">{safeValue}%</span> : null}
    </div>
  );
}
