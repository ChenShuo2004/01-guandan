import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  tone?: "energy" | "success" | "tech" | "danger";
}

const toneClasses = {
  energy: "bg-guandan-gold",
  success: "bg-guandan-success",
  tech: "bg-guandan-blue",
  danger: "bg-guandan-danger"
};

export function ProgressBar({ value, max, label, tone = "energy" }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-guandan-subtext">
        <span>{label ?? "进度"}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full border border-guandan-border bg-guandan-muted">
        <div
          className={cn("h-full rounded-full transition-all duration-500", toneClasses[tone])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
