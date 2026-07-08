import type { CoachAction } from "@/types/coach";
import { cn } from "@/lib/utils";
import { CoachAvatar } from "./CoachAvatar";

interface CoachBubbleProps {
  text: string;
  action?: CoachAction;
  caption?: string;
  label?: string;
}

const bubbleClasses: Partial<Record<CoachAction, string>> = {
  idle: "border-guandan-border bg-guandan-card",
  wave: "border-guandan-blue/35 bg-guandan-card",
  thinking: "border-guandan-cyan/35 bg-guandan-cyan/5",
  point: "border-guandan-gold/40 bg-guandan-gold/5",
  warning: "border-guandan-danger/45 bg-guandan-danger/5",
  wrong: "border-guandan-danger/45 bg-guandan-danger/5",
  happy: "border-guandan-success/45 bg-guandan-success/5",
  correct: "border-guandan-success/45 bg-guandan-success/5",
  celebrate: "border-guandan-reward/50 bg-guandan-reward/5"
};

const labelClasses: Partial<Record<CoachAction, string>> = {
  warning: "text-guandan-danger",
  wrong: "text-guandan-danger",
  happy: "text-guandan-success",
  correct: "text-guandan-success",
  celebrate: "text-guandan-reward",
  wave: "text-guandan-blue",
  thinking: "text-guandan-cyan"
};

export function CoachBubble({
  text,
  action = "idle",
  caption,
  label = "Ace AI 教练"
}: CoachBubbleProps) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-arena border p-4 shadow-panel",
        bubbleClasses[action] ?? bubbleClasses.idle
      )}
    >
      <CoachAvatar action={action} />
      <div className="min-w-0">
        <p className={cn("text-[13px] font-bold text-guandan-gold", labelClasses[action])}>
          {label}
        </p>
        <p className="mt-1 text-base font-bold leading-7">{text}</p>
        {caption ? <p className="mt-1 text-sm leading-6 text-guandan-subtext">{caption}</p> : null}
      </div>
    </div>
  );
}
