import type { CoachAction } from "@/types/coach";
import { cn } from "@/lib/utils";

interface CoachAvatarProps {
  action?: CoachAction;
}

const actionLabel: Record<CoachAction, string> = {
  idle: "AI",
  wave: "嗨",
  thinking: "想",
  point: "看",
  warning: "停",
  happy: "好",
  correct: "赞",
  wrong: "慢",
  celebrate: "赢"
};

export function CoachAvatar({ action = "idle" }: CoachAvatarProps) {
  return (
    <div
      className={cn(
        "flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-guandan-border bg-guandan-muted text-lg font-black text-guandan-gold shadow-soft",
        action === "warning" && "text-guandan-danger",
        action === "correct" && "text-guandan-success"
      )}
      aria-label={`AI 教练状态：${action}`}
    >
      {actionLabel[action]}
    </div>
  );
}
