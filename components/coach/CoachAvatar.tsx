import type { CoachAction } from "@/types/coach";
import { cn } from "@/lib/utils";

interface CoachAvatarProps {
  action?: CoachAction;
}

const actionLabel: Record<CoachAction, string> = {
  idle: "Ace",
  wave: "Hi",
  thinking: "想",
  point: "讲",
  warning: "看",
  happy: "好",
  correct: "准",
  wrong: "改",
  celebrate: "稳"
};

const actionClasses: Partial<Record<CoachAction, string>> = {
  idle: "border-guandan-border bg-guandan-muted text-guandan-gold",
  wave: "border-guandan-blue/50 bg-guandan-blue/10 text-guandan-blue",
  thinking: "border-guandan-cyan/50 bg-guandan-cyan/10 text-guandan-cyan",
  point: "border-guandan-gold/55 bg-guandan-gold/10 text-guandan-gold",
  warning: "border-guandan-danger/55 bg-guandan-danger/10 text-guandan-danger",
  wrong: "border-guandan-danger/55 bg-guandan-danger/10 text-guandan-danger",
  happy: "border-guandan-success/55 bg-guandan-success/10 text-guandan-success",
  correct: "border-guandan-success/55 bg-guandan-success/10 text-guandan-success",
  celebrate: "border-guandan-reward/60 bg-guandan-reward/10 text-guandan-reward"
};

export function CoachAvatar({ action = "idle" }: CoachAvatarProps) {
  return (
    <div
      className={cn(
        "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border text-base font-black shadow-panel transition-colors sm:h-16 sm:w-16 sm:text-lg",
        actionClasses[action] ?? actionClasses.idle
      )}
      aria-label={`AI 教练状态：${action}`}
    >
      {actionLabel[action]}
    </div>
  );
}
