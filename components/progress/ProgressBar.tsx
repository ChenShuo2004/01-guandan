interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-bold text-guandan-subtext">
        <span>{label ?? "进度"}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-guandan-muted">
        <div
          className="h-full rounded-full bg-guandan-gold transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
